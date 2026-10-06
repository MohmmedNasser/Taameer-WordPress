// 03-astra.php — Astra Customizer settings, menus, footer widgets, Home page shell (WP phase 1, D-038).
// Run on the site through Novamira (novamira/execute-php; no <?php tag). Idempotent: rebuilds only its own menus/widgets.
$map = get_option('tp_media_map', []);

/* ---- Home page (content is built in Elementor by 06-home.php) ---- */
$home_id = (int) get_option('tp_home_page_id');
if (!$home_id || !get_post($home_id)) {
  $home_id = wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Home', 'post_name' => 'home', 'post_content' => '']);
  update_option('tp_home_page_id', $home_id, false);
}
update_post_meta($home_id, '_wp_page_template', 'elementor_header_footer');
update_option('show_on_front', 'page');
update_option('page_on_front', $home_id);

/* ---- Menus (Appearance → Menus). Inner pages do not exist yet: their final permalinks are used. ---- */
$tp_menu = function ($name, $items) use ($home_id) {
  $m = wp_get_nav_menu_object($name);
  $id = $m ? $m->term_id : wp_create_nav_menu($name);
  foreach (wp_get_nav_menu_items($id) ?: [] as $it) wp_delete_post($it->ID, true);
  foreach ($items as $i => $item) {
    $args = ['menu-item-title' => $item[0], 'menu-item-status' => 'publish', 'menu-item-position' => $i + 1];
    if ($item[1] === 'HOME') $args += ['menu-item-type' => 'post_type', 'menu-item-object' => 'page', 'menu-item-object-id' => $home_id];
    else $args += ['menu-item-type' => 'custom', 'menu-item-url' => $item[1]];
    wp_update_nav_menu_item($id, 0, $args);
  }
  return $id;
};
$main = [['Home', 'HOME'], ['About', '/about/'], ['Services', '/services/'], ['Projects', '/projects/'], ['Testimonials', '/testimonials/'], ['Contact', '/contact/']];
$primary  = $tp_menu('Main navigation', $main);
$quick    = $tp_menu('Footer: Quick links', $main);
$services = $tp_menu('Footer: Services', [
  ['Construction', '/services/#construction'], ['Design & Build', '/services/#design-build'], ['Decoration & Fit-out', '/services/#decoration-fitout'],
  ['Renovation', '/services/#renovation'], ['Maintenance', '/services/#maintenance'], ['Turnkey Projects', '/services/#turnkey']]);
set_theme_mod('nav_menu_locations', ['primary' => $primary, 'mobile_menu' => $primary]);

/* ---- Logo ---- */
set_theme_mod('custom_logo', $map['logo-taameer-plus.webp']);

/* ---- Astra palette (Customizer → Global → Colors): brand, alt brand, heading, text, bg, bg 2, alt bg, subtle, supporting ---- */
$palette = ['#0D0D0D', '#262626', '#0D0D0D', '#0D0D0D', '#FFFFFF', '#F4F4F4', '#0D0D0D', '#D9D9D9', '#595959'];
$pal = get_option('astra-color-palettes', []);
$pal['currentPalette'] = 'palette_1';
$pal['palettes']['palette_1'] = $palette;
update_option('astra-color-palettes', $pal);

// Language switcher: visual only until the Arabic site exists (no link, so no broken URL).
$lang = '<p class="tp-lang"><span class="tp-lang__current" aria-current="true"><abbr title="English">EN</abbr></span><span class="tp-lang__sep" aria-hidden="true">|</span><span class="tp-lang__link" lang="ar" title="Arabic version: coming in a later phase">عربي</span></p>';

$o = get_option('astra-settings', []);
$o['global-color-palette'] = ['palette' => $palette];
$o['site-content-width'] = 1416;
$o['body-font-family'] = "'Inter', sans-serif";
$o['body-font-weight'] = '400';
$o['headings-font-family'] = "'Playfair Display', serif";
$o['headings-font-weight'] = '500';
$o['display-site-title-responsive'] = ['desktop' => 0, 'tablet' => 0, 'mobile' => 0];
$o['display-site-tagline-responsive'] = ['desktop' => 0, 'tablet' => 0, 'mobile' => 0];
$o['ast-header-responsive-logo-width'] = ['desktop' => 135, 'tablet' => 135, 'mobile' => 135];

/* Header: logo | menu · language · Get a Quote ; below 1024px: logo | Menu toggle → full-screen panel */
$o['header-desktop-items'] = [
  'popup'   => ['popup_content' => ['mobile-menu', 'button-1', 'html-2']],
  'above'   => ['above_left' => [], 'above_left_center' => [], 'above_center' => [], 'above_right_center' => [], 'above_right' => []],
  'primary' => ['primary_left' => ['logo'], 'primary_left_center' => [], 'primary_center' => ['menu-1'], 'primary_right_center' => [], 'primary_right' => ['html-1', 'button-1']],
  'below'   => ['below_left' => [], 'below_left_center' => [], 'below_center' => [], 'below_right_center' => [], 'below_right' => []],
];
$o['header-mobile-items'] = [
  'popup'   => ['popup_content' => ['mobile-menu', 'button-1', 'html-2']],
  'above'   => ['above_left' => [], 'above_center' => [], 'above_right' => []],
  'primary' => ['primary_left' => ['logo'], 'primary_center' => [], 'primary_right' => ['mobile-trigger']],
  'below'   => ['below_left' => [], 'below_center' => [], 'below_right' => []],
];
$o['hb-header-height'] = ['desktop' => 80, 'tablet' => 68, 'mobile' => 68];
$o['hb-header-main-sep'] = 0;
$o['header-html-1'] = $lang;
$o['header-html-2'] = '<div class="tp-menu-foot"><p><a href="tel:+97143290500">+971 4 329 0500</a></p><p><a href="mailto:info@taameer.ae">info@taameer.ae</a></p>' . $lang . '</div>';
$o['header-button1-text'] = 'Get a Quote';
$o['header-button1-link-option'] = ['url' => '/contact/', 'new_tab' => false, 'link_rel' => ''];
$o['mobile-header-type'] = 'off-canvas';
$o['off-canvas-layout'] = 'full-width';
$o['mobile-header-menu-label'] = 'Menu';
$o['mobile-header-toggle-btn-style'] = 'minimal'; // the hairline box comes from taameer.css

/* Footer: brand | Quick links | Services | Contact ; bottom row: copyright | language (+ floating WhatsApp button) */
$o['footer-desktop-items'] = [
  'above'   => ['above_1' => [], 'above_2' => [], 'above_3' => [], 'above_4' => [], 'above_5' => []],
  'primary' => ['primary_1' => ['widget-1'], 'primary_2' => ['widget-2'], 'primary_3' => ['widget-3'], 'primary_4' => ['widget-4'], 'primary_5' => []],
  'below'   => ['below_1' => ['copyright'], 'below_2' => ['html-1', 'html-2'], 'below_3' => [], 'below_4' => [], 'below_5' => []],
];
$o['hb-footer-column'] = '4';
$o['hb-footer-layout'] = ['desktop' => '4-lheavy', 'tablet' => '2-equal', 'mobile' => 'full'];
$o['hbb-footer-column'] = '2';
$o['hbb-footer-layout'] = ['desktop' => '2-equal', 'tablet' => '2-equal', 'mobile' => 'full'];
$o['hb-footer-main-sep'] = 0;
$o['hbb-footer-separator'] = 0;
$o['footer-copyright-editor'] = '© [current_year] Taameer Plus Contracting LLC. All rights reserved.';
$o['footer-html-1'] = $lang;
$o['footer-html-2'] = '<a class="tp-fab" href="https://wa.me/971503029281" rel="noopener" target="_blank" aria-label="Chat with Taameer Plus on WhatsApp (opens in a new tab)"></a>';
update_option('astra-settings', $o);

/* ---- Footer widgets (Appearance → Widgets) ---- */
$pdf  = wp_get_attachment_url($map['taameer-plus-company-profile.pdf']);
$logo = wp_get_attachment_image_src($map['logo-taameer-plus.webp'], 'full');
$wb = get_option('widget_block', []);  // keep WordPress's own widgets (ids 2-6, sidebar-1); ours are 100/101
$wb = array_replace($wb, [
  100 => ['content' => '<!-- wp:html --><div class="tp-footer-brand"><p class="tp-footer-logo"><img src="' . esc_url($logo[0]) . '" width="' . $logo[1] . '" height="' . $logo[2] . '" alt="Taameer Plus Contracting LLC"></p><p class="tp-footer-blurb">Construct A Better Tomorrow. A leading contracting, design, fit-out and technical services provider based in Dubai, UAE — building trust before concrete since 2015.</p><p><a class="tp-footer-download" href="' . esc_url($pdf) . '" download>Download company profile <span class="tp-footer-meta">(PDF, 5 MB)</span></a></p></div><!-- /wp:html -->'],
  101 => ['content' => '<!-- wp:html --><h2 class="tp-footer-heading">Contact</h2><address class="tp-footer-list"><p>Sky Business Building, Office M30,<br>Festival City, Dubai, UAE</p><p><span class="tp-footer-label">Office</span> <a href="tel:+97143290500">+971 4 329 0500</a></p><p><span class="tp-footer-label">Mobile</span> <a href="tel:+971503029281">+971 50 302 9281</a></p><p><a href="mailto:info@taameer.ae">info@taameer.ae</a></p><p class="tp-social"><a href="https://wa.me/971503029281" rel="noopener" target="_blank">WhatsApp<span class="tp-visually-hidden"> (opens in a new tab)</span></a><a href="https://instagram.com/taameer_contracting" rel="noopener" target="_blank">Instagram<span class="tp-visually-hidden"> (opens in a new tab)</span></a></p></address><!-- /wp:html -->'],
  '_multiwidget' => 1,
]);
update_option('widget_block', $wb);
update_option('widget_nav_menu', array_replace(get_option('widget_nav_menu', []), [100 => ['title' => 'Quick links', 'nav_menu' => $quick], 101 => ['title' => 'Services', 'nav_menu' => $services], '_multiwidget' => 1]));
$sw = get_option('sidebars_widgets', []);
$sw['footer-widget-1'] = ['block-100'];
$sw['footer-widget-2'] = ['nav_menu-100'];
$sw['footer-widget-3'] = ['nav_menu-101'];
$sw['footer-widget-4'] = ['block-101'];
update_option('sidebars_widgets', $sw);

return ['home_id' => $home_id, 'menus' => [$primary, $quick, $services], 'front' => get_option('page_on_front'), 'logo' => get_theme_mod('custom_logo'), 'pdf' => $pdf];
