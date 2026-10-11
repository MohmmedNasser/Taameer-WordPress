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
 *   7. prints the "404 page" Elementor saved template on not-found requests (Elementor Free has no Theme Builder),
 *   8. Arabic (Polylang Free, WP Phase 8, D-045): Arabic-only fonts + taameer-ar.css, the [tp_lang] language switcher,
 *      the same page slugs in both languages (/about/ ↔ /ar/about/), per-language saved templates (404) and the
 *      Polylang strings used by taameer.js and the WPForms messages,
 *   9. SEO (Yoast SEO free, WP Phase 9, D-046): removes Yoast's HTML comment and the X "Est. reading time" label; the
 *      SEO data itself lives in Yoast's fields; the schema Organization gets the GeneralContractor type and the business
 *      details Yoast free cannot hold (D-048, tp_schema_business()).
 *
 * @package taameer-astra-child
 */

defined( 'ABSPATH' ) || exit;

define( 'TP_CHILD_VERSION', '1.0.0' );

/** Current Polylang language slug ('en' when Polylang is off). */
function tp_lang() {
	return function_exists( 'pll_current_language' ) && pll_current_language() ? pll_current_language() : 'en';
}

/** The page of an option-stored English page id (tp_projects_page_id …) in the current language. */
function tp_page_option( $option ) {
	$id = (int) get_option( $option );
	if ( $id && function_exists( 'pll_get_post' ) ) {
		$id = (int) pll_get_post( $id, tp_lang() ) ?: $id;
	}
	return $id;
}

/** Strings shown by taameer.js and WPForms, translated in Languages → Translations (group "Taameer theme"). */
function tp_strings() {
	return array(
		'before'      => 'Before',
		'after'       => 'After',
		'divider'     => 'Before and after divider',
		'shown'       => '{n}% of the before image shown',
		'servicesNav' => 'Services on this page',
		'showingOne'  => 'Showing 1 project',
		'showingTwo'  => 'Showing 2 projects',
		'showing'     => 'Showing {n} projects',
		'showingMany' => 'Showing {n} projects (11 or more)',
		'moreProjects' => 'More projects',
		'openLetter'  => 'Open the original letter from {company}',
	);
}

add_action(
	'init',
	function () {
		if ( ! function_exists( 'pll_register_string' ) ) {
			return;
		}
		foreach ( tp_strings() as $key => $text ) {
			pll_register_string( 'tp-js-' . $key, $text, 'Taameer theme' );
		}
		pll_register_string( 'tp-menu-label', 'Menu', 'Taameer theme' );
		foreach ( array( 'Please fill in this field.', 'Please enter a valid email address, for example name@example.com.', 'Please enable JavaScript in your browser to complete this form.' ) as $text ) {
			pll_register_string( 'tp-wpforms', $text, 'Taameer theme' );
		}
	}
);

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

		// Arabic pages only: the prototype's Arabic fonts (D-034: El Messiri 500, IBM Plex Sans Arabic 400/500/600), the
		// Arabic typography + RTL rules, and the translated script strings. English pages load none of this.
		if ( 'ar' === tp_lang() ) {
			wp_enqueue_style(
				'taameer-ar-fonts',
				'https://fonts.googleapis.com/css2?family=El+Messiri:wght@500&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap',
				array(),
				null
			);
			wp_enqueue_style(
				'taameer-ar',
				$uri . '/assets/css/taameer-ar.css',
				array( 'taameer' ),
				TP_CHILD_VERSION . '.' . filemtime( $dir . '/assets/css/taameer-ar.css' )
			);
			$strings = array_map( 'pll__', tp_strings() );
			wp_add_inline_script( 'taameer', 'window.tpI18n = ' . wp_json_encode( $strings, JSON_UNESCAPED_UNICODE ) . ';', 'before' );
		}
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
		if ( $parent && tp_page_option( 'tp_projects_page_id' ) === $parent ) {
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
		$pages = array_filter( array( tp_page_option( 'tp_services_page_id' ), tp_page_option( 'tp_testimonials_page_id' ) ) );
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
		// Arabic not-found URLs (/ar/…) show the Arabic copy of the template (saved templates are not Polylang content).
		$ar = (int) get_option( 'tp_404_template_id_ar' );
		if ( 'ar' === tp_lang() && $ar && 'publish' === get_post_status( $ar ) ) {
			$id = $ar;
		}
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
 * SEO (Yoast SEO free, WP Phase 9, D-046): titles, descriptions, Open Graph and the sitemap come from Yoast (per-page
 * fields, scripts/wp/15-seo.php, 15-seo-social.php); hreflang stays Polylang's. Two filters, output only: no "optimized
 * with Yoast SEO" HTML comment, and no "Est. reading time" label in the X card.
 */
add_filter( 'wpseo_debug_markers', '__return_false' );

// No "Est. reading time" label / data in the X (Twitter) card (Yoast's Slack "enhanced data"; pages never get "Written by").
add_filter( 'wpseo_enhanced_slack_data', '__return_empty_array' );

/**
 * Empty category archives are noindex (D-047): the default category cannot be deleted, so "Uncategorized" (English) and
 * its Polylang translation (Arabic) answer 200 with "Nothing found". Only the main query of a category archive Yoast is
 * presenting as a category term, with no posts at all (Polylang limits it to the page's language); a category with posts
 * stays indexable without any change. Only `index` is changed, every other directive is kept (as Yoast's own noindex).
 */
add_filter(
	'wpseo_robots_array',
	function ( $robots, $presentation = null ) {
		$query = $GLOBALS['wp_the_query'] ?? null;
		$model = $presentation->model ?? null;
		if (
			! is_array( $robots )
			|| ! $query instanceof WP_Query
			|| ! $query->is_category()
			|| $query->is_404()
			|| ! $query->get_queried_object() instanceof WP_Term
			|| 'term' !== ( $model->object_type ?? '' )
			|| 'category' !== ( $model->object_sub_type ?? '' )
			|| (int) $query->get_queried_object_id() !== (int) ( $model->object_id ?? 0 )
			|| 0 !== (int) $query->found_posts
			|| 0 !== (int) $query->post_count
		) {
			return $robots;
		}
		$robots['index'] = 'noindex';
		return $robots;
	},
	10,
	2
);

/**
 * Business details of the schema Organization (D-048, WP Phase 9 C3), from the prototype's JSON-LD (index.html,
 * contact.html; the same block in ar/). Yoast SEO free prints the Organization node (name = site title, translated by
 * Polylang; logo = the theme logo; url) but cannot set its schema type or a postal address, so these values are kept
 * here. Edit them here; scripts/wp/16-schema.php validates them. A language with an empty description gets none (the
 * prototype has no Arabic description; to be supplied by the client).
 */
function tp_schema_business() {
	return array(
		'type'         => 'GeneralContractor',
		'description'  => array(
			'en' => 'Dubai-based general contractor established in 2015: construction, design and build, fit-out, renovation, maintenance and turnkey projects.',
			'ar' => '',
		),
		'telephone'    => '+97143290500',
		'email'        => 'info@taameer.ae',
		'foundingDate' => '2015',
		'address'      => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => 'Sky Business Building, Office M30, Festival City',
			'addressLocality' => 'Dubai',
			'addressCountry'  => 'AE',
		),
		'sameAs'       => array( 'https://instagram.com/taameer_contracting' ),
	);
}

/**
 * Adds the business details to Yoast's existing Organization node (same @id, so WebSite.publisher and WebPage.about keep
 * pointing at it; no second node). The type becomes [Organization, GeneralContractor]. A property Yoast already prints
 * (e.g. from Yoast SEO → Settings → Site representation) is kept, never duplicated; sameAs is merged without duplicates.
 * Note: Yoast's organization description is one value, so if it is filled it is printed on Arabic pages too (unless
 * Polylang translates it); requests without a Polylang language (e.g. Yoast's REST head endpoint) use the English values.
 */
add_filter(
	'wpseo_schema_organization',
	function ( $data ) {
		if ( ! is_array( $data ) ) {
			return $data;
		}
		$business      = tp_schema_business();
		$data['@type'] = array_values( array_unique( array_merge( (array) ( $data['@type'] ?? 'Organization' ), array( $business['type'] ) ) ) );
		$description   = $business['description'][ tp_lang() ] ?? '';
		if ( '' !== $description && empty( $data['description'] ) ) {
			$data['description'] = $description;
		}
		foreach ( array( 'telephone', 'email', 'foundingDate', 'address' ) as $key ) {
			if ( empty( $data[ $key ] ) ) {
				$data[ $key ] = $business[ $key ];
			}
		}
		$data['sameAs'] = array_values( array_unique( array_merge( (array) ( $data['sameAs'] ?? array() ), $business['sameAs'] ) ) );
		return $data;
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

/* --------------------------------------------------------------------------------------------------------------------
 * Arabic / Polylang Free (WP Phase 8, D-045)
 * ------------------------------------------------------------------------------------------------------------------ */

/**
 * Same slugs in both languages: /about/ ↔ /ar/about/, /projects/<slug>/ ↔ /ar/projects/<slug>/ (as the prototype's final
 * URLs). Polylang Free has no shared slugs, so WordPress would rename an Arabic page "about-2" on every save. A slug is
 * kept when the pages already using it (same type and parent) are all in another language.
 */
add_filter(
	'wp_unique_post_slug',
	function ( $slug, $post_id, $status, $type, $parent, $original ) {
		global $wpdb;
		if ( $slug === $original || ! $post_id || ! function_exists( 'pll_get_post_language' ) || ! is_post_type_hierarchical( $type ) ) {
			return $slug;
		}
		$lang = pll_get_post_language( $post_id );
		if ( ! $lang ) {
			return $slug;
		}
		$others = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM $wpdb->posts WHERE post_name = %s AND post_type = %s AND post_parent = %d AND ID != %d", $original, $type, $parent, $post_id ) );
		foreach ( $others as $other ) {
			if ( pll_get_post_language( (int) $other ) === $lang ) {
				return $slug;
			}
		}
		return $original;
	},
	10,
	6
);

/**
 * …and the page of the requested language is the one served: WordPress looks a page path up without a language, so
 * /about/ could return the Arabic "about". The path is resolved among the pages of the URL's language (Polylang puts
 * lang=ar in the query for /ar/…; no prefix = the default language).
 */
add_filter(
	'request',
	function ( $vars ) {
		if ( empty( $vars['pagename'] ) || ! function_exists( 'pll_default_language' ) || is_admin() ) {
			return $vars;
		}
		$lang  = ! empty( $vars['lang'] ) ? $vars['lang'] : pll_default_language();
		$path  = trim( $vars['pagename'], '/' );
		$parts = explode( '/', $path );
		// Polylang does not filter single-post (name) queries by language: the language is checked here.
		$found = get_posts(
			array(
				'post_type'   => 'page',
				'name'        => sanitize_title( end( $parts ) ),
				'lang'        => '',
				'post_status' => array( 'publish', 'private', 'draft', 'pending', 'future' ),
				'numberposts' => 10,
			)
		);
		foreach ( $found as $page ) {
			if ( pll_get_post_language( $page->ID ) === $lang && get_page_uri( $page ) === $path ) {
				unset( $vars['pagename'] );
				$vars['page_id'] = $page->ID;
				break;
			}
		}
		return $vars;
	},
	20
);

/**
 * [tp_lang] — the header / mobile menu / footer language switcher (Astra HTML elements). Same markup as the prototype:
 * current language, separator, link to the same page in the other language. On a not-found URL it links to the same
 * path in the other language, which is that language's 404.
 */
add_shortcode(
	'tp_lang',
	function () {
		$ar    = 'ar' === tp_lang();
		$other = $ar ? 'en' : 'ar';
		$url   = '';
		if ( is_404() ) {
			$path = (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH ); // phpcs:ignore
			$path = preg_replace( '#^/ar(/|$)#', '/', $path );
			$url  = home_url( $ar ? $path : '/ar' . $path );
		} elseif ( function_exists( 'pll_the_languages' ) ) {
			$langs = pll_the_languages( array( 'raw' => 1, 'hide_if_empty' => 0, 'hide_if_no_translation' => 0 ) );
			$url   = isset( $langs[ $other ]['url'] ) ? $langs[ $other ]['url'] : '';
		}
		if ( ! $url ) {
			$url = function_exists( 'pll_home_url' ) ? pll_home_url( $other ) : home_url( '/' );
		}
		$current = $ar
			? '<span class="tp-lang__current" aria-current="true" lang="ar"><abbr title="العربية">عربي</abbr></span>'
			: '<span class="tp-lang__current" aria-current="true"><abbr title="English">EN</abbr></span>';
		$link    = $ar
			? '<a class="tp-lang__link" href="' . esc_url( $url ) . '" lang="en" hreflang="en">English</a>'
			: '<a class="tp-lang__link" href="' . esc_url( $url ) . '" lang="ar" hreflang="ar">عربي</a>';
		return '<p class="tp-lang">' . $current . '<span class="tp-lang__sep" aria-hidden="true">|</span>' . $link . '</p>';
	}
);

/** Astra's mobile menu label ("Menu") is not an Astra translatable option: translated through Polylang. */
add_filter(
	'astra_get_option_mobile-header-menu-label',
	fn( $label ) => function_exists( 'pll__' ) ? pll__( $label ) : $label
);

/** WPForms validation messages are global settings: on Arabic pages they come from Polylang string translations. */
add_filter(
	'wpforms_frontend_strings',
	function ( $strings ) {
		if ( 'ar' !== tp_lang() || ! function_exists( 'pll__' ) ) {
			return $strings;
		}
		foreach ( array( 'val_required', 'val_email', 'val_email_suggestion' ) as $key ) {
			if ( ! empty( $strings[ $key ] ) && is_string( $strings[ $key ] ) ) {
				$strings[ $key ] = pll__( $strings[ $key ] );
			}
		}
		return $strings;
	}
);

/** WPForms has no Arabic language pack: its no-JavaScript notice is translated through Polylang too. */
add_filter(
	'gettext_wpforms-lite',
	function ( $translation, $text ) {
		return 'Please enable JavaScript in your browser to complete this form.' === $text && 'ar' === tp_lang() && function_exists( 'pll__' ) ? pll__( $text ) : $translation;
	},
	10,
	2
);
