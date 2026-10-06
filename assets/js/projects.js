/* PROTOTYPE ONLY — in WordPress these cards are static atomic cards (Home, Services), or Atomic Loop if the
   Phase 4 spike confirms it is free; the archive and 404 cards are rendered by PHP (archive-project.php, 404.php). */
/* ==========================================================================
   projects.js — renders project cards into [data-tp-projects] from data/projects.json
   The card markup is NOT in this file: it is cloned from <template id="tp-project-card"> in the page, so the
   PHP conversion copies the markup directly. Template hooks: [data-tp-field="title|location|type|when"] (text),
   img.tp-card__img (src/srcset/width/height/alt), a.tp-card (href), [data-tp-badge="ongoing|render"] (removed
   when not applicable), article[data-tp-type].
   Container attributes:
     data-tp-src="data/projects.json"  data-tp-featured="true|false"  data-tp-count="6"
     data-tp-type="construction|renovation-decoration|fit-out|landscaping" (optional)
     data-tp-exclude="<id>" (optional; used for related projects)
     data-tp-service="construction|design-build|…" (optional; Services page related projects): the project types
       come from services[].relatedTypes in data/site.json (data-tp-site, default "data/site.json"); a service with
       no types or no matching project hides the enclosing [data-tp-related] block instead of rendering it empty.
   Card link: project.html?id=<slug>. Order (also used by project.html prev/next): ongoing first, then completion
   date newest first; projects without a date last. The wall-cladding showcase never appears in listings.
   Stagger is a class on the container in the page markup (tp-stagger), not an option here.
   After rendering, a bubbling "tp:rendered" event fires on the container (the project filter listens for it).
   Public: TP.projects = { load, sorted, render, labels }.
   Language: <html lang> picks the "en"/"ar" string, falling back to "en".
   ========================================================================== */
(function () {
  'use strict';

  var TP = (window.TP = window.TP || {});
  var lang = (document.documentElement.lang || 'en').slice(0, 2);

  // Per-language strings (becomes Polylang string translation in WordPress). English is the fallback.
  var STRINGS = {
    en: {
      ongoing: 'Ongoing', ongoingProject: 'Ongoing project', completed: 'Completed {d}',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      brand: 'Taameer Plus Contracting LLC',
      notFound: 'Project not found',
      notFoundText: 'We could not find that project. It may have moved, or the link may be incorrect. Browse the full portfolio or return to the homepage.',
      specType: 'Type', specLocation: 'Location', specDuration: 'Duration', specCompletion: 'Completion', specConsultant: 'Consultant',
      imageOf: ' — image {i} of {n}', after: 'After: {t}, completed', before: 'Before: {t}, during construction',
      description: '{title} — a {type} project in {location} delivered by {brand}{when}. View the project details and image gallery.'
    },
    ar: {
      ongoing: 'قيد التنفيذ', ongoingProject: 'مشروع قيد التنفيذ', completed: 'اكتمل في {d}',
      months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      brand: 'تعمير بلس للمقاولات ش.ذ.م.م',
      notFound: 'المشروع غير موجود',
      notFoundText: 'لم نعثر على هذا المشروع. ربما نُقل أو أن الرابط غير صحيح. تصفّح سجل أعمالنا الكامل أو عد إلى الصفحة الرئيسية.',
      specType: 'النوع', specLocation: 'الموقع', specDuration: 'المدة', specCompletion: 'تاريخ الإنجاز', specConsultant: 'الاستشاري',
      imageOf: ' — الصورة {i} من {n}', after: 'بعد: {t}، بعد الإنجاز', before: 'قبل: {t}، أثناء الإنشاء',
      description: '{title} — مشروع في مجال {type} في {location} نفّذته {brand}{when}. اطلع على تفاصيل المشروع ومعرض الصور.'
    }
  };
  function s(key) {
    return (STRINGS[lang] || STRINGS.en)[key] || STRINGS.en[key];
  }
  // Asset and data paths in the JSON are relative to the site root; the Arabic pages live one folder down.
  var ROOT = lang === 'ar' ? '../' : '';
  function asset(path) {
    return path ? ROOT + path : path;
  }

  function t(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.en || '';
  }

  function sortKey(p) {
    return p.status === 'ongoing' ? '9999-99' : p.completion || '0000-00';
  }

  // Listing order: ongoing first, then newest completion; stable for equal keys; showcase excluded.
  function sorted(data) {
    return (data.projects || [])
      .filter(function (p) { return p.type !== 'showcase'; })
      .map(function (p, i) { return { p: p, i: i }; })
      .sort(function (a, b) { return sortKey(b.p).localeCompare(sortKey(a.p)) || a.i - b.i; })
      .map(function (x) { return x.p; });
  }

  function setText(root, field, value) {
    var el = root.querySelector('[data-tp-field="' + field + '"]');
    if (el) el.textContent = value;
  }

  function card(tpl, p, data) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    var year = p.completion ? p.completion.slice(0, 4) : '';
    var ongoing = p.status === 'ongoing';
    var meta = (data.imageMeta || {})[p.cover] || [];

    node.setAttribute('data-tp-type', p.type);
    node.querySelector('a.tp-card').setAttribute('href', 'project.html?id=' + encodeURIComponent(p.id));
    setText(node, 'title', t(p.title));
    setText(node, 'location', t(p.location));
    setText(node, 'type', t((data.types || {})[p.type]));
    setText(node, 'when', ongoing ? s('ongoing') : year);

    var img = node.querySelector('img.tp-card__img');
    img.setAttribute('src', asset(p.cover));
    img.setAttribute('alt', t(p.title) + ', ' + t(p.location));
    if (meta[0]) {
      img.setAttribute('width', meta[0]);
      img.setAttribute('height', meta[1]);
    }
    if (meta[2]) {
      img.setAttribute('srcset', asset(p.cover.replace(/\.webp$/, '-md.webp')) + ' 900w, ' + asset(p.cover) + ' ' + meta[0] + 'w');
    }

    var keep = { ongoing: ongoing, render: !!p.isRender };
    node.querySelectorAll('[data-tp-badge]').forEach(function (b) {
      if (!keep[b.getAttribute('data-tp-badge')]) b.remove();
    });
    var badges = node.querySelector('.tp-card__badges');
    if (badges && !badges.children.length) badges.remove();
    return node;
  }

  // opts ({ type, exclude, count }) override the container's data attributes (used by project.html).
  function render(container, data, types, opts) {
    opts = opts || {};
    var tpl = document.getElementById(container.dataset.tpTemplate || 'tp-project-card');
    if (!tpl) throw new Error('missing <template id="tp-project-card">');
    var featured = container.dataset.tpFeatured === 'true';
    var type = opts.type || container.dataset.tpType;
    var exclude = opts.exclude || container.dataset.tpExclude;
    var count = opts.count || parseInt(container.dataset.tpCount, 10) || Infinity;

    var list = sorted(data).filter(function (p) {
      if (featured && !p.featured) return false;
      if (type && p.type !== type) return false;
      if (exclude && p.id === exclude) return false;
      if (types && types.indexOf(p.type) === -1) return false;
      return true;
    }).slice(0, count);

    if (!list.length) {
      var wrap = container.closest('[data-tp-related]');
      if (wrap) wrap.hidden = true;
      return;
    }
    var frag = document.createDocumentFragment();
    list.forEach(function (p) { frag.appendChild(card(tpl, p, data)); });
    container.replaceChildren(frag);
    if (TP.refreshAnimations) TP.refreshAnimations(container.parentNode);
    container.dispatchEvent(new CustomEvent('tp:rendered', { bubbles: true }));
  }

  // Cache the JSON between containers on the same page.
  var cache = {};
  function load(src) {
    src = src || 'data/projects.json';
    if (!/^(\.\.\/|https?:)/.test(src)) src = ROOT + src;
    if (!cache[src]) {
      cache[src] = fetch(src).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + src);
        return r.json();
      });
    }
    return cache[src];
  }

  function init() {
    document.querySelectorAll('[data-tp-projects]').forEach(function (container) {
      var src = container.dataset.tpSrc || 'data/projects.json';
      var service = container.dataset.tpService;
      var ready = service
        ? Promise.all([load(src), load(container.dataset.tpSite || 'data/site.json')]).then(function (r) {
            var match = (r[1].services || []).filter(function (x) { return x.id === service; })[0];
            render(container, r[0], (match && match.relatedTypes) || []);
          })
        : load(src).then(function (data) { render(container, data); });
      ready.catch(function (err) {
        // Keep the server-rendered fallback link (file:// or network failure).
        if (window.console) console.warn('[tp-projects] ' + err.message + ' — serve the site with `npx serve .`');
      });
    });
  }

  TP.projects = { load: load, sorted: sorted, render: render, card: card, t: t, s: s, asset: asset };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
