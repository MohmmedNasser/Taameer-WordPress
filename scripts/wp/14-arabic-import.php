// 14-arabic-import.php — writes the Arabic site (WP Phase 8, D-045). Run by 14-arabic.py, which prepends
// `$MODE = 'prepare' | 'build'; $IN = '<payload.json>';`. Re-runnable: existing Arabic posts are updated in place.
//   prepare: Polylang media translations (same files, Arabic alt / title / caption), the Arabic WPForms form, and empty
//            Arabic saved templates (CTA band, 404 page); returns their ids so the driver can point the pages at them.
//   build:   the Arabic pages (Polylang translations of the English ones, same slugs and hierarchy, Elementor Full Width,
//            title hidden), the Arabic templates' content, the Arabic menus + Polylang menu locations, the language-scoped
//            footer widgets, the Polylang string translations (Astra header / footer, site title, theme strings) and the
//            [tp_lang] switcher in the English Astra HTML elements.
if (empty($IN) || !file_exists($IN)) return ['error' => 'payload missing'];
if (!function_exists('pll_set_post_language')) return ['error' => 'Polylang inactive'];
$P = json_decode(file_get_contents($IN), true);
$docs = \Elementor\Plugin::$instance->documents;
$res = [];

if ($MODE === 'prepare') {
  // ---- Polylang: media translatable (Arabic alt text), English for everything that has no language yet
  $o = get_option('polylang');
  if (empty($o['media_support'])) { $o['media_support'] = 1; update_option('polylang', $o); }
  foreach (get_posts(['post_type' => ['attachment', 'page', 'post'], 'numberposts' => -1, 'post_status' => 'any', 'lang' => '', 'fields' => 'ids']) as $id) {
    if (!pll_get_post_language($id)) pll_set_post_language($id, 'en');
  }

  // ---- media translations
  $media = [];
  foreach ($P['media'] as $en => $m) {
    $en = (int) $en;
    $src = get_post($en);
    if (!$src) continue;
    $ar = (int) pll_get_post($en, 'ar');
    if (!$ar) {
      $ar = wp_insert_attachment(['post_title' => $m['title'], 'post_mime_type' => $src->post_mime_type, 'guid' => $src->guid, 'post_status' => 'inherit'], false, 0);
      if (!$ar || is_wp_error($ar)) continue;
      update_post_meta($ar, '_wp_attached_file', get_post_meta($en, '_wp_attached_file', true));
      update_post_meta($ar, '_wp_attachment_metadata', wp_get_attachment_metadata($en));
      pll_set_post_language($ar, 'ar');
      pll_save_post_translations(['en' => $en, 'ar' => $ar]);
    }
    wp_update_post(['ID' => $ar, 'post_title' => $m['title'], 'post_excerpt' => $m['caption']]);
    update_post_meta($ar, '_wp_attachment_image_alt', $m['alt']);
    $media[$en] = $ar;
  }
  $res['media'] = $media;

  // ---- WPForms: Arabic Contact form (same fields / settings, Arabic text)
  $fid = (int) get_option('tp_contact_form_id_ar');
  if (!$fid || get_post_type($fid) !== 'wpforms') {
    $fid = wpforms()->obj('form')->add('Contact (العربية)', [], ['builder' => false]);
    update_option('tp_contact_form_id_ar', $fid, false);
  }
  $form = $P['form'];
  $form['id'] = (string) $fid;
  $form['settings']['notifications'][1]['sender_name'] = get_bloginfo('name');
  wp_update_post(['ID' => $fid, 'post_title' => 'Contact (العربية)', 'post_status' => 'publish', 'post_content' => wpforms_encode($form)]);
  $res['form'] = $fid;

  // ---- Arabic saved templates (shells; content written in build)
  foreach ($P['templates'] as $key => $title) {
    $tid = (int) get_option("tp_{$key}_template_id_ar");
    if (!$tid || get_post_type($tid) !== 'elementor_library') {
      $d = $docs->create('container', ['post_title' => $title, 'post_status' => 'publish']);
      $tid = $d->get_main_id();
      update_option("tp_{$key}_template_id_ar", $tid, false);
    }
    $res['templates'][$key] = $tid;
  }
  return $res;
}

if ($MODE !== 'build') return ['error' => 'unknown mode'];

// The driver sends the pages in batches (one call each, so no call runs into the HTTP timeout), then the rest.
// ---- pages (parents first: the payload lists Projects before its 22 children)
$ids = [];
foreach ((array) ($P['pages'] ?? []) as $pg) {
  $en = (int) $pg['en'];
  $ar = (int) pll_get_post($en, 'ar');
  $parent = $pg['parent_en'] ? (int) pll_get_post((int) $pg['parent_en'], 'ar') : 0;
  if (!$ar) {
    $ar = wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => $pg['title'], 'post_name' => $pg['slug'] . '-ar', 'post_parent' => $parent, 'menu_order' => $pg['menu_order'], 'post_content' => ''], true);
    if (is_wp_error($ar)) { $res['errors'][] = $pg['slug'] . ': ' . $ar->get_error_message(); continue; }
    pll_set_post_language($ar, 'ar');
    pll_save_post_translations(['en' => $en, 'ar' => $ar]);
  }
  // Same slug as English: allowed once the page is Arabic (functions.php, wp_unique_post_slug).
  wp_update_post(['ID' => $ar, 'post_title' => $pg['title'], 'post_name' => $pg['slug'], 'post_parent' => $parent, 'menu_order' => $pg['menu_order']]);
  foreach ($pg['meta'] as $k => $v) if ($k !== '_elementor_page_settings') update_post_meta($ar, $k, $v);
  $d = $docs->get($ar, false);
  $d->set_is_built_with_elementor(true);
  $ok = $d->save(['elements' => $pg['data'], 'settings' => array_merge((array) ($pg['meta']['_elementor_page_settings'] ?? []), ['template' => 'elementor_header_footer'])]);
  $ids[$pg['key']] = ['id' => $ar, 'saved' => $ok, 'slug' => get_post_field('post_name', $ar), 'url' => get_permalink($ar)];
}
$res['pages'] = $ids;
if (empty($P['templates'])) { \Elementor\Plugin::$instance->files_manager->clear_cache(); return $res; }

// ---- templates content
foreach ($P['templates'] as $key => $t) {
  $d = $docs->get((int) $t['ar'], false);
  $d->set_is_built_with_elementor(true);
  $res['templates'][$key] = $d->save(['elements' => $t['data']]);
}

// ---- menus: Arabic copies, assigned per language through Polylang
$pll = get_option('polylang');
$theme = get_option('stylesheet');
$menuIds = [];
foreach ($P['menus'] as $enId => $m) {
  $obj = wp_get_nav_menu_object($m['name']);
  $mid = $obj ? (int) $obj->term_id : (int) wp_create_nav_menu($m['name']);
  foreach ((array) wp_get_nav_menu_items($mid) as $it) wp_delete_post($it->ID, true);
  foreach ($m['items'] as $i => $it) {
    wp_update_nav_menu_item($mid, 0, ['menu-item-title' => $it['title'], 'menu-item-url' => $it['url'], 'menu-item-type' => 'custom', 'menu-item-status' => 'publish', 'menu-item-position' => $i + 1]);
  }
  $menuIds[(int) $enId] = $mid;
}
foreach ($P['locations'] as $loc => $enMenu) {
  $pll['nav_menus'][$theme][$loc] = ['en' => (int) $enMenu, 'ar' => $menuIds[(int) $enMenu] ?? 0];
}
update_option('polylang', $pll);
$res['menus'] = $menuIds;

// ---- footer widgets: the English ones are shown for English only, Arabic copies for Arabic only (Polylang widget language)
$blocks = get_option('widget_block');
$navs = get_option('widget_nav_menu');
$sidebars = get_option('sidebars_widgets');
foreach ($P['widgets']['block'] as $enKey => $w) {
  $blocks[(int) $enKey]['pll_lang'] = 'en';
  $blocks[(int) $w['ar_key']] = ['content' => $w['content'], 'pll_lang' => 'ar'];
  $sb = $w['sidebar'];
  if (!in_array('block-' . $w['ar_key'], $sidebars[$sb], true)) $sidebars[$sb][] = 'block-' . $w['ar_key'];
}
foreach ($P['widgets']['nav_menu'] as $enKey => $w) {
  $navs[(int) $enKey]['pll_lang'] = 'en';
  $navs[(int) $w['ar_key']] = ['title' => $w['title'], 'nav_menu' => $menuIds[(int) $w['menu_en']] ?? 0, 'pll_lang' => 'ar'];
  $sb = $w['sidebar'];
  if (!in_array('nav_menu-' . $w['ar_key'], $sidebars[$sb], true)) $sidebars[$sb][] = 'nav_menu-' . $w['ar_key'];
}
update_option('widget_block', $blocks);
update_option('widget_nav_menu', $navs);
update_option('sidebars_widgets', $sidebars);

// ---- English Astra HTML elements: the visual-only switcher becomes [tp_lang] (works in both languages)
$astra = get_option('astra-settings');
foreach ($P['astra_en'] as $k => $v) $astra[$k] = $v;
update_option('astra-settings', $astra);

// ---- Polylang string translations (Arabic): Astra admin texts (wpml-config.xml), site title, theme strings
$lang = PLL()->model->get_language('ar');
$mo = new PLL_MO();
$mo->import_from_db($lang);
foreach ($P['strings'] as $pair) $mo->add_entry($mo->make_entry($pair[0], $pair[1]));
$mo->export_to_db($lang);
$res['strings'] = count($P['strings']);

\Elementor\Plugin::$instance->files_manager->clear_cache();
flush_rewrite_rules(false);
return $res;
