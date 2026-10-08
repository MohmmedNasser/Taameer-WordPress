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
 *      (Elementor Free has no Template widget / global widgets),
 *   5. keeps in-page menu links (/services/#construction …) from being marked as the current page,
 *   6. on the Services page, leaves #anchor scrolling to the browser (Astra's scroll-to-ID ignores the sticky chip bar),
 *   7. prints the "404 page" Elementor saved template on not-found requests (Elementor Free has no Theme Builder).
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
 * WordPress ignores the #fragment when it matches menu URLs, so on /services/ all six "Services" footer links
 * (/services/#construction …) became current items (underlined, aria-current="page"). Only the page link is current,
 * as in the prototype.
 */
add_filter(
	'wp_nav_menu_objects',
	function ( $items ) {
		foreach ( $items as $item ) {
			if ( $item->current && false !== strpos( (string) $item->url, '#' ) ) {
				$item->current = false;
				$item->classes = array_diff( (array) $item->classes, array( 'current-menu-item', 'current_page_item' ) );
			}
		}
		// A project page (child of /projects/) keeps "Projects" current, as on the prototype's project page. The menu links
		// are custom URLs, so WordPress does not mark the parent page itself.
		$parent = is_page() ? wp_get_post_parent_id( get_queried_object_id() ) : 0;
		if ( $parent && (int) get_option( 'tp_projects_page_id' ) === $parent ) {
			$path = wp_parse_url( get_permalink( $parent ), PHP_URL_PATH );
			foreach ( $items as $item ) {
				if ( rtrim( (string) wp_parse_url( $item->url, PHP_URL_PATH ), '/' ) === rtrim( (string) $path, '/' ) && false === strpos( (string) $item->url, '#' ) ) {
					$item->current = true;
					$item->classes = array_merge( (array) $item->classes, array( 'current-menu-item', 'current_page_item' ) );
				}
			}
		}
		return $items;
	}
);

/**
 * Astra's "scroll to ID" scrolls #links (and the URL hash on load) to the very top of the target: it only allows for
 * Astra Pro's sticky header, so on Services the section landed under the header and the chip bar (and on Testimonials
 * the letter of /testimonials/#id under the header). There the browser scrolls natively instead, honouring the
 * scroll-margin in taameer.css, as in the prototype. Other pages unchanged.
 */
add_filter(
	'astra_theme_js_localize',
	function ( $data ) {
		$pages = array_filter( array( (int) get_option( 'tp_services_page_id' ), (int) get_option( 'tp_testimonials_page_id' ) ) );
		if ( $pages && is_page( $pages ) ) {
			$data['is_scroll_to_id'] = false;
		}
		return $data;
	}
);

/**
 * 404 page. Elementor Free has no Theme Builder, so the "Page not found" content is an Elementor saved template
 * ("404 page", option tp_404_template_id, built by scripts/wp/13-404.php, edited in Templates → Saved Templates). On a
 * not-found request it replaces Astra's 404 content, full width like the Elementor pages (Astra "page-builder" layout);
 * the response stays a 404 and is noindex, as in the prototype. Without the template Astra's own 404 is shown.
 */
add_action(
	'wp',
	function () {
		$id = (int) get_option( 'tp_404_template_id' );
		if ( ! is_404() || ! $id || 'publish' !== get_post_status( $id ) || ! class_exists( '\Elementor\Plugin' ) ) {
			return;
		}
		add_filter( 'astra_get_content_layout', fn() => 'page-builder' );
		// The template's CSS in the head (it is printed after wp_head).
		add_action( 'wp_enqueue_scripts', fn() => ( new \Elementor\Core\Files\CSS\Post( $id ) )->enqueue(), 20 );
		remove_all_actions( 'astra_404_content_template' );
		add_action( 'astra_404_content_template', fn() => print( do_shortcode( '[tp_template id="' . $id . '"]' ) ) );
	}
);

add_filter(
	'wp_robots',
	function ( $robots ) {
		if ( is_404() ) {
			$robots['noindex'] = true;
		}
		return $robots;
	}
);

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
