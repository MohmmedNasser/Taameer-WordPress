// 10-project-detail.php — builds ONE project detail page from project.html + data/projects.json (WP phase 4B: the approved
// reference implementation, wadi-alshabak-villas, the first card of the Projects listing). Elementor Containers + native widgets
// only (Heading, Text Editor, Image, Basic Gallery, Button, Shortcode); no HTML widget, no CPT, no Loop Grid, no dynamic query.
// Page = child of /projects/ so the URL is /projects/<slug>/ (the card links already used by the listing). Related projects and
// previous/next are STATIC cards computed here with the prototype's rules (project-page.js): up to 3 of the same type excluding
// the current one, then Projects-grid order, wrapping at the ends. Set $SLUG and $DETAIL to build another project (phase 4C).
// Helpers are copied from 09-projects.php (each Novamira run is standalone). Re-running replaces the page content (same ID).
// Run on the site through Novamira (novamira/execute-php).

$SLUG = 'wadi-alshabak-villas';
$DETAIL = json_decode(<<<'JSON'
{
 "wadi-alshabak-villas": {
  "period": "13 Months",
  "consultant": null,
  "description": "",
  "gallery": ["project-wadi-alshabak-villas-01.webp", "project-wadi-alshabak-villas-02.webp", "project-wadi-alshabak-villas-03.webp", "project-wadi-alshabak-villas-04.webp", "project-wadi-alshabak-villas-05.webp"]
 }
}
JSON, true);

$MAP = get_option('tp_media_map', []);
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


/* ================= Projects-only: data (data/projects.json, listing order of projects.js, 22 projects, showcase excluded) ================= */
$PROJECTS = json_decode(<<<'JSON'
[
 {
  "id": "wadi-alshabak-villas",
  "title": "Proposed G+1 Residential Villas",
  "type": "construction",
  "location": "Wadi Alshabak, Dubai",
  "status": "ongoing",
  "completion": null,
  "isRender": true,
  "cover": "assets/img/project-wadi-alshabak-villas-01.webp"
 },
 {
  "id": "jvc-residential-retail-building",
  "title": "Full Renovation of Residential & Retail Building (G+4P+H+22+R)",
  "type": "renovation-decoration",
  "location": "JVC, Al Barsha 4th, Dubai",
  "status": "completed",
  "completion": "2026-03",
  "isRender": false,
  "cover": "assets/img/project-jvc-residential-retail-building-01.webp"
 },
 {
  "id": "palm-jumeirah-villa",
  "title": "Private Villa Renovation",
  "type": "renovation-decoration",
  "location": "Palm Jumeirah, UAE",
  "status": "completed",
  "completion": "2025-11",
  "isRender": false,
  "cover": "assets/img/project-palm-jumeirah-villa-02.webp"
 },
 {
  "id": "al-awir-villas",
  "title": "Proposed G+1 Residential Villas",
  "type": "construction",
  "location": "Al Awir 1, Dubai",
  "status": "completed",
  "completion": "2025-08",
  "isRender": false,
  "cover": "assets/img/project-al-awir-villas-01.webp"
 },
 {
  "id": "dubai-g-residential-villa",
  "title": "Proposed G Residential Villa",
  "type": "construction",
  "location": "Dubai, UAE",
  "status": "completed",
  "completion": "2025-07",
  "isRender": false,
  "cover": "assets/img/project-dubai-g-residential-villa-01.webp"
 },
 {
  "id": "abu-dhabi-marina-private-gym",
  "title": "Construction & Fit-out of Private Gym",
  "type": "construction",
  "location": "Marina, Abu Dhabi",
  "status": "completed",
  "completion": "2024-09",
  "isRender": false,
  "cover": "assets/img/project-abu-dhabi-marina-private-gym-01.webp"
 },
 {
  "id": "kf-inc-headquarters",
  "title": "Fit-out of KF INC Headquarters Office",
  "type": "fit-out",
  "location": "Al Saadiyat Island, Abu Dhabi",
  "status": "completed",
  "completion": "2024-07",
  "isRender": false,
  "cover": "assets/img/project-kf-inc-headquarters-01.webp"
 },
 {
  "id": "al-warqa-4th-villa",
  "title": "Renovation & Decoration of Private Villa",
  "type": "renovation-decoration",
  "location": "Al Warqa 4th, Dubai",
  "status": "completed",
  "completion": "2024-04",
  "isRender": false,
  "cover": "assets/img/project-al-warqa-4th-villa-01.webp"
 },
 {
  "id": "dubai-marina-triplex-villa",
  "title": "Renovation & Decoration of G+2 Triplex Villa",
  "type": "renovation-decoration",
  "location": "Dubai Marina, Dubai",
  "status": "completed",
  "completion": "2024-02",
  "isRender": false,
  "cover": "assets/img/project-dubai-marina-triplex-villa-01.webp"
 },
 {
  "id": "perfume-shop-al-barsha",
  "title": "Perfume Shop Fit-out & Decoration",
  "type": "fit-out",
  "location": "Al Barsha 1st, Dubai",
  "status": "completed",
  "completion": "2023-12",
  "isRender": false,
  "cover": "assets/img/project-perfume-shop-al-barsha-01.webp"
 },
 {
  "id": "mbr-city-villa",
  "title": "Renovation & Decoration of G+1 Private Villa",
  "type": "renovation-decoration",
  "location": "MBR City by EMAAR, Dubai",
  "status": "completed",
  "completion": "2023-12",
  "isRender": false,
  "cover": "assets/img/project-mbr-city-villa-01.webp"
 },
 {
  "id": "al-warqa-1st-g2-villa",
  "title": "Construction of G+2 Private Villa",
  "type": "construction",
  "location": "Al Warqa 1st, Dubai",
  "status": "completed",
  "completion": "2023-11",
  "isRender": false,
  "cover": "assets/img/project-al-warqa-1st-g2-villa-01.webp"
 },
 {
  "id": "faiz-couture-dress-shop",
  "title": "Renovation & Decoration of Dress Shop (Faiz Couture)",
  "type": "renovation-decoration",
  "location": "Al Bustan Shopping Centre, Dubai",
  "status": "completed",
  "completion": "2023-11",
  "isRender": false,
  "cover": "assets/img/project-faiz-couture-dress-shop-01.webp"
 },
 {
  "id": "atlas-copco-headquarters",
  "title": "Renovation & Decoration of Atlas Copco Headquarters",
  "type": "renovation-decoration",
  "location": "Gold & Diamond Park by EMAAR, Dubai",
  "status": "completed",
  "completion": "2023-08",
  "isRender": false,
  "cover": "assets/img/project-atlas-copco-headquarters-01.webp"
 },
 {
  "id": "al-twar-villa",
  "title": "Renovation & Decoration of Private Villa",
  "type": "renovation-decoration",
  "location": "Villa #5, Al Twar 2, Dubai",
  "status": "completed",
  "completion": "2023-07",
  "isRender": false,
  "cover": "assets/img/project-al-twar-villa-01.webp"
 },
 {
  "id": "souk-al-bahar-apartment",
  "title": "Renovation & Decoration of Residential Flat",
  "type": "renovation-decoration",
  "location": "Souk Al Bahar by EMAAR, Dubai Mall, Dubai",
  "status": "completed",
  "completion": "2023-06",
  "isRender": false,
  "cover": "assets/img/project-souk-al-bahar-apartment-01.webp"
 },
 {
  "id": "um-nahad-villa",
  "title": "Fit-out & Decoration of Private Villa",
  "type": "fit-out",
  "location": "Um Nahad, Dubai",
  "status": "completed",
  "completion": "2022-12",
  "isRender": false,
  "cover": "assets/img/project-um-nahad-villa-01.webp"
 },
 {
  "id": "beauty-lounge-spa-mirdif",
  "title": "Fit-out of Ladies Beauty Lounge & Spa",
  "type": "fit-out",
  "location": "The 77 Hub Mall, Mirdif, Dubai",
  "status": "completed",
  "completion": "2022-11",
  "isRender": false,
  "cover": "assets/img/project-beauty-lounge-spa-mirdif-01.webp"
 },
 {
  "id": "thai-restaurant-deira",
  "title": "Fit-out of Thai Restaurant",
  "type": "fit-out",
  "location": "Muteena, Deira, Dubai",
  "status": "completed",
  "completion": "2022-10",
  "isRender": false,
  "cover": "assets/img/project-thai-restaurant-deira-01.webp"
 },
 {
  "id": "jumeirah-golf-estates-landscaping",
  "title": "Fit-out & Landscaping for Private Villa",
  "type": "landscaping",
  "location": "Jumeirah Golf Estates by WASL, Dubai",
  "status": "completed",
  "completion": "2021-10",
  "isRender": false,
  "cover": "assets/img/project-jumeirah-golf-estates-landscaping-01.webp"
 },
 {
  "id": "damac-hills-villa",
  "title": "Renovation of Private Villa",
  "type": "renovation-decoration",
  "location": "DAMAC Hills by DAMAC, Dubai",
  "status": "completed",
  "completion": "2018-04",
  "isRender": false,
  "cover": "assets/img/project-damac-hills-villa-01.webp"
 },
 {
  "id": "service-blocks-extensions",
  "title": "Service Blocks & Extensions",
  "type": "construction",
  "location": "Multiple locations",
  "status": "completed",
  "completion": null,
  "isRender": false,
  "cover": "assets/img/project-service-blocks-extensions-01.webp"
 }
]
JSON, true);
$TYPES = ['construction' => 'Construction', 'renovation-decoration' => 'Renovation &amp; Decoration', 'fit-out' => 'Fit-out', 'landscaping' => 'Landscaping'];
$esc = fn($s) => htmlspecialchars($s, ENT_NOQUOTES, 'UTF-8');

/* ================= selected project ================= */
$list = $PROJECTS;                                       // already in listing (Projects-grid) order
$idx = array_search($SLUG, array_column($list, 'id'), true);
if ($idx === false || !isset($DETAIL[$SLUG])) return ['error' => "unknown project $SLUG"];
$P = $list[$idx] + $DETAIL[$SLUG];
$typeLabel = $TYPES[$P['type']];
$title = $esc($P['title']);
$related = array_slice(array_values(array_filter($list, fn($x) => $x['type'] === $P['type'] && $x['id'] !== $SLUG)), 0, 3);
$prev = $list[($idx - 1 + count($list)) % count($list)];
$next = $list[($idx + 1) % count($list)];
$projectsId = (int) get_option('tp_projects_page_id');
if (!$projectsId) return ['error' => 'Projects page missing'];

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

/* ================= 1 Page hero + breadcrumbs (Home > Projects > name), H1 = title ================= */
$H1W22 = 'calc(13.53 * clamp(2.375rem, 1.85rem + 2.9vw, 4.75rem))';   // .tp-project-title: 22ch of the H1
$hero = $SEC([[48, 60], [32, 48], [32, 40]], array_merge($FOG, $border(0, 0, 1, 0)), [
  $T('<nav class="tp-breadcrumb" aria-label="Breadcrumb"><ol class="tp-breadcrumb__list"><li><a href="/">Home</a></li><li><a href="/projects/">Projects</a></li><li><span aria-current="page">' . $title . '</span></li></ol></nav>', null, 'secondary'),
  $C(['margin' => $dim(32, 0, 0, 0), 'flex_gap' => $gap(24)], [
    $H($typeLabel, 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']),
    $H($title, 'h1', 'h1', 'primary', $MW($H1W22)),
    ...($P['description'] ? [$T('<p>' . $esc($P['description']) . '</p>', 'secondary', 'secondary', $MW($MEASURE))] : []),
  ]),
]);

/* ================= 2 Overview: spec block (dl) + cover (framed, never upscaled) ================= */
$spec = [['Type', $typeLabel], ['Location', $esc($P['location'])]];
if ($P['period']) $spec[] = ['Duration', $esc($P['period'])];
if ($P['status'] === 'ongoing') $spec[] = ['Completion', 'Ongoing'];
elseif ($P['completion']) $spec[] = ['Completion', date('F Y', strtotime($P['completion'] . '-01'))];
if ($P['consultant']) $spec[] = ['Consultant', $esc($P['consultant'])];
$specHtml = '<dl>' . implode('', array_map(fn($r) => "<dt>{$r[0]}</dt><dd>{$r[1]}</dd>", $spec)) . '</dl>';

$cover = $IMG(basename($P['cover']), array_merge(['_border_radius' => $all(2)], $shadow('_', 12, 32, 0.09)));
$cover['settings']['image']['alt'] = $P['title'] . ', ' . $P['location'];     // prototype: "title, location" (gallery images carry "image i of n")
$coverW = 487;                                                                  // native width of the cover (never upscaled)
$overview = $SEC($PAD, ['css_classes' => 'tp-project-overview'], [
  $C(['flex_direction' => 'row', 'flex_direction_tablet' => 'column', 'flex_direction_mobile' => 'column', 'flex_wrap' => 'nowrap',
      'flex_align_items' => 'flex-start', 'flex_gap' => $gap(41), 'flex_gap_tablet' => $gap(32), 'flex_gap_mobile' => $gap(24)], [
    $C(['width' => $cw('calc((100% - 41px) * 0.2948)'), 'width_tablet' => $w(100), 'width_mobile' => $w(100)], [
      $T($specHtml, null, 'primary', ['_css_classes' => 'tp-spec tp-spec--stack']),
    ]),
    $C(['width' => $cw('calc((100% - 41px) * 0.7052)'), 'width_tablet' => $w(100), 'width_mobile' => $w(100)], [
      $C(['css_classes' => 'tp-frame', 'width' => $cw("min(100%, {$coverW}px)")], [$cover]),
    ]),
  ]),
]);

/* ================= 3 3D Visualization notice (only when the project is a render) ================= */
$TIGHT = [[58, 58], [52, 52], [40, 40]];   // --tp-section-pad-tight at desktop / tablet / mobile
$notice = $P['isRender'] ? [$SEC($TIGHT, ['css_classes' => 'tp-render-note-section'], [
  $T('<p><strong>3D Visualization.</strong> These images are 3D visualizations of the project, not photographs of the finished building.</p>', null, 'secondary', ['_css_classes' => 'tp-render-note']),
])] : [];

/* ================= 4 Gallery: Basic Gallery (native lightbox), CSS-columns masonry (tp-masonry) ================= */
$gallery = array_map(fn($f) => ['id' => $MAP[$f] ?? 0, 'url' => wp_get_attachment_url($MAP[$f] ?? 0)], $P['gallery']);
if (in_array(0, array_column($gallery, 'id'), true)) return ['error' => 'gallery image missing from media map'];
// Lightbox caption = attachment title: set it to the alt text (as 08-services.php does for the cladding gallery). Idempotent.
foreach ($gallery as $g) {
  $alt = get_post_meta($g['id'], '_wp_attachment_image_alt', true);
  if ($alt && get_the_title($g['id']) !== $alt) wp_update_post(['ID' => $g['id'], 'post_title' => $alt]);
}
$galleryS = $SEC($PAD, array_merge($FOG, ['css_classes' => 'tp-project-gallery-section']), [
  $C(['flex_gap' => $gap(16), 'margin' => $dim(0, 0, 64, 0), 'margin_mobile' => $dim(0, 0, 48, 0)], [
    $H('Gallery', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']),
    $H('Project images', 'h2', 'h2', 'primary', $MW($H2W)),
  ]),
  $W('image-gallery', [
    'wp_gallery' => $gallery, 'thumbnail_size' => 'full', 'gallery_columns' => '3',
    'gallery_link' => 'file', 'open_lightbox' => 'yes', 'gallery_display_caption' => 'none',
    'image_spacing' => 'custom', 'image_spacing_custom' => $px(0),
    '_css_classes' => 'tp-masonry',
  ]),
]);

/* ================= 5 Previous / next project (listing order, wraps) ================= */
$navLink = fn($p, $label, $cls) => $C([
  'html_tag' => 'a', 'link' => ['url' => "/projects/{$p['id']}/", 'is_external' => '', 'nofollow' => ''],
  'css_classes' => "tp-project-nav__link tp-project-nav__$cls", 'flex_gap' => $gap(8), 'padding' => $dim(16, 0, 16, 0),
  'width' => $cw('calc((100% - 24px) / 2)'), 'width_tablet' => $cw('calc((100% - 24px) / 2)'), 'width_mobile' => $w(100),
], [
  $H($label, 'p', 'eyebrow', 'secondary', ['_css_classes' => 'tp-project-nav__label']),
  $H($esc($p['title']), 'p', null, 'primary', $typo('typography', 'Playfair Display', 400, $fluid['h4'], 1.15) + ['_css_classes' => 'tp-project-nav__title']),
]);
$navS = $SEC($TIGHT, array_merge(['html_tag' => 'nav', 'css_classes' => 'tp-project-nav'], $border(1, 0, 0, 0)), [
  $C(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_justify_content' => 'space-between', 'flex_gap' => $gap(24)], [
    $navLink($prev, 'Previous project', 'prev'),
    $navLink($next, 'Next project', 'next'),
  ]),
]);

/* ================= 6 Related projects (static cards) ================= */
$relatedS = $related ? [$SEC($PAD, ['css_classes' => 'tp-related'], [
  $ROW(0.7, 0.3,
    [[$H('Keep exploring', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']), $H('Related projects', 'h2', 'h2', 'primary', $MW($H2W))]],
    [[$B('All projects', '/projects/', 'link')], ['flex_gap' => $gap(16)]],
    ['flex_justify_content' => 'space-between', 'flex_align_items' => 'flex-end', 'flex_align_items_tablet' => 'flex-start', 'flex_align_items_mobile' => 'flex-start', 'margin' => $dim(0, 0, 64, 0), 'margin_mobile' => $dim(0, 0, 48, 0)]),
  $C($cardRowS(44), array_map($card, $related)),
])] : [];

/* ================= 7 CTA band (shared template) ================= */
$cta_id = (int) get_option('tp_cta_template_id');
if (!$cta_id || get_post_type($cta_id) !== 'elementor_library') return ['error' => 'CTA template missing'];
$cta_ref = ['id' => $uid(), 'elType' => 'container', 'isInner' => false,
  'settings' => ['content_width' => 'full', 'flex_direction' => 'column', 'flex_gap' => $gap(0), 'padding' => $all(0)],
  'elements' => [$W('shortcode', ['shortcode' => '[tp_template id="' . $cta_id . '"]'])]];

/* ================= Page (child of /projects/, slug = project id) ================= */
$ids = get_option('tp_project_page_ids', []);
$pid = (int) ($ids[$SLUG] ?? 0);
if (!$pid || get_post_type($pid) !== 'page') {
  $existing = get_page_by_path("projects/$SLUG", OBJECT, 'page');
  $pid = $existing ? $existing->ID : wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => html_entity_decode($title), 'post_name' => $SLUG, 'post_parent' => $projectsId, 'post_content' => ''], true);
  if (is_wp_error($pid)) return ['error' => $pid->get_error_message()];
  $ids[$SLUG] = $pid;
  update_option('tp_project_page_ids', $ids, false);
}
update_post_meta($pid, '_wp_page_template', 'elementor_header_footer');
$page = \Elementor\Plugin::$instance->documents->get($pid, false);
$page->set_is_built_with_elementor(true);
$ok = $page->save([
  'elements' => array_merge([$hero, $overview], $notice, [$galleryS, $navS], $relatedS, [$cta_ref]),
  'settings' => ['template' => 'elementor_header_footer', 'hide_title' => 'yes'],
]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
return ['page' => $pid, 'saved' => $ok, 'url' => get_permalink($pid), 'edit' => admin_url("post.php?post=$pid&action=elementor"), 'related' => array_column($related, 'id'), 'prev' => $prev['id'], 'next' => $next['id'], 'cta' => $cta_id];
