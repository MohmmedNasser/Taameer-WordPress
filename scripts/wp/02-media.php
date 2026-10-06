// 02-media.php — uploads the original images and PDFs to the Media Library (WP phase 1, D-038).
// Run repeatedly through Novamira (novamira/execute-php) until total_done = total: each call stops after ~20 s
// (the ability has a 30 s limit) and skips files already uploaded (option tp_media_map: filename => attachment id).
// Originals only: no -md variants (WordPress generates its own sizes), no recompression of the source files.
// Alt text comes from scripts/wp/alt-map.json (python scripts/wp/00-alt-map.py . scripts/wp/alt-map.json).
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
$t0 = microtime(true);
add_filter('fallback_intermediate_image_sizes', '__return_empty_array'); // no PDF preview images
$repo = 'C:/Users/HP/Desktop/TAAMEER-Company-profile/';
$alts = json_decode(file_get_contents($repo . 'scripts/wp/alt-map.json'), true);
// The two "license-*.pdf" files in assets/docs are JPEG images with a .pdf extension; WordPress rejects them
// (type check). They are used only on the About page (later phase); see the WP phase 1 report / D-038.
$pdfs = ['taameer-plus-company-profile.pdf' => 'Taameer Plus company profile (PDF)'];
$queue = [];
foreach ($alts as $f => $a) $queue[$f] = ['path' => $repo . 'assets/img/' . $f, 'alt' => $a, 'title' => null];
foreach ($pdfs as $f => $title) $queue[$f] = ['path' => $repo . 'assets/docs/' . $f, 'alt' => '', 'title' => $title];
$map = get_option('tp_media_map', []);
$done = 0; $errors = [];
foreach ($queue as $f => $q) {
  if (isset($map[$f]) && get_post($map[$f])) continue;
  if (microtime(true) - $t0 > 20) break;
  $tmp = wp_tempnam($f);
  copy($q['path'], $tmp);
  $id = media_handle_sideload(['name' => $f, 'tmp_name' => $tmp], 0, $q['title']);
  if (is_wp_error($id)) { $errors[$f] = $id->get_error_message(); @unlink($tmp); continue; }
  if ($q['alt'] !== '') update_post_meta($id, '_wp_attachment_image_alt', $q['alt']);
  $map[$f] = $id; $done++;
  update_option('tp_media_map', $map, false);
}
return ['uploaded_now' => $done, 'total_done' => count($map), 'total' => count($queue), 'errors' => $errors, 'secs' => round(microtime(true) - $t0, 1)];
