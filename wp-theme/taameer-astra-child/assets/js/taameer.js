/* ==========================================================================
   taameer.js — the only script of the Astra child theme (owner decision D-038)
   Small, class-driven behaviours that Elementor Free and Astra cannot provide. Never targets IDs.
     tp-split          Heading revealed line by line (aria-label keeps the full text)
     tp-img-reveal     Image wipe on enter
     tp-parallax       Scroll parallax on the image inside the element
     tp-marquee        Partner strip: the track is cloned once (aria-hidden) for a seamless CSS loop
     tp-before-after   Comparison slider built from two Image widgets
                       (.tp-before-after__after, .tp-before-after__before), keyboard operable (role="slider")
     Counter widget    Under prefers-reduced-motion the native Counter shows its final number at once
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

  function init() {
    if (inEditor()) return;
    counters();
    marquees();
    document.querySelectorAll('.tp-before-after').forEach(beforeAfter);
    splits();
    entrances();
    parallax();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
