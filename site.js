// sakhilebhayi.com · one script for every page (loaded with defer).
(() => {
  // Home: the letter's facts move from grey to ink once, after first paint.
  const letter = document.getElementById('letter');
  if (letter) {
    const light = () => letter.classList.add('is-lit');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      light();
    } else {
      const later = () => requestAnimationFrame(() => requestAnimationFrame(light));
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(later, 200));
      setTimeout(light, 1500); // safety if fonts never settle
    }
    addEventListener('beforeprint', light);
  }

  // Phones: the bottom dock steps out of the way while a form field has the keyboard.
  const root = document.documentElement;
  document.addEventListener('focusin', (e) => { if (e.target.matches && e.target.matches('input, textarea, select')) root.classList.add('kb'); });
  document.addEventListener('focusout', () => { root.classList.remove('kb'); });

  // Home: the header is dark only while the dark opening is under it, and light over the light sections.
  const opener = document.querySelector('.letter, .page-head--dark');
  const bar = document.querySelector('.nav');
  if (opener && bar && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => bar.classList.toggle('on-dark', e.isIntersecting), { rootMargin: '-48px 0px 0px 0px' }).observe(opener);
  }

  // Home: Band A sits at the fold, inside the distance at which browsers fetch lazy images early.
  // It is added on the first scroll, touch or key press instead, so the first screen loads only what it shows.
  const deferred = [...document.querySelectorAll('[data-defer]')];
  if (deferred.length) {
    const kinds = ['scroll', 'wheel', 'touchstart', 'keydown'];
    const show = () => {
      deferred.forEach(el => {
        const ns = el.querySelector('noscript');
        if (ns) { el.insertAdjacentHTML('beforeend', ns.textContent); ns.remove(); }
      });
      kinds.forEach(t => removeEventListener(t, show));
    };
    if (scrollY > 0 || location.hash) show();
    else kinds.forEach(t => addEventListener(t, show, { passive: true }));
  }

  // Contact form (Web3Forms), in the close of every page.
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('f-status');
  const fail = document.getElementById('f-fail');
  const sent = document.getElementById('f-sent');
  const submit = document.getElementById('f-submit');
  const subject = document.getElementById('f-subject');

  // A text link can choose the subject: /contact/?subject=invest. The value carries no personal data.
  const wanted = new URLSearchParams(location.search).get('subject');
  if (wanted && [...subject.options].some(o => o.value === wanted && !o.disabled)) subject.value = wanted;

  const rules = {
    'f-name': el => el.value.trim().length > 0,
    'f-email': el => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()),
    'f-subject': el => el.value !== '',
    'f-message': el => el.value.trim().length > 1,
  };
  const describe = (el, err) => {
    const ids = (el.dataset.hint ? [el.dataset.hint] : []).concat(err && !err.hidden ? [err.id] : []);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' ')); else el.removeAttribute('aria-describedby');
  };
  const check = id => {
    const el = document.getElementById(id);
    const ok = rules[id](el);
    const err = document.getElementById(id + '-err');
    el.setAttribute('aria-invalid', String(!ok));
    err.hidden = ok;
    describe(el, err);
    return ok;
  };
  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => { if (el.value.trim() !== '' || el.dataset.touched) check(id); el.dataset.touched = '1'; });
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { if (el.getAttribute('aria-invalid') === 'true') check(id); });
  });

  let sending = false;
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (sending) return;
    fail.hidden = true;
    const bad = Object.keys(rules).filter(id => !check(id));
    if (bad.length) {
      document.getElementById(bad[0]).focus();
      status.textContent = bad.length === 1 ? '1 field needs attention.' : bad.length + ' fields need attention.';
      return;
    }
    status.textContent = '';
    const done = () => {
      form.hidden = true;
      sent.hidden = false;
      sent.focus();
    };
    if (form.botcheck.checked) { done(); return; }
    const data = Object.fromEntries(new FormData(form));
    delete data.botcheck;
    const label = subject.options[subject.selectedIndex].text;
    data.subject = 'sakhilebhayi.com · ' + label + ' · ' + data.name.trim();
    data.topic = label;
    sending = true; submit.setAttribute('aria-disabled', 'true'); submit.textContent = 'Sending…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) done();
      else throw new Error(json.message || 'The form service did not accept the message.');
    } catch (err) {
      fail.hidden = false;
    } finally {
      sending = false; submit.removeAttribute('aria-disabled'); submit.textContent = 'Send message';
    }
  });
})();
