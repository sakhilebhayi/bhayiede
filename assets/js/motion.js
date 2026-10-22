// sakhilebhayi.com · motion for every page (GSAP + ScrollTrigger).
// Runs only when the visitor has not asked for reduced motion; every element is fully visible without it.
// The REVEAL list below must match the :is(...) list in site.css that hides elements until they animate.
(() => {
  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('has-motion'); return; }
  window.__motionReady = true;
  gsap.registerPlugin(ScrollTrigger);
  const q = (s, c = document) => [...c.querySelectorAll(s)];
  const REVEAL = '.letter__head,.letter__p,.letter__acts,.letter__sign,.mark,.page-head h1,.page-head .prose,.sec__head,.prose,.rows > li,.career__list > li,.features > li,.help-photo,.notes > li,.tools > li,.items > li,.offers > li,.steps > li,.bios > *,.audience > li,.faq > *,.contact__intro,.profiles > li,.donate,.map__col,.shot';
  const mm = gsap.matchMedia();

  mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 735px)', fine: '(hover: hover) and (pointer: fine)' }, (ctx) => {
    const { wide, fine } = ctx.conditions;
    const letter = document.querySelector('.letter');
    const opener = letter || document.querySelector('.page-head--dark');

    // 1. Arrival. Home: headline, letter, links, signature, then the logo. Other pages: the page heading and its lede.
    const intro = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.1 } });
    const lines = letter ? q('.letter__head, .letter__p, .letter__acts, .letter__sign') : q('.page-head h1, .page-head .prose');
    if (lines.length) { gsap.set(lines, { y: 40 }); lines.forEach((el, i) => intro.to(el, { opacity: 1, y: 0 }, i * 0.14)); }
    const mark = document.querySelector('.mark');
    if (mark) {
      gsap.set(mark, { x: wide ? 70 : 0, y: wide ? 0 : 30, scale: 0.92, transformOrigin: '50% 50%' });
      intro.to(mark, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.6 }, 0.35);
    }

    // 2. Parallax: in the opening the photograph drifts slower than the page and the logo rises faster;
    //    the other dark bands drift their photograph inside the band.
    if (opener) {
      const open = { trigger: opener, start: 'top top', end: 'bottom top', scrub: 0.6 };
      const hb = opener.querySelector('.hero-bg');
      if (hb) {
        gsap.fromTo(hb, { yPercent: 0 }, { yPercent: wide ? 10 : 0, ease: 'none', scrollTrigger: open });
        gsap.fromTo(hb.querySelector('img'), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: open });
      }
      if (mark && wide) gsap.to(mark, { y: -70, ease: 'none', scrollTrigger: open });
    }
    q('.sec--invest .hero-bg, .close .hero-bg').forEach((hb) => {
      gsap.fromTo(hb, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: hb.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });

    // 3. Sections rise as they enter, in small staggered groups.
    const items = q(REVEAL).filter((el) => !lines.includes(el) && el !== mark);
    if (items.length) {
      gsap.set(items, { y: 48 });
      ScrollTrigger.batch(items, {
        start: 'top 90%', once: true,
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12, overwrite: true }),
      });
    }

    // 4. Career rows: the date slides in from the right as the row appears.
    q('.career__list > li').forEach((li) => {
      const when = li.querySelector('.career__when');
      if (when) gsap.from(when, { x: 48, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 90%', once: true } });
    });

    // 5. Platform logos pop in and wiggle on hover.
    q('.feature__logo, .tile__logo img, .co__logo img').forEach((logo) => {
      gsap.from(logo, { scale: 0.5, rotate: -14, duration: 1.1, ease: 'back.out(2.2)', scrollTrigger: { trigger: logo, start: 'top 92%', once: true } });
      const host = logo.closest('li, a, .feature') || logo;
      if (fine) host.addEventListener('pointerenter', () => gsap.fromTo(logo, { rotate: -6 }, { rotate: 6, duration: 0.16, repeat: 3, yoyo: true, ease: 'sine.inOut', onComplete: () => gsap.to(logo, { rotate: 0, duration: 0.2 }) }));
    });

    // 6. Photographs: a clip-path reveal on entry, and image parallax inside the frame.
    q('.photo--sky, .photo--c').forEach((p) => {
      gsap.fromTo(p, { clipPath: 'inset(14% 5% 14% 5%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
    });
    q('.photo--sky, .photo--c, .help-photo').forEach((box) => {
      const img = box.querySelector('img');
      if (!img) return;
      gsap.set(img, { scale: 1.18 });
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });

    // 7. Links follow the mouse a little (mouse only): the opening's links, and the "more" links elsewhere.
    if (fine) q('.letter__acts .tlink, .more .tlink').forEach((a) => {
      const x = gsap.quickTo(a, 'x', { duration: 0.5, ease: 'power3.out' });
      const y = gsap.quickTo(a, 'y', { duration: 0.5, ease: 'power3.out' });
      a.addEventListener('pointermove', (e) => { const r = a.getBoundingClientRect(); x((e.clientX - (r.left + r.width / 2)) * 0.25); y((e.clientY - (r.top + r.height / 2)) * 0.4); });
      a.addEventListener('pointerleave', () => { gsap.to(a, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' }); });
    });

    // 8. Scroll progress, and a header that steps aside while you read down and returns when you scroll up.
    const bar = document.createElement('div');
    bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    const nav = document.querySelector('.nav');
    const dock = document.querySelector('.dock');
    if (nav) {
      let hidden = false;
      // The top bar steps aside on every screen; the dock steps aside with it only when it is part of that bar (wide screens).
      const set = (h) => { if (h === hidden) return; hidden = h; gsap.to(wide ? [nav, dock] : nav, { yPercent: h ? -100 : 0, duration: 0.4, ease: 'power3.out', overwrite: true }); };
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => set(s.scroll() > 320 && s.direction === 1) });
      nav.addEventListener('focusin', () => set(false));
      if (dock) dock.addEventListener('focusin', () => set(false));
    }

    // 9. The scene: five scattered sources join into one picture. Pinned on wide screens, scrubbed on scroll.
    const scene = document.querySelector('.scene');
    if (scene) {
      const chips = q('.chip', scene), bars = chips.map((c) => c.querySelector('i')), panel = scene.querySelector('.scene__panel');
      const W = scene.getBoundingClientRect().width, H = Math.min(window.innerHeight * 0.66, 540);
      const off = [[-0.62, -0.2, -12], [0.6, -0.3, 8], [-0.58, 0.28, -7], [0.62, 0.3, 11], [0.08, -0.34, 4]];
      gsap.set(chips, { x: (i) => off[i][0] * W, y: (i) => off[i][1] * H, rotate: (i) => off[i][2], scale: 0.92 });
      gsap.set(bars, { scaleX: 0, transformOrigin: '0 50%' });
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: scene, start: wide ? 'center center' : 'top 80%', end: wide ? '+=110%' : '+=70%', scrub: 0.7, pin: wide, anticipatePin: 1 } });
      tl.to(chips, { x: 0, y: 0, rotate: 0, scale: 1, stagger: 0.08, duration: 1 })
        .to(bars, { scaleX: 1, stagger: 0.06, duration: 0.5 }, '>-0.2')
        .to(panel, { borderColor: '#f1c62e', duration: 0.3 });
    }

    // 10. The method: five cards that travel sideways while the section is pinned (wide screens).
    const steps = document.querySelector('.steps');
    let undo = () => {};
    if (steps && wide) {
      steps.classList.add('is-h');
      const sec = steps.closest('section');
      const dist = () => Math.max(0, steps.scrollWidth - steps.parentElement.clientWidth);
      gsap.to(steps, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top+=48', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
      undo = () => steps.classList.remove('is-h');
    }

    // 11. Platform home pages in frames: the page scrolls inside its frame as you scroll the site,
    //     the frames beside the home features tilt up into place, and the gallery rows travel in opposite directions.
    q('.frame__img').forEach((img) => {
      gsap.fromTo(img, { objectPosition: '50% 0%' }, { objectPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: img.closest('.frame'), start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });
    q('.feature__frame').forEach((fr) => {
      gsap.from(fr, { opacity: 0, y: 70, rotateX: wide ? 10 : 0, transformPerspective: 1100, transformOrigin: '50% 100%', duration: 1.3, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: fr, start: 'top 88%', once: true } });
    });
    q('.reel').forEach((reel) => {
      const rows = q('.reel__row', reel);
      rows.forEach((row, i) => {
        const dist = () => Math.max(0, row.scrollWidth - reel.clientWidth);
        gsap.fromTo(row, { x: () => (i % 2 ? -dist() : 0) }, { x: () => (i % 2 ? 0 : -dist()), ease: 'none', scrollTrigger: { trigger: reel, start: 'top bottom', end: 'bottom top', scrub: 0.8, invalidateOnRefresh: true } });
      });
      gsap.from(q('.frame', reel), { opacity: 0, y: 60, scale: 0.94, duration: 1, ease: 'expo.out', stagger: 0.08, clearProps: 'transform', scrollTrigger: { trigger: reel, start: 'top 85%', once: true } });
    });

    // 12. Logo tiles pop in one after another, per column; hover lift is restored after.
    q('.map__col, .eco > div, .eco__more').forEach((col) => {
      const tiles = q('.mtile', col);
      if (tiles.length) gsap.from(tiles, { opacity: 0, y: 26, scale: 0.92, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.05, clearProps: 'transform,opacity', scrollTrigger: { trigger: col, start: 'top 88%', once: true } });
    });

    // 12b. The investor case reads out row by row.
    const pitch = q('.pitch > div');
    if (pitch.length) gsap.from(pitch, { opacity: 0, x: -28, duration: 0.9, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity', scrollTrigger: { trigger: pitch[0], start: 'top 88%', once: true } });

    // 13. The numbers under the opening count up once.
    q('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', o = { v: 0 };
      const fmt = (v) => Math.round(v).toLocaleString('en-ZA').replace(/\u00a0| /g, ',') + suffix;
      el.textContent = fmt(0);
      gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); }, onComplete: () => { el.textContent = el.dataset.final || fmt(end); }, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });

    const refresh = () => ScrollTrigger.refresh();
    addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    return undo;
  });
})();
