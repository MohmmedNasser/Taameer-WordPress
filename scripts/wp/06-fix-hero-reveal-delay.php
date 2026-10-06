// Add tp-delay-2 to the hero image widget only (classes "tp-img-reveal tp-parallax" + the Palm Jumeirah image).
$id = (int) get_option('tp_home_page_id');
$data = json_decode(get_post_meta($id, '_elementor_data', true), true);
$hero_img = (int) get_option('tp_media_map')['project-palm-jumeirah-villa-02.webp'];
$changed = 0;
$walk = function (&$els) use (&$walk, &$changed, $hero_img) {
  foreach ($els as &$e) {
    $s = &$e['settings'];
    if (($e['widgetType'] ?? '') === 'image' && ($s['_css_classes'] ?? '') === 'tp-img-reveal tp-parallax' && (int) ($s['image']['id'] ?? 0) === $hero_img) {
      $s['_css_classes'] = 'tp-img-reveal tp-delay-2 tp-parallax'; $changed++;
    }
    unset($s);
    $walk($e['elements']);
  }
};
$walk($data);
if ($changed !== 1) return ['changed' => $changed, 'saved' => false];
$doc = \Elementor\Plugin::$instance->documents->get($id, false);
$ok = $doc->save(['elements' => $data]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
return ['changed' => $changed, 'saved' => $ok];
