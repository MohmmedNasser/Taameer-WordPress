// 04-kit.php — Elementor Global Kit (Site Settings): colours, typography, theme style, buttons, layout, breakpoints.
// Values = assets/css/tokens.css of the static prototype. Run through Novamira (novamira/execute-php).
$kit_id = (int) get_option('elementor_active_kit');
$kit = \Elementor\Plugin::$instance->documents->get($kit_id);
if (!$kit) return ['error' => 'no active kit'];

$em = fn($v) => ['unit' => 'em', 'size' => $v, 'sizes' => []];
$px = fn($v) => ['unit' => 'px', 'size' => $v, 'sizes' => []];
$fluid = fn($clamp) => ['unit' => 'custom', 'size' => $clamp, 'sizes' => []];
$type = function ($id, $title, $family, $weight, $size, $lh, $extra = []) use ($em) {
  return array_merge([
    '_id' => $id, 'title' => $title,
    'typography_typography' => 'custom',
    'typography_font_family' => $family,
    'typography_font_weight' => (string) $weight,
    'typography_font_size' => $size,
    'typography_line_height' => $em($lh),
  ], $extra);
};
$upper = fn($tracking) => ['typography_text_transform' => 'uppercase', 'typography_letter_spacing' => ['unit' => 'em', 'size' => $tracking, 'sizes' => []]];
$display = ['typography_letter_spacing' => ['unit' => 'em', 'size' => -0.01, 'sizes' => []]];

$PF = 'Playfair Display';
$IN = 'Inter';
$fs = [
  'xs'    => $fluid('clamp(0.75rem, 0.73rem + 0.08vw, 0.8125rem)'),
  'sm'    => $fluid('clamp(0.875rem, 0.86rem + 0.06vw, 0.9375rem)'),
  'base'  => $fluid('clamp(1rem, 0.97rem + 0.12vw, 1.0625rem)'),
  'lg'    => $fluid('clamp(1.125rem, 1.07rem + 0.24vw, 1.3125rem)'),
  'h4'    => $fluid('clamp(1.25rem, 1.18rem + 0.35vw, 1.5rem)'),
  'h3'    => $fluid('clamp(1.5rem, 1.35rem + 0.7vw, 2.125rem)'),
  'h2'    => $fluid('clamp(1.875rem, 1.5rem + 1.6vw, 3.125rem)'),
  'h1'    => $fluid('clamp(2.375rem, 1.85rem + 2.9vw, 4.75rem)'),
  'stat'  => $fluid('clamp(2.75rem, 2.1rem + 3.2vw, 5.5rem)'),
  'quote' => $fluid('clamp(1.5rem, 1.25rem + 1.1vw, 2.5rem)'),
];

$settings = [
  /* Colours: 4 system + 3 custom, no duplicates of role (Text and Primary share #0D0D0D by design: ink). */
  'system_colors' => [
    ['_id' => 'primary', 'title' => 'Ink (primary)', 'color' => '#0D0D0D'],
    ['_id' => 'secondary', 'title' => 'Slate (secondary text, meta)', 'color' => '#595959'],
    ['_id' => 'text', 'title' => 'Text', 'color' => '#0D0D0D'],
    ['_id' => 'accent', 'title' => 'Charcoal (accent text, hover)', 'color' => '#262626'],
  ],
  'custom_colors' => [
    ['_id' => 'paper', 'title' => 'Paper (background)', 'color' => '#FFFFFF'],
    ['_id' => 'fog', 'title' => 'Fog (alternate sections, footer)', 'color' => '#F4F4F4'],
    ['_id' => 'line', 'title' => 'Line (hairlines, borders)', 'color' => '#D9D9D9'],
  ],
  /* Typography: system = Headings / Lead / Body / Button; custom = the rest of the prototype hierarchy. */
  'system_typography' => [
    $type('primary', 'Headings (Playfair 500)', $PF, 500, $fs['h2'], 1.15, $display),
    $type('secondary', 'Lead', $IN, 400, $fs['lg'], 1.7),
    $type('text', 'Body', $IN, 400, $fs['base'], 1.7),
    $type('accent', 'Button', $IN, 500, $fs['xs'], 1.7, $upper(0.03)),
  ],
  'custom_typography' => [
    $type('h1', 'H1', $PF, 500, $fs['h1'], 1.05, $display),
    $type('h2', 'H2', $PF, 500, $fs['h2'], 1.15, $display),
    $type('h3', 'H3', $PF, 400, $fs['h3'], 1.15, $display),
    $type('h4', 'H4', $PF, 500, $fs['h4'], 1.15, $display),
    $type('small', 'Small', $IN, 400, $fs['sm'], 1.7),
    $type('quote', 'Quote', $PF, 500, $fs['quote'], 1.15, ['typography_font_style' => 'italic']),
    $type('stat', 'Stat number', $PF, 500, $fs['stat'], 1),
    $type('eyebrow', 'Eyebrow / label', $IN, 600, $fs['xs'], 1.15, $upper(0.22)),
    $type('caption', 'Caption', $IN, 400, $fs['xs'], 1.4, $upper(0.03)),
    $type('link', 'Text link', $IN, 600, $fs['sm'], 1.7, $upper(0.03)),
  ],
  'default_generic_fonts' => 'Sans-serif',

  /* Theme style */
  'body_background_background' => 'classic',
  'body_background_color' => '#FFFFFF',
  'link_normal_color' => '#262626',
  'link_hover_color' => '#0D0D0D',
  'h1_color' => '#0D0D0D', 'h2_color' => '#0D0D0D', 'h3_color' => '#0D0D0D', 'h4_color' => '#0D0D0D',
  'button_text_color' => '#FFFFFF',
  'button_background_background' => 'classic',
  'button_background_color' => '#0D0D0D',
  'button_hover_text_color' => '#FFFFFF',
  'button_hover_background_background' => 'classic',
  'button_hover_background_color' => '#262626',
  'button_border_border' => 'solid',
  'button_border_width' => ['unit' => 'px', 'top' => '1', 'right' => '1', 'bottom' => '1', 'left' => '1', 'isLinked' => true],
  'button_border_color' => 'rgba(0,0,0,0)',
  'button_border_radius' => ['unit' => 'px', 'top' => '2', 'right' => '2', 'bottom' => '2', 'left' => '2', 'isLinked' => true],
  'button_padding' => ['unit' => 'px', 'top' => '15', 'right' => '28', 'bottom' => '15', 'left' => '28', 'isLinked' => false],
  '__globals__' => [
    'body_color' => 'globals/colors?id=text',
    'body_typography_typography' => 'globals/typography?id=text',
    'link_normal_color' => 'globals/colors?id=accent',
    'link_hover_color' => 'globals/colors?id=primary',
    'h1_typography_typography' => 'globals/typography?id=h1',
    'h2_typography_typography' => 'globals/typography?id=h2',
    'h3_typography_typography' => 'globals/typography?id=h3',
    'h4_typography_typography' => 'globals/typography?id=h4',
    'h1_color' => 'globals/colors?id=primary',
    'h2_color' => 'globals/colors?id=primary',
    'h3_color' => 'globals/colors?id=primary',
    'h4_color' => 'globals/colors?id=primary',
    'button_typography_typography' => 'globals/typography?id=accent',
    'button_text_color' => 'globals/colors?id=paper',
    'button_background_color' => 'globals/colors?id=primary',
    'button_hover_text_color' => 'globals/colors?id=paper',
    'button_hover_background_color' => 'globals/colors?id=accent',
    'body_background_color' => 'globals/colors?id=paper',
  ],

  /* Layout: 1320px content; containers carry their own padding (no default padding); 24px widget gap. */
  'container_width' => $px(1320),
  'container_padding' => ['unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'isLinked' => true],
  'space_between_widgets' => ['unit' => 'px', 'column' => '24', 'row' => '24', 'isLinked' => true, 'size' => 24],

  /* Breakpoints = Astra (functions.php) = prototype's 1024px desktop switch. */
  'viewport_mobile' => 767,
  'viewport_tablet' => 1023,
  'viewport_md' => 768,
  'viewport_lg' => 1024,
];

$current = $kit->get_settings();
$saved = $kit->save(['settings' => array_merge(is_array($current) ? $current : [], $settings)]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
$after = \Elementor\Plugin::$instance->documents->get($kit_id, false)->get_settings();
return [
  'saved' => $saved,
  'colors' => count($after['system_colors']) + count($after['custom_colors']),
  'typography' => count($after['system_typography']) + count($after['custom_typography']),
  'tablet' => $after['viewport_tablet'] ?? null,
  'h1' => $after['custom_typography'][0]['typography_font_size'] ?? null,
];
