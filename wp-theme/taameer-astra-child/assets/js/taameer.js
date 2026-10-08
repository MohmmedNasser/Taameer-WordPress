/* ==========================================================================
   taameer.js — the only script of the Astra child theme (owner decision D-038)
   Small, class-driven behaviours that Elementor Free and Astra cannot provide. Never targets IDs.
     tp-split          Heading revealed line by line (aria-label keeps the full text)
     tp-img-reveal     Image wipe on enter
     tp-parallax       Scroll parallax on the image inside the element
     tp-marquee        Partner strip: the track is cloned once (aria-hidden) for a seamless CSS loop
     tp-before-after   Comparison slider built from two Image widgets
                       (.tp-before-after__after, .tp-before-after__before), keyboard operable (role="slider")
     tp-scrollspy      Services chip bar: marks the chip of the section in view (aria-current="true") and keeps it
                       visible in the scrolling row; exposes the header's real height (--tp-masthead-h) for the sticky offset
     tp-filter__bar    Projects page: the filter Buttons (.tp-filter-<type>) show/hide the static cards of
                       .tp-filter__items (.tp-type-<type>), FLIP move animation, aria-pressed, live status, ?type= in the URL
     Counter widget    Under prefers-reduced-motion the native Counter shows its final number at once
     tp-project-nav    Project detail page: names the previous / next <nav> landmark (Container tag nav has no label field)
     tp-letter-sheet   Testimonials page: groups the four letter links into one Elementor lightbox slideshow and names
                       each link "Open the original letter from …" (Container links have no attribute fields in Free)
   Entrance fades are Elementor's native entrance animations (retimed in taameer.css).
   Nothing runs inside the Elementor editor, so the editor always shows the plain, editable widgets.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function inEditor() {
    return document.body.classList.contains('elementor-editor-active') ||
      document.body.classList.contains('elementor-editor-preview') ||
      /[?&]elementor-preview=/.test(window.location.search);
  }

  /* ---- Counter: final value at once under reduced motion (runs before Elementor binds its handler) ---- */
  function counters() {
    if (!reduced) return;
    document.querySelectorAll('.elementor-counter-number[data-to-value]').forEach(function (el) {
      el.setAttribute('data-from-value', el.getAttribute('data-to-value'));
      el.textContent = el.getAttribute('data-to-value');
    });
  }

  /* ---- tp-split: wrap each rendered line of the heading text ---- */
  function accessibleText(el) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll('[aria-hidden="true"]').forEach(function (n) { n.remove(); });
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function split(el) {
    if (!el.tpSource) {
      el.tpSource = el.innerHTML;
      el.setAttribute('aria-label', accessibleText(el));
    }
    el.innerHTML = el.tpSource;

    var parts = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) { parts.push(node); return; }
      node.textContent.split(/(\s+)/).forEach(function (piece) {
        if (!piece) return;
        if (/^\s+$/.test(piece)) { parts.push(document.createTextNode(' ')); return; }
        var w = document.createElement('span');
        w.className = 'tp-split__word';
        w.textContent = piece;
        parts.push(w);
      });
    });
    el.textContent = '';
    parts.forEach(function (p) { el.appendChild(p); });

    // Group words by rendered line; spaces and decorations (the superscript "+") stay on the current line.
    var lines = [];
    var lastTop = null;
    parts.forEach(function (node) {
      var isWord = node.nodeType === 1 && node.classList.contains('tp-split__word');
      if (!isWord) {
        if (lines.length) lines[lines.length - 1].push(node);
        else lines.push([node]);
        return;
      }
      var top = node.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        lines.push([]);
        lastTop = top;
      }
      lines[lines.length - 1].push(node);
    });

    el.textContent = '';
    lines.forEach(function (nodes, i) {
      var line = document.createElement('span');
      line.className = 'tp-split__line';
      line.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.className = 'tp-split__inner';
      inner.style.setProperty('--tp-i', i);
      nodes.forEach(function (n) { inner.appendChild(n); });
      line.appendChild(inner);
      el.appendChild(line);
    });
  }

  function splits() {
    var els = Array.prototype.map.call(document.querySelectorAll('.tp-split'), function (w) {
      return w.querySelector('.elementor-heading-title') || w;
    });
    if (!els.length || reduced) return;
    els.forEach(split);
    var lastWidth = window.innerWidth;
    var timer;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(function () { els.forEach(split); }, 200);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { els.forEach(split); });
  }

  /* ---- Entrance observer for tp-split and tp-img-reveal ---- */
  function entrances() {
    var targets = document.querySelectorAll('.tp-split, .tp-img-reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var proxies = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        (proxies.get(entry.target) || [entry.target]).forEach(function (el) { el.classList.add('is-visible'); });
        proxies.delete(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) {
      // A fully clipped element never reports as intersecting in Chrome: observe its parent instead.
      var watched = el.classList.contains('tp-img-reveal') && el.parentElement ? el.parentElement : el;
      var list = proxies.get(watched) || [];
      list.push(el);
      proxies.set(watched, list);
      io.observe(watched);
    });
  }

  /* ---- tp-parallax ---- */
  function parallax() {
    var items = document.querySelectorAll('.tp-parallax');
    if (!items.length || reduced || !('IntersectionObserver' in window)) return;
    var visible = new Set();
    var ticking = false;
    var SPEED = 0.1;

    function update() {
      ticking = false;
      var vh = window.innerHeight;
      visible.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--tp-py', ((rect.top + rect.height / 2 - vh / 2) * -SPEED).toFixed(1) + 'px');
      });
    }
    function request() {
      if (!ticking && visible.size) { ticking = true; requestAnimationFrame(update); }
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      });
      request();
    });
    items.forEach(function (el) { io.observe(el); });
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  }

  /* ---- tp-marquee: clone the track once ---- */
  function marquees() {
    if (reduced) return;
    document.querySelectorAll('.tp-marquee').forEach(function (marquee) {
      var tracks = marquee.querySelectorAll('.tp-marquee__track');
      if (tracks.length !== 1) return;
      var clone = tracks[0].cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('data-id');
      clone.querySelectorAll('img').forEach(function (img) { img.alt = ''; img.removeAttribute('fetchpriority'); });
      clone.querySelectorAll('a, [tabindex]').forEach(function (n) { n.setAttribute('tabindex', '-1'); });
      marquee.appendChild(clone);
      marquee.classList.add('is-ready');
    });
  }

  /* ---- tp-before-after ---- */
  function beforeAfter(root) {
    if (root.classList.contains('tp-ba')) return;
    var after = root.querySelector('.tp-before-after__after img');
    var before = root.querySelector('.tp-before-after__before img');
    if (!after || !before) return;

    root.classList.add('tp-ba');
    after.classList.add('tp-ba__img');
    before.classList.add('tp-ba__img');
    after.removeAttribute('loading');
    before.removeAttribute('loading');
    root.appendChild(after);
    var clip = document.createElement('div');
    clip.className = 'tp-ba__before';
    clip.appendChild(before);
    root.appendChild(clip);
    root.insertAdjacentHTML('beforeend',
      '<span class="tp-ba__label tp-ba__label--before" aria-hidden="true">Before</span>' +
      '<span class="tp-ba__label tp-ba__label--after" aria-hidden="true">After</span>' +
      '<div class="tp-ba__handle" role="slider" tabindex="0" aria-label="Before and after divider" ' +
      'aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></div>');

    var handle = root.querySelector('.tp-ba__handle');
    var pos = 50;
    var dragging = false;

    function set(value) {
      pos = Math.max(0, Math.min(100, value));
      root.style.setProperty('--tp-ba-pos', pos + '%');
      handle.setAttribute('aria-valuenow', Math.round(pos));
      handle.setAttribute('aria-valuetext', Math.round(pos) + '% of the before image shown');
    }
    function fromPointer(clientX) {
      var rect = root.getBoundingClientRect();
      set(((clientX - rect.left) / rect.width) * 100);
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
      var delta = { ArrowRight: 2, ArrowLeft: -2, ArrowUp: 2, ArrowDown: -2, PageUp: 10, PageDown: -10 }[e.key];
      if (e.key === 'Home') set(0);
      else if (e.key === 'End') set(100);
      else if (delta !== undefined) set(pos + delta);
      else return;
      e.preventDefault();
    });

    set(pos);
  }

  /* ---- tp-scrollspy: chip of the section crossing the reading line (just below the sticky bars) is current ---- */
  function scrollspy() {
    var nav = document.querySelector('.tp-scrollspy');
    if (!nav) return;
    var list = nav.querySelector('.tp-chips') || nav;
    var landmark = nav.querySelector('nav');
    if (landmark && !landmark.hasAttribute('aria-label')) landmark.setAttribute('aria-label', 'Services on this page');

    // The bar sticks right below the header: its real height (the logo row is taller than the --tp-header-h token on
    // small screens) is exposed as --tp-masthead-h for the sticky offset and the section scroll-margin (taameer.css).
    var header = document.querySelector('#masthead');
    function headerHeight() {
      if (header) document.documentElement.style.setProperty('--tp-masthead-h', header.offsetHeight + 'px');
    }
    headerHeight();
    if (header && 'ResizeObserver' in window) new ResizeObserver(headerHeight).observe(header);
    else window.addEventListener('resize', headerHeight);

    if (!('IntersectionObserver' in window)) return;
    var chips = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var byId = {};
    var sections = chips.map(function (a) {
      var id = a.getAttribute('href').slice(1);
      byId[id] = a;
      return document.getElementById(id);
    }).filter(Boolean);
    if (!sections.length) return;
    var visible = {};
    var currentId = null;
    var observer = null;

    function reveal(chip) {
      var box = list.getBoundingClientRect();
      var rect = chip.getBoundingClientRect();
      if (rect.left >= box.left && rect.right <= box.right) return;
      list.scrollBy({ left: rect.left < box.left ? rect.left - box.left : rect.right - box.right, behavior: reduced ? 'auto' : 'smooth' });
    }
    function setCurrent(id) {
      if (id === currentId) return;
      currentId = id;
      chips.forEach(function (a) {
        if (a === byId[id]) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      if (byId[id]) reveal(byId[id]);
    }
    // Sections overlapping the band: the one furthest down has crossed the reading line, so it is current.
    function pick() {
      for (var i = sections.length - 1; i >= 0; i--) {
        if (visible[sections[i].id]) { setCurrent(sections[i].id); return; }
      }
    }
    function observe() {
      if (observer) observer.disconnect();
      visible = {};
      var top = (parseFloat(getComputedStyle(nav).top) || 0) + nav.offsetHeight;
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
        pick();
      }, { rootMargin: '-' + Math.round(top) + 'px 0px -' + Math.round(window.innerHeight * 0.55) + 'px 0px', threshold: 0 });
      sections.forEach(function (sec) { observer.observe(sec); });
    }

    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a) setCurrent(a.getAttribute('href').slice(1)); // marks the chip at once; the browser scrolls (CSS smooth)
    });
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(observe, 150);
    });
    observe();
  }

  /* ---- Projects filter: .tp-filter__bar buttons (.tp-filter-all | .tp-filter-<type>) toggle .tp-type-<type> cards ---- */
  function projectFilter() {
    var bar = document.querySelector('.tp-filter__bar');
    var holder = document.querySelector('.tp-filter__items');
    if (!bar || !holder) return;
    var DURATION = 380;
    var EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    var buttons = [];
    bar.querySelectorAll('.tp-filter__btn').forEach(function (wrap) {
      var m = /(?:^|\s)tp-filter-([a-z-]+)(?:\s|$)/.exec(wrap.className);
      var a = wrap.querySelector('a.elementor-button');
      if (!m || !a) return;
      a.setAttribute('role', 'button');
      a.setAttribute('aria-pressed', 'false');
      var label = a.querySelector('.elementor-button-text');
      if (label) label.innerHTML = label.innerHTML.replace(/\s*(\d+)\s*$/, ' <span class="tp-filter__count">$1</span>');
      buttons.push({ key: m[1], link: a });
    });
    if (!buttons.length) return;
    var cards = Array.prototype.slice.call(holder.querySelectorAll(':scope > .tp-card'));
    var status = document.createElement('p');
    status.className = 'tp-visually-hidden';
    status.setAttribute('aria-live', 'polite');
    bar.insertAdjacentElement('afterend', status);
    var current = null;
    var running = [];

    function typeOf(card) {
      var m = /(?:^|\s)tp-type-([a-z-]+)(?:\s|$)/.exec(card.className);
      return m ? m[1] : '';
    }
    function valid(v) { return buttons.some(function (b) { return b.key === v; }); }
    function fromUrl() {
      var v = new URLSearchParams(window.location.search).get('type');
      return v && valid(v) ? v : 'all';
    }
    function writeUrl(v) {
      var params = new URLSearchParams(window.location.search);
      if (v === 'all') params.delete('type'); else params.set('type', v);
      var qs = params.toString();
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }
    function isShown(c) { return !c.classList.contains('tp-is-filtered'); }

    function apply(value, animate) {
      var motion = animate && !reduced && typeof Element.prototype.animate === 'function';
      running.forEach(function (a) { a.cancel(); });
      running = [];
      var first = new Map();
      if (motion) cards.forEach(function (c) { if (isShown(c)) first.set(c, c.getBoundingClientRect()); });
      if (motion) holder.style.minBlockSize = holder.offsetHeight + 'px';
      var shown = 0;
      cards.forEach(function (c) {
        var show = value === 'all' || typeOf(c) === value;
        c.classList.toggle('tp-is-filtered', !show);
        if (show) {
          shown++;
          // A card that never scrolled into view still waits for Elementor's entrance: show it now.
          c.classList.remove('elementor-invisible');
        }
      });
      if (motion) {
        cards.forEach(function (c) {
          if (!isShown(c)) return;
          var before = first.get(c);
          var after = c.getBoundingClientRect();
          var anim;
          if (before) {
            var dx = before.left - after.left;
            var dy = before.top - after.top;
            if (!dx && !dy) return;
            anim = c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: DURATION, easing: EASE });
          } else {
            anim = c.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], { duration: DURATION, easing: EASE });
          }
          running.push(anim);
        });
        var done = function () { holder.style.minBlockSize = ''; };
        if (running.length) Promise.all(running.map(function (a) { return a.finished; })).then(done, done);
        else done();
      }
      buttons.forEach(function (b) { b.link.setAttribute('aria-pressed', b.key === value ? 'true' : 'false'); });
      holder.setAttribute('data-tp-active', value);
      status.textContent = shown === 1 ? 'Showing 1 project' : 'Showing ' + shown + ' projects';
    }
    function select(v, animate, url) {
      if (!valid(v)) v = 'all';
      current = v;
      apply(v, animate);
      if (url) writeUrl(v);
    }

    buttons.forEach(function (b) {
      b.link.addEventListener('click', function (e) {
        e.preventDefault();
        if (b.key !== current) select(b.key, true, true);
      });
      // Role=button: Space activates as well (Enter already follows the link).
      b.link.addEventListener('keydown', function (e) {
        if (e.key === ' ') { e.preventDefault(); b.link.click(); }
      });
    });
    window.addEventListener('popstate', function () { select(fromUrl(), true, false); });
    select(fromUrl(), false, false);
  }

  /* ---- tp-project-nav: accessible name for the previous / next landmark ---- */
  function projectNav() {
    var nav = document.querySelector('nav.tp-project-nav');
    if (nav && !nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', 'More projects');
  }

  /* ---- Testimonials: the four letter sheets open as one lightbox slideshow; each link is named after its letter ---- */
  function letterSheets() {
    document.querySelectorAll('.tp-letter-entry').forEach(function (entry) {
      var link = entry.querySelector('a.tp-letter-sheet');
      if (!link) return;
      link.setAttribute('data-elementor-lightbox-slideshow', 'tp-letters');
      var company = entry.querySelector('h2');
      if (company && !link.hasAttribute('aria-label')) link.setAttribute('aria-label', 'Open the original letter from ' + company.textContent.trim());
    });
  }

  function init() {
    if (inEditor()) return;
    counters();
    marquees();
    document.querySelectorAll('.tp-before-after').forEach(beforeAfter);
    splits();
    entrances();
    parallax();
    scrollspy();
    projectFilter();
    projectNav();
    letterSheets();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
