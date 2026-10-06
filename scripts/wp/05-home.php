// 05-home.php — builds the CTA band (Elementor saved template) and the Home page from index.html (WP phase 1, D-038).
// Elementor Containers + native widgets only (Heading, Text Editor, Image, Button, Counter, Shortcode).
// CSS classes refer to the child theme's taameer.css. Re-running replaces both documents' content (same IDs).
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
  if ($text) $end[] = $T("<p>$text</p>", 'text', 'text', ['_css_classes' => 'tp-measure'] + $anim(0));
  if ($link) $end[] = $B($link[0], $link[1], 'link', $anim(100));
  return $ROW(0.7, 0.3,
    [[$H($eyebrow, 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)), $H($title, 'h2', 'h2', 'primary', $anim(100))]],
    [$end, ['flex_gap' => $gap(16)]],
    ['flex_justify_content' => 'space-between', 'flex_align_items' => 'flex-end', 'flex_align_items_tablet' => 'flex-start', 'flex_align_items_mobile' => 'flex-start', 'margin' => ['unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '64', 'left' => '0', 'isLinked' => false], 'margin_mobile' => ['unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '48', 'left' => '0', 'isLinked' => false]]);
};

/* ================= CTA band (saved template, reused through [tp_template]) ================= */
$cta = [$SEC([[0, 128], [0, 96], [0, 72]], [], [
  $C(array_merge([
    'flex_align_items' => 'flex-start', 'flex_gap' => $gap(24),
    'padding' => $all(88), 'padding_tablet' => $all(56), 'padding_mobile' => $all(32),
    'border_radius' => $all(2),
  ], $border(1, 1, 1, 1, 'ink'), $canim(0)), [
    $H('Ready to build your next project?', 'h2', 'h2', 'primary', ['_css_classes' => 'tp-measure-cta']),
    $T('<p>Contact Taameer Plus Contracting for expert consultations, value engineering and turnkey proposals.</p>', 'secondary', 'secondary', ['_css_classes' => 'tp-measure']),
    $C(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_align_items' => 'center', 'flex_gap' => ['unit' => 'px', 'size' => 32, 'column' => '32', 'row' => '12', 'isLinked' => false]], [
      $B('Get a Quote', '/contact/'),
      $B('+971 4 329 0500', 'tel:+97143290500', 'contact'),
      $B('info@taameer.ae', 'mailto:info@taameer.ae', 'contact'),
    ]),
  ]),
])];

$docs = \Elementor\Plugin::$instance->documents;
$cta_id = (int) get_option('tp_cta_template_id');
if (!$cta_id || get_post_type($cta_id) !== 'elementor_library') {
  $doc = $docs->create('container', ['post_title' => 'CTA band (site-wide)', 'post_status' => 'publish']);
  $cta_id = $doc->get_main_id();
  update_option('tp_cta_template_id', $cta_id, false);
}
$cta_doc = $docs->get($cta_id, false);
$cta_doc->set_is_built_with_elementor(true);
$cta_doc->save(['elements' => $cta]);

/* ================= Home ================= */
$hero = $SEC([[32, 60], [24, 48], [24, 40]], [
  'flex_direction' => 'row', 'flex_direction_tablet' => 'column', 'flex_direction_mobile' => 'column',
  'flex_align_items' => 'flex-start', 'flex_wrap' => 'nowrap',
], [
  // Fog panel: bleeds to the screen edges below 1024px (negative gutters), boxed with a radius on desktop.
  $C(array_merge($FOG, [
    'width' => $w(64), 'width_tablet' => ['unit' => 'custom', 'size' => 'calc(100% + 4rem)', 'sizes' => []], 'width_mobile' => ['unit' => 'custom', 'size' => 'calc(100% + 2.5rem)', 'sizes' => []],
    'margin_tablet' => $dim(0, -32, 0, -32), 'margin_mobile' => $dim(0, -20, 0, -20),
    'padding' => $dim(64, 128, 64, 64), 'padding_tablet' => $dim(64, 32, 64, 32), 'padding_mobile' => $dim(64, 20, 64, 20),
    'border_radius' => $all(2), 'border_radius_tablet' => $all(0),
    'flex_gap' => $gap(32), 'flex_justify_content' => 'center',
  ]), [
    $H('Taameer Plus Contracting LLC — Dubai, UAE', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(100)),
    $H('Construct A Better Tomorrow<span class="tp-hero-plus" aria-hidden="true">+</span>', 'h1', 'h1', 'primary', ['_css_classes' => 'tp-split']),
    $T('<p>An approved G+4 general contractor delivering turnkey construction, design &amp; build, luxury fit-out and full-scale renovation across the UAE — with uncompromising quality since 2015.</p>', 'secondary', 'secondary', ['_css_classes' => 'tp-measure-lead'] + $anim(300)),
    $C(array_merge(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_gap' => $gap(12)], $canim(400)), [
      $B('View Projects', '/projects/'),
      $B('Get a Quote', '/contact/', 'ghost'),
    ]),
  ]),
  // Framed photo overlapping the panel's end edge on desktop.
  $C([
    'width' => ['unit' => 'custom', 'size' => 'calc(36% + 6rem)', 'sizes' => []], 'width_tablet' => ['unit' => 'custom', 'size' => 'min(100%, 36rem)', 'sizes' => []], 'width_mobile' => ['unit' => 'custom', 'size' => 'min(100%, 36rem)', 'sizes' => []],
    'margin' => $dim(0, 0, 0, -96), 'margin_tablet' => $dim(0, 0, 0, 0),
    'padding' => $dim(96, 0, 0, 0), 'padding_tablet' => $dim(48, 0, 0, 0),
    'flex_gap' => $gap(16),
  ], [
    $C(['css_classes' => 'tp-frame'], [
      $IMG('project-palm-jumeirah-villa-02.webp', array_merge(['_css_classes' => 'tp-img-reveal tp-delay-2 tp-parallax', '_border_radius' => $all(2)], $shadow('_', 12, 32, 0.09))),
    ]),
    $H('Private villa renovation · Palm Jumeirah · 2025', 'p', 'caption', 'secondary', ['_css_classes' => 'tp-caption'] + $anim(500)),
  ]),
]);

$logos = [
  ['partner-al-gurm.webp', 0], ['partner-al-bastaki.webp', 1], ['partner-amec.webp', 0], ['partner-al-sondos.webp', 1],
  ['partner-atlas-copco.webp', 1], ['partner-cooltech.webp', 1], ['partner-cifa.webp', 0], ['partner-innovative-consultants.webp', 1],
  ['partner-kf-inc.webp', 1], ['partner-nahas-interiors.webp', 0], ['partner-oceanworld.webp', 0], ['partner-rd2-design.webp', 0],
  ['partner-r-monogram.webp', 0], ['partner-owa.webp', 1],
];
$partners = ['id' => $uid(), 'elType' => 'container', 'isInner' => false, 'settings' => array_merge([
  'content_width' => 'full', 'html_tag' => 'section', 'flex_direction' => 'column', 'flex_gap' => $gap(32),
  'padding' => $dim(60, 0, 60, 0), 'padding_tablet' => $dim(48, 0, 48, 0), 'padding_mobile' => $dim(40, 0, 40, 0),
], $border(1, 0, 1, 0)), 'elements' => [
  $C(['content_width' => 'boxed', 'padding' => $dim(0, 48, 0, 48), 'padding_tablet' => $dim(0, 32, 0, 32), 'padding_mobile' => $dim(0, 20, 0, 20)], [
    $H('Our trusted partners', 'h2', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow']),
  ]),
  $C(['css_classes' => 'tp-marquee', 'flex_direction' => 'row', 'overflow' => 'hidden'], [
    $C(['css_classes' => 'tp-marquee__track', 'flex_direction' => 'row', 'flex_align_items' => 'center'],
      array_map(fn($l) => $IMG($l[0], ['_css_classes' => 'tp-marquee__logo' . ($l[1] ? ' tp-blend' : '')]), $logos)),
  ]),
]];

$stat = fn(array $kids, $last = false, $delay = 0) => $C(array_merge(
  ['flex_gap' => $gap(4), 'padding' => $dim(24, 0, 24, 0)], $border(1, 0, $last ? 1 : 0, 0), $canim($delay)), $kids);
$counterBase = [
  'thousand_separator' => '', 'duration' => 1800, 'title_position' => 'after',
  'number_position' => 'start', 'number_alignment' => 'start', 'number_gap' => ['unit' => 'px', 'size' => 0, 'sizes' => []], 'title_horizontal_alignment' => 'start', 'title_tag' => 'p',
  '__globals__' => ['typography_number_typography' => 'globals/typography?id=stat', 'number_color' => 'globals/colors?id=primary', 'typography_title_typography' => 'globals/typography?id=eyebrow', 'title_color' => 'globals/colors?id=secondary'],
];
$about = $SEC($PAD, [], [
  $ROW(0.56, 0.44,
    [[
      $H('About Taameer Plus', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)),
      $H('Pioneering engineering &amp; construction solutions', 'h2', 'h2', 'primary', ['_css_classes' => 'tp-measure-title'] + $anim(100)),
      $T('<p>Established in Dubai in 2015 as a small technical services company, Taameer Plus Contracting LLC has grown steadily through years of exceptional experience in the market. Today it is a full-service contracting company with well-trained staff, delivering high quality and standards with state-of-the-art engineering processes.</p>', 'secondary', 'text', ['_css_classes' => 'tp-measure'] + $anim(200)),
      $T('<p>Our primary goal is to achieve the highest quality in all our operations without compromise, offering our customers a safe, cost-effective and professional service.</p>', 'text', 'text', $anim(300)),
      $B('More about us', '/about/', 'link', $anim(400)),
    ]],
    [[
      $stat([$W('counter', $counterBase + ['starting_number' => 1990, 'ending_number' => 2015, 'title' => 'Established in Dubai'])], false, 0),
      $stat([
        $H('G+4', 'p', 'stat', 'primary', ['_css_classes' => 'tp-stat']),
        $H('Approved contractor', 'p', 'eyebrow', 'secondary'),
      ], false, 110),
      $stat([$W('counter', $counterBase + ['starting_number' => 0, 'ending_number' => 100, 'suffix' => '+', 'title' => 'Delivered projects'])], true, 220),
    ], ['flex_gap' => $gap(0)]],
    ['flex_align_items' => 'flex-end', 'flex_align_items_tablet' => 'stretch', 'flex_align_items_mobile' => 'stretch'])
]);

$chairman = $SEC($PAD, $FOG, [
  $ROW(0.3, 0.7,
    [[
      $C(['css_classes' => 'tp-frame'], [
        $IMG('chairman-fahim-al-ali.webp', array_merge(['_css_classes' => 'tp-img-reveal', '_border_radius' => $all(2)], $shadow('_', 12, 32, 0.09))),
      ]),
    ], ['width_tablet' => ['unit' => 'custom', 'size' => 'min(100%, 26rem)', 'sizes' => []], 'width_mobile' => ['unit' => 'custom', 'size' => 'min(100%, 26rem)', 'sizes' => []]]],
    [[
      $H('Chairman’s message', 'h2', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)),
      $T('<blockquote><p>“After meeting the Taameer Plus family, your experience with us will be a turning point in your understanding of construction — a fruitful start to a continuous business relationship, as <em>we build trust before concrete.</em>”</p></blockquote>', 'quote', 'primary', ['_css_classes' => 'tp-quote tp-measure-quote'] + $anim(100)),
      $C(array_merge(['flex_gap' => $gap(4), 'padding' => $dim(0, 0, 0, 24)], $border(0, 0, 0, 1, 'ink'), $canim(200)), [
        $H('Mr. Fahim Al-Ali', 'p', null, 'primary', $typo('typography', 'Inter', 600, $fluid['base'], 1.7)),
        $H('Chairman', 'p', 'small', 'secondary'),
      ]),
    ], ['flex_gap' => $gap(32)]],
    ['flex_align_items' => 'center', 'flex_align_items_tablet' => 'flex-start', 'flex_align_items_mobile' => 'flex-start'])
]);

$services_rows = [
  ['Construction', 'Full-scale construction ranging from G+1 luxury villas to G+4 residential and commercial buildings, with complete structural integrity.', '#construction', 'project-dubai-g-residential-villa-02.webp'],
  ['Design &amp; Build', 'Direct single-contract solutions covering structural, architectural and electromechanical works, evaluated for cost and buildability by one team.', '#design-build', 'project-al-awir-villas-02.webp'],
  ['Decoration &amp; Fit-out', 'Premium corporate, retail, hospitality and residential fit-out and decoration, including custom wall cladding and joinery through our carpentry division.', '#decoration-fitout', 'project-kf-inc-headquarters-05.webp'],
  ['Renovation', 'Complete building and villa refurbishments, interior modernisations and structural updates executed on schedule.', '#renovation', 'project-dubai-marina-triplex-villa-04.webp'],
  ['Maintenance', 'Ongoing technical services, active maintenance and facility support that keep structures in prime condition long after handover.', '#maintenance', 'project-atlas-copco-headquarters-03.webp'],
  ['Turnkey Projects', 'Experienced professionals handling every phase of construction, from new build to renovation, coordinated with qualified subcontractors to meet deadlines.', '#turnkey', 'project-al-warqa-1st-g2-villa-06.webp'],
];
$services = $SEC($PAD, [], [
  $HEAD('Our expertise', 'Comprehensive contracting services', 'A pioneer general contractor in the UAE, delivering construction solutions in a professional and cost-effective manner.', ['All services', '/services/']),
  $C($border(1, 0, 0, 0), array_map(fn($r, $i) => $C(array_merge([
    'flex_direction' => 'row', 'flex_direction_tablet' => 'column', 'flex_direction_mobile' => 'column',
    'flex_align_items' => 'center', 'flex_align_items_tablet' => 'stretch', 'flex_wrap' => 'nowrap',
    'flex_gap' => $gap(96), 'flex_gap_tablet' => $gap(32), 'padding' => $dim(32, 0, 32, 0),
  ], $border(0, 0, 1, 0)), [
    $C(array_merge([
      'html_tag' => 'a', 'link' => ['url' => '/services/' . $r[2], 'is_external' => '', 'nofollow' => ''], 'css_classes' => 'tp-service',
      'width' => ['unit' => 'custom', 'size' => 'calc((100% - 96px) * 7 / 12)', 'sizes' => []], 'width_tablet' => $w(100), 'width_mobile' => $w(100),
      'flex_gap' => $gap(8), 'padding' => $dim(0, 40, 0, 0),
    ], $canim($i * 100)), [
      $H($r[0], 'h3', null, 'primary', $typo('typography', 'Playfair Display', 500, $fluid['h3'], 1.15, ['letter_spacing' => ['unit' => 'em', 'size' => -0.01, 'sizes' => []]])),
      $T("<p>{$r[1]}</p>", 'text', 'secondary', ['_css_classes' => 'tp-measure']),
    ]),
    $IMG($r[3], array_merge([
      '_css_classes' => 'tp-service__img', 'image_border_radius' => $all(2),
      '_element_width' => 'initial', '_element_custom_width' => ['unit' => 'custom', 'size' => 'calc((100% - 96px) * 5 / 12)', 'sizes' => []],
      '_element_width_tablet' => 'inherit', '_element_width_mobile' => 'inherit',
      'image_box_shadow_box_shadow_type' => 'yes', 'image_box_shadow_box_shadow' => ['horizontal' => 0, 'vertical' => 12, 'blur' => 32, 'spread' => 0, 'color' => 'rgba(13,13,13,0.09)'],
    ])),
  ]), $services_rows, array_keys($services_rows))),
]);

$why_items = [
  ['Approved G+4 Contractor', 'Licensed by the Government of Dubai for multi-storey residential and commercial structural developments.'],
  ['Turnkey &amp; Value Engineering', 'Design-build contracts covering structural, architectural and electromechanical works under one roof, saving cost and time.'],
  ['Uncompromising Quality', 'Rigorous quality control, trustworthy relations with private and government agencies, and reliable delivery timelines.'],
];
$why = $SEC($PAD, $FOG, [
  $ROW(0.5, 0.5,
    [[
      $C(['css_classes' => 'tp-frame tp-frame--portrait'], [
        $IMG('project-dubai-g-residential-villa-05.webp', array_merge(['_css_classes' => 'tp-img-reveal tp-parallax', '_border_radius' => $all(2)], $shadow('_', 12, 32, 0.09))),
      ]),
    ]],
    [[
      $H('Why Taameer Plus', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)),
      $H('Why choose us', 'h2', 'h2', 'primary', $anim(100)),
      $C(['margin' => $dim(16, 0, 0, 0)], array_map(fn($it, $i) => $C(array_merge(
        ['css_classes' => 'tp-plus-item', 'flex_gap' => $gap(8), 'padding' => $dim(24, 0, 24, 32)], $border(1, 0, 0, 0), $canim($i * 110)), [
        $H($it[0], 'h3', 'h4', 'primary'),
        $T("<p>{$it[1]}</p>", 'text', 'secondary', ['_css_classes' => 'tp-measure']),
      ]), $why_items, array_keys($why_items))),
    ]],
    ['flex_align_items' => 'center'])
]);

// Featured projects: static cards (Elementor Free has no Loop Grid). Listing order = newest completion first.
$cards = [
  ['palm-jumeirah-villa', 'Private Villa Renovation', 'Palm Jumeirah, UAE', 'Renovation &amp; Decoration', '2025', 'project-palm-jumeirah-villa-02.webp'],
  ['dubai-g-residential-villa', 'Proposed G Residential Villa', 'Dubai, UAE', 'Construction', '2025', 'project-dubai-g-residential-villa-01.webp'],
  ['kf-inc-headquarters', 'Fit-out of KF INC Headquarters Office', 'Al Saadiyat Island, Abu Dhabi', 'Fit-out', '2024', 'project-kf-inc-headquarters-01.webp'],
  ['dubai-marina-triplex-villa', 'Renovation &amp; Decoration of G+2 Triplex Villa', 'Dubai Marina, Dubai', 'Renovation &amp; Decoration', '2024', 'project-dubai-marina-triplex-villa-01.webp'],
  ['al-warqa-1st-g2-villa', 'Construction of G+2 Private Villa', 'Al Warqa 1st, Dubai', 'Construction', '2023', 'project-al-warqa-1st-g2-villa-01.webp'],
  ['atlas-copco-headquarters', 'Renovation &amp; Decoration of Atlas Copco Headquarters', 'Gold &amp; Diamond Park by EMAAR, Dubai', 'Renovation &amp; Decoration', '2023', 'project-atlas-copco-headquarters-01.webp'],
];
$card = fn($c, $share, $delay) => $C(array_merge([
  'html_tag' => 'a', 'link' => ['url' => "/projects/{$c[0]}/", 'is_external' => '', 'nofollow' => ''], 'css_classes' => 'tp-card',
  'width' => ['unit' => 'custom', 'size' => "calc((100% - 44px) * $share)", 'sizes' => []],
  'width_tablet' => ['unit' => 'custom', 'size' => 'calc((100% - 32px) / 2)', 'sizes' => []], 'width_mobile' => $w(100),
  'flex_gap' => $gap(16),
], $canim($delay)), [
  $IMG($c[5], [
    'width' => $w(100), 'height' => ['unit' => 'custom', 'size' => 'clamp(15rem, 10rem + 16vw, 30rem)', 'sizes' => []], 'object-fit' => 'cover',
    '_border_radius' => $all(6),
  ]),
  $C(['flex_direction' => 'row', 'flex_justify_content' => 'space-between', 'flex_wrap' => 'wrap', 'flex_gap' => $gap(8)], [
    $H($c[3], 'p', 'eyebrow', 'secondary'),
    $H($c[4], 'p', 'eyebrow', 'secondary'),
  ]),
  $H($c[1], 'h3', null, 'primary', $typo('typography', 'Playfair Display', 400, $fluid['h4'], 1.15)),
  $H($c[2], 'p', 'small', 'secondary'),
  $H('View project', 'p', 'link', 'accent', ['_css_classes' => 'tp-card__more'] + $typo('typography', 'Inter', 600, $fluid['xs'], 1.7, ['text_transform' => 'uppercase', 'letter_spacing' => ['unit' => 'em', 'size' => 0.03, 'sizes' => []]])),
]);
$cardRow = fn($a, $b, $sa, $sb) => $C([
  'flex_direction' => 'row', 'flex_direction_mobile' => 'column', 'flex_wrap' => 'nowrap',
  'flex_gap' => $gap(44), 'flex_gap_tablet' => $gap(32), 'flex_gap_mobile' => $gap(32),
], [$card($a, $sa, 0), $card($b, $sb, 110)]);
$featured = $SEC($PAD, [], [
  $HEAD('Track record', 'Featured projects', 'A selection of construction, renovation and fit-out works completed across Dubai and Abu Dhabi.', ['All projects', '/projects/']),
  $C(['flex_gap' => $gap(44), 'flex_gap_tablet' => $gap(32), 'flex_gap_mobile' => $gap(32)], [
    $cardRow($cards[0], $cards[1], '7 / 12', '5 / 12'),
    $cardRow($cards[2], $cards[3], '5 / 12', '7 / 12'),
    $cardRow($cards[4], $cards[5], '6 / 12', '6 / 12'),
  ]),
]);

$spec = fn($label, $value) => $C(array_merge(['width' => $w(50), 'width_mobile' => $w(50), 'flex_gap' => $gap(4), 'padding' => $dim(16, 0, 16, 0)], $border(0, 0, 1, 0)), [
  $H($label, 'p', 'eyebrow', 'secondary'),
  $H($value, 'p', null, 'primary', $typo('typography', 'Playfair Display', 400, $fluid['h4'], 1.15)),
]);
$compare = $SEC($PAD, $FOG, [
  $ROW(0.42, 0.58,
    [[
      $H('Before &amp; after', 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $anim(0)),
      $H('Construction and fit-out of a private gym', 'h2', 'h2', 'primary', $anim(100)),
      $T('<p>Drag the divider to compare the space before work began with the finished gym.</p>', 'text', 'text', $anim(200)),
      $C(array_merge(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'css_classes' => 'tp-spec'], $border(1, 0, 0, 0), $canim(300)), [
        $spec('Location', 'Marina, Abu Dhabi'), $spec('Period', '135 days'), $spec('Completion', 'September 2024'), $spec('Type', 'Construction'),
      ]),
      $B('View the project', '/projects/abu-dhabi-marina-private-gym/', 'link', $anim(400)),
    ]],
    [[
      $C(array_merge(['css_classes' => 'tp-before-after', 'flex_gap' => $gap(12)], $canim(200)), [
        $IMG('project-abu-dhabi-marina-private-gym-01.webp', ['_css_classes' => 'tp-before-after__after', '_border_radius' => $all(6)]),
        $IMG('project-abu-dhabi-marina-private-gym-before.webp', ['_css_classes' => 'tp-before-after__before', '_border_radius' => $all(6)]),
      ]),
    ], ['flex_align_items' => 'center']],
    ['flex_align_items' => 'center'])
]);

$letters = [
  ['They made very good recommendations during the design phase of the project and the communication from their team was very good. It was a pleasure working with your team.', 'letter-atlas-copco.webp', 'Atlas Copco Services Middle East', 'Nicole Rowe, Regional Human Resources Manager'],
  ['The Taameer Plus Contracting LLC team accomplished designing and constructing work for the beauty lounge successfully, and adhered professionally to project completion budget, schedule and quality.', 'letter-bella-cure.webp', 'Bella Cure Beauty Lounge', 'Maitha Ahli, Owner'],
  ['Taameer Plus completed the entire works in accordance with the contract specifications and specified construction timeline, showing a satisfactory degree of proper planning, coordination, safety and quality of workmanship.', 'letter-today-engineering.webp', 'TODAY Engineering Consultants', 'Abdulla Al Zaabi, Chairman'],
];
$testimonials = $SEC($PAD, [], [
  $HEAD('Client endorsements', 'Letters of appreciation', '', ['Read all letters', '/testimonials/']),
  $C(['flex_direction' => 'row', 'flex_direction_mobile' => 'column', 'flex_wrap' => 'wrap', 'flex_align_items' => 'stretch', 'flex_gap' => $gap(44), 'flex_gap_tablet' => $gap(32), 'flex_gap_mobile' => $gap(24)],
    array_map(fn($l, $i) => $C(array_merge([
      'css_classes' => 'tp-lift', '_flex_size' => 'grow',
      'width' => ['unit' => 'custom', 'size' => 'calc((100% - 88px) / 3)', 'sizes' => []],
      'width_tablet' => ['unit' => 'custom', 'size' => 'calc((100% - 32px) / 2)', 'sizes' => []], 'width_mobile' => $w(100),
      'background_background' => 'classic', 'background_color' => '#FFFFFF',
      'border_radius' => $all(6), 'padding' => $all(32),
      'flex_justify_content' => 'space-between', 'flex_gap' => $gap(32),
      '__globals__' => ['background_color' => 'globals/colors?id=paper'],
    ], $shadow('', 4, 12, 0.06), $canim($i * 110)), [
      $T("<p>“{$l[0]}”</p>", null, 'primary', $typo('typography', 'Playfair Display', 400, $fluid['h4'], 1.35)),
      $C(array_merge(['flex_direction' => 'row', 'flex_align_items' => 'center', 'flex_gap' => $gap(16), 'padding' => $dim(24, 0, 0, 0)], $border(1, 0, 0, 0)), [
        $IMG($l[1], array_merge(['_css_classes' => 'tp-letter__thumb', 'image_size' => 'medium', 'width' => $w(52, 'px'),
          '_element_width' => 'initial', '_element_custom_width' => $w(52, 'px'), 'image_border_radius' => $all(2)],
          ['image_border_border' => 'solid', 'image_border_width' => $all(1), 'image_border_color' => '#D9D9D9'])),
        $C(['width' => ['unit' => 'custom', 'size' => 'calc(100% - 68px)', 'sizes' => []], 'flex_gap' => $gap(0)], [
          $H($l[2], 'p', null, 'primary', $typo('typography', 'Inter', 600, $fluid['sm'], 1.7)),
          $H($l[3], 'p', null, 'secondary', $typo('typography', 'Inter', 400, $fluid['xs'], 1.7)),
        ]),
      ]),
    ]), $letters, array_keys($letters))),
]);

$cta_ref = ['id' => $uid(), 'elType' => 'container', 'isInner' => false,
  'settings' => ['content_width' => 'full', 'flex_direction' => 'column', 'flex_gap' => $gap(0), 'padding' => $all(0)],
  'elements' => [$W('shortcode', ['shortcode' => '[tp_template id="' . $cta_id . '"]'])]];

$home_id = (int) get_option('tp_home_page_id');
$home = $docs->get($home_id, false);
$home->set_is_built_with_elementor(true); // "Edit with Elementor" mode; without it WordPress renders the plain-text fallback
$ok = $home->save([
  'elements' => [$hero, $partners, $about, $chairman, $services, $why, $featured, $compare, $testimonials, $cta_ref],
  'settings' => ['template' => 'elementor_header_footer', 'hide_title' => 'yes'],
]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
return ['home' => $home_id, 'saved' => $ok, 'cta' => $cta_id, 'url' => get_permalink($home_id), 'edit' => admin_url("post.php?post=$home_id&action=elementor")];
