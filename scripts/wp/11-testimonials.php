// 11-testimonials.php — builds the Testimonials page (/testimonials/, WP phase 5) from testimonials.html + data/testimonials.json.
// Elementor Containers + native widgets only (Heading, Text Editor, Image, Button, Shortcode); no HTML widget, no CPT, no
// Loop Grid. Sections as the prototype: page hero + breadcrumbs, the four letters (alternating sheet / text rows, row-reverse
// on even letters, wrapping to one column below ~900px exactly like the prototype's flex-wrap), shared CTA band.
// Each letter = Container <article> whose CSS ID is the testimonial id (atlas-copco, bella-cure, today-engineering,
// jans-noodles): the anchors the project pages' "Read the letter" links (/testimonials/#id) point to. The sheet is a
// Container link (<a>) to the full letter image, which Elementor's global lightbox opens; taameer.js (letterSheets) groups
// the four into one slideshow and names the link, as the prototype does. Letter images are reused from the Media Library.
// Creates the page once (option tp_testimonials_page_id); re-running replaces its content (same ID).
// Run on the site through Novamira (novamira/execute-php).

// data/testimonials.json in listing order (order 1–4), English strings; date shown as on the prototype. Jan's Noodles has
// only its company name and letter (no excerpt, author or date in the source).
$LETTERS = json_decode(<<<'JSON'
[
 {"id":"atlas-copco","company":"Atlas Copco Services Middle East OMC","date":"2023-08-30","excerpt":"They made very good recommendations during the design phase of the project and the communication from their team was very good. It was a pleasure working with your team.","author":"Nicole Rowe","role":"Regional Human Resources Manager, Power Technique","project":["atlas-copco-headquarters","Renovation & Decoration of Atlas Copco Headquarters"],"image":"letter-atlas-copco.webp"},
 {"id":"bella-cure","company":"Bella Cure Beauty Lounge","date":"2022-11","excerpt":"Taameer Plus Contracting LLC team accomplished designing and constructing work for the beauty lounge successfully, and adhered professionally to project completion budget, schedule, and quality.","author":"Maitha Ahli","role":"Owner","project":["beauty-lounge-spa-mirdif","Fit-out of Ladies Beauty Lounge & Spa"],"image":"letter-bella-cure.webp"},
 {"id":"today-engineering","company":"TODAY Engineering Consultants","date":"2022-12-27","excerpt":"M/s Taameer Plus Contracting LLC have completed the entire works in accordance with the contract specifications and specified construction timeline, showing a satisfactory degree of proper planning, coordination, safety, and quality of workmanship.","author":"Abdulla Al Zaabi","role":"Chairman","project":null,"image":"letter-today-engineering.webp"},
 {"id":"jans-noodles","company":"Jan’s Noodles Restaurant","date":null,"excerpt":null,"author":null,"role":null,"project":null,"image":"letter-jans-noodles.webp"}
]
JSON, true);

$MAP = get_option('tp_media_map', []);
foreach ($LETTERS as $L) if (empty($MAP[$L['image']])) return ['error' => "letter image missing from media map: {$L['image']}"];

/* ================= helpers (copied from 10-project-detail.php; each Novamira run is standalone) ================= */
$uid = fn() => substr(md5(uniqid('', true) . mt_rand()), 0, 7);
$dim = fn($t, $r, $b, $l, $u = 'px') => ['unit' => $u, 'top' => (string) $t, 'right' => (string) $r, 'bottom' => (string) $b, 'left' => (string) $l, 'isLinked' => false];
$all = fn($v, $u = 'px') => ['unit' => $u, 'top' => (string) $v, 'right' => (string) $v, 'bottom' => (string) $v, 'left' => (string) $v, 'isLinked' => true];
$gap = fn($v) => ['unit' => 'px', 'size' => $v, 'column' => (string) $v, 'row' => (string) $v, 'isLinked' => true];
$w = fn($v, $u = '%') => ['unit' => $u, 'size' => $v, 'sizes' => []];
$px = fn($v) => ['unit' => 'px', 'size' => $v, 'sizes' => []];
$cw = fn($expr) => ['unit' => 'custom', 'size' => $expr, 'sizes' => []];
$fluid = [
  'xs' => 'clamp(0.75rem, 0.73rem + 0.08vw, 0.8125rem)',
  'sm' => 'clamp(0.875rem, 0.86rem + 0.06vw, 0.9375rem)',
  'base' => 'clamp(1rem, 0.97rem + 0.12vw, 1.0625rem)',
  'h3' => 'clamp(1.5rem, 1.35rem + 0.7vw, 2.125rem)',
];
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
// Text link (Button + tp-link: hairline and arrow), as on the project pages.
$LINK = fn($text, $url) => $W('button', [
  'text' => $text, 'link' => ['url' => $url, 'is_external' => '', 'nofollow' => ''],
  'background_background' => 'classic', 'background_color' => 'rgba(0,0,0,0)',
  'button_background_hover_background' => 'classic', 'button_background_hover_color' => 'rgba(0,0,0,0)',
  'button_text_color' => '#262626', 'hover_color' => '#0D0D0D', 'border_border' => 'none', 'border_radius' => $all(0),
  'text_padding' => $dim(8, 0, 8, 0), '_css_classes' => 'tp-link',
  '__globals__' => ['typography_typography' => 'globals/typography?id=link', 'button_text_color' => 'globals/colors?id=accent', 'hover_color' => 'globals/colors?id=primary'],
]);
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
$MW = fn($expr) => ['_element_width' => 'initial', '_element_custom_width' => $cw("min(100%, $expr)")];
$MEASURE = '38rem';                                                               // --tp-measure
$H1W = 'calc(9.84 * clamp(2.375rem, 1.85rem + 2.9vw, 4.75rem))';                  // 16ch of the H1
$esc = fn($s) => htmlspecialchars($s, ENT_NOQUOTES, 'UTF-8');

/* ================= 1 Page hero + breadcrumbs (as About) ================= */
$hero = $SEC([[48, 60], [32, 48], [32, 40]], array_merge($FOG, $border(0, 0, 1, 0)), [
  $T('<nav class="tp-breadcrumb" aria-label="Breadcrumb"><ol class="tp-breadcrumb__list"><li><a href="/">Home</a></li><li><span aria-current="page">Testimonials</span></li></ol></nav>', null, 'secondary'),
  $C(['margin' => $dim(32, 0, 0, 0), 'flex_gap' => $gap(24)], [
    $H('Client endorsements', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(100)),
    $H('Letters of appreciation', 'h1', 'h1', 'primary', $MW($H1W) + $anim(200)),
    $T('<p>Words from the clients and consultants we have worked with, together with the original signed letters.</p>', 'secondary', 'secondary', $MW($MEASURE) + $anim(300)),
  ]),
]);

/* ================= 2 Letters: sheet (lightbox link) + text, alternating ================= */
$letter = function ($L, $i) use ($C, $H, $T, $IMG, $LINK, $esc, $gap, $dim, $all, $w, $cw, $px, $border, $shadow, $typo, $fluid, $canim, $MW, $MEASURE, $MAP) {
  $company = $esc($L['company']);
  // Sheet: paper with hairline, 2px radius, large shadow; "View original letter" label pinned to its foot.
  $sheet = $C(array_merge([
    'html_tag' => 'a', 'link' => ['url' => wp_get_attachment_url($MAP[$L['image']]), 'is_external' => '', 'nofollow' => ''],
    'css_classes' => 'tp-letter-sheet', 'overflow' => 'hidden',
    'width' => $cw('min(100%, 26rem)'),
    'background_background' => 'classic', 'background_color' => '#FFFFFF', '__globals__' => ['background_color' => 'globals/colors?id=paper'],
    'border_radius' => $all(2),
  ], $border(1, 1, 1, 1), $shadow('', 28, 64, 0.13)), [
    $IMG($L['image'], ['image_size' => 'large', 'width' => $w(100)]),
    $H('View original letter', 'p', null, 'primary', array_merge(
      $typo('typography', 'Inter', 600, $fluid['xs'], 1.7, ['text_transform' => 'uppercase', 'letter_spacing' => ['unit' => 'em', 'size' => 0.03, 'sizes' => []]]),
      ['_css_classes' => 'tp-letter-sheet__zoom', 'align' => 'center',
       '_position' => 'absolute', '_offset_orientation_h' => 'start', '_offset_x' => $px(16), '_offset_orientation_v' => 'end', '_offset_y_end' => $px(16), '_z_index' => 2,
       '_element_width' => 'initial', '_element_custom_width' => $cw('calc(100% - 32px)'),
       '_padding' => $dim(12, 16, 12, 16), '_border_radius' => $all(2),
       '_background_background' => 'classic', '_background_color' => '#FFFFFF', '__globals__' => ['title_color' => 'globals/colors?id=primary', '_background_color' => 'globals/colors?id=paper']],
      $shadow('_', 4, 12, 0.05))),
  ]);
  $text = [
    $H('Letter of appreciation', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']),
    $H($company, 'h2', 'h2', 'primary'),
  ];
  if ($L['date']) $text[] = $H(date(strlen($L['date']) === 7 ? 'F Y' : 'j F Y', strtotime(strlen($L['date']) === 7 ? $L['date'] . '-01' : $L['date'])), 'p', 'eyebrow', 'secondary');
  if ($L['excerpt']) $text[] = $T('<blockquote><p>“' . $esc($L['excerpt']) . '”</p></blockquote>', null, 'primary', $MW($MEASURE) + $typo('typography', 'Playfair Display', 400, $fluid['h3'], 1.35));
  if ($L['author']) $text[] = $C(array_merge(['flex_gap' => $gap(4), 'padding' => $dim(16, 0, 0, 0), 'width' => $cw('fit-content')], $border(1, 0, 0, 0)), [
    $H($esc($L['author']), 'p', null, 'primary', $typo('typography', 'Inter', 600, $fluid['base'], 1.7)),
    $H($esc($L['role']), 'p', 'small', 'secondary'),
  ]);
  if ($L['project']) $text[] = $LINK('View the project: ' . $esc($L['project'][1]), "/projects/{$L['project'][0]}/");
  // Row (even letters reversed) that wraps like the prototype (sheet 26rem, text at least 22rem, gap 4rem).
  return $C(array_merge([
    'html_tag' => 'article', '_element_id' => $L['id'], 'css_classes' => 'tp-letter-entry',
    'flex_direction' => $i % 2 ? 'row-reverse' : 'row', 'flex_wrap' => 'wrap', 'flex_align_items' => 'center', 'flex_gap' => $gap(64),
  ], $canim(0)), [
    $sheet,
    $C(['width' => $cw('min(100%, 22rem)'), '_flex_size' => 'grow', 'flex_align_items' => 'flex-start', 'flex_gap' => $gap(24)], $text),
  ]);
};
$letters = $SEC($PAD, ['css_classes' => 'tp-letters-page'], [
  $C(['flex_gap' => $gap(128)], array_map($letter, $LETTERS, array_keys($LETTERS))),
]);

/* ================= 3 CTA band (shared template) ================= */
$cta_id = (int) get_option('tp_cta_template_id');
if (!$cta_id || get_post_type($cta_id) !== 'elementor_library') return ['error' => 'CTA template missing'];
$cta_ref = ['id' => $uid(), 'elType' => 'container', 'isInner' => false,
  'settings' => ['content_width' => 'full', 'flex_direction' => 'column', 'flex_gap' => $gap(0), 'padding' => $all(0)],
  'elements' => [$W('shortcode', ['shortcode' => '[tp_template id="' . $cta_id . '"]'])]];

/* ================= Page ================= */
$pid = (int) get_option('tp_testimonials_page_id');
if (!$pid || get_post_type($pid) !== 'page') {
  $existing = get_page_by_path('testimonials', OBJECT, 'page');
  $pid = $existing ? $existing->ID : wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Testimonials', 'post_name' => 'testimonials', 'post_content' => ''], true);
  if (is_wp_error($pid)) return ['error' => $pid->get_error_message()];
  update_option('tp_testimonials_page_id', $pid, false);
}
update_post_meta($pid, '_wp_page_template', 'elementor_header_footer');
$page = \Elementor\Plugin::$instance->documents->get($pid, false);
$page->set_is_built_with_elementor(true); // "Edit with Elementor" mode; without it WordPress renders the plain-text fallback
$ok = $page->save([
  'elements' => [$hero, $letters, $cta_ref],
  'settings' => ['template' => 'elementor_header_footer', 'hide_title' => 'yes'],
]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
return ['testimonials' => $pid, 'saved' => $ok, 'url' => get_permalink($pid), 'edit' => admin_url("post.php?post=$pid&action=elementor"), 'cta' => $cta_id];
