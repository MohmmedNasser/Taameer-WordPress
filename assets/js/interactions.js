/* ==========================================================================
   interactions.js — class-driven interactive behaviour (approved exception E2, docs/PRD.md 8.2.1)
   One IIFE, six separate sections. A behaviour starts only when its class is present on the page:
     tp-lightbox     container = one gallery; every <a href="image"> inside it opens in the dialog
     tp-before-after container with two <img>: .tp-before-after__after + .tp-before-after__before
     tp-scrollspy    container of <a href="#id"> links; marks the section in view with aria-current="true"
     tp-filter       container with .tp-filter__btn[data-tp-filter] buttons and [data-tp-type] items
   plus the header menu (hooks [data-tp-header] / [data-tp-menu-toggle] / [data-tp-menu], theme header.php).
   Everything enhances markup that atomic elements (a Container with a class holding images/links) can produce;
   the UI that scripts generate (dialog, slider handle and labels, live region) is styled by theme.css.
   Dialog/slider classes are prefixed tp-lbox / tp-ba so they never clash with the author-facing triggers.
   Language: <html lang> picks the label set (en, ar; in WordPress these become Polylang string translations).
   WP: wp_enqueue_script('tp-interactions', …/interactions.js, [], ver, ['strategy' => 'defer']) with theme.css.
   ========================================================================== */
(function () {
  'use strict';

  var TP = (window.TP = window.TP || {});
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var STRINGS = {
    en: {
      menu: 'Menu', closeMenu: 'Close',
      close: 'Close', prev: 'Previous image', next: 'Next image', of: ' / ',
      before: 'Before', after: 'After', divider: 'Before and after comparison divider', shown: '% before image shown',
      showing: 'Showing {n} projects', showingOne: 'Showing 1 project'
    },
    ar: {
      menu: 'القائمة', closeMenu: 'إغلاق',
      close: 'إغلاق', prev: 'الصورة السابقة', next: 'الصورة التالية', of: ' / ',
      before: 'قبل', after: 'بعد', divider: 'فاصل المقارنة بين قبل وبعد', shown: '% من صورة «قبل» ظاهرة',
      showing: 'عرض {n} مشاريع', showingOne: 'عرض مشروع واحد', showingTwo: 'عرض مشروعين', showingMany: 'عرض {n} مشروعاً'
    }
  };
  // Number-noun agreement for "Showing n projects" (Arabic: 1, 2, 3–10 plural, 11+ singular accusative).
  function showingText(n) {
    var key = n === 1 ? 'showingOne' : n === 2 && lang === 'ar' ? 'showingTwo' : n > 10 && lang === 'ar' ? 'showingMany' : 'showing';
    return s(key).replace('{n}', n);
  }
  function s(key) {
    return (STRINGS[lang] || STRINGS.en)[key] || STRINGS.en[key];
  }
  function isRtl(el) {
    return getComputedStyle(el || document.documentElement).direction === 'rtl';
  }
  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ======================================================================
     1. Header menu (theme header.php) — sticky solid header needs no scroll state
     ====================================================================== */
  (function menu() {
    var header = document.querySelector('[data-tp-header]');
    if (!header) return;
    var toggle = header.querySelector('[data-tp-menu-toggle]');
    var panel = header.querySelector('[data-tp-menu]');
    var label = toggle && toggle.querySelector('.tp-menu-toggle__label');
    if (!toggle || !panel) return;
    var desktop = window.matchMedia('(min-width: 64em)');
    var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

    function open() {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      if (label) label.textContent = s('closeMenu');
      header.classList.add('tp-header--menu-open');
      document.body.classList.add('tp-is-locked');
      // Next frame so the opacity transition runs after `hidden` is removed.
      requestAnimationFrame(function () {
        panel.classList.add('is-open');
        var first = panel.querySelector(FOCUSABLE);
        if (first) first.focus();
      });
      document.addEventListener('keydown', onKeydown);
    }

    function close(returnFocus) {
      panel.classList.remove('is-open');
      header.classList.remove('tp-header--menu-open');
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (label) label.textContent = s('menu');
      document.body.classList.remove('tp-is-locked');
      document.removeEventListener('keydown', onKeydown);
      if (returnFocus) toggle.focus();
    }

    // Focus cycles through the toggle + menu items only (the rest of the header is hidden on mobile).
    function onKeydown(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;
      var items = [toggle].concat(Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE)));
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    toggle.addEventListener('click', function () { if (isOpen()) close(true); else open(); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
    desktop.addEventListener('change', function (e) { if (e.matches && isOpen()) close(false); });
  })();

  /* ======================================================================
     2. Lightbox — .tp-lightbox
     Every <a href="x.webp"> inside a .tp-lightbox container belongs to that container's gallery, in DOM order;
     one entry per distinct image. Standard markup only (PRD v1.6 R6): the full-size image is the link's href, the
     caption is the thumbnail's alt (falls back to the link's aria-label). PDF links are not lightbox entries: they
     open normally.
     Dialog: role="dialog" aria-modal, labelled by the caption; Esc closes; ← → navigate (mirrored in RTL); Tab is
     trapped; focus returns to the trigger; swipe on touch; counter "3 / 8"; next/previous preloaded only; scroll lock.
     Public: TP.lightbox.open(link) / close().
     ====================================================================== */
  (function lightbox() {
    var IMAGE = /\.(webp|jpe?g|png|avif|gif)(\?|#|$)/i;
    var FOCUSABLE = 'a[href], button:not([disabled])';
    var SWIPE_MIN = 48;
    var root, imgEl, capEl, countEl, prevBtn, nextBtn, closeBtn;
    var items = [];
    var index = 0;
    var opener = null;
    var savedScroll = 0;
    var touchX = null;

    function build() {
      if (root) return;
      root = document.createElement('div');
      root.className = 'tp-lbox';
      root.hidden = true;
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-labelledby', 'tp-lbox-caption');
      root.innerHTML =
        '<div class="tp-lbox__backdrop" data-tp-lb-close></div>' +
        '<figure class="tp-lbox__fig">' +
          '<img class="tp-lbox__img" alt="">' +
          '<figcaption class="tp-lbox__bar">' +
            '<span class="tp-lbox__caption" id="tp-lbox-caption"></span>' +
            '<span class="tp-lbox__meta">' +
              '<span class="tp-lbox__count" aria-live="polite"></span>' +
            '</span>' +
          '</figcaption>' +
        '</figure>' +
        '<button class="tp-lbox__btn tp-lbox__close" type="button" aria-label="' + s('close') + '">' +
          '<svg aria-hidden="true" width="20" height="20"><use href="#tp-i-plus"/></svg></button>' +
        '<button class="tp-lbox__btn tp-lbox__prev" type="button" aria-label="' + s('prev') + '">' +
          '<svg aria-hidden="true" width="24" height="24"><use href="#tp-i-arrow"/></svg></button>' +
        '<button class="tp-lbox__btn tp-lbox__next" type="button" aria-label="' + s('next') + '">' +
          '<svg aria-hidden="true" width="24" height="24"><use href="#tp-i-arrow"/></svg></button>';
      document.body.appendChild(root);

      imgEl = root.querySelector('.tp-lbox__img');
      capEl = root.querySelector('.tp-lbox__caption');
      countEl = root.querySelector('.tp-lbox__count');
      closeBtn = root.querySelector('.tp-lbox__close');
      prevBtn = root.querySelector('.tp-lbox__prev');
      nextBtn = root.querySelector('.tp-lbox__next');

      root.addEventListener('click', function (e) {
        if (e.target.closest('[data-tp-lb-close]') || e.target.closest('.tp-lbox__close')) close();
        else if (e.target.closest('.tp-lbox__prev')) go(-1);
        else if (e.target.closest('.tp-lbox__next')) go(1);
      });
      root.addEventListener('touchstart', function (e) {
        touchX = e.touches.length === 1 ? e.touches[0].clientX : null;
      }, { passive: true });
      root.addEventListener('touchend', function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) < SWIPE_MIN) return;
        // Swiping toward the inline-start edge reveals the next image (left in LTR, right in RTL).
        go((dx < 0) !== isRtl() ? 1 : -1);
      }, { passive: true });
      imgEl.addEventListener('load', function () { root.classList.remove('is-loading'); });
      imgEl.addEventListener('error', function () { root.classList.remove('is-loading'); });
    }

    function describe(a) {
      var thumb = a.querySelector('img');
      var alt = (thumb && thumb.getAttribute('alt')) || '';
      return { src: a.getAttribute('href') || '', caption: alt || a.getAttribute('aria-label') || '', alt: alt };
    }

    function preload(i) {
      if (i < 0 || i >= items.length || items[i].loaded || !items[i].src) return;
      items[i].loaded = true;
      new Image().src = items[i].src;
    }

    function show(i) {
      index = (i + items.length) % items.length;
      var it = items[index];
      root.classList.add('is-loading');
      imgEl.src = it.src;
      imgEl.alt = it.alt;
      it.loaded = true;
      capEl.textContent = it.caption;
      countEl.textContent = items.length > 1 ? index + 1 + s('of') + items.length : '';
      var many = items.length > 1;
      prevBtn.hidden = !many;
      nextBtn.hidden = !many;
      if (many) { preload(index + 1); preload(index - 1); }
    }

    function go(step) {
      if (items.length > 1) show(index + step);
    }

    function isTrigger(a) {
      var href = a.getAttribute('href') || '';
      return IMAGE.test(href);
    }

    // Returns false when the link is not a lightbox entry, so the browser follows it normally.
    function open(trigger) {
      var group = trigger.closest('.tp-lightbox');
      if (!group || !isTrigger(trigger)) return false;
      var seen = {};
      var triggers = [];
      var start = -1;
      // One entry per distinct image: a thumbnail and a "View" button for the same license count once.
      Array.prototype.forEach.call(group.querySelectorAll('a[href]'), function (a) {
        if (!isTrigger(a)) return;
        var src = describe(a).src;
        if (seen[src] === undefined) { seen[src] = triggers.length; triggers.push(a); }
        if (a === trigger) start = seen[src];
      });
      if (start < 0) return false;
      items = triggers.map(describe);

      build();
      opener = trigger;
      savedScroll = window.scrollY;
      root.hidden = false;
      root.setAttribute('dir', document.documentElement.dir || 'ltr');
      document.body.classList.add('tp-is-locked');
      show(start);
      requestAnimationFrame(function () {
        root.classList.add('is-open');
        closeBtn.focus();
      });
      document.addEventListener('keydown', onKeydown);
      return true;
    }

    function close() {
      if (!root || root.hidden) return;
      document.removeEventListener('keydown', onKeydown);
      root.classList.remove('is-open', 'is-loading');
      root.hidden = true;
      imgEl.removeAttribute('src');
      document.body.classList.remove('tp-is-locked');
      // The lock uses overflow:hidden, which keeps the position; restore only if a browser dropped it.
      if (Math.abs(window.scrollY - savedScroll) > 1) window.scrollTo({ top: savedScroll, behavior: 'instant' });
      if (opener) opener.focus({ preventScroll: true });
      opener = null;
    }

    function onKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        go((e.key === 'ArrowRight') !== isRtl() ? 1 : -1);
      } else if (e.key === 'Home' && items.length > 1) {
        e.preventDefault();
        show(0);
      } else if (e.key === 'End' && items.length > 1) {
        e.preventDefault();
        show(items.length - 1);
      } else if (e.key === 'Tab') {
        var nodes = Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), function (n) { return !n.hidden && n.offsetParent !== null; });
        if (!nodes.length) return;
        var first = nodes[0];
        var last = nodes[nodes.length - 1];
        if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    // Delegated: triggers added later (JSON-rendered galleries) work without re-initialising.
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var trigger = e.target.closest && e.target.closest('.tp-lightbox a[href]');
      if (!trigger) return;
      if (open(trigger)) e.preventDefault();
    });

    TP.lightbox = { open: open, close: close };
  })();

  /* ======================================================================
     3. Before / after — .tp-before-after
     Plain markup: <div class="tp-before-after"><img class="tp-before-after__after"><img class="tp-before-after__before"></div>
     (without JS the two images simply stack). The script adds the clip layer, the "Before"/"After" labels and the
     keyboard-operable role="slider" handle. Opens at 50%.
     The position lives in one CSS custom property (--tp-ba-pos, % from the inline-start edge); RTL needs a JS
     branch only to convert pointer X and arrow keys into inline-start distance.
     Input: pointer (vertical page scroll still works via touch-action: pan-y); handle keys ←/→ (visual direction),
     ↑/↓, PageUp/PageDown, Home/End.
     ====================================================================== */
  (function beforeAfter() {
    var STEP = 2;
    var BIG_STEP = 10;

    function enhance(root) {
      if (root.classList.contains('tp-ba')) return;
      var after = root.querySelector('.tp-before-after__after');
      var before = root.querySelector('.tp-before-after__before');
      if (!after || !before) return;

      root.classList.add('tp-ba');
      after.classList.add('tp-ba__img');
      before.classList.add('tp-ba__img');
      var clip = document.createElement('div');
      clip.className = 'tp-ba__before';
      before.parentNode.insertBefore(clip, before);
      clip.appendChild(before);

      root.insertAdjacentHTML('beforeend',
        '<span class="tp-ba__label tp-ba__label--before" aria-hidden="true">' + s('before') + '</span>' +
        '<span class="tp-ba__label tp-ba__label--after" aria-hidden="true">' + s('after') + '</span>' +
        '<div class="tp-ba__handle" role="slider" tabindex="0" aria-label="' + s('divider') + '" ' +
          'aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' +
          '<svg aria-hidden="true" width="16" height="16"><use href="#tp-i-plus"/></svg></div>');

      var handle = root.querySelector('.tp-ba__handle');
      var pos = 50;
      var dragging = false;

      function set(value) {
        pos = Math.max(0, Math.min(100, value));
        root.style.setProperty('--tp-ba-pos', pos + '%');
        var rounded = Math.round(pos);
        handle.setAttribute('aria-valuenow', rounded);
        handle.setAttribute('aria-valuetext', rounded + s('shown'));
      }

      // Pointer X → percentage from the inline-start edge (the right edge in RTL).
      function fromPointer(clientX) {
        var rect = root.getBoundingClientRect();
        var fromStart = isRtl(root) ? rect.right - clientX : clientX - rect.left;
        set((fromStart / rect.width) * 100);
      }

      root.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        dragging = true;
        root.setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
        handle.focus({ preventScroll: true });
      });
      root.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e.clientX); });
      function stop(e) {
        dragging = false;
        if (root.hasPointerCapture && root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
      }
      root.addEventListener('pointerup', stop);
      root.addEventListener('pointercancel', stop);

      handle.addEventListener('keydown', function (e) {
        // ArrowRight moves the divider visually right: toward the end edge in LTR, the start edge in RTL.
        var rightward = isRtl(root) ? -1 : 1;
        var delta = {
          ArrowRight: STEP * rightward, ArrowLeft: -STEP * rightward,
          ArrowUp: STEP, ArrowDown: -STEP, PageUp: BIG_STEP, PageDown: -BIG_STEP
        }[e.key];
        if (e.key === 'Home') set(0);
        else if (e.key === 'End') set(100);
        else if (delta !== undefined) set(pos + delta);
        else return;
        e.preventDefault();
      });

      set(pos);
    }

    ready(function () { document.querySelectorAll('.tp-before-after').forEach(enhance); });
    TP.beforeAfter = { enhance: enhance };
  })();

  /* ======================================================================
     4. Scrollspy — .tp-scrollspy (services chip navigation)
     Container holds <a href="#id"> links; each target is any element with that id. An IntersectionObserver marks the
     section crossing a band just below the sticky bars as current (aria-current="true") and keeps that link visible
     inside a horizontally scrolling list. A click marks the link immediately; the browser performs the scroll
     (smooth via base.css, instant under reduced motion). Without JS the links are plain in-page anchors.
     ====================================================================== */
  (function scrollspy() {
    var nav = document.querySelector('.tp-scrollspy');
    if (!nav || !('IntersectionObserver' in window)) return;

    var list = nav.querySelector('ul') || nav;
    var chips = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var sections = chips
      .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
      .filter(Boolean);
    if (!sections.length) return;

    var byId = {};
    chips.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var visible = {};
    var observer = null;
    var currentId = null;

    function revealChip(chip) {
      var box = list.getBoundingClientRect();
      var rect = chip.getBoundingClientRect();
      var overflowStart = rect.left < box.left;
      var overflowEnd = rect.right > box.right;
      if (!overflowStart && !overflowEnd) return;
      var delta = overflowStart ? rect.left - box.left : rect.right - box.right;
      list.scrollBy({ left: delta, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }

    function setCurrent(id) {
      if (id === currentId) return;
      currentId = id;
      chips.forEach(function (a) {
        if (a === byId[id]) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      if (byId[id]) revealChip(byId[id]);
    }

    // Sections overlapping the band: the one furthest down has crossed the reading line, so it is current.
    function pickCurrent() {
      for (var i = sections.length - 1; i >= 0; i--) {
        if (visible[sections[i].id]) { setCurrent(sections[i].id); return; }
      }
    }

    // Band (reading line): from just under the sticky bars to ~45% down the viewport.
    function observe() {
      if (observer) observer.disconnect();
      visible = {};
      var top = (parseFloat(getComputedStyle(nav).top) || 0) + nav.offsetHeight;
      var bottom = Math.round(window.innerHeight * 0.55);
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
        pickCurrent();
      }, { rootMargin: '-' + Math.round(top) + 'px 0px -' + bottom + 'px 0px', threshold: 0 });
      sections.forEach(function (sec) { observer.observe(sec); });
    }

    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a) setCurrent(a.getAttribute('href').slice(1));
    });
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(observe, 150);
    });
    observe();
  })();

  /* ======================================================================
     5. Project filter — .tp-filter
     Markup (archive-project.php): .tp-filter wraps
       .tp-filter__btn[data-tp-filter="all|<type-slug>"] buttons (aria-pressed), each with a .tp-filter__count,
       .tp-filter__items containing [data-tp-type="<type-slug>"] items,
       .tp-filter__status (visually hidden, aria-live="polite") announcing "Showing 8 projects",
       .tp-filter__empty (optional message, hidden).
     State lives in the URL (?type=fit-out), read on load and written with history.replaceState, mirroring the
     future taxonomy archive URLs. Filtering animates with FLIP (WAAPI transforms + fade for entering items) and is
     instant under reduced motion; the grid keeps its height during the move so the page never jumps.
     Items rendered later by projects.js fire "tp:rendered" on the container and the filter re-applies.
     ====================================================================== */
  (function filter() {
    var DURATION = 380;
    var EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

    function init(root) {
      var buttons = Array.prototype.slice.call(root.querySelectorAll('.tp-filter__btn'));
      var holder = root.querySelector('.tp-filter__items');
      var status = root.querySelector('.tp-filter__status');
      var empty = root.querySelector('.tp-filter__empty');
      if (!buttons.length || !holder) return;
      var current = null;
      var running = [];

      function itemsAll() { return Array.prototype.slice.call(holder.querySelectorAll('[data-tp-type]')); }

      function valid(value) {
        return value === 'all' || buttons.some(function (b) { return b.getAttribute('data-tp-filter') === value; });
      }

      function fromUrl() {
        var v = new URLSearchParams(window.location.search).get('type');
        return v && valid(v) ? v : 'all';
      }

      function writeUrl(value) {
        var params = new URLSearchParams(window.location.search);
        if (value === 'all') params.delete('type'); else params.set('type', value);
        var qs = params.toString();
        history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
      }

      function updateCounts() {
        var all = itemsAll();
        buttons.forEach(function (b) {
          var key = b.getAttribute('data-tp-filter');
          var n = key === 'all' ? all.length : all.filter(function (i) { return i.getAttribute('data-tp-type') === key; }).length;
          var badge = b.querySelector('.tp-filter__count');
          if (badge && all.length) badge.textContent = n;
        });
      }

      function announce(n) {
        if (status) status.textContent = showingText(n);
        if (empty) empty.hidden = n !== 0;
      }

      function apply(value, animate) {
        var all = itemsAll();
        var shouldShow = function (i) { return value === 'all' || i.getAttribute('data-tp-type') === value; };
        var motion = animate && !reducedMotion() && all.length && typeof Element.prototype.animate === 'function';

        running.forEach(function (a) { a.cancel(); });
        running = [];

        var first = new Map();
        if (motion) all.forEach(function (i) { if (!i.hidden) first.set(i, i.getBoundingClientRect()); });
        var startHeight = holder.offsetHeight;
        if (motion) holder.style.minBlockSize = startHeight + 'px';

        var shown = 0;
        all.forEach(function (i) {
          var show = shouldShow(i);
          i.hidden = !show;
          if (show) shown++;
        });

        if (motion) {
          all.forEach(function (i) {
            if (i.hidden) return;
            var before = first.get(i);
            var after = i.getBoundingClientRect();
            var anim;
            if (before) {
              var dx = before.left - after.left;
              var dy = before.top - after.top;
              if (!dx && !dy) return;
              anim = i.animate(
                [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],
                { duration: DURATION, easing: EASE }
              );
            } else {
              anim = i.animate(
                [{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }],
                { duration: DURATION, easing: EASE }
              );
            }
            running.push(anim);
          });
          var done = function () { holder.style.minBlockSize = ''; };
          if (running.length) {
            Promise.all(running.map(function (a) { return a.finished; })).then(done, done);
          } else {
            done();
          }
        }

        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed', b.getAttribute('data-tp-filter') === value ? 'true' : 'false');
        });
        root.setAttribute('data-tp-active', value);
        announce(shown);
      }

      function select(value, animate, updateUrl) {
        if (!valid(value)) value = 'all';
        current = value;
        apply(value, animate);
        if (updateUrl) writeUrl(value);
      }

      buttons.forEach(function (b) {
        b.addEventListener('click', function () {
          var value = b.getAttribute('data-tp-filter');
          if (value !== current) select(value, true, true);
        });
      });

      root.addEventListener('tp:rendered', function () {
        updateCounts();
        select(current || fromUrl(), false, false);
      });
      window.addEventListener('popstate', function () { select(fromUrl(), true, false); });

      updateCounts();
      select(fromUrl(), false, false);
    }

    ready(function () { document.querySelectorAll('.tp-filter').forEach(init); });
  })();
})();
