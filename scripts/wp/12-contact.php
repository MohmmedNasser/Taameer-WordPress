// 12-contact.php — builds the Contact page (/contact/, WP phase 6) from contact.html, with its enquiry form in WPForms Lite.
// 1. WPForms form "Contact" (option tp_contact_form_id): the prototype's fields in order (Full name*, Email address*, Phone
//    number, Project type, Message*), "Send message", AJAX submit, honeypot + WPForms modern anti-spam (the prototype's
//    honeypot), the prototype's success copy as the confirmation message, one email notification (local: {admin_email},
//    caught by Local's Mailpit; set to the client's inbox at go-live). The "Fields marked * are required." note is the form
//    description (shown just above the button by taameer.css §5g). WPForms' global validation messages are set to the
//    prototype's wording where WPForms allows one message per rule.
// 2. Elementor page: hero + breadcrumbs, contact details (dl spec) beside the form (WPForms widget, its own style controls),
//    "Visit our office" location block with the Google Maps link, shared CTA band. Elementor Containers + native widgets
//    only; no HTML widget. Creates the page once (option tp_contact_page_id); re-running replaces its content (same IDs).
// Run on the site through Novamira (novamira/execute-php).

/* ================= 1 WPForms form ================= */
$TYPES = ['Construction', 'Design & Build', 'Decoration & Fit-out', 'Renovation', 'Maintenance', 'Turnkey Projects', 'Other'];
$choices = [];
foreach ($TYPES as $i => $t) $choices[$i + 1] = ['label' => $t, 'value' => '', 'image' => '', 'icon' => '', 'icon_style' => ''];

$fid = (int) get_option('tp_contact_form_id');
if (!$fid || get_post_type($fid) !== 'wpforms') {
  $fid = wpforms()->obj('form')->add('Contact', [], ['builder' => false]);
  if (!$fid) return ['error' => 'WPForms could not create the form'];
  update_option('tp_contact_form_id', $fid, false);
}
$form = [
  'id' => (string) $fid,
  'field_id' => 6,
  'fields' => [
    1 => ['id' => '1', 'type' => 'name', 'label' => 'Full name', 'format' => 'simple', 'required' => '1', 'size' => 'large', 'simple_placeholder' => '', 'simple_default' => ''],
    2 => ['id' => '2', 'type' => 'email', 'label' => 'Email address', 'required' => '1', 'size' => 'large', 'placeholder' => '', 'default_value' => ''],
    3 => ['id' => '3', 'type' => 'text', 'label' => 'Phone number', 'size' => 'large', 'placeholder' => '', 'default_value' => ''],
    4 => ['id' => '4', 'type' => 'select', 'label' => 'Project type', 'choices' => $choices, 'placeholder' => 'Select a service', 'size' => 'large', 'style' => 'classic'],
    5 => ['id' => '5', 'type' => 'textarea', 'label' => 'Message', 'required' => '1', 'size' => 'large', 'placeholder' => '', 'default_value' => ''],
  ],
  'settings' => [
    'form_title' => 'Contact',
    'form_desc' => 'Fields marked * are required.',
    'submit_text' => 'Send message',
    'submit_text_processing' => 'Sending…',
    'form_class' => '',
    'submit_class' => '',
    'ajax_submit' => '1',
    'honeypot' => '1',
    'antispam_v3' => '1',
    'store_spam_entries' => '0',
    'notification_enable' => '1',
    'notifications' => [1 => [
      'notification_name' => 'Website enquiry',
      'email' => '{admin_email}',
      'subject' => 'New enquiry from {field_id="1"} — taameer.ae',
      'sender_name' => get_bloginfo('name'),
      'sender_address' => '{admin_email}',
      'replyto' => '{field_id="2"}',
      'message' => '{all_fields}',
    ]],
    'confirmations' => [1 => [
      'name' => 'Default Confirmation',
      'type' => 'message',
      'message' => '<h3>Thank you for your message</h3><p>Our team will get back to you. For anything urgent, call +971 4 329 0500 or message us on WhatsApp.</p>',
      'message_scroll' => '1',
      'page' => '', 'redirect' => '',
    ]],
  ],
  'meta' => ['template' => 'blank'],
];
wp_update_post(['ID' => $fid, 'post_title' => 'Contact', 'post_status' => 'publish', 'post_content' => wpforms_encode($form)]);

// Global WPForms validation messages (one per rule; the prototype names the field, WPForms cannot).
$ws = (array) get_option('wpforms_settings', []);
$ws['validation-required'] = 'Please fill in this field.';
$ws['validation-email'] = 'Please enter a valid email address, for example name@example.com.';
update_option('wpforms_settings', $ws);

/* ================= helpers (as 11-testimonials.php; each Novamira run is standalone) ================= */
$uid = fn() => substr(md5(uniqid('', true) . mt_rand()), 0, 7);
$dim = fn($t, $r, $b, $l, $u = 'px') => ['unit' => $u, 'top' => (string) $t, 'right' => (string) $r, 'bottom' => (string) $b, 'left' => (string) $l, 'isLinked' => false];
$all = fn($v, $u = 'px') => ['unit' => $u, 'top' => (string) $v, 'right' => (string) $v, 'bottom' => (string) $v, 'left' => (string) $v, 'isLinked' => true];
$gap = fn($v) => ['unit' => 'px', 'size' => $v, 'column' => (string) $v, 'row' => (string) $v, 'isLinked' => true];
$w = fn($v, $u = '%') => ['unit' => $u, 'size' => $v, 'sizes' => []];
$px = fn($v) => ['unit' => 'px', 'size' => $v, 'sizes' => []];
$cw = fn($expr) => ['unit' => 'custom', 'size' => $expr, 'sizes' => []];
$border = fn($t, $r, $b, $l, $color = 'line') => [
  'border_border' => 'solid', 'border_width' => ['unit' => 'px', 'top' => "$t", 'right' => "$r", 'bottom' => "$b", 'left' => "$l", 'isLinked' => false],
  'border_color' => $color === 'line' ? '#D9D9D9' : '#0D0D0D',
];
$C = function (array $s, array $children = []) use ($uid, $gap) {
  $s += ['content_width' => 'full', 'flex_direction' => 'column', 'flex_gap' => $gap(0)];
  return ['id' => $uid(), 'elType' => 'container', 'isInner' => true, 'settings' => $s, 'elements' => $children];
};
$W = fn($type, array $s) => ['id' => $uid(), 'elType' => 'widget', 'widgetType' => $type, 'isInner' => false, 'settings' => $s, 'elements' => []];
$anim = fn($delay = 0) => ['_animation' => 'fadeInUp', '_animation_delay' => $delay];
$H = function ($text, $tag, $typoId, $colorId = 'primary', array $x = []) use ($W) {
  $s = ['title' => $text, 'header_size' => $tag, '__globals__' => ['title_color' => "globals/colors?id=$colorId"]];
  if ($typoId) $s['__globals__']['typography_typography'] = "globals/typography?id=$typoId";
  return $W('heading', array_merge($s, $x));
};
$T = function ($html, $typoId = 'text', $colorId = 'text', array $x = []) use ($W) {
  $s = ['editor' => $html, '__globals__' => ['text_color' => "globals/colors?id=$colorId"]];
  if ($typoId) $s['__globals__']['typography_typography'] = "globals/typography?id=$typoId";
  return $W('text-editor', array_merge($s, $x));
};
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
$NEWTAB = '<span class="tp-visually-hidden"> (opens in a new tab)</span>';
$EYE = fn($text, array $x = []) => $H($text, 'p', 'eyebrow', 'accent', ['_css_classes' => 'tp-eyebrow'] + $x);

/* ================= 1 Page hero + breadcrumbs (as Testimonials) ================= */
$hero = $SEC([[48, 60], [32, 48], [32, 40]], array_merge($FOG, $border(0, 0, 1, 0)), [
  $T('<nav class="tp-breadcrumb" aria-label="Breadcrumb"><ol class="tp-breadcrumb__list"><li><a href="/">Home</a></li><li><span aria-current="page">Contact</span></li></ol></nav>', null, 'secondary'),
  $C(['margin' => $dim(32, 0, 0, 0), 'flex_gap' => $gap(24)], [
    $EYE('Contact us', $anim(100)),
    $H('Get in touch with our team', 'h1', 'h1', 'primary', $MW($H1W) + $anim(200)),
    $T('<p>Ready to build your next project? Contact Taameer Plus Contracting for expert consultations, value engineering, and turnkey proposals.</p>', 'secondary', 'secondary', $MW($MEASURE) + $anim(300)),
  ]),
]);

/* ================= 2 Contact details (5 cols) + form (7 cols): wraps below ~810 px like the prototype's tp-row ================= */
$spec = '<dl>'
  . '<dt>Address</dt><dd><address>Sky Business Building, Office M30, Festival City, Dubai, UAE</address></dd>'
  . '<dt>Office</dt><dd><a href="tel:+97143290500">+971 4 329 0500</a></dd>'
  . '<dt>Mobile</dt><dd><a href="tel:+971503029281">+971 50 302 9281</a></dd>'
  . '<dt>Email</dt><dd><a href="mailto:info@taameer.ae">info@taameer.ae</a></dd>'
  . '<dt>WhatsApp</dt><dd><a href="https://wa.me/971503029281" target="_blank" rel="noopener">Chat with us instantly' . $NEWTAB . '</a></dd>'
  . '<dt>Instagram</dt><dd><a href="https://instagram.com/taameer_contracting" target="_blank" rel="noopener">@taameer_contracting' . $NEWTAB . '</a></dd>'
  . '</dl>';
$wpf = $W('wpforms', [
  'form_id' => (string) $fid, 'display_form_name' => '', 'display_form_description' => 'yes',
  // WPForms' own style controls (CSS variables scoped to this widget); typography and states in taameer.css §5g.
  'fieldSize' => 'medium', 'fieldBorderStyle' => 'solid', 'fieldBorderSize' => '1', 'fieldBorderRadius' => '2',
  'fieldBackgroundColor' => '#FFFFFF', 'fieldBorderColor' => '#D9D9D9', 'fieldTextColor' => '#0D0D0D', 'fieldMenuColor' => '#FFFFFF',
  'labelSize' => 'small', 'labelColor' => '#0D0D0D', 'labelSublabelColor' => '#595959', 'labelErrorColor' => '#0D0D0D',
  'buttonSize' => 'medium', 'buttonBorderStyle' => 'none', 'buttonBorderSize' => '0', 'buttonBorderRadius' => '2',
  'buttonBackgroundColor' => '#0D0D0D', 'buttonBorderColor' => '#0D0D0D', 'buttonTextColor' => '#FFFFFF',
  '_css_classes' => 'tp-contact-form',
] + $anim(0));
$contact = $SEC($PAD, ['css_classes' => 'tp-contact'], [
  $C(['flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_align_items' => 'flex-start', 'flex_gap' => $gap(41), 'flex_gap_tablet' => $gap(32), 'flex_gap_mobile' => $gap(24)], [
    $C(['css_classes' => 'tp-contact-info', 'width' => $cw('min(100%, 20rem)'), '_flex_size' => 'custom', '_flex_grow' => 5, '_flex_shrink' => 1, 'flex_gap' => $gap(24)], [
      $EYE('Contact details', $anim(0)),
      $H('Head office', 'h2', 'h2', 'primary', $anim(0)),
      $T($spec, null, 'primary', ['_css_classes' => 'tp-spec tp-spec--stack'] + $anim(0)),
    ]),
    $C(['css_classes' => 'tp-contact-formcol', 'width' => $cw('min(100%, 24rem)'), '_flex_size' => 'custom', '_flex_grow' => 7, '_flex_shrink' => 1, 'flex_gap' => $gap(24)], [
      $EYE('Send a message', $anim(0)),
      $H('Tell us about your project', 'h2', 'h2', 'primary', $anim(0)),
      $wpf,
    ]),
  ]),
]);

/* ================= 3 Location: "+" mark, text, Google Maps button (no embedded map, as the prototype) ================= */
$location = $SEC($PAD, array_merge($FOG, ['css_classes' => 'tp-location-section']), [
  $C(array_merge([
    'css_classes' => 'tp-location', 'flex_direction' => 'row', 'flex_wrap' => 'wrap', 'flex_align_items' => 'center', 'flex_gap' => $gap(32),
    'padding' => $all(64), 'padding_tablet' => $all(64), 'padding_mobile' => $all(64),
    'background_background' => 'classic', 'background_color' => '#FFFFFF', '__globals__' => ['background_color' => 'globals/colors?id=paper'],
    'border_radius' => $all(2),
  ], $border(1, 1, 1, 1)), [
    $C(['css_classes' => 'tp-location__mark', 'width' => $px(56), 'min_height' => $px(56), '_flex_size' => 'none']),
    $C(['width' => $cw('min(100%, 18rem)'), '_flex_size' => 'grow', 'flex_gap' => $gap(12)], [
      $EYE('Find us'),
      $H('Visit our office', 'h2', 'h2', 'primary'),
      $T('<p>Sky Business Building, Office M30, Festival City, Dubai, UAE</p>', 'secondary', 'text'),   // tp-lead: Lead size, text colour
    ]),
    $W('button', ['text' => 'Open in Google Maps' . $NEWTAB,
      'link' => ['url' => 'https://www.google.com/maps/search/?api=1&query=Sky+Business+Building+Festival+City+Dubai+UAE', 'is_external' => 'on', 'nofollow' => '']]),
  ]),
]);

/* ================= 4 CTA band (shared template) ================= */
$cta_id = (int) get_option('tp_cta_template_id');
if (!$cta_id || get_post_type($cta_id) !== 'elementor_library') return ['error' => 'CTA template missing'];
$cta_ref = ['id' => $uid(), 'elType' => 'container', 'isInner' => false,
  'settings' => ['content_width' => 'full', 'flex_direction' => 'column', 'flex_gap' => $gap(0), 'padding' => $all(0)],
  'elements' => [$W('shortcode', ['shortcode' => '[tp_template id="' . $cta_id . '"]'])]];

/* ================= Page ================= */
$pid = (int) get_option('tp_contact_page_id');
if (!$pid || get_post_type($pid) !== 'page') {
  $existing = get_page_by_path('contact', OBJECT, 'page');
  $pid = $existing ? $existing->ID : wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Contact', 'post_name' => 'contact', 'post_content' => ''], true);
  if (is_wp_error($pid)) return ['error' => $pid->get_error_message()];
  update_option('tp_contact_page_id', $pid, false);
}
update_post_meta($pid, '_wp_page_template', 'elementor_header_footer');
$page = \Elementor\Plugin::$instance->documents->get($pid, false);
$page->set_is_built_with_elementor(true);
$ok = $page->save([
  'elements' => [$hero, $contact, $location, $cta_ref],
  'settings' => ['template' => 'elementor_header_footer', 'hide_title' => 'yes'],
]);
\Elementor\Plugin::$instance->files_manager->clear_cache();
return ['contact' => $pid, 'form' => $fid, 'saved' => $ok, 'url' => get_permalink($pid), 'edit' => admin_url("post.php?post=$pid&action=elementor"), 'cta' => $cta_id];
