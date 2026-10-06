// 07-about.php — builds the About page from about.html (WP phase 2). Elementor Containers + native widgets only
// (Heading, Text Editor, Image, Button, Counter, Shortcode). CSS classes refer to the child theme's taameer.css.
// Helpers (lines up to $HEAD) are copied verbatim from 05-home.php: each Novamira run is standalone.
// Creates the page "About" (/about/) once (option tp_about_page_id); re-running replaces its content (same ID).
// Reuses the CTA band template (option tp_cta_template_id); does not touch Home, the Kit, Astra or the template.
// Run on the site through Novamira (novamira/execute-php).

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

// Section head: eyebrow + H2 on the start side, short text + link on the end side.
$HEAD = function ($eyebrow, $title, $text, $link) use ($ROW, $H, $T, $B, $anim, $gap) {
  $end = [];
  if ($text) $end[] = $T("<p>$text</p>", 'text', 'text', $MW($MEASURE) + $anim(0));
  if ($link) $end[] = $B($link[0], $link[1], 'link', $anim(100));
  return $ROW(0.7, 0.3,
    [[$H($eyebrow, 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)), $H($title, 'h2', 'h2', 'primary', $anim(100))]],
    [$end, ['flex_gap' => $gap(16)]],
    ['flex_justify_content' => 'space-between', 'flex_align_items' => 'flex-end', 'flex_align_items_tablet' => 'flex-start', 'flex_align_items_mobile' => 'flex-start', 'margin' => ['unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '64', 'left' => '0', 'isLinked' => false], 'margin_mobile' => ['unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '48', 'left' => '0', 'isLinked' => false]]);
};

/* ================= About-only helpers ================= */
$px = fn($v) => ['unit' => 'px', 'size' => $v, 'sizes' => []];
$cw = fn($expr) => ['unit' => 'custom', 'size' => $expr, 'sizes' => []];
// Max line length as Elementor's native Custom Width (Advanced > Width), capped at 100%. The child theme's tp-measure*
// classes cannot do this: Elementor's ".elementor.elementor .e-con > .elementor-widget { max-width: 100% }" outranks them.
// Heading caps follow the prototype's ch values, converted to multiples of the fluid font size (measured at 375/1280/1440).
$MW = fn($expr) => ['_element_width' => 'initial', '_element_custom_width' => $cw("min(100%, $expr)")];
$MEASURE = '38rem';                                                               // --tp-measure
$H1W = 'calc(9.84 * clamp(2.375rem, 1.85rem + 2.9vw, 4.75rem))';                  // 16ch of the H1
$H2W = 'calc(12.3 * clamp(1.875rem, 1.5rem + 1.6vw, 3.125rem))';                  // 20ch of the H2
$PHILW = 'calc(40 * clamp(1.25rem, 1.18rem + 0.35vw, 1.5rem))';                   // 40em of the h4-size text
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
// Compact spec row (drawing title block): eyebrow label + value in Inter 500. $width = [desktop, tablet, mobile] in %.
$SPEC = fn($label, $value, $width = [100, 100, 100], $html = false) => $C(array_merge([
  'width' => $w($width[0]), 'width_tablet' => $w($width[1]), 'width_mobile' => $w($width[2]),
  'flex_gap' => $gap(4), 'padding' => $dim(12, 0, 12, 0),
], $border(0, 0, 1, 0)), [
  $H($label, 'p', 'eyebrow', 'secondary'),
  $html
    ? $T($value, null, 'primary', $typo('typography', 'Inter', 500, $fluid['base'], 1.6))
    : $H($value, 'p', null, 'primary', $typo('typography', 'Inter', 500, $fluid['base'], 1.35)),
]);
$specBox = fn(array $rows) => $C(array_merge(['flex_direction' => 'row', 'flex_wrap' => 'wrap'], $border(1, 0, 0, 0)), $rows);

/* ================= 1 Page hero + breadcrumbs ================= */
$hero = $SEC([[48, 60], [32, 48], [32, 40]], array_merge($FOG, $border(0, 0, 1, 0)), [
  // Breadcrumbs: static links (Elementor Free has no breadcrumbs widget); edited in the Text Editor's Text tab.
  $T('<nav class="tp-breadcrumb" aria-label="Breadcrumb"><ol class="tp-breadcrumb__list"><li><a href="/">Home</a></li><li><span aria-current="page">About</span></li></ol></nav>', null, 'secondary'),
  $C(['margin' => $dim(32, 0, 0, 0), 'flex_gap' => $gap(24)], [
    $H('Taameer Plus Contracting LLC — Dubai, UAE', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(100)),
    $H('About Taameer Plus', 'h1', 'h1', 'primary', $MW($H1W) + $anim(200)),
    $T('<p>Established in Dubai in 2015 as a small technical services company, Taameer Plus Contracting LLC has grown steadily through years of gaining exceptional experience in the market.</p>', 'secondary', 'secondary', $MW($MEASURE) + $anim(300)),
  ]),
]);

/* ================= 2 Chairman's message (portrait sticky on desktop) ================= */
$chairman = $SEC($PAD, [], [
  $C([
    'flex_direction' => 'row', 'flex_direction_tablet' => 'column', 'flex_direction_mobile' => 'column',
    'flex_wrap' => 'nowrap', 'flex_align_items' => 'flex-start',
    'flex_gap' => $gap(44), 'flex_gap_tablet' => $gap(32), 'flex_gap_mobile' => $gap(24),
  ], [
    $C(['css_classes' => 'tp-sticky', 'width' => $cw('26rem'), 'width_tablet' => $cw('min(100%, 26rem)'), 'width_mobile' => $cw('min(100%, 26rem)')], [
      $C(['css_classes' => 'tp-frame'], [
        $IMG('chairman-fahim-al-ali.webp', array_merge(['_css_classes' => 'tp-img-reveal', '_border_radius' => $all(2)], $shadow('_', 12, 32, 0.09))),
      ]),
    ]),
    $C(['width' => $cw('calc(100% - 26rem - 44px)'), 'width_tablet' => $w(100), 'width_mobile' => $w(100), 'flex_gap' => $gap(48)], [
      $H('Chairman’s message', 'h2', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)),
      $T('<blockquote><p>Welcome to our company, Taameer Plus Contracting LLC. Taameer Plus has gained a good reputable name in the market over the years. Through hard work, professionalism and dedication it has become one of the leading companies in Dubai within the industry of design, fit-out, decoration and contracting.</p></blockquote>',
        null, 'primary', array_merge($typo('typography', 'Playfair Display', 500, $fluid['h3'], 1.35),
          ['_css_classes' => 'tp-chair-lead', '_padding' => $dim(48, 0, 0, 0)], $anim(0))),
      $T('<p>I am confident that after meeting the Taameer Plus family, your experience with us will be a turning point in your understanding of construction — a fruitful start to a continuous business relationship, as <em>we build trust before concrete.</em></p>',
        'secondary', 'text', ['_css_classes' => 'tp-chair-body'] + $MW($MEASURE) + $anim(0)),
      $C(array_merge(['width' => $cw('min(100%, 34rem)'), 'flex_gap' => $gap(4), 'padding' => $dim(24, 0, 0, 0)], $border(1, 0, 0, 0, 'ink'), $canim(0)), [
        $H('Mr. Fahim Al-Ali', 'p', null, 'primary', $typo('typography', 'Inter', 600, $fluid['base'], 1.7)),
        $H('Chairman', 'p', 'small', 'secondary'),
      ]),
    ]),
  ]),
]);

/* ================= 3 About text + 2015 fact ================= */
$about = $SEC($PAD, $FOG, [
  $ROW(7 / 12, 5 / 12,
    [[
      $H('About Taameer Plus', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)),
      $H('Pioneering engineering &amp; construction solutions', 'h2', 'h2', 'primary', $MW($H2W) + $anim(0)),
      $T('<p>Established in Dubai in 2015 as a small technical services company, Taameer Plus Contracting LLC has grown steadily through years of gaining exceptional experience in the market. Today, Taameer Plus is a full-service contracting company with well-trained staff delivering high quality and standards, using state-of-the-art engineering processes.</p>', 'secondary', 'text', $MW($MEASURE) + $anim(0)),
      $T('<p>Our primary goal is to achieve the highest quality in all our operations without compromise — offering our customers a safe, cost-effective and professional service. Quality performance is the cornerstone of our company culture and a personal responsibility of every employee.</p>', 'text', 'text', $MW($MEASURE) + $anim(0)),
    ]],
    [[
      // The fact in a hairline title block with the "+" setting-out marks; scales in (Elementor Zoom In, retimed in taameer.css).
      $C(['css_classes' => 'tp-frame', 'animation' => 'zoomIn', 'animation_delay' => 0], [
        $C(array_merge($border(1, 1, 1, 1), [
          'background_background' => 'classic', 'background_color' => '#FFFFFF', '__globals__' => ['background_color' => 'globals/colors?id=paper'],
          'border_radius' => $all(2), 'padding' => $dim(48, 32, 48, 32), 'flex_gap' => $gap(12),
        ]), [
          $H('Established in Dubai', 'p', 'eyebrow', 'secondary'),
          $W('counter', [
            'starting_number' => 1990, 'ending_number' => 2015, 'thousand_separator' => '', 'duration' => 1800, 'title' => '',
            'number_alignment' => 'start', 'number_position' => 'start',
            '__globals__' => ['typography_number_typography' => 'globals/typography?id=stat', 'number_color' => 'globals/colors?id=primary'],
          ]),
          $T('<p>From a small technical services company to a full-service contracting company.</p>', 'text', 'secondary'),
        ]),
      ]),
    ], ['flex_justify_content' => 'center']],
    ['flex_align_items' => 'center', 'flex_align_items_tablet' => 'stretch', 'flex_align_items_mobile' => 'stretch'])
]);

/* ================= 4 Aims (4 / 2 / 1 per row, "+" on the top hairline) ================= */
$aims_items = [
  ['Exceed Expectations', 'Fulfill or exceed customer needs and expectations by delivering a quality project consistently and promptly.'],
  ['Continuous Improvement', 'Maintain the commitment to continuous improvement and communicate our goals to every employee.'],
  ['Safe &amp; Efficient Environment', 'Promote a working environment where training and tools are provided so work proceeds safely.'],
  ['Reviewed Standards', 'Implement a system of policies, periodically reviewed, so all working groups perform effectively.'],
];
$aims = $SEC($PAD, [], [
  $HEADX('Quality performance', 'Our aim', 'To maintain quality performance at the highest level, these four aims are pursued.'),
  $C($cardRowS(32), array_map(fn($a, $i) => $C(array_merge(
    ['css_classes' => 'tp-aim', 'flex_gap' => $gap(12), 'padding' => $dim(32, 0, 0, 0)], $cols(4, 2, 1), $border(1, 0, 0, 0), $canim($i * 110)), [
    $H($a[0], 'h3', 'h4', 'primary'),
    $T("<p>{$a[1]}</p>", 'text', 'secondary'),
  ]), $aims_items, array_keys($aims_items))),
]);

/* ================= 5 Why choose us (same block as Home, different photo) ================= */
$why_items = [
  ['Approved G+4 Contractor', 'Licensed by the Government of Dubai for multi-storey residential and commercial structural developments.'],
  ['Turnkey &amp; Value Engineering', 'Design-build contracts covering structural, architectural and electromechanical works under one roof, saving cost and time.'],
  ['Uncompromising Quality', 'Rigorous quality control, trustworthy relations with private and government agencies, and reliable delivery timelines.'],
];
$why = $SEC($PAD, $FOG, [
  $ROW(0.5, 0.5,
    [[
      $C(['css_classes' => 'tp-frame tp-frame--portrait'], [
        $IMG('project-dubai-g-residential-villa-03.webp', array_merge(['_css_classes' => 'tp-img-reveal tp-parallax', '_border_radius' => $all(2)], $shadow('_', 12, 32, 0.09))),
      ]),
    ]],
    [[
      $H('Why Taameer Plus', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)),
      $H('Why choose us', 'h2', 'h2', 'primary', $anim(100)),
      $C(['margin' => $dim(16, 0, 0, 0)], array_map(fn($it, $i) => $C(array_merge(
        ['css_classes' => 'tp-plus-item', 'flex_gap' => $gap(8), 'padding' => $dim(24, 0, 24, 32)], $border(1, 0, 0, 0), $canim($i * 110)), [
        $H($it[0], 'h3', 'h4', 'primary'),
        $T("<p>{$it[1]}</p>", 'text', 'secondary', $MW($MEASURE)),
      ]), $why_items, array_keys($why_items))),
    ]],
    ['flex_align_items' => 'center'])
]);

/* ================= 6 Leadership (3 / 2 / 1 per row) + team philosophy ================= */
$team = [
  ['team-mohannad-al-musleh.webp', 'Eng. Mohannad Al Musleh', 'General Manager', 'With extensive experience in the UAE’s construction and development sector, he has built strong expertise through senior roles with leading contracting companies in Dubai, contributing to the successful delivery of a diverse portfolio of prestigious projects.'],
  ['team-rauof-al-otaibi.webp', 'Eng. Rauof Al-Otaibi', 'Business Development Manager', 'With extensive experience in the UAE’s construction and development sector, he has built a strong background in business development and real estate, including five years in a Vice President role with a leading Dubai developer.'],
  ['team-mohammad-amer.webp', 'Eng. Mohammad Amer', 'Projects Manager', 'With extensive experience in the UAE construction sector, he has successfully managed a wide range of major projects, building a strong track record in project delivery, coordination, and execution.'],
];
$leadership = $SEC($PAD, [], [
  $HEADX('Expert leadership', 'Meet our core leadership', 'Taameer Plus is a very selective company when it comes to staff — we consider our employees the real treasure of our company.'),
  $C($cardRowS(48), array_map(fn($m, $i) => $C(array_merge(['flex_gap' => $gap(16)], $cols(3, 2, 1), $canim($i * 110)), [
    $IMG($m[0], array_merge(['width' => $w(100), 'image_border_radius' => $all(6)], $imgShadowSm)),
    $C(['flex_gap' => $gap(4)], [
      $H($m[1], 'h3', 'h4', 'primary'),
      $H($m[2], 'p', 'eyebrow', 'accent'),
    ]),
    $T("<p>{$m[3]}</p>", 'text', 'secondary', $MW($MEASURE)),
  ]), $team, array_keys($team))),
  $C(array_merge(['margin' => $dim(64, 0, 0, 0), 'padding' => $dim(32, 0, 0, 0), 'flex_gap' => $gap(16)], $border(1, 0, 0, 0), $canim(0)), [
    $H('Our team', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']),
    $T('<p>Over the years, Taameer Plus has built an experienced team of professional, creative and hard-working engineers, motivated to deliver projects with uncompromising quality, the best economical solution and the shortest time. Trustworthy relations are key to building good relationships with local private and government agencies.</p>',
      null, 'primary', $MW($PHILW) + $typo('typography', 'Playfair Display', 500, $fluid['h4'], 1.35)),
  ]),
]);

/* ================= 7 Team experience: 4 buildings by team members (not company projects, not links; 4 / 2 / 1) ================= */
$exp_items = [
  ['team-exp-al-barsha-hotel.webp', '2B+G+6+HC 4-Star Hotel', 'Al Barsha 1st, Dubai', 'Alhashmi Planners, Arc. Engs.'],
  ['team-exp-nadd-al-hamar-residential.webp', 'G+P+10 Typical + Gym + 2 Roof', 'Nadd Al Hamar, Dubai', 'R-Qitect Design Studio'],
  ['team-exp-dubai-investments-hq.webp', 'Dubai Investments Headquarters', 'Dubai Investment Park, Dubai', 'Dewan Al Amara Engineering Consultants'],
  ['team-exp-souq-al-kabeer-mixed-use.webp', 'G+M+5 Floors + Roof Shopping Mall / Residential', 'Souq Al Kabeer, Dubai', 'Al-Shurooq Consultants'],
];
$experience = $SEC($PAD, $FOG, [
  $HEADX('Recently executed', 'Large-scale projects by the Taameer Plus team', 'Buildings executed by members of the Taameer Plus team as part of their earlier experience. They are not Taameer Plus company projects.', 'small', 'secondary'),
  $C($cardRowS(48), array_map(fn($e, $i) => $C(array_merge(['flex_gap' => $gap(16)], $cols(4, 2, 1), $canim($i * 110)), [
    $C([], [
      $IMG($e[0], array_merge(['_css_classes' => 'tp-exp__img', 'width' => $w(100), 'image_border_radius' => $all(6)], $imgShadowSm)),
      $BADGE('Team experience', ['_position' => 'absolute', '_offset_orientation_h' => 'start', '_offset_x' => $px(16), '_offset_orientation_v' => 'start', '_offset_y' => $px(16), '_z_index' => 2]),
    ]),
    $H($e[1], 'h3', null, 'primary', $typo('typography', 'Playfair Display', 400, $fluid['h4'], 1.15, ['letter_spacing' => ['unit' => 'em', 'size' => -0.01, 'sizes' => []]])),
    $specBox([$SPEC('Location', $e[2]), $SPEC('Consultant', $e[3])]),
  ]), $exp_items, array_keys($exp_items))),
]);

/* ================= 8 Partners grid (14 logos; 7 / 4 / 2 per row) ================= */
$logos = [
  ['partner-al-gurm.webp', 0], ['partner-al-bastaki.webp', 1], ['partner-amec.webp', 0], ['partner-al-sondos.webp', 1],
  ['partner-atlas-copco.webp', 1], ['partner-cooltech.webp', 1], ['partner-cifa.webp', 0], ['partner-innovative-consultants.webp', 1],
  ['partner-kf-inc.webp', 1], ['partner-nahas-interiors.webp', 0], ['partner-oceanworld.webp', 0], ['partner-rd2-design.webp', 0],
  ['partner-r-monogram.webp', 0], ['partner-owa.webp', 1],
];
$partners = $SEC($PAD, [], [
  $HEADX('Strategic alliance', 'Our trusted partners', ''),
  $C(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_justify_content' => 'center', 'flex_gap' => $gap(16)],
    array_map(fn($l, $i) => $C(array_merge([
      'css_classes' => 'tp-partner',
      'width' => $cw('calc((100% - 96px) / 7)'), 'width_tablet' => $cw('calc((100% - 48px) / 4)'), 'width_mobile' => $cw('calc((100% - 16px) / 2)'),
      'min_height' => $px(96), 'flex_justify_content' => 'center', 'flex_align_items' => 'center', 'padding' => $all(16),
      'background_background' => 'classic', 'background_color' => '#FFFFFF', '__globals__' => ['background_color' => 'globals/colors?id=paper'],
      'border_radius' => $all(2),
    ], $border(1, 1, 1, 1), $canim($i * 110)), [
      $IMG($l[0], ['_css_classes' => 'tp-partner__logo' . ($l[1] ? ' tp-blend' : '')]),
    ]), $logos, array_keys($logos))),
]);

/* ================= 9 Licences =================
   The licence "PDFs" are JPEG files with a .pdf extension (not uploaded, D-040). Preview and "View license" open the
   full licence image (license-*.webp, 1810 x 2560, already in the Media Library) in Elementor's lightbox; no PDF is linked. */
$licences = [
  ['license-contracting.webp', 'Taameer Plus Contracting LLC', [
    ['License No.', '741846'], ['Legal type', 'Limited Liability Company (LLC)'], ['Register No.', '1857822'], ['DCCI No.', '257369'],
    ['Issue date', '7 September 2015'], ['Expiry date', '6 September 2027'],
  ], '<p>Building Contracting<br>Decoration Design &amp; Implementation<br>Building Maintenance</p>'],
  ['license-carpentry.webp', 'Taameer Plus Carpentry LLC', [
    ['License No.', '1314264'], ['Legal type', 'Limited Liability Company (LLC)'], ['Register No.', '2230336'], ['DCCI No.', '520139'],
    ['Issue date', '19 February 2024'], ['Expiry date', '18 February 2027'],
  ], '<p>Carpentry</p>'],
];
$licence_card = function ($l, $i) use ($C, $IMG, $H, $B, $BADGE, $SPEC, $specBox, $MAP, $cw, $w, $gap, $all, $shadow, $canim, $imgShadowSm) {
  $full = wp_get_attachment_url($MAP[$l[0]] ?? 0);
  $rows = array_map(fn($r) => $SPEC($r[0], $r[1], [50, 33.333, 100]), $l[2]);
  $rows[] = $SPEC('Primary activities', $l[3], [100, 100, 100], true);
  return $C(array_merge([
    'flex_direction' => 'row', 'flex_direction_mobile' => 'column', 'flex_wrap' => 'nowrap', 'flex_align_items' => 'flex-start',
    'flex_gap' => $gap(32), 'padding' => $all(32),
    'width' => $cw('calc((100% - 44px) / 2)'), 'width_tablet' => $w(100), 'width_mobile' => $w(100),
    'background_background' => 'classic', 'background_color' => '#FFFFFF', '__globals__' => ['background_color' => 'globals/colors?id=paper'],
    'border_radius' => $all(6),
  ], $shadow('', 4, 12, 0.06), $canim($i * 110)), [
    $IMG($l[0], array_merge([
      '_css_classes' => 'tp-license__preview', 'image_size' => 'medium',
      '_element_width' => 'initial', '_element_custom_width' => $cw('8rem'),
      'link_to' => 'file', 'open_lightbox' => 'yes',
      'image_border_border' => 'solid', 'image_border_width' => $all(1), 'image_border_color' => '#D9D9D9', 'image_border_radius' => $all(2),
    ], $imgShadowSm)),
    $C(['width' => $cw('calc(100% - 8rem - 32px)'), 'width_mobile' => $w(100), 'flex_gap' => $gap(16)], [
      $C(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_justify_content' => 'space-between', 'flex_align_items' => 'center', 'flex_gap' => $gap(12)], [
        $H($l[1], 'h3', 'h4', 'primary', ['_element_width' => 'auto']),
        $BADGE('Active'),
      ]),
      $specBox($rows),
      $B('View license', $full, 'ghost', ['_element_width' => 'auto']),
    ]),
  ]);
};
$licences_sec = $SEC($PAD, array_merge($FOG, ['_element_id' => 'licenses']), [
  $HEADX('Compliance &amp; trust', 'Official licenses', 'Commercial licenses issued by the Dubai Department of Economy and Tourism. Open a license to view the full document.'),
  $C($cardRowS(44), array_map($licence_card, $licences, array_keys($licences))),
]);

/* ================= 10 CTA band (shared template; top padding because it follows a fog section) ================= */
$cta_id = (int) get_option('tp_cta_template_id');
if (!$cta_id || get_post_type($cta_id) !== 'elementor_library') return ['error' => 'CTA template missing'];
$cta_ref = ['id' => $uid(), 'elType' => 'container', 'isInner' => false,
  'settings' => ['content_width' => 'full', 'flex_direction' => 'column', 'flex_gap' => $gap(0),
    'padding' => $dim(128, 0, 0, 0), 'padding_tablet' => $dim(96, 0, 0, 0), 'padding_mobile' => $dim(72, 0, 0, 0)],
  'elements' => [$W('shortcode', ['shortcode' => '[tp_template id="' . $cta_id . '"]'])]];

/* ================= Page ================= */
$about_id = (int) get_option('tp_about_page_id');
if (!$about_id || get_post_type($about_id) !== 'page') {
  $existing = get_page_by_path('about', OBJECT, 'page');
  $about_id = $existing ? $existing->ID : wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'About', 'post_name' => 'about', 'post_content' => ''], true);
  if (is_wp_error($about_id)) return ['error' => $about_id->get_error_message()];
  update_option('tp_about_page_id', $about_id, false);
}
update_post_meta($about_id, '_wp_page_template', 'elementor_header_footer');
$docs = \Elementor\Plugin::$instance->documents;
$page = $docs->get($about_id, false);
$page->set_is_built_with_elementor(true); // "Edit with Elementor" mode; without it WordPress renders the plain-text fallback
$ok = $page->save([
  'elements' => [$hero, $chairman, $about, $aims, $why, $leadership, $experience, $partners, $licences_sec, $cta_ref],
  'settings' => ['template' => 'elementor_header_footer', 'hide_title' => 'yes'],
]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
return ['about' => $about_id, 'saved' => $ok, 'url' => get_permalink($about_id), 'edit' => admin_url("post.php?post=$about_id&action=elementor"), 'cta' => $cta_id,
  'lightbox' => \Elementor\Plugin::$instance->kits_manager->get_current_settings('global_image_lightbox')];
