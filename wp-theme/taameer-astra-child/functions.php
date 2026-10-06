<?php
/**
 * Taameer Plus — Astra child theme.
 *
 * Kept deliberately small (owner decision D-038): page layouts are Elementor Containers and native widgets,
 * header/footer are the Astra Header/Footer Builder. This file only:
 *   1. enqueues assets/css/taameer.css and assets/js/taameer.js,
 *   2. sets html.tp-js before first paint (entrance states never flash; content stays visible without JS),
 *   3. aligns Astra's breakpoints with Elementor's (tablet <= 1023px, mobile <= 767px),
 *   4. registers [tp_template id="…"] so one Elementor saved template (the CTA band) can be reused on many pages
 *      (Elementor Free has no Template widget / global widgets).
 *
 * @package taameer-astra-child
 */

defined( 'ABSPATH' ) || exit;

define( 'TP_CHILD_VERSION', '1.0.0' );

/**
 * Styles and scripts. Loaded after Astra and Elementor so component classes win without !important.
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		$dir = get_stylesheet_directory();
		$uri = get_stylesheet_directory_uri();

		wp_enqueue_style(
			'taameer',
			$uri . '/assets/css/taameer.css',
			array( 'astra-theme-css' ),
			TP_CHILD_VERSION . '.' . filemtime( $dir . '/assets/css/taameer.css' )
		);

		wp_enqueue_script(
			'taameer',
			$uri . '/assets/js/taameer.js',
			array(),
			TP_CHILD_VERSION . '.' . filemtime( $dir . '/assets/js/taameer.js' ),
			array( 'strategy' => 'defer', 'in_footer' => false )
		);
	},
	20
);

/**
 * html.tp-js before first paint. Hidden entrance states in taameer.css only apply under this class.
 */
add_action(
	'wp_head',
	function () {
		echo "<script>document.documentElement.classList.add('tp-js');</script>\n";
	},
	1
);

/**
 * Astra breakpoints = Elementor breakpoints (Site Settings → Layout → Breakpoints: tablet 1023, mobile 767).
 * The header switches to the mobile menu below 1024px, as in the static prototype.
 */
add_filter( 'astra_tablet_breakpoint', fn() => 1023 );
add_filter( 'astra_mobile_breakpoint', fn() => 767 );

/**
 * [tp_template id="123"] — prints a published Elementor saved template (with its CSS).
 * Used through Elementor's free Shortcode widget, so editing the template updates every page that uses it.
 */
add_shortcode(
	'tp_template',
	function ( $atts ) {
		$id = absint( shortcode_atts( array( 'id' => 0 ), $atts )['id'] );
		if ( ! $id || 'elementor_library' !== get_post_type( $id ) || 'publish' !== get_post_status( $id ) ) {
			return '';
		}
		if ( ! class_exists( '\Elementor\Plugin' ) ) {
			return '';
		}
		return \Elementor\Plugin::instance()->frontend->get_builder_content_for_display( $id, true );
	}
);
