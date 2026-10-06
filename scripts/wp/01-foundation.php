// 01-foundation.php — site identity, https URLs, Elementor v3 feature set, child theme activation (WP phase 1, D-038).
// Run through Novamira (novamira/execute-php).
$before = [ 'siteurl'=>get_option('siteurl'), 'home'=>get_option('home'), 'blogname'=>get_option('blogname'), 'theme'=>get_stylesheet() ];
// Site identity
update_option('blogname', 'Taameer Plus Contracting LLC');
update_option('blogdescription', 'Construction, Fit-out & Renovation in Dubai');
// The site is served over https (LocalWP SSL); http URLs would be blocked as mixed content on https pages.
update_option('siteurl', 'https://taameer.local');
update_option('home', 'https://taameer.local');
update_option('timezone_string', 'Asia/Dubai');
// Elementor: pin the v3 feature set (Containers, Nested Elements, Optimized Markup on; Atomic/v4 off).
foreach (['container'=>'active','nested-elements'=>'active','e_optimized_markup'=>'active','e_atomic_elements'=>'inactive','e_opt_in_v4'=>'inactive'] as $f=>$s) update_option('elementor_experiment-'.$f, $s);
update_option('elementor_disable_color_schemes', 'yes');
update_option('elementor_disable_typography_schemes', 'yes');
update_option('elementor_cpt_support', ['page','post']);
// Child theme
$t = wp_get_theme('taameer-astra-child');
if (!$t->exists() || $t->errors()) return ['error'=>'child theme not found', 'e'=>$t->errors()];
switch_theme('taameer-astra-child');
return ['before'=>$before, 'after'=>['siteurl'=>get_option('siteurl'),'home'=>get_option('home'),'blogname'=>get_option('blogname'),'theme'=>get_stylesheet(),'template'=>get_template()]];
