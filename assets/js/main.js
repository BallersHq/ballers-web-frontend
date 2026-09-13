(function () {
  'use strict';

  var config = window.BALLERS_CONFIG || {};
  var API_BASE = (config.apiBase || '').replace(/\/+$/, '');
  var NOTIFY_URL = API_BASE + '/v1/landing/notify';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- Year ---------- */
  var yearEl = document.querySelector('.js-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    var use = toggle.querySelector('use');
    if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
    menu.classList.toggle('is-open', open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- "List your arena" → hero form as arena owner ---------- */
  var heroForm = document.querySelector('.js-waitlist[data-form="hero"]');
  document.querySelectorAll('.js-arena-cta').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (!heroForm) return;
      e.preventDefault();
      var clientRadio = heroForm.querySelector('input[name="userType"][value="CLIENT"]');
      if (clientRadio) clientRadio.checked = true;
      heroForm.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      var email = heroForm.querySelector('input[name="email"]');
      if (email) setTimeout(function () { email.focus({ preventScroll: true }); }, prefersReducedMotion() ? 0 : 450);
    });
  });

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Waitlist forms ---------- */
  document.querySelectorAll('.js-waitlist').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitWaitlist(form);
    });
    var emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        if (emailInput.getAttribute('aria-invalid') === 'true') {
          emailInput.removeAttribute('aria-invalid');
          setStatus(form, '', null);
        }
      });
    }
  });

  function getUserType(form) {
    var checked = form.querySelector('input[name="userType"]:checked');
    if (checked) return checked.value;
    var hidden = form.querySelector('input[name="userType"]');
    return hidden && hidden.value ? hidden.value : 'BALLER';
  }

  function setStatus(form, message, kind) {
    var status = form.querySelector('.form-status');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('form-status--error', kind === 'error');
    status.classList.toggle('form-status--success', kind === 'success');
  }

  function setLoading(form, loading) {
    var button = form.querySelector('button[type="submit"]');
    if (!button) return;
    var label = button.querySelector('.js-label');
    if (label) {
      if (!label.dataset.idle) label.dataset.idle = label.textContent;
      label.textContent = loading ? 'Joining…' : label.dataset.idle;
    }
    button.disabled = loading;
    button.setAttribute('aria-busy', String(loading));
  }

  function extractMessage(body, fallback) {
    if (!body) return fallback;
    var msg = body.message;
    if (Array.isArray(msg)) msg = msg.filter(Boolean).join(' ');
    return typeof msg === 'string' && msg.trim() ? msg.trim() : fallback;
  }

  function showSuccess(form, message, userType) {
    var wrap = document.createElement('div');
    wrap.className = 'waitlist-success';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('tabindex', '-1');

    var icon = document.createElement('div');
    icon.className = 'waitlist-success__icon';
    icon.innerHTML = '<svg class="ic ic--heavy" width="24" height="24" aria-hidden="true"><use href="#i-check"/></svg>';

    var title = document.createElement('h3');
    title.textContent = userType === 'CLIENT' ? "Your arena is on the list." : "You're on the list.";

    var text = document.createElement('p');
    text.className = 'body';
    text.textContent = message;

    wrap.appendChild(icon);
    wrap.appendChild(title);
    wrap.appendChild(text);

    form.replaceChildren(wrap);
    wrap.focus({ preventScroll: true });
  }

  function submitWaitlist(form) {
    var emailInput = form.querySelector('input[name="email"]');
    var phoneInput = form.querySelector('input[name="phone"]');
    var email = emailInput ? emailInput.value.trim() : '';
    var phone = phoneInput ? phoneInput.value.trim() : '';
    var userType = getUserType(form);

    if (!EMAIL_RE.test(email)) {
      if (emailInput) {
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.focus();
      }
      setStatus(form, 'Enter a valid email address, like you@example.com.', 'error');
      return;
    }

    if (!API_BASE) {
      setStatus(form, 'Sign-ups are not configured yet. Please try again later.', 'error');
      return;
    }

    setStatus(form, '', null);
    setLoading(form, true);

    fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email, phone: phone || null, userType: userType })
    })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (body) {
          return { ok: res.ok, status: res.status, body: body };
        });
      })
      .then(function (result) {
        setLoading(form, false);
        if (result.ok) {
          showSuccess(form, extractMessage(result.body, "You've been added to the waitlist. We'll notify you once the app is ready!"), userType);
          return;
        }
        if (result.status >= 400 && result.status < 500) {
          setStatus(form, extractMessage(result.body, 'Please check your details and try again.'), 'error');
        } else {
          setStatus(form, 'Something went wrong on our side. Please try again in a moment.', 'error');
        }
      })
      .catch(function () {
        setLoading(form, false);
        setStatus(form, "We couldn't reach BallersHQ. Check your connection and try again.", 'error');
      });
  }

  /* ---------- Launch countdown (1 Oct 2026, 00:00 WAT) ---------- */
  (function initCountdown() {
    var boxes = document.querySelectorAll('.js-countdown');
    var inlines = document.querySelectorAll('.js-countdown-inline');
    var source = boxes[0] || inlines[0];
    if (!source) return;
    var launchAt = new Date(source.getAttribute('data-launch')).getTime();
    if (isNaN(launchAt)) return;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function render() {
      var remaining = Math.max(0, Math.floor((launchAt - Date.now()) / 1000));
      var days = Math.floor(remaining / 86400);
      var hours = Math.floor((remaining % 86400) / 3600);
      var minutes = Math.floor((remaining % 3600) / 60);
      var seconds = remaining % 60;
      var live = remaining === 0;

      Array.prototype.forEach.call(boxes, function (box) {
        box.hidden = live;
        if (live) return;
        box.querySelector('[data-unit="days"]').textContent = pad(days);
        box.querySelector('[data-unit="hours"]').textContent = pad(hours);
        box.querySelector('[data-unit="minutes"]').textContent = pad(minutes);
        box.querySelector('[data-unit="seconds"]').textContent = pad(seconds);
        box.setAttribute('aria-label', days + ' days, ' + hours + ' hours and ' + minutes + ' minutes until launch');
      });
      Array.prototype.forEach.call(document.querySelectorAll('.js-launch-label'), function (label) {
        label.textContent = live ? "We're live in Abuja" : 'Launching in Abuja · 1 October';
      });
      Array.prototype.forEach.call(inlines, function (el) {
        el.textContent = live
          ? "We're live in Abuja"
          : (days > 0 ? days + (days === 1 ? ' day' : ' days') + ' to go' : pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + ' to go') + ' · Launching in Abuja on 1 October';
      });
      return live;
    }

    if (render()) return;
    var timer = setInterval(function () {
      if (render()) clearInterval(timer);
    }, 1000);
  })();
})();
