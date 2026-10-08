/**
 * wp-contact-check.mjs — functional checks of the WordPress Contact page (WP phase 6).
 *   PW_MODULE=<playwright> node scripts/wp/wp-contact-check.mjs
 * Checks /contact/: URL + 200, title, one h1, heading order, sections, no HTML widget, breadcrumbs, hero copy, the contact
 * details (labels, values, link targets, new-tab notes), the WPForms form (fields in order, labels, required marks, types,
 * project-type options, honeypot, note, button), validation (empty submit, invalid email, error text, focus, error cleared
 * once valid), keyboard-only use, a valid submission (focused confirmation, prototype copy) and its email in Local's Mailpit
 * (http://localhost:10006; skipped with a notice when Mailpit is not reachable), a filled honeypot (no email), the location
 * block and Google Maps link, shared CTA, header / footer / current menu, layout (details beside the form from 1024 px,
 * stacked below) and no overflow at 7 widths, reduced motion, console errors. Runs one browser context at a time.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PW_MODULE ? pathToFileURL(path.join(process.env.PW_MODULE, 'index.mjs')).href : 'playwright');
const base = 'https://taameer.local';
const url = base + '/contact/';
const MAIN = '[data-elementor-type="wp-page"]';
const MAILPIT = 'http://localhost:10006/api/v1';
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

// Prototype contact.html, in order.
const DETAILS = [
  ['Address', 'Sky Business Building, Office M30, Festival City, Dubai, UAE', null],
  ['Office', '+971 4 329 0500', 'tel:+97143290500'],
  ['Mobile', '+971 50 302 9281', 'tel:+971503029281'],
  ['Email', 'info@taameer.ae', 'mailto:info@taameer.ae'],
  ['WhatsApp', 'Chat with us instantly (opens in a new tab)', 'https://wa.me/971503029281'],
  ['Instagram', '@taameer_contracting (opens in a new tab)', 'https://instagram.com/taameer_contracting'],
];
const FIELDS = [
  ['Full name', true, 'text'], ['Email address', true, 'email'], ['Phone number', false, 'text'],
  ['Project type', false, 'select'], ['Message', true, 'textarea'],
];
const TYPES = ['Construction', 'Design & Build', 'Decoration & Fit-out', 'Renovation', 'Maintenance', 'Turnkey Projects', 'Other'];
const SUCCESS = ['Thank you for your message', 'Our team will get back to you. For anything urgent, call +971 4 329 0500 or message us on WhatsApp.'];
const MAPS = 'https://www.google.com/maps/search/?api=1&query=Sky+Business+Building+Festival+City+Dubai+UAE';

const browser = await chromium.launch();
async function open(width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const res = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);
  return { ctx, page, errors, res };
}
async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(60); }
  await page.waitForTimeout(1200);
}
// Visible WPForms error messages (em / label .wpforms-error, not the fields that carry the class).
const shownErrors = (page) => page.$$eval('.tp-contact-form .wpforms-error:not(input):not(select):not(textarea)', (els) => els
  .filter((e) => e.offsetParent && e.textContent.trim()).map((e) => ({ id: e.id, t: e.textContent.trim(), role: e.getAttribute('role') })));
const mailpit = async (ctx) => { try { const r = await ctx.request.get(MAILPIT + '/messages', { timeout: 5000 }); return r.ok() ? await r.json() : null; } catch { return null; } };
async function waitConfirmation(page) {
  try { await page.waitForSelector('.tp-contact-form .wpforms-confirmation-container-full', { timeout: 45000 }); return true; } catch { return false; }
}

/* ---- Desktop: structure, content, form markup ---- */
let formId;
{
  const { ctx, page, errors, res } = await open(1280);
  check('/contact/ returns 200 at its own URL', res.status() === 200 && new URL(page.url()).pathname === '/contact/', `${res.status()} ${page.url()}`);
  check('page title starts with "Contact"', /^Contact\b/.test(await page.title()), await page.title());
  check('exactly one h1 ("Get in touch with our team")', (await page.locator('h1').count()) === 1 && (await page.locator('h1').innerText()).trim() === 'Get in touch with our team');
  const headings = await page.$$eval(`${MAIN} h1, ${MAIN} h2, ${MAIN} h3`, (els) => els.map((e) => `${e.tagName}:${e.textContent.trim()}`));
  check('heading order: h1, Head office, Tell us about your project, Visit our office, CTA h2',
    headings.join('|') === 'H1:Get in touch with our team|H2:Head office|H2:Tell us about your project|H2:Visit our office|H2:Ready to build your next project?', headings.join(' | '));
  check('4 top-level sections (hero, details + form, location, CTA)', (await page.$$eval(`${MAIN} > .e-con`, (els) => els.length)) === 4);
  check('no HTML widget on the page', (await page.locator(`${MAIN} .elementor-widget-html`).count()) === 0);
  check('form is the native WPForms widget', (await page.locator(`${MAIN} .elementor-widget-wpforms.tp-contact-form form.wpforms-form`).count()) === 1);
  const crumbs = await page.$$eval('.tp-breadcrumb__list li', (els) => els.map((e) => ({ t: e.textContent.trim(), href: (e.querySelector('a') || {}).getAttribute?.('href') })));
  check('breadcrumbs: Home (/) > Contact (current)', crumbs.length === 2 && crumbs[0].t === 'Home' && crumbs[0].href === '/' &&
    (await page.locator('.tp-breadcrumb [aria-current="page"]').textContent()).trim() === 'Contact');
  const eyebrows = await page.$$eval(`${MAIN} .tp-eyebrow`, (els) => els.map((e) => e.textContent.trim()));
  check('eyebrows: Contact us, Contact details, Send a message, Find us', ['Contact us', 'Contact details', 'Send a message', 'Find us'].every((t, i) => eyebrows[i] === t), eyebrows.join(', '));
  check('hero lead as in the prototype', norm(await page.locator(MAIN).innerText()).includes('Ready to build your next project? Contact Taameer Plus Contracting for expert consultations, value engineering, and turnkey proposals.'));

  // Contact details
  const spec = await page.$$eval('.tp-contact-info dl', (dls) => {
    const dl = dls[0]; if (!dl) return [];
    return [...dl.querySelectorAll('dt')].map((dt) => {
      const dd = dt.nextElementSibling; const a = dd.querySelector('a');
      return { dt: dt.textContent.trim(), dd: dd.textContent.replace(/\s+/g, ' ').trim(), href: a && a.getAttribute('href'), target: a && a.getAttribute('target'), rel: a && a.getAttribute('rel'), address: !!dd.querySelector('address') };
    });
  });
  check('6 contact details in order (labels + values)', spec.length === 6 && DETAILS.every((d, i) => spec[i].dt === d[0] && spec[i].dd === d[1]), spec.map((s) => `${s.dt}: ${s.dd}`).join(' / '));
  check('detail links: tel / mailto / wa.me / instagram targets exactly as the prototype', DETAILS.every((d, i) => spec[i].href === d[2]));
  check('address in <address>; WhatsApp + Instagram open in a new tab with rel=noopener', spec[0].address && spec.slice(4).every((s) => s.target === '_blank' && /noopener/.test(s.rel)));

  // Form markup
  formId = await page.getAttribute('.tp-contact-form form', 'data-formid');
  const fields = await page.$$eval('.tp-contact-form .wpforms-field-container > .wpforms-field', (els) => els
    .filter((f) => getComputedStyle(f).position !== 'absolute')   // WPForms' own decoy honeypot is absolutely positioned and hidden
    .map((f) => {
      const c = f.querySelector('input, select, textarea'); const l = f.querySelector('label.wpforms-field-label');
      return { label: l && l.childNodes[0].textContent.trim(), forOk: l && c && l.htmlFor === c.id, star: !!(l && l.querySelector('.wpforms-required-label[aria-hidden="true"]')),
        required: c.required, type: c.tagName === 'INPUT' ? c.type : c.tagName.toLowerCase(), opts: c.tagName === 'SELECT' ? [...c.options].map((o) => o.textContent.trim()) : null };
    }));
  check('5 visible fields in the prototype order with its labels', fields.length === 5 && FIELDS.every((f, i) => fields[i].label === f[0]), fields.map((f) => f.label).join(', '));
  check('every label is associated with its field (for = id)', fields.every((f) => f.forOk));
  check('required: Full name, Email address, Message (required attribute + aria-hidden "*")', FIELDS.every((f, i) => fields[i].required === f[1] && fields[i].star === f[1]));
  check('field types: text, email, text (phone), select, textarea', FIELDS.every((f, i) => fields[i].type === f[2]), fields.map((f) => f.type).join(','));
  check('project type: "Select a service" + the 7 prototype options', JSON.stringify(fields[3].opts) === JSON.stringify(['Select a service', ...TYPES]), (fields[3].opts || []).join(' | '));
  const hp = await page.$$eval('.tp-contact-form .wpforms-field-hp, .tp-contact-form .wpforms-field-container > .wpforms-field', (els) => els
    .filter((f) => f.classList.contains('wpforms-field-hp') || getComputedStyle(f).position === 'absolute')
    .map((f) => { const r = f.getBoundingClientRect(); const i = f.querySelector('input'); return { w: r.width, h: r.height, hidden: getComputedStyle(f).display === 'none' || getComputedStyle(i).visibility === 'hidden' }; }));
  check('honeypot present and invisible (WPForms honeypot + its decoy field)', hp.length >= 1 && hp.every((h) => h.hidden || (h.w <= 1 && h.h <= 1)), JSON.stringify(hp));
  check('note "Fields marked * are required." just above the button', await page.evaluate(() => {
    const n = document.querySelector('.tp-contact-form .wpforms-description'); const b = document.querySelector('.tp-contact-form button.wpforms-submit');
    const last = [...document.querySelectorAll('.tp-contact-form textarea')].pop();
    return n && n.textContent.trim() === 'Fields marked * are required.' && n.getBoundingClientRect().top > last.getBoundingClientRect().bottom && n.getBoundingClientRect().bottom <= b.getBoundingClientRect().top;
  }));
  const btn = await page.$eval('.tp-contact-form button.wpforms-submit', (b) => { const s = getComputedStyle(b); return { t: b.textContent.trim(), type: b.type, bg: s.backgroundColor, fg: s.color, tt: s.textTransform, h: b.getBoundingClientRect().height, w: b.getBoundingClientRect().width, fw: b.closest('form').getBoundingClientRect().width }; });
  check('submit button "Send message": ink fill, white uppercase text, full form width, >= 44px', btn.t === 'Send message' && btn.type === 'submit' && btn.bg === 'rgb(13, 13, 13)' && btn.fg === 'rgb(255, 255, 255)' && btn.tt === 'uppercase' && btn.h >= 44 && Math.abs(btn.w - btn.fw) < 1, JSON.stringify(btn));
  check('fields: hairline border, 2px radius, >= 44px tall', await page.$$eval('.tp-contact-form :is(input[type=text], input[type=email], select, textarea)', (els) => els.filter((e) => e.offsetParent && getComputedStyle(e).visibility !== 'hidden').every((e) => {
    const s = getComputedStyle(e); return s.borderTopColor === 'rgb(217, 217, 217)' && s.borderTopLeftRadius === '2px' && e.getBoundingClientRect().height >= 44;
  })));

  // Location + CTA, header, footer, menu
  const maps = await page.$eval('.tp-location a.elementor-button', (a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'), t: a.textContent.replace(/\s+/g, ' ').trim() }));
  check('location: address + "Open in Google Maps" → Maps search, new tab', maps.href === MAPS && maps.target === '_blank' && maps.t === 'Open in Google Maps (opens in a new tab)' &&
    norm(await page.locator('.tp-location').innerText()).includes('Sky Business Building, Office M30, Festival City, Dubai, UAE'), JSON.stringify(maps));
  check('location "+" mark: 56 px, decorative (no text)', await page.$eval('.tp-location__mark', (m) => { const r = m.getBoundingClientRect(); return Math.round(r.width) === 56 && Math.round(r.height) === 56 && m.textContent.trim() === ''; }));
  check('shared CTA band (template 228) present', (await page.locator(`${MAIN} .elementor-widget-shortcode .elementor[data-elementor-id="228"] h2`).first().textContent()).trim() === 'Ready to build your next project?');
  check('Astra header + footer present', (await page.locator('#masthead').count()) === 1 && (await page.locator('#colophon').count()) === 1);
  const current = await page.$$eval('#masthead .current-menu-item > a', (els) => [...new Set(els.map((e) => e.textContent.trim()))]);
  check('Contact is the only current header menu item', current.join() === 'Contact', current.join());
  check('footer quick link "Contact" is current', (await page.locator('#colophon a[href="/contact/"][aria-current="page"]').count()) === 1);
  check('header "Get a quote" button links to /contact/', (await page.locator('#masthead a[href="/contact/"]').filter({ hasText: /get a quote/i }).count()) >= 1);
  check('floating WhatsApp button present', (await page.locator('.tp-fab').count()) === 1);
  check('no console errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Validation ---- */
{
  const { ctx, page, errors } = await open(1280);
  const F = (n) => `#wpforms-${formId}-field_${n}`;
  await page.click('.tp-contact-form button.wpforms-submit');
  await page.waitForTimeout(800);
  let errs = await shownErrors(page);
  check('empty submit: 3 required errors (name, email, message), role=alert', errs.length === 3 && errs.every((e) => e.t === 'Please fill in this field.' && e.role === 'alert') &&
    ['1', '2', '5'].every((n, i) => errs[i].id === `wpforms-${formId}-field_${n}-error`), JSON.stringify(errs));
  check('empty submit: form stays, no confirmation', (await page.locator('.tp-contact-form form.wpforms-form').isVisible()) && (await page.locator('.wpforms-confirmation-container-full').count()) === 0);
  check('empty submit: focus moves to the first invalid field (Full name)', await page.evaluate((id) => document.activeElement && document.activeElement.id === id, F(1).slice(1)));
  check('error message linked to the field (aria-errormessage / aria-describedby)', await page.$eval(F(1), (e) => [e.getAttribute('aria-errormessage'), ...(e.getAttribute('aria-describedby') || '').split(' ')].includes(e.id + '-error')));
  const invalidStyle = await page.$eval(F(1), (e) => getComputedStyle(e).boxShadow);
  check('invalid field: ink inner underline (prototype aria-invalid style)', /rgb\(13, 13, 13\).*inset|inset.*rgb\(13, 13, 13\)/.test(invalidStyle), invalidStyle);
  await page.fill(F(1), 'Test User');
  await page.locator(F(2)).focus();
  await page.waitForTimeout(500);
  check('error clears once the field is valid', !(await shownErrors(page)).some((e) => e.id === `wpforms-${formId}-field_1-error`));
  await page.fill(F(2), 'not-an-email');
  await page.fill(F(5), 'Local WPForms test');
  await page.click('.tp-contact-form button.wpforms-submit');
  await page.waitForTimeout(800);
  errs = await shownErrors(page);
  check('invalid email: one error with the prototype wording', errs.length === 1 && errs[0].t === 'Please enter a valid email address, for example name@example.com.', JSON.stringify(errs));
  check('invalid email: aria-invalid="true" on the email field, form not sent', (await page.getAttribute(F(2), 'aria-invalid')) === 'true' && (await page.locator('.wpforms-confirmation-container-full').count()) === 0);
  check('valid values kept after a failed submit', (await page.inputValue(F(1))) === 'Test User' && (await page.inputValue(F(5))) === 'Local WPForms test');
  check('no console errors (validation)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Keyboard-only valid submission + Mailpit ---- */
{
  const { ctx, page, errors } = await open(1280);
  const before = await mailpit(ctx);
  const stamp = 'Local WPForms test ' + Date.now();
  await page.locator(`#wpforms-${formId}-field_1`).focus();
  const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; });
  check('keyboard: focused field shows a visible focus ring', ring);
  await page.keyboard.type('Test User');
  await page.keyboard.press('Tab'); await page.keyboard.type('test@example.com');
  await page.keyboard.press('Tab'); await page.keyboard.type('+971 4 000 0000');
  await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown');   // first real option
  const typeVal = await page.inputValue(`#wpforms-${formId}-field_4`);
  await page.keyboard.press('Tab'); await page.keyboard.type(stamp);
  await page.keyboard.press('Tab');
  check('keyboard: Tab order name → email → phone → type → message → Send message', await page.evaluate(() => document.activeElement.classList.contains('wpforms-submit')) && typeVal === 'Construction', typeVal);
  await page.waitForTimeout(3000);   // WPForms modern anti-spam rejects instant bot-like submissions
  await page.keyboard.press('Enter');
  const ok = await waitConfirmation(page);
  const conf = ok && await page.$eval('.tp-contact-form .wpforms-confirmation-container-full', (c) => ({ h: (c.querySelector('h3') || {}).textContent, p: (c.querySelector('p') || {}).textContent, focused: document.activeElement === c, role: c.getAttribute('role'), bg: getComputedStyle(c).backgroundColor }));
  await page.waitForTimeout(300);
  check('valid submit: form replaced by the confirmation (prototype copy, h3 + text)', ok && conf.h === SUCCESS[0] && norm(conf.p) === SUCCESS[1] && (await page.locator('.tp-contact-form form.wpforms-form').count()) === 0, JSON.stringify(conf));
  check('confirmation: focused, role=status, fog panel', ok && await page.evaluate(() => { const c = document.querySelector('.tp-contact-form .wpforms-confirmation-container-full'); return document.activeElement === c && c.getAttribute('role') === 'status'; }) && conf.bg === 'rgb(244, 244, 244)', JSON.stringify(conf));
  if (!before) {
    console.log('SKIP  Mailpit not reachable at ' + MAILPIT + ' — email delivery not verified');
  } else {
    let msg = null;
    for (let i = 0; i < 20 && !msg; i++) {
      const now = await mailpit(ctx);
      msg = now && now.messages.find((m) => m.Snippet && m.Snippet.includes(stamp.split(' ').pop()));
      if (!msg) await page.waitForTimeout(1000);
    }
    check('Mailpit: notification received', !!msg, msg ? msg.Subject : 'not found');
    if (msg) {
      const full = await (await ctx.request.get(`${MAILPIT}/message/${msg.ID}`)).json();
      check('Mailpit: subject "New enquiry from Test User — taameer.ae", Reply-To the visitor', msg.Subject === 'New enquiry from Test User — taameer.ae' && msg.ReplyTo.some((r) => r.Address === 'test@example.com'), `${msg.Subject} / ${JSON.stringify(msg.ReplyTo)}`);
      check('Mailpit: from the site name, to the site admin address (local)', msg.From.Name === 'Taameer Plus Contracting LLC' && msg.To.length === 1 && msg.From.Address === msg.To[0].Address, `${JSON.stringify(msg.From)} → ${JSON.stringify(msg.To)}`);
      check('Mailpit: body lists every filled field', ['Test User', 'test@example.com', '+971 4 000 0000', 'Construction', stamp].every((v) => full.Text.includes(v)));
    }
  }
  check('no console errors (submission)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---- Honeypot: a bot filling the hidden field gets no email ---- */
{
  const { ctx, page } = await open(1280);
  const before = await mailpit(ctx);
  const stamp = 'Honeypot test ' + Date.now();
  await page.fill(`#wpforms-${formId}-field_1`, 'Bot');
  await page.fill(`#wpforms-${formId}-field_2`, 'bot@example.com');
  await page.fill(`#wpforms-${formId}-field_5`, stamp);
  await page.$eval('.tp-contact-form .wpforms-field-hp input', (i) => { i.value = 'http://spam.example'; });
  await page.waitForTimeout(3000);
  await page.click('.tp-contact-form button.wpforms-submit');
  await page.waitForTimeout(12000);
  if (before) {
    const now = await mailpit(ctx);
    check('honeypot filled: no email sent', !now.messages.some((m) => m.Snippet && m.Snippet.includes(stamp.split(' ').pop())));
  } else console.log('SKIP  honeypot email check (Mailpit not reachable)');
  await ctx.close();
}

/* ---- Widths: layout and overflow ---- */
{
  const overflow = []; const wrong = []; const errs = []; const narrow = [];
  for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
    const { ctx, page, errors } = await open(w);
    await scrollThrough(page);
    if ((await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) > 0) overflow.push(w);
    const lay = await page.evaluate(() => {
      const i = document.querySelector('.tp-contact-info').getBoundingClientRect(); const f = document.querySelector('.tp-contact-formcol').getBoundingClientRect();
      const fields = [...document.querySelectorAll('.tp-contact-form :is(input[type=text], input[type=email], select, textarea)')].filter((e) => e.offsetParent && getComputedStyle(e).visibility !== 'hidden').map((e) => e.getBoundingClientRect());   // not the decoy honeypot
      return { mode: f.top >= i.bottom - 1 ? 'stack' : 'row', fullWidth: fields.every((r) => Math.abs(r.width - f.width) < 1), stacked: fields.every((r, k) => k === 0 || r.top > fields[k - 1].bottom) };
    });
    const expect = w >= 1024 ? 'row' : 'stack';
    if (lay.mode !== expect) wrong.push(`${w}px: ${lay.mode}`);
    if (!lay.fullWidth || !lay.stacked) narrow.push(`${w}px`);
    errs.push(...errors);
    await ctx.close();
  }
  check('details beside the form from 1024 px, stacked at 320–768 px (prototype tp-row wrap)', wrong.length === 0, wrong.join('; '));
  check('fields full width of the form column, one per row, at every width', narrow.length === 0, narrow.join(', '));
  check('no horizontal overflow at 320 / 375 / 390 / 768 / 1024 / 1280 / 1440', overflow.length === 0, overflow.join(','));
  check('no console errors (all widths)', errs.length === 0, errs.join(' | '));
}

/* ---- Reduced motion ---- */
{
  const { ctx, page, errors } = await open(375, { reducedMotion: 'reduce' });
  const hidden = await page.$$eval(`${MAIN} .elementor-element`, (els) => els.filter((e) => getComputedStyle(e).visibility === 'hidden' || getComputedStyle(e).opacity === '0').length);
  check('reduced motion: every element visible without scrolling', hidden === 0, String(hidden));
  check('no console errors (reduced motion)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
