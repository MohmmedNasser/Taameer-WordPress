// 13-404.php — builds the 404 content (WP phase 7) from 404.html as an Elementor saved template ("404 page", Templates →
// Saved Templates, option tp_404_template_id). Elementor Free has no Theme Builder, so the child theme's functions.php prints
// this template in place of Astra's 404 content (full width, like the Elementor pages) on every not-found URL; the response
// stays a real 404. Containers + native widgets only (Text Editor, Heading, Button, Image); no HTML widget, no Loop Grid.
// Sections as the prototype: "404" + "+" mark beside eyebrow, H1, lead and two buttons (Home, Projects); hairline; "Or explore
// our work" with 3 featured project cards. No breadcrumbs, no CTA band (the prototype ends on the projects), no entrance
// animations (the prototype's 404 has none).
// Featured projects are STATIC, computed with the prototype's rule (projects.js: featured, listing order, first 3):
// palm-jumeirah-villa, dubai-g-residential-villa, kf-inc-headquarters. Cards = the project pages' related-card build.
// Helpers are copied from 10-project-detail.php (each Novamira run is standalone). Creates the template once; re-running
// replaces its content (same ID). Run on the site through Novamira (novamira/execute-php).

$FEATURED = json_decode(<<<'JSON'
[
 {"id":"palm-jumeirah-villa","title":"Private Villa Renovation","type":"renovation-decoration","location":"Palm Jumeirah, UAE","status":"completed","completion":"2025-11","cover":"project-palm-jumeirah-villa-02.webp"},
 {"id":"dubai-g-residential-villa","title":"Proposed G Residential Villa","type":"construction","location":"Dubai, UAE","status":"completed","completion":"2025-07","cover":"project-dubai-g-residential-villa-01.webp"},
 {"id":"kf-inc-headquarters","title":"Fit-out of KF INC Headquarters Office","type":"fit-out","location":"Al Saadiyat Island, Abu Dhabi","status":"completed","completion":"2024-07","cover":"project-kf-inc-headquarters-01.webp"}
]
JSON, true);

$MAP = get_option('tp_media_map', []);
foreach ($FEATURED as $p) if (empty($MAP[$p['cover']])) return ['error' => "cover missing from media map: {$p['cover']}"];

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

$TYPES = ['construction' => 'Construction', 'renovation-decoration' => 'Renovation &amp; Decoration', 'fit-out' => 'Fit-out', 'landscaping' => 'Landscaping'];
$esc = fn($s) => htmlspecialchars($s, ENT_NOQUOTES, 'UTF-8');

// Project card (same build as the listing; no entrance animation: the prototype's related cards have none). 3 / 3 / 1 per row.
$ABS = ['position' => 'absolute', '_offset_orientation_h' => 'start', '_offset_x' => $px(16), '_offset_orientation_v' => 'start', '_offset_y' => $px(16), 'z_index' => 2];
$card = function ($p) use ($C, $H, $IMG, $BADGE, $gap, $w, $all, $cw, $px, $cols, $typo, $fluid, $esc, $TYPES, $ABS) {
  $badges = [];
  if ($p['status'] === 'ongoing') $badges[] = 'Ongoing';
  if (!empty($p['isRender'])) $badges[] = '3D Visualization';
  $when = $p['status'] === 'ongoing' ? 'Ongoing' : substr($p['completion'] ?? '', 0, 4);
  return $C(array_merge([
    'html_tag' => 'a', 'link' => ['url' => "/projects/{$p['id']}/", 'is_external' => '', 'nofollow' => ''],
    'css_classes' => 'tp-card tp-type-' . $p['type'], 'flex_gap' => $gap(16),
  ], $cols(3, 3, 1)), [
    $C([], array_merge(
      [$IMG(basename($p['cover']), ['_css_classes' => 'tp-ratio-4x3', 'width' => $w(100), '_border_radius' => $all(6)])],
      $badges ? [$C(array_merge(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_gap' => $gap(8), 'width' => $cw('calc(100% - 32px)')], $ABS), array_map(fn($b) => $BADGE($b), $badges))] : []
    )),
    $C(['flex_direction' => 'row', 'flex_justify_content' => 'space-between', 'flex_wrap' => 'wrap', 'flex_gap' => $gap(8)], [
      $H($TYPES[$p['type']], 'p', 'eyebrow', 'secondary'),
      ...($when !== '' ? [$H($when, 'p', 'eyebrow', 'secondary')] : []),
    ]),
    $H($esc($p['title']), 'h3', null, 'primary', $typo('typography', 'Playfair Display', 400, $fluid['h4'], 1.15)),
    $H($esc($p['location']), 'p', 'small', 'secondary'),
    $H('View project', 'p', 'link', 'accent', ['_css_classes' => 'tp-card__more'] + $typo('typography', 'Inter', 600, $fluid['xs'], 1.7, ['text_transform' => 'uppercase', 'letter_spacing' => ['unit' => 'em', 'size' => 0.03, 'sizes' => []]])),
  ]);
};

/* ================= 404: message ================= */
// "404" (display size, aria-hidden as the prototype) with the ink "+" mark at its top end. The mark is an empty Container
// drawn by the child theme's "+" mask rule (tp-location__mark, shared with Contact; no new CSS).
$CODE = 'clamp(6rem, 3rem + 14vw, 14rem)';                                       // .tp-404__code font size
$code = $C(['width' => $cw('fit-content'), 'css_classes' => 'tp-404-code'], [
  $T('<p aria-hidden="true">404</p>', null, 'text', array_merge(
    $typo('typography', 'Playfair Display', 500, $CODE, 1.05, ['letter_spacing' => ['unit' => 'em', 'size' => -0.01, 'sizes' => []]]),
    ['_padding' => $dim(0, 0.3, 0, 0, 'em')])),
  $C(['css_classes' => 'tp-location__mark', 'width' => $px(40), 'min_height' => $px(40),
      'position' => 'absolute', '_offset_orientation_h' => 'end', '_offset_x_end' => $px(0),
      '_offset_orientation_v' => 'start', '_offset_y' => $cw("calc(0.1 * $CODE)")]),
]);
$text = $C(['width' => $cw('min(100%, 22rem)'), '_flex_size' => 'grow', 'flex_align_items' => 'flex-start', 'flex_gap' => $gap(24)], [
  $H('Page not found', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']),
  $H('We could not find that page', 'h1', 'h1', 'primary', $MW($H1W)),
  $T('<p>The page may have moved, or the link may be incorrect. Return to the homepage or browse our projects.</p>', 'secondary', 'text', $MW($MEASURE)),
  $C(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_gap' => $gap(12), 'width' => $w(100)], [
    $B('Back to home', '/'),
    $B('View projects', '/projects/', 'ghost'),
  ]),
]);
$hero = $C(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_align_items' => 'center', 'flex_gap' => $gap(64), 'padding' => $dim(0, 0, 96, 0)], [$code, $text]);

/* ================= 404: featured projects ================= */
$projects = $C(array_merge(['padding' => $dim(64, 0, 0, 0)], $border(1, 0, 0, 0)), [
  // .tp-section-head: eyebrow directly above the H2, 4rem below at every width.
  $C(['margin' => $dim(0, 0, 64, 0)], [
    $H('Featured projects', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']),
    $H('Or explore our work', 'h2', 'h2', 'primary', $MW($H2W)),
  ]),
  // Row gap = column gap (the prototype grid's --tp-gap), so the stacked mobile cards sit 24px apart.
  $C(array_merge($cardRowS(44), ['flex_gap_tablet' => $gap(32), 'flex_gap_mobile' => $gap(24)]), array_map($card, $FEATURED)),
]);

$section = $SEC($PAD, ['css_classes' => 'tp-404'], [$hero, $projects]);

/* ================= Saved template ================= */
$docs = \Elementor\Plugin::$instance->documents;
$tid = (int) get_option('tp_404_template_id');
if (!$tid || get_post_type($tid) !== 'elementor_library') {
  $doc = $docs->create('container', ['post_title' => '404 page', 'post_status' => 'publish']);
  $tid = $doc->get_main_id();
  update_option('tp_404_template_id', $tid, false);
}
$doc = $docs->get($tid, false);
$doc->set_is_built_with_elementor(true);
$ok = $doc->save(['elements' => [$section]]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
return ['template' => $tid, 'saved' => $ok, 'edit' => admin_url("post.php?post=$tid&action=elementor"), 'cards' => array_column($FEATURED, 'id')];
