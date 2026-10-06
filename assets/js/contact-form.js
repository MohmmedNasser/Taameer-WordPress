/* PROTOTYPE ONLY — in WordPress this becomes an Elementor v4 Atomic Form (pending the Phase 4 spike). */
/* ==========================================================================
   contact-form.js — validation and success state for form.tp-form (nothing is ever sent)
   - Native HTML5 constraints (required, type=email) drive the rules; `novalidate` turns off the browser bubbles so
     errors are inline: <p class="tp-form__error"> linked with aria-describedby, aria-invalid on the field.
   - On submit: all invalid fields are marked, a role="alert" summary is filled, focus moves to the first invalid
     field. Typing or choosing clears that field's error once it is valid again.
   - Valid submit: the form is replaced by .tp-form__success (focused, role="status"); no request is made.
   - The honeypot (.tp-form__hp) is ignored by users; a filled honeypot gets the same success state and is not
     "sent" either (a real backend would drop it silently).
   ========================================================================== */
(function () {
  'use strict';

  var MESSAGES = {
    en: {
      required: function (label) { return 'Please enter your ' + label + '.'; },
      email: 'Please enter a valid email address, for example name@example.com.',
      summary: function (n) { return n === 1 ? 'Please correct 1 field below.' : 'Please correct ' + n + ' fields below.'; }
    },
    ar: {
      required: function (label) { return 'يرجى تعبئة حقل «' + label + '».'; },
      email: 'يرجى إدخال عنوان بريد إلكتروني صحيح، مثل name@example.com.',
      summary: function (n) {
        if (n === 1) return 'يرجى تصحيح حقل واحد أدناه.';
        if (n === 2) return 'يرجى تصحيح حقلين أدناه.';
        return n <= 10 ? 'يرجى تصحيح ' + n + ' حقول أدناه.' : 'يرجى تصحيح ' + n + ' حقلاً أدناه.';
      }
    }
  };
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var M = MESSAGES[lang] || MESSAGES.en;

  function labelText(field) {
    var label = field.closest('.tp-form__field').querySelector('label');
    return label ? label.firstChild.textContent.trim().toLowerCase() : 'value';
  }

  function messageFor(field) {
    var v = field.validity;
    if (v.valueMissing) return M.required(labelText(field));
    if (v.typeMismatch || v.patternMismatch) return M.email;
    return field.validationMessage;
  }

  function setError(field, text) {
    var err = document.getElementById(field.id + '-err');
    if (text) {
      field.setAttribute('aria-invalid', 'true');
      err.textContent = text;
      err.hidden = false;
    } else {
      field.removeAttribute('aria-invalid');
      err.textContent = '';
      err.hidden = true;
    }
  }

  function init(form) {
    var status = form.querySelector('.tp-form__status');
    var success = form.parentNode.querySelector('.tp-form__success');
    var fields = Array.prototype.slice.call(form.querySelectorAll('.tp-form__field input, .tp-form__field select, .tp-form__field textarea'));

    function check(field) {
      var ok = field.checkValidity();
      setError(field, ok ? '' : messageFor(field));
      return ok;
    }

    fields.forEach(function (f) {
      f.addEventListener('input', function () { if (f.hasAttribute('aria-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.hasAttribute('aria-invalid')) check(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = fields.filter(function (f) { return !check(f); });
      if (invalid.length) {
        status.textContent = M.summary(invalid.length);
        status.hidden = false;
        invalid[0].focus();
        return;
      }
      status.textContent = '';
      status.hidden = true;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });
  }

  document.querySelectorAll('form.tp-form').forEach(init);
})();
