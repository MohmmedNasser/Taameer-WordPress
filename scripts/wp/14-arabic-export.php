// 14-arabic-export.php — READ ONLY. Writes the approved English site's translatable parts to $OUT (JSON), for
// 14-arabic.py (WP Phase 8). The driver prepends `$OUT = '<path>';`. Nothing on the site changes.
// Exported: the Elementor data + settings of the English pages (Home, About, Services, Projects, the 22 project pages,
// Testimonials, Contact) and of the two saved templates (CTA band 228, 404 page); all attachments (alt, title, caption);
// the WPForms Contact form; the three menus; the footer widgets; the Astra header / footer strings; Arabic ids that
// already exist (re-runs update them in place).
if (empty($OUT)) return ['error' => '$OUT missing'];

$ids = [
  'home' => (int) get_option('page_on_front'),
  'about' => (int) get_option('tp_about_page_id'),
  'services' => (int) get_option('tp_services_page_id'),
  'projects' => (int) get_option('tp_projects_page_id'),
  'testimonials' => (int) get_option('tp_testimonials_page_id'),
  'contact' => (int) get_option('tp_contact_page_id'),
];
foreach ((array) get_option('tp_project_page_ids') as $slug => $id) $ids['project:' . $slug] = (int) $id;
$templates = ['cta' => 228, '404' => (int) get_option('tp_404_template_id')];

$doc = function ($id) {
  $p = get_post($id);
  $meta = [];
  foreach (get_post_meta($id) as $k => $v) {
    if ($k === '_wp_page_template' || $k === '_elementor_page_settings' || $k === '_elementor_template_type' || $k[0] !== '_') $meta[$k] = maybe_unserialize($v[0]);
  }
  return [
    'id' => $id, 'title' => $p->post_title, 'slug' => $p->post_name, 'parent' => (int) $p->post_parent, 'menu_order' => (int) $p->menu_order,
    'meta' => $meta, 'data' => json_decode((string) get_post_meta($id, '_elementor_data', true), true),
    'ar' => function_exists('pll_get_post') ? (int) pll_get_post($id, 'ar') : 0,
  ];
};

$out = ['pages' => [], 'templates' => [], 'media' => [], 'menus' => [], 'widgets' => [], 'astra' => []];
foreach ($ids as $key => $id) if ($id) $out['pages'][$key] = $doc($id);
foreach ($templates as $key => $id) if ($id) { $out['templates'][$key] = $doc($id); $out['templates'][$key]['ar'] = (int) get_option("tp_{$key}_template_id_ar"); }

foreach (get_posts(['post_type' => 'attachment', 'numberposts' => -1, 'post_status' => 'inherit', 'lang' => '']) as $a) {
  if (function_exists('pll_get_post_language') && pll_get_post_language($a->ID) === 'ar') continue; // Arabic copies
  $out['media'][$a->ID] = [
    'file' => basename((string) get_post_meta($a->ID, '_wp_attached_file', true)), 'title' => $a->post_title, 'caption' => $a->post_excerpt,
    'alt' => (string) get_post_meta($a->ID, '_wp_attachment_image_alt', true),
    'ar' => function_exists('pll_get_post') ? (int) pll_get_post($a->ID, 'ar') : 0,
  ];
}

$fid = (int) get_option('tp_contact_form_id');
$out['form'] = ['id' => $fid, 'data' => wpforms_decode(get_post($fid)->post_content), 'ar' => (int) get_option('tp_contact_form_id_ar'),
  'settings' => array_intersect_key((array) get_option('wpforms_settings', []), array_flip(['validation-required', 'validation-email']))];

foreach (wp_get_nav_menus() as $m) {
  $items = [];
  foreach (wp_get_nav_menu_items($m->term_id) as $it) $items[] = ['title' => $it->title, 'url' => $it->url, 'order' => (int) $it->menu_order];
  $out['menus'][$m->term_id] = ['name' => $m->name, 'items' => $items];
}
$out['locations'] = get_nav_menu_locations();
$out['widgets'] = ['block' => get_option('widget_block'), 'nav_menu' => get_option('widget_nav_menu'), 'sidebars' => get_option('sidebars_widgets')];
$astra = get_option('astra-settings');
foreach (['header-html-1', 'header-html-2', 'footer-html-1', 'footer-html-2', 'header-button1-text', 'header-button1-link-option', 'footer-copyright-editor', 'mobile-header-menu-label'] as $k) $out['astra'][$k] = $astra[$k] ?? null;
$out['blog'] = ['name' => get_option('blogname'), 'description' => get_option('blogdescription')];
$out['stylesheet'] = get_option('stylesheet');

file_put_contents($OUT, wp_json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
return ['written' => filesize($OUT), 'pages' => count($out['pages']), 'media' => count($out['media'])];
