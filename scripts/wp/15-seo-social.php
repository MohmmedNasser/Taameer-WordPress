// 15-seo-social.php — WP Phase 9, C2 (Yoast SEO free, D-046): the social (Open Graph / X) image of every published English /
// Arabic page = the prototype page's og:image (scripts/wp/seo-meta.json → og_image; project pages: their cover from projects.json).
// Run with 15-seo-run.mjs (dry run by default), which prepends
//   $META = json_decode(base64_decode('<scripts/wp/seo-meta.json, base64>'), true);
// and $DRY = true; unless --write is given. A dry run resolves pages and images and reports what would change; it writes nothing.
// Before any write every entry of $META must resolve to a published page in its language and to an image in that language, and
// every published page must be in $META; otherwise the script stops with the list and writes nothing.
// Writes only Yoast's per-page fields _yoast_wpseo_opengraph-image (URL) and _yoast_wpseo_opengraph-image-id, with the
// Media Library attachment in the page's language (Polylang media translation; same file in both languages), then triggers
// the page's Yoast indexable build (refreshes stored indexables in production; LocalWP's "local" environment stores none and
// Yoast builds the output per request). OG / X title and description are left empty so Yoast keeps using the C1 SEO title /
// description.
// The prototype's "-md" files (900 px copies) are not in the Media Library: the original of the same image is used.
// Not touched: Elementor data, titles, descriptions, canonical, hreflang, robots, schema, any Yoast or site setting.
// Re-running is idempotent.

if (!isset($META) || !is_array($META) || !$META) {
  echo json_encode(['error' => 'META missing or empty']);
  return;
}

global $wpdb;
$byPath = [];
foreach (get_posts(['post_type' => 'page', 'post_status' => 'publish', 'numberposts' => -1, 'lang' => '', 'suppress_filters' => true]) as $p) {
  $byPath[wp_make_link_relative(get_permalink($p))] = $p;
}

// English attachment id of a prototype file name (the -md copy falls back to its original).
$attachment = function ($file) use ($wpdb) {
  foreach ([$file, preg_replace('/-md\.webp$/', '.webp', $file)] as $name) {
    foreach ($wpdb->get_col($wpdb->prepare("select post_id from {$wpdb->postmeta} where meta_key='_wp_attached_file' and meta_value like %s", '%/' . $wpdb->esc_like($name))) as $id) {
      if (pll_get_post_language((int) $id) === 'en') return (int) $id;
    }
  }
  return 0;
};

// Resolve every entry first: nothing is written unless all pages and images resolve and no published page is left out.
$resolved = [];
$missing = [];
foreach ($META as $m) {
  $p = $byPath[$m['path']] ?? null;
  $en = empty($m['og_image']) ? 0 : $attachment($m['og_image']);
  $id = $en ? (int) pll_get_post($en, $m['lang']) : 0;
  if (!$p || pll_get_post_language($p->ID) !== $m['lang'] || !$id) {
    $missing[] = [$m['path'], $m['og_image'] ?? null, $p ? $p->ID : null, $id];
    continue;
  }
  $resolved[] = [$p, $m, $id];
}
$unlisted = array_values(array_diff(array_keys($byPath), array_column($META, 'path')));
if ($missing || $unlisted) {
  echo json_encode(['error' => 'META, published pages or images differ, nothing written', 'missing' => $missing, 'unlisted' => $unlisted], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  return;
}

$dry = !empty($DRY);
$watcher = YoastSEO()->classes->get(\Yoast\WP\SEO\Integrations\Watchers\Indexable_Post_Watcher::class);
$report = ['dry' => $dry, 'pages' => []];

foreach ($resolved as [$p, $m, $id]) {
  $url = wp_get_attachment_url($id);
  $before = [get_post_meta($p->ID, '_yoast_wpseo_opengraph-image', true), (string) get_post_meta($p->ID, '_yoast_wpseo_opengraph-image-id', true)];
  $state = $before === [$url, (string) $id] ? 'same' : ($dry ? 'would change' : 'changed');
  if (!$dry) {
    update_post_meta($p->ID, '_yoast_wpseo_opengraph-image', $url);
    update_post_meta($p->ID, '_yoast_wpseo_opengraph-image-id', (string) $id);
    $watcher->build_indexable($p->ID);
  }
  $report['pages'][] = [$p->ID, $m['path'], $id, basename($url), $state];
}

$report['count'] = count($report['pages']);
echo json_encode($report, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
