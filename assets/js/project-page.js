/* PROTOTYPE ONLY — in WordPress single-project.php prints all of this server-side from the Project CPT. */
/* ==========================================================================
   project-page.js — fills project.html from data/projects.json for ?id=<slug> (the single template, E3)
   - Unknown, missing or showcase id: "Project not found" state in the hero (message + links to Projects and Home),
     <meta name="robots" content="noindex">, document.title updated. No redirect.
   - Found: document.title, meta description, Open Graph title/description/image from the project data; hero title
     (the only H1), type, optional description; spec block rows from <template id="tp-spec-row">; cover (framed
     with setting-out marks below 1200px or portrait, plain above); 3D Visualization notice; masonry gallery from
     <template id="tp-gallery-item"> (one lightbox group); before/after only when `beforeImage` exists; related
     testimonial from data/testimonials.json (relatedProject === id); previous / next in the Projects-grid order,
     wrapping at the ends; up to 3 related projects of the same type through projects.js and
     <template id="tp-project-card">.
   Needs projects.js (loaded first) and interactions.js (lightbox + before/after enhance).
   ========================================================================== */
(function () {
  'use strict';

  var TP = window.TP;
  var S = TP.projects.s;
  var asset = TP.projects.asset;
  var BRAND = S('brand');
  var MONTHS = S('months');

  function $(sel, root) { return (root || document).querySelector(sel); }
  function field(name) { return $('[data-tp-field="' + name + '"]'); }
  function setField(name, value) { var el = field(name); if (el) el.textContent = value; }

  function setMeta(selector, attr, value) {
    var el = $(selector);
    if (el) el.setAttribute(attr, value);
  }

  function monthYear(iso) {
    var m = /^(\d{4})-(\d{2})/.exec(iso || '');
    return m ? MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[1] : '';
  }

  function notFound() {
    document.title = S('notFound') + ' — ' + BRAND;
    var robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);
    setField('crumb', S('notFound'));
    setField('type', '404');
    setField('title', S('notFound'));
    var lead = field('lead');
    lead.textContent = S('notFoundText');
    lead.hidden = false;
    $('.tp-notfound').hidden = false;
    $('[data-tp-project-body]').setAttribute('data-state', 'empty');
  }

  function description(p, typeLabel) {
    var own = TP.projects.t(p.description);
    if (own) return own;
    var when = p.status === 'ongoing' ? S('ongoingProject') : monthYear(p.completion) ? S('completed').replace('{d}', monthYear(p.completion)) : '';
    return S('description').replace('{title}', TP.projects.t(p.title)).replace('{type}', typeLabel.toLowerCase())
      .replace('{location}', TP.projects.t(p.location)).replace('{brand}', BRAND).replace('{when}', when ? '. ' + when : '');
  }

  function specRows(p, typeLabel) {
    var rows = [[S('specType'), typeLabel], [S('specLocation'), TP.projects.t(p.location)]];
    var period = TP.projects.t(p.period);
    if (period) rows.push([S('specDuration'), period]);
    if (p.status === 'ongoing') rows.push([S('specCompletion'), S('ongoing')]);
    else if (p.completion) rows.push([S('specCompletion'), monthYear(p.completion)]);
    var consultant = TP.projects.t(p.consultant);
    if (consultant) rows.push([S('specConsultant'), consultant]);
    return rows;
  }

  function renderSpec(p, typeLabel) {
    var tpl = document.getElementById('tp-spec-row');
    var dl = $('[data-tp-spec]');
    dl.classList.add('tp-spec--stack');
    specRows(p, typeLabel).forEach(function (r) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      row.querySelector('dt').textContent = r[0];
      row.querySelector('dd').textContent = r[1];
      dl.appendChild(row);
    });
  }

  function renderCover(p, data) {
    var meta = (data.imageMeta || {})[p.cover] || [];
    var w = meta[0] || 1200;
    var h = meta[1] || 800;
    var alt = TP.projects.t(p.title) + ', ' + TP.projects.t(p.location);
    var fig = $('[data-tp-cover]');
    var img = document.createElement('img');
    img.src = asset(p.cover);
    img.alt = alt;
    img.width = w;
    img.height = h;
    img.decoding = 'async';
    img.setAttribute('fetchpriority', 'high');
    if (meta[2]) img.srcset = asset(p.cover.replace(/\.webp$/, '-md.webp')) + ' 900w, ' + asset(p.cover) + ' ' + w + 'w';
    img.sizes = '(min-width: 64em) 62vw, 100vw';
    fig.style.setProperty('--tp-cover-ratio', (w / h).toFixed(4));
    if (w < 1200 || h > w) {
      // Framed: shown at its own size at most (never upscaled), with the setting-out marks.
      fig.style.setProperty('--tp-cover-w', w + 'px');
      img.className = 'tp-frame__img';
      fig.innerHTML = '<div class="tp-frame"><div class="tp-frame__clip"></div></div>';
      fig.querySelector('.tp-frame__clip').appendChild(img);
    } else {
      img.className = 'tp-project-cover__plain';
      fig.appendChild(img);
    }
  }

  function renderGallery(p, data) {
    var tpl = document.getElementById('tp-gallery-item');
    var box = $('[data-tp-gallery]');
    var meta = data.imageMeta || {};
    var title = TP.projects.t(p.title);
    var caption = title + ', ' + TP.projects.t(p.location);
    (p.gallery && p.gallery.length ? p.gallery : [p.cover]).forEach(function (src, i, all) {
      var a = tpl.content.firstElementChild.cloneNode(true);
      var img = a.querySelector('img');
      var m = meta[src] || [];
      a.href = asset(src);
      img.src = asset(src);
      img.alt = caption + S('imageOf').replace('{i}', i + 1).replace('{n}', all.length);
      if (m[0]) { img.width = m[0]; img.height = m[1]; }
      if (m[2]) img.srcset = asset(src.replace(/\.webp$/, '-md.webp')) + ' 900w, ' + asset(src) + ' ' + m[0] + 'w';
      img.sizes = '(min-width: 64em) 30vw, (min-width: 40em) 45vw, 100vw';
      box.appendChild(a);
    });
  }

  function renderCompare(p, data) {
    if (!p.beforeImage) return;
    var meta = data.imageMeta || {};
    var after = p.gallery && p.gallery[0] ? p.gallery[0] : p.cover;
    var title = TP.projects.t(p.title);
    function image(src, cls, alt) {
      var m = meta[src] || [];
      var img = document.createElement('img');
      img.className = cls;
      img.src = asset(src);
      img.alt = alt;
      if (m[0]) { img.width = m[0]; img.height = m[1]; }
      img.loading = 'lazy';
      img.decoding = 'async';
      return img;
    }
    var box = document.createElement('div');
    box.className = 'tp-before-after';
    box.appendChild(image(after, 'tp-before-after__after', S('after').replace('{t}', title)));
    box.appendChild(image(p.beforeImage, 'tp-before-after__before', S('before').replace('{t}', title)));
    $('[data-tp-compare-media]').appendChild(box);
    $('[data-tp-compare]').hidden = false;
    if (TP.beforeAfter) TP.beforeAfter.enhance(box);
  }

  function renderLetter(p) {
    return TP.projects.load('data/testimonials.json').then(function (d) {
      var t = (d.testimonials || []).filter(function (x) { return x.relatedProject === p.id && x.excerpt; })[0];
      if (!t) return;
      setField('letter-excerpt', TP.projects.t(t.excerpt));
      setField('letter-company', TP.projects.t(t.company));
      var by = [TP.projects.t(t.authorName), TP.projects.t(t.authorTitle)].filter(Boolean).join(', ');
      setField('letter-author', by);
      field('letter-link').setAttribute('href', 'testimonials.html#' + t.id);
      $('[data-tp-letter]').hidden = false;
    }).catch(function () { /* the testimonial is optional */ });
  }

  function renderNav(p, data) {
    var list = TP.projects.sorted(data);
    var i = list.map(function (x) { return x.id; }).indexOf(p.id);
    var prev = list[(i - 1 + list.length) % list.length];
    var next = list[(i + 1) % list.length];
    var a = $('.tp-project-nav__prev');
    var b = $('.tp-project-nav__next');
    a.setAttribute('href', 'project.html?id=' + encodeURIComponent(prev.id));
    b.setAttribute('href', 'project.html?id=' + encodeURIComponent(next.id));
    setField('prev-title', TP.projects.t(prev.title));
    setField('next-title', TP.projects.t(next.title));
  }

  function renderRelated(p, data) {
    var grid = $('[data-tp-related-grid]');
    TP.projects.render(grid, data, null, { type: p.type, exclude: p.id, count: 3 });
  }

  function show(p, data) {
    var typeLabel = TP.projects.t((data.types || {})[p.type]);
    var title = TP.projects.t(p.title);
    var desc = description(p, typeLabel);

    document.title = title + ' — ' + BRAND;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', title + ' — ' + BRAND);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:image"]', 'content', asset(p.cover));

    setField('crumb', title);
    setField('type', typeLabel);
    setField('title', title);
    var own = TP.projects.t(p.description);
    if (own) { setField('lead', own); field('lead').hidden = false; }

    renderSpec(p, typeLabel);
    renderCover(p, data);
    if (p.isRender) $('[data-tp-render-note]').hidden = false;
    renderGallery(p, data);
    renderCompare(p, data);
    renderNav(p, data);
    renderRelated(p, data);
    $('[data-tp-project-body]').setAttribute('data-state', 'ready');
    return renderLetter(p);
  }

  // The language switcher keeps ?id= (in WordPress Polylang links to the translated project instead).
  function keepQueryInSwitcher() {
    document.querySelectorAll('.tp-lang__link').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').split('?')[0] + window.location.search);
    });
  }

  function init() {
    keepQueryInSwitcher();
    var id = new URLSearchParams(window.location.search).get('id');
    TP.projects.load('data/projects.json').then(function (data) {
      var p = (data.projects || []).filter(function (x) { return x.id === id && x.type !== 'showcase'; })[0];
      if (!id || !p) { notFound(); return; }
      return show(p, data);
    }).catch(function (err) {
      if (window.console) console.warn('[tp-project] ' + err.message + ' — serve the site with `npx serve .`');
      notFound();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
