// 08-services.php — builds the Services page from services.html (WP phase 3). Elementor Containers + native widgets only
// (Heading, Text Editor, Image, Button, Basic Gallery, Shortcode). CSS classes refer to the child theme's taameer.css.
// Helpers (up to $ROW) are copied verbatim from 07-about.php, plus the About-only helpers this page needs: each Novamira
// run is standalone. Creates the page "Services" (/services/) once (option tp_services_page_id); re-running replaces its
// content (same ID). Reuses the CTA band template (option tp_cta_template_id); does not touch Home, About, the Kit,
// Astra or the template. Run on the site through Novamira (novamira/execute-php).

$MAP = get_option('tp_media_map', []);

/* ================= helpers ================= */
$uid = fn() => substr(md5(uniqid('', true) . mt_rand()), 0, 7);
$dim = fn($t, $r, $b, $l, $u = 'px') => ['unit' => $u, 'top' => (string) $t, 'right' => (string) $r, 'bottom' => (string) $b, 'left' => (string) $l, 'isLinked' => false];
$all = fn($v, $u = 'px') => ['unit' => $u, 'top' => (string) $v, 'right' => (string) $v, 'bottom' => (string) $v, 'left' => (string) $v, 'isLinked' => true];
$gap = fn($v) => ['unit' => 'px', 'size' => $v, 'column' => (string) $v, 'row' => (string) $v, 'isLinked' => true];
$w = fn($v, $u = '%') => ['unit' => $u, 'size' => $v, 'sizes' => []];
$fluid = [
  'xs' => 'clamp(0.75rem, 0.73rem + 0.08vw, 0.8125rem)',
  'sm' => 'clamp(0.875rem, 0.86rem + 0.06vw, 0.9375rem)',
  'base' => 'clamp(1rem, 0.97rem + 0.12vw, 1.0625rem)',
  'h4' => 'clamp(1.25rem, 1.18rem + 0.35vw, 1.5rem)',
  'h3' => 'clamp(1.5rem, 1.35rem + 0.7vw, 2.125rem)',
];
// Local typography where a widget differs from every global style (prefix = control group name).
$typo = function ($prefix, $family, $weight, $size, $lh, $extra = []) {
  $s = [
    "{$prefix}_typography" => 'custom',
    "{$prefix}_font_family" => $family,
    "{$prefix}_font_weight" => (string) $weight,
    "{$prefix}_font_size" => ['unit' => 'custom', 'size' => $size, 'sizes' => []],
    "{$prefix}_line_height" => ['unit' => 'em', 'size' => $lh, 'sizes' => []],
  ];
  foreach ($extra as $k => $v) $s["{$prefix}_$k"] = $v;
  return $s;
};
$border = fn($t, $r, $b, $l, $color = 'line') => [
  'border_border' => 'solid', 'border_width' => ['unit' => 'px', 'top' => "$t", 'right' => "$r", 'bottom' => "$b", 'left' => "$l", 'isLinked' => false],
  'border_color' => $color === 'line' ? '#D9D9D9' : '#0D0D0D',
];
$shadow = fn($pre, $v, $b, $a) => ["{$pre}box_shadow_box_shadow_type" => 'yes', "{$pre}box_shadow_box_shadow" => ['horizontal' => 0, 'vertical' => $v, 'blur' => $b, 'spread' => 0, 'color' => "rgba(13,13,13,$a)"]];

// Container. $s: settings; children: elements. Defaults: full width, column, no gap, no padding.
$C = function (array $s, array $children = []) use ($uid, $gap) {
  $s += ['content_width' => 'full', 'flex_direction' => 'column', 'flex_gap' => $gap(0)];
  return ['id' => $uid(), 'elType' => 'container', 'isInner' => true, 'settings' => $s, 'elements' => $children];
};
$W = fn($type, array $s) => ['id' => $uid(), 'elType' => 'widget', 'widgetType' => $type, 'isInner' => false, 'settings' => $s, 'elements' => []];
$anim = fn($delay = 0) => ['_animation' => 'fadeInUp', '_animation_delay' => $delay];
$canim = fn($delay = 0) => ['animation' => 'fadeInUp', 'animation_delay' => $delay];

$H = function ($text, $tag, $typoId, $colorId = 'primary', array $x = []) use ($W) {
  $s = ['title' => $text, 'header_size' => $tag, '__globals__' => ['title_color' => "globals/colors?id=$colorId"]];
  if ($typoId) $s['__globals__']['typography_typography'] = "globals/typography?id=$typoId";
  if (isset($x['__globals__'])) { $s['__globals__'] = array_merge($s['__globals__'], $x['__globals__']); unset($x['__globals__']); }
  return $W('heading', array_merge($s, $x));
};
$T = function ($html, $typoId = 'text', $colorId = 'text', array $x = []) use ($W) {
  $s = ['editor' => $html, '__globals__' => ['text_color' => "globals/colors?id=$colorId"]];
  if ($typoId) $s['__globals__']['typography_typography'] = "globals/typography?id=$typoId";
  return $W('text-editor', array_merge($s, $x));
};
$IMG = function ($file, array $x = []) use ($W, $MAP) {
  $id = $MAP[$file] ?? 0;
  return $W('image', array_merge([
    'image' => ['id' => $id, 'url' => wp_get_attachment_url($id), 'alt' => '', 'source' => 'library', 'size' => ''],
    'image_size' => 'full',
  ], $x));
};
// Buttons: primary (kit style), ghost (outline), link (text link + hairline + arrow, class tp-link), contact (underlined text).
$B = function ($text, $url, $variant = 'primary', array $x = []) use ($W, $all, $dim, $typo, $fluid) {
  $s = ['text' => $text, 'link' => ['url' => $url, 'is_external' => '', 'nofollow' => '']];
  if ($variant === 'ghost') $s += [
    'background_background' => 'classic', 'background_color' => 'rgba(0,0,0,0)',
    'button_text_color' => '#0D0D0D', 'border_border' => 'solid', 'border_width' => $all(1), 'border_color' => '#0D0D0D',
    'hover_color' => '#FFFFFF', 'button_background_hover_background' => 'classic', 'button_background_hover_color' => '#0D0D0D',
    '__globals__' => ['button_text_color' => 'globals/colors?id=primary', 'border_color' => 'globals/colors?id=primary', 'button_background_hover_color' => 'globals/colors?id=primary', 'hover_color' => 'globals/colors?id=paper'],
  ];
  if ($variant === 'link') $s += [
    'background_background' => 'classic', 'background_color' => 'rgba(0,0,0,0)',
    'button_background_hover_background' => 'classic', 'button_background_hover_color' => 'rgba(0,0,0,0)',
    'button_text_color' => '#262626', 'hover_color' => '#0D0D0D', 'border_border' => 'none', 'border_radius' => $all(0),
    'text_padding' => $dim(8, 0, 8, 0), '_css_classes' => 'tp-link',
    '__globals__' => ['typography_typography' => 'globals/typography?id=link', 'button_text_color' => 'globals/colors?id=accent', 'hover_color' => 'globals/colors?id=primary'],
  ];
  if ($variant === 'contact') $s += [
    'background_background' => 'classic', 'background_color' => 'rgba(0,0,0,0)',
    'button_background_hover_background' => 'classic', 'button_background_hover_color' => 'rgba(0,0,0,0)',
    'button_text_color' => '#0D0D0D', 'hover_color' => '#0D0D0D',
    'border_border' => 'solid', 'border_width' => $dim(0, 0, 1, 0), 'border_color' => '#D9D9D9', 'button_hover_border_color' => '#0D0D0D',
    'border_radius' => $all(0), 'text_padding' => $dim(8, 0, 8, 0),
  ] + $typo('typography', 'Inter', 500, $fluid['base'], 1.7, ['text_transform' => 'none', 'letter_spacing' => ['unit' => 'em', 'size' => 0, 'sizes' => []]]);
  return $W('button', array_merge($s, $x));
};

// Section = outer Container (html <section>, boxed 1320px, gutters 48/32/20, vertical padding per device).
$SEC = function (array $pad, array $s, array $children) use ($uid, $dim, $gap) {
  [$d, $t, $m] = $pad;
  $s += [
    'content_width' => 'boxed', 'html_tag' => 'section', 'flex_direction' => 'column', 'flex_gap' => $gap(0),
    'padding' => $dim($d[0], 48, $d[1], 48), 'padding_tablet' => $dim($t[0], 32, $t[1], 32), 'padding_mobile' => $dim($m[0], 20, $m[1], 20),
  ];
  return ['id' => $uid(), 'elType' => 'container', 'isInner' => false, 'settings' => $s, 'elements' => $children];
};
$PAD = [[128, 128], [96, 96], [72, 72]];   // --tp-section-pad at desktop / tablet / mobile
$FOG = ['background_background' => 'classic', 'background_color' => '#F4F4F4', '__globals__' => ['background_color' => 'globals/colors?id=fog']];

// Two-column row (desktop + tablet), stacked on mobile. $a/$b = share of the row after the gap.
// Below 1024px the prototype's two-column rows wrap to one column (their flex-basis no longer fits), so tablet stacks too.
$ROW = function ($a, $b, array $left, array $right, array $s = [], $tabletStack = true) use ($C, $gap, $w) {
  $col = fn($share, $kids, $extra) => $C(array_merge([
    'width' => ['unit' => 'custom', 'size' => "calc((100% - 44px) * $share)", 'sizes' => []],
    'width_tablet' => $tabletStack ? $w(100) : ['unit' => 'custom', 'size' => "calc((100% - 32px) * $share)", 'sizes' => []],
    'width_mobile' => $w(100),
    'flex_gap' => $gap(24),
  ], $extra), $kids);
  return $C(array_merge([
    'flex_direction' => 'row', 'flex_direction_tablet' => $tabletStack ? 'column' : 'row', 'flex_direction_mobile' => 'column',
    'flex_wrap' => 'nowrap', 'flex_gap' => $gap(44), 'flex_gap_tablet' => $gap(32), 'flex_gap_mobile' => $gap(24),
  ], $s), [$col($a, $left[0], $left[1] ?? []), $col($b, $right[0], $right[1] ?? [])]);
};

/* ================= helpers shared with 07-about.php ================= */
$px = fn($v) => ['unit' => 'px', 'size' => $v, 'sizes' => []];
$cw = fn($expr) => ['unit' => 'custom', 'size' => $expr, 'sizes' => []];
// Max line length as Elementor's native Custom Width (Advanced > Width), capped at 100%. The child theme's tp-measure*
// classes cannot do this: Elementor's ".elementor.elementor .e-con > .elementor-widget { max-width: 100% }" outranks them.
// Heading caps follow the prototype's ch values, converted to multiples of the fluid font size (measured at 375/1280/1440).
$MW = fn($expr) => ['_element_width' => 'initial', '_element_custom_width' => $cw("min(100%, $expr)")];
$MEASURE = '38rem';                                                               // --tp-measure
$H1W = 'calc(9.84 * clamp(2.375rem, 1.85rem + 2.9vw, 4.75rem))';                  // 16ch of the H1
$H2W = 'calc(12.3 * clamp(1.875rem, 1.5rem + 1.6vw, 3.125rem))';                  // 20ch of the H2
// Section head whose end-side text may use another style (team-experience note: small, slate).
$HEADX = function ($eyebrow, $title, $text, $typoId = 'text', $colorId = 'text') use ($ROW, $H, $T, $anim, $gap, $dim, $MW, $MEASURE, $H2W) {
  return $ROW(0.7, 0.3,
    [[$H($eyebrow, 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)), $H($title, 'h2', 'h2', 'primary', $MW($H2W) + $anim(100))]],
    [$text ? [$T("<p>$text</p>", $typoId, $colorId, $MW($MEASURE) + $anim(0))] : [], ['flex_gap' => $gap(16)]],
    ['flex_justify_content' => 'space-between', 'flex_align_items' => 'flex-end', 'flex_align_items_tablet' => 'flex-start', 'flex_align_items_mobile' => 'flex-start', 'margin' => $dim(0, 0, 64, 0), 'margin_mobile' => $dim(0, 0, 48, 0)]);
};
// Card widths in a wrapping row from a column count per device (gaps: desktop 44, tablet 32, mobile 24).
$cols = fn($d, $t, $m) => [
  'width' => $d > 1 ? $cw('calc((100% - ' . (($d - 1) * 44) . "px) / $d)") : $w(100),
  'width_tablet' => $t > 1 ? $cw('calc((100% - ' . (($t - 1) * 32) . "px) / $t)") : $w(100),
  'width_mobile' => $m > 1 ? $cw('calc((100% - ' . (($m - 1) * 24) . "px) / $m)") : $w(100),
];
$rowGap = fn($col, $row) => ['unit' => 'px', 'size' => $col, 'column' => (string) $col, 'row' => (string) $row, 'isLinked' => false];
$cardRowS = fn($row) => ['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_align_items' => 'stretch',
  'flex_gap' => $rowGap(44, $row), 'flex_gap_tablet' => $rowGap(32, $row), 'flex_gap_mobile' => $rowGap(24, $row)];
$imgShadowSm = ['image_box_shadow_box_shadow_type' => 'yes', 'image_box_shadow_box_shadow' => ['horizontal' => 0, 'vertical' => 4, 'blur' => 12, 'spread' => 0, 'color' => 'rgba(13,13,13,0.06)']];
// Small paper label (prototype .tp-badge): Inter 600 xs uppercase, paper background, 2px radius, soft shadow.
$BADGE = fn($text, array $x = []) => $H($text, 'p', null, 'primary', array_merge(
  $typo('typography', 'Inter', 600, $fluid['xs'], 1.7, ['text_transform' => 'uppercase', 'letter_spacing' => ['unit' => 'em', 'size' => 0.03, 'sizes' => []]]),
  ['_element_width' => 'auto', '_padding' => $dim(4, 12, 4, 12), '_border_radius' => $all(2),
   '_background_background' => 'classic', '_background_color' => '#FFFFFF', '__globals__' => ['title_color' => 'globals/colors?id=primary', '_background_color' => 'globals/colors?id=paper']],
  $shadow('_', 4, 12, 0.06), $x));

/* ================= Services-only helpers ================= */
$SVCH2W = 'calc(8.61 * clamp(1.875rem, 1.5rem + 1.6vw, 3.125rem))';               // 14ch of the H2 (service titles)
// Container positioning keys have no leading underscore for position / z-index (widgets: _position, _z_index).
$ABS = ['position' => 'absolute', '_offset_orientation_h' => 'start', '_offset_x' => $px(16), '_offset_orientation_v' => 'start', '_offset_y' => $px(16), 'z_index' => 2];

// Project card (static; Elementor Free has no Loop Grid): same build as the homepage cards, image cropped to 4:3.
// $p = [slug, title, location, type, year or "Ongoing", cover file, badges[]]
$card = fn($p, $i) => $C(array_merge([
  'html_tag' => 'a', 'link' => ['url' => "/projects/{$p[0]}/", 'is_external' => '', 'nofollow' => ''], 'css_classes' => 'tp-card',
  'flex_gap' => $gap(16),
], $cols(3, 3, 1), $canim($i * 110)), [
  $C([], array_merge(
    [$IMG($p[5], ['_css_classes' => 'tp-ratio-4x3', 'width' => $w(100), '_border_radius' => $all(6)])],
    $p[6] ? [$C(array_merge(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_gap' => $gap(8), 'width' => $cw('calc(100% - 32px)')], $ABS), array_map(fn($b) => $BADGE($b), $p[6]))] : []
  )),
  $C(['flex_direction' => 'row', 'flex_justify_content' => 'space-between', 'flex_wrap' => 'wrap', 'flex_gap' => $gap(8)], [
    $H($p[3], 'p', 'eyebrow', 'secondary'),
    $H($p[4], 'p', 'eyebrow', 'secondary'),
  ]),
  $H($p[1], 'h3', null, 'primary', $typo('typography', 'Playfair Display', 400, $fluid['h4'], 1.15)),
  $H($p[2], 'p', 'small', 'secondary'),
  $H('View project', 'p', 'link', 'accent', ['_css_classes' => 'tp-card__more'] + $typo('typography', 'Inter', 600, $fluid['xs'], 1.7, ['text_transform' => 'uppercase', 'letter_spacing' => ['unit' => 'em', 'size' => 0.03, 'sizes' => []]])),
]);
// "Related projects": hairline, eyebrow title, three cards (3 / 3 / 1 per row).
$RELATED = fn(array $cards) => $C(array_merge(['margin' => $dim(64, 0, 0, 0), 'padding' => $dim(32, 0, 0, 0), 'flex_gap' => $gap(32)], $border(1, 0, 0, 0)), [
  $H('Related projects', 'h3', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']),
  $C($cardRowS(24), array_map($card, $cards, array_keys($cards))),
]);

// Service block: text and framed 4:3 photo side by side; --flip puts the photo first (row-reverse). Both columns are
// 24rem wide and may grow and shrink, so the row wraps (text above photo) once two no longer fit, like the prototype.
$SERVICE = function ($id, $flip, $n, $title, $lead, $body, $link, $img, $related = null) use ($SEC, $PAD, $FOG, $C, $H, $T, $B, $IMG, $anim, $gap, $rowGap, $cw, $all, $shadow, $MW, $MEASURE, $SVCH2W, $RELATED) {
  $grow = ['width' => $cw('24rem'), '_flex_size' => 'custom', '_flex_grow' => 1, '_flex_shrink' => 1];
  $text = [
    $H("Service $n", 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)),
    $H($title, 'h2', 'h2', 'primary', $MW($SVCH2W) + $anim(0)),
    $T("<p>$lead</p>", 'secondary', 'text', $MW($MEASURE) + $anim(0)),
  ];
  if ($body) $text[] = $T("<p>$body</p>", 'text', 'secondary', $MW($MEASURE) + $anim(0));
  if ($link) $text[] = $B($link[0], $link[1], 'link', ['_element_width' => 'auto'] + $anim(0));
  $kids = [$C(['flex_direction' => $flip ? 'row-reverse' : 'row', 'flex_wrap' => 'wrap', 'flex_align_items' => 'center', 'flex_gap' => $rowGap(96, 48)], [
    $C(array_merge($grow, ['flex_gap' => $gap(24)]), $text),
    $C($grow, [
      $C(['css_classes' => 'tp-frame'], [
        $IMG($img, array_merge(['_css_classes' => 'tp-img-reveal tp-ratio-4x3', '_border_radius' => $all(2)], $shadow('_', 12, 32, 0.09))),
      ]),
    ]),
  ])];
  if ($related) $kids[] = $RELATED($related);
  return $SEC($PAD, array_merge($flip ? $FOG : [], ['_element_id' => $id, 'css_classes' => 'tp-service-block' . ($flip ? ' tp-service-block--flip' : '')]), $kids);
};

/* ================= 1 Page hero + breadcrumbs ================= */
$hero = $SEC([[48, 60], [32, 48], [32, 40]], array_merge($FOG, $border(0, 0, 1, 0)), [
  // Breadcrumbs: static links (Elementor Free has no breadcrumbs widget); edited in the Text Editor's Text tab.
  $T('<nav class="tp-breadcrumb" aria-label="Breadcrumb"><ol class="tp-breadcrumb__list"><li><a href="/">Home</a></li><li><span aria-current="page">Services</span></li></ol></nav>', null, 'secondary'),
  $C(['margin' => $dim(32, 0, 0, 0), 'flex_gap' => $gap(24)], [
    $H('Our expertise', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(100)),
    $H('Our services', 'h1', 'h1', 'primary', $MW($H1W) + $anim(200)),
    $T('<p>Taameer Plus is a pioneer general contractor in the United Arab Emirates, delivering construction solutions in a professional and cost-effective manner.</p>', 'secondary', 'secondary', $MW($MEASURE) + $anim(300)),
  ]),
]);

/* ================= 2 Service navigation: sticky chip bar (6 Buttons), current section marked by taameer.js ================= */
$chips = [['Construction', 'construction'], ['Design &amp; Build', 'design-build'], ['Decoration &amp; Fit-out', 'decoration-fitout'],
  ['Renovation', 'renovation'], ['Maintenance', 'maintenance'], ['Turnkey Projects', 'turnkey']];
$chipNav = ['id' => $uid(), 'elType' => 'container', 'isInner' => false, 'settings' => array_merge([
  'content_width' => 'boxed', 'flex_direction' => 'column', 'flex_gap' => $gap(0), 'css_classes' => 'tp-service-nav tp-scrollspy',
  'padding' => $dim(0, 48, 0, 48), 'padding_tablet' => $dim(0, 32, 0, 32), 'padding_mobile' => $dim(0, 20, 0, 20),
  'background_background' => 'classic', 'background_color' => 'rgba(255,255,255,0.94)',
], $border(0, 0, 1, 0)), 'elements' => [
  $C(['html_tag' => 'nav', 'css_classes' => 'tp-chips', 'flex_direction' => 'row', 'flex_wrap' => 'nowrap', 'flex_align_items' => 'center',
    'flex_gap' => $gap(8), 'min_height' => $px(56), 'padding' => $dim(4, 0, 4, 0)],
    array_map(fn($c) => $B($c[0], '#' . $c[1], 'primary', array_merge([
      '_css_classes' => 'tp-chip',
      'background_background' => 'classic', 'background_color' => 'rgba(0,0,0,0)',
      'button_background_hover_background' => 'classic', 'button_background_hover_color' => 'rgba(0,0,0,0)',
      'button_text_color' => '#0D0D0D', 'hover_color' => '#0D0D0D',
      'border_border' => 'solid', 'border_width' => $all(1), 'border_color' => '#D9D9D9', 'button_hover_border_color' => '#0D0D0D',
      'border_radius' => $all(2), 'text_padding' => $dim(11, 16, 11, 16),
      '__globals__' => ['button_text_color' => 'globals/colors?id=primary', 'hover_color' => 'globals/colors?id=primary', 'border_color' => 'globals/colors?id=line', 'button_hover_border_color' => 'globals/colors?id=primary'],
    ], $typo('typography', 'Inter', 600, $fluid['xs'], 1.7, ['text_transform' => 'uppercase', 'letter_spacing' => ['unit' => 'em', 'size' => 0.03, 'sizes' => []]]))), $chips)),
]];

/* ================= 3–8 Service blocks (alternating; related projects = newest three of the service's project types) ================= */
$s1 = $SERVICE('construction', false, '01', 'Construction',
  'Full-scale construction ranging from G+1 luxury villas to G+4 residential and commercial buildings, with complete structural integrity.',
  'As an approved G+4 contractor, Taameer Plus has successfully completed many turnkey projects, including the structure and full fit-out of villas and service blocks, with remarkable quality.',
  null, 'project-dubai-g-residential-villa-02.webp', [
    ['wadi-alshabak-villas', 'Proposed G+1 Residential Villas', 'Wadi Alshabak, Dubai', 'Construction', 'Ongoing', 'project-wadi-alshabak-villas-01.webp', ['Ongoing', '3D Visualization']],
    ['al-awir-villas', 'Proposed G+1 Residential Villas', 'Al Awir 1, Dubai', 'Construction', '2025', 'project-al-awir-villas-01.webp', []],
    ['dubai-g-residential-villa', 'Proposed G Residential Villa', 'Dubai, UAE', 'Construction', '2025', 'project-dubai-g-residential-villa-01.webp', []],
  ]);
$s2 = $SERVICE('design-build', true, '02', 'Design &amp; Build',
  'Direct single-contract solutions covering structural, architectural, and electromechanical works, evaluated for cost and buildability by one team.',
  'Taameer Plus handles Design-Build projects by entering into a direct contract with the client to provide all design aspects related to structural, architectural and electromechanical works. The team evaluates alternative materials and methods efficiently and accurately, and value engineering and constructability are applied continuously and more effectively when designers and Taameer Plus work together as one team throughout the design process. These steps ultimately save the owner significant amounts of money and time.',
  null, 'project-al-awir-villas-02.webp');
$s3 = $SERVICE('decoration-fitout', false, '03', 'Decoration &amp; Fit-out',
  'Premium corporate, retail, hospitality, and residential fit-out and decoration, including custom wall cladding and joinery through our carpentry division.',
  null, ['See the wall cladding showcase', '#wall-cladding'], 'project-kf-inc-headquarters-05.webp', [
    ['kf-inc-headquarters', 'Fit-out of KF INC Headquarters Office', 'Al Saadiyat Island, Abu Dhabi', 'Fit-out', '2024', 'project-kf-inc-headquarters-01.webp', []],
    ['perfume-shop-al-barsha', 'Perfume Shop Fit-out &amp; Decoration', 'Al Barsha 1st, Dubai', 'Fit-out', '2023', 'project-perfume-shop-al-barsha-01.webp', []],
    ['um-nahad-villa', 'Fit-out &amp; Decoration of Private Villa', 'Um Nahad, Dubai', 'Fit-out', '2022', 'project-um-nahad-villa-01.webp', []],
  ]);
$s4 = $SERVICE('renovation', true, '04', 'Renovation',
  'Complete building and villa refurbishments, interior modernisations and structural updates executed on schedule.',
  null, null, 'project-dubai-marina-triplex-villa-04.webp', [
    ['jvc-residential-retail-building', 'Full Renovation of Residential &amp; Retail Building (G+4P+H+22+R)', 'JVC, Al Barsha 4th, Dubai', 'Renovation &amp; Decoration', '2026', 'project-jvc-residential-retail-building-01.webp', []],
    ['palm-jumeirah-villa', 'Private Villa Renovation', 'Palm Jumeirah, UAE', 'Renovation &amp; Decoration', '2025', 'project-palm-jumeirah-villa-02.webp', []],
    ['al-warqa-4th-villa', 'Renovation &amp; Decoration of Private Villa', 'Al Warqa 4th, Dubai', 'Renovation &amp; Decoration', '2024', 'project-al-warqa-4th-villa-01.webp', []],
  ]);
$s5 = $SERVICE('maintenance', false, '05', 'Maintenance',
  'Ongoing technical services, active maintenance, and facility support that keep structures in prime condition long after handover.',
  null, null, 'project-atlas-copco-headquarters-03.webp');
$s6 = $SERVICE('turnkey', true, '06', 'Turnkey Projects',
  'Experienced professionals handling all phases of construction — from new build to renovation — coordinated with qualified subcontractors to meet deadlines.',
  'Taameer Plus provides experienced and knowledgeable professionals to handle all phases of project construction. As a general contractor, we handle all types and volumes of projects, from new construction to renovations. Our project management team maintains full coordination throughout every phase with our field staff and qualified subcontractors, delivering projects on schedule with the highest standards of safety and quality to ensure deadlines are met.',
  ['View construction projects', '/projects/?type=construction'], 'project-al-warqa-1st-g2-villa-06.webp');

/* ================= 9 Wall cladding showcase: Basic Gallery (one lightbox slideshow; 3 / 3 / 2 per row, 4:3) ================= */
// Lightbox caption = attachment title (Kit setting); the prototype captions each photo with its alt text, so the six
// titles are set to the alt text (filenames before). Media metadata only; idempotent.
foreach (range(1, 6) as $n) {
  $aid = $MAP["project-wall-cladding-0$n.webp"] ?? 0;
  $alt = $aid ? get_post_meta($aid, '_wp_attachment_image_alt', true) : '';
  if ($alt && get_the_title($aid) !== $alt) wp_update_post(['ID' => $aid, 'post_title' => $alt]);
}
$gallery = array_map(fn($n) => ['id' => $MAP["project-wall-cladding-0$n.webp"] ?? 0, 'url' => wp_get_attachment_url($MAP["project-wall-cladding-0$n.webp"] ?? 0)], range(1, 6));
$cladding = $SEC($PAD, ['_element_id' => 'wall-cladding'], [
  $HEADX('Showcase', 'Wall cladding', 'Wall cladding for multiple projects. Designed and executed by the Taameer Plus team.'),
  $W('image-gallery', [
    'wp_gallery' => $gallery, 'thumbnail_size' => 'full', 'gallery_columns' => '3', // 2 per row below 768px: taameer.css (the control is not responsive)
    'gallery_link' => 'file', 'open_lightbox' => 'yes', 'gallery_display_caption' => 'none',
    'image_spacing' => 'custom', 'image_spacing_custom' => $px(0),
    '_css_classes' => 'tp-gallery',
  ] + $anim(0)),
]);

/* ================= 10 CTA band (shared template; follows a white section, as on the homepage) ================= */
$cta_id = (int) get_option('tp_cta_template_id');
if (!$cta_id || get_post_type($cta_id) !== 'elementor_library') return ['error' => 'CTA template missing'];
$cta_ref = ['id' => $uid(), 'elType' => 'container', 'isInner' => false,
  'settings' => ['content_width' => 'full', 'flex_direction' => 'column', 'flex_gap' => $gap(0), 'padding' => $all(0)],
  'elements' => [$W('shortcode', ['shortcode' => '[tp_template id="' . $cta_id . '"]'])]];

/* ================= Page ================= */
$svc_id = (int) get_option('tp_services_page_id');
if (!$svc_id || get_post_type($svc_id) !== 'page') {
  $existing = get_page_by_path('services', OBJECT, 'page');
  $svc_id = $existing ? $existing->ID : wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Services', 'post_name' => 'services', 'post_content' => ''], true);
  if (is_wp_error($svc_id)) return ['error' => $svc_id->get_error_message()];
  update_option('tp_services_page_id', $svc_id, false);
}
update_post_meta($svc_id, '_wp_page_template', 'elementor_header_footer');
$docs = \Elementor\Plugin::$instance->documents;
$page = $docs->get($svc_id, false);
$page->set_is_built_with_elementor(true); // "Edit with Elementor" mode; without it WordPress renders the plain-text fallback
$ok = $page->save([
  'elements' => [$hero, $chipNav, $s1, $s2, $s3, $s4, $s5, $s6, $cladding, $cta_ref],
  'settings' => ['template' => 'elementor_header_footer', 'hide_title' => 'yes'],
]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
return ['services' => $svc_id, 'saved' => $ok, 'url' => get_permalink($svc_id), 'edit' => admin_url("post.php?post=$svc_id&action=elementor"), 'cta' => $cta_id];
