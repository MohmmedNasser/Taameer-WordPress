// 16-schema.php — WP Phase 9, C3 (Yoast SEO free, D-048): validates the schema Organization of the English / Arabic site.
// Run with 15-seo-run.mjs (dry run by default; no $META needed):
//   node scripts/wp/15-seo-run.mjs 16-schema.php            dry run: validates and reports, writes nothing
//   node scripts/wp/15-seo-run.mjs 16-schema.php --write    only after the owner's approval
// Writing is opt-in: only `$WRITE = true;` (prepended by the runner's --write) enables it, and `$DRY = true;` always wins.
// Run any other way (e.g. pasted into novamira/execute-php without either variable) the script is a dry run.
// The business details (GeneralContractor type, description per language, telephone, email, foundingDate, PostalAddress,
// sameAs) live in the child theme (functions.php → tp_schema_business(), added to Yoast's Organization node by the
// wpseo_schema_organization filter); Yoast prints name (site title, translated by Polylang), url and logo (theme logo).
// Checks: the filter is active, every value is present and well formed (a language without a description is reported as a
// note, not an error: the prototype has no Arabic description), Yoast represents a company with a name and a logo, and
// which Yoast "Site representation" fields would take precedence over the child-theme values (Yoast's value is kept).
// Any error stops the script before writing. The only write (with --write) is Yoast's "company_or_person" = "company",
// the condition for Yoast to print the Organization node at all; nothing else (no Yoast field, page or Elementor data).
// Re-running is idempotent.

$write = !empty($WRITE) && empty($DRY);
$report = ['dry' => !$write, 'errors' => [], 'notes' => [], 'values' => null, 'yoast' => []];

if (!function_exists('tp_schema_business') || !has_filter('wpseo_schema_organization')) {
  echo json_encode(['error' => 'child-theme schema filter not active (tp_schema_business / wpseo_schema_organization)']);
  return;
}

// 1. The child-theme values: present and well formed.
$b = tp_schema_business();
$report['values'] = $b;
$err = function ($msg) use (&$report) { $report['errors'][] = $msg; };
if (($b['type'] ?? '') !== 'GeneralContractor') $err('type is not GeneralContractor');
foreach (['en', 'ar'] as $lang) {
  if (!array_key_exists($lang, $b['description'] ?? [])) $err("description.$lang key missing");
  elseif (trim($b['description'][$lang]) === '') $report['notes'][] = "no $lang description: none is printed on $lang pages (client copy needed)";
}
if (trim($b['description']['en'] ?? '') === '') $err('English description empty (the prototype has one)');
if (!preg_match('/^\+\d{8,15}$/', $b['telephone'] ?? '')) $err('telephone not in +<digits> form');
if (!is_email($b['email'] ?? '')) $err('email invalid');
if (!preg_match('/^\d{4}(-\d{2}(-\d{2})?)?$/', $b['foundingDate'] ?? '')) $err('foundingDate not an ISO 8601 date / year');
$a = $b['address'] ?? [];
if (($a['@type'] ?? '') !== 'PostalAddress') $err('address @type is not PostalAddress');
foreach (['streetAddress', 'addressLocality'] as $k) if (trim($a[$k] ?? '') === '') $err("address.$k empty");
if (!preg_match('/^[A-Z]{2}$/', $a['addressCountry'] ?? '')) $err('address.addressCountry not an ISO 3166 alpha-2 code');
if (!is_array($b['sameAs'] ?? null) || !$b['sameAs']) $err('sameAs empty');
// Format only (no DNS lookup, so the check also works offline).
foreach ((array) ($b['sameAs'] ?? []) as $u) if (!filter_var($u, FILTER_VALIDATE_URL) || !str_starts_with($u, 'https://')) $err("sameAs not an https URL: $u");

// 2. Yoast: company representation, name and logo sources, fields that would win over the child-theme values.
$type = WPSEO_Options::get('company_or_person');
$report['yoast']['company_or_person'] = [$type, $type === 'company' ? 'same' : 'would change'];
$report['yoast']['name'] = WPSEO_Options::get('company_name') !== '' ? 'Yoast company name' : (get_option('blogname') !== '' ? 'site title (Polylang-translated)' : 'missing');
$report['yoast']['logo'] = WPSEO_Options::get('company_logo_id') ? 'Yoast company logo' : (get_theme_mod('custom_logo') ? 'theme logo (id ' . get_theme_mod('custom_logo') . ')' : 'missing');
if ($report['yoast']['name'] === 'missing') $err('no organization name (Yoast company name or site title)');
if ($report['yoast']['logo'] === 'missing') $err('no organization logo (Yoast company logo or theme logo)');
foreach (['org-description' => 'description', 'org-email' => 'email', 'org-phone' => 'telephone', 'org-founding-date' => 'foundingDate'] as $opt => $key) {
  $v = (string) WPSEO_Options::get($opt);
  if ($v !== '') $report['notes'][] = "Yoast $opt is set (\"$v\"): Yoast prints it instead of the child-theme $key" . ($key === 'description' ? ' (one value: also on Arabic pages unless Polylang translates it)' : '');
}
$social = (array) WPSEO_Options::get('other_social_urls');
if ($social) $report['notes'][] = 'Yoast other profiles merged into sameAs: ' . implode(', ', $social);

if ($report['errors']) {
  $report['error'] = 'schema values invalid, nothing written';
  echo json_encode($report, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  return;
}

// 3. Write (only with --write, after validation): Yoast must represent a company for the Organization node to exist.
if ($write && $type !== 'company') {
  WPSEO_Options::set('company_or_person', 'company');
  $report['yoast']['company_or_person'] = [WPSEO_Options::get('company_or_person'), 'changed'];
}

echo json_encode($report, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
