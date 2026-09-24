/* Slayed by Soup — interactions, scroll choreography, UI */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const emit = (name) => window.dispatchEvent(new CustomEvent(name));

  /* ---------- static bits ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- live hours (Orlando time) ---------- */
  const OPEN = 8, CLOSE = 23, AFTER = 20;
  const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function orlandoNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    return { day: DAYS[get('weekday')], h: +get('hour'), m: +get('minute') };
  }
  function updateHours() {
    const { day, h, m } = orlandoNow();
    const t = h + m / 60;
    $$('.hours__list [data-day]').forEach((row) => row.classList.toggle('is-today', +row.dataset.day === day));
    const status = $('[data-status]');
    if (status) {
      const open = t >= OPEN && t < CLOSE;
      status.classList.toggle('is-open', open);
      status.classList.toggle('is-closed', !open);
      status.querySelector('span').textContent = open
        ? (t >= AFTER ? 'Open now · after-hours fee applies' : 'Open now · until 11PM')
        : (t >= CLOSE ? 'Closed now · opens tomorrow 8AM' : 'Closed now · opens 8AM');
    }
    return { h, m };
  }
  const now = updateHours();
  setInterval(updateHours, 60_000);

  // Clock face ticks + real Orlando time on the hands
  const ticks = $('.clock__ticks');
  if (ticks) {
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 12; i++) {
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', 50); l.setAttribute('y1', 9); l.setAttribute('x2', 50); l.setAttribute('y2', i % 3 ? 14 : 17);
      l.setAttribute('transform', `rotate(${i * 30} 50 50)`);
      ticks.appendChild(l);
    }
  }
  const handH = $('.clock__h'), handM = $('.clock__m');
  const angH = ((now.h % 12) + now.m / 60) * 30, angM = now.m * 6;
  handH?.setAttribute('transform', `rotate(${angH} 50 50)`);
  handM?.setAttribute('transform', `rotate(${angM} 50 50)`);

  /* ---------- menu ---------- */
  const burger = $('.nav__burger');
  const menu = $('#menu');
  let lenis = null;
  function openMenu() {
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    if (window.gsap && !reduce) {
      gsap.fromTo(menu, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: .7, ease: 'expo.out' });
      gsap.fromTo('.menu li a', { yPercent: 110 }, { yPercent: 0, duration: .8, stagger: .05, ease: 'expo.out', delay: .1 });
      gsap.fromTo('.menu .btn, .menu__social', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, stagger: .08, delay: .35 });
    }
    menu.querySelector('a')?.focus({ preventScroll: true });
  }
  function closeMenu(returnFocus = true) {
    if (menu.hidden) return;
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    lenis?.start();
    if (returnFocus) burger.focus({ preventScroll: true });
  }
  burger?.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- checklist ---------- */
  const checks = $$('.checklist input');
  const done = $('.checklist__done');
  const bookBtn = $('[data-book]');
  checks.forEach((c) => c.addEventListener('change', () => {
    const all = checks.every((x) => x.checked);
    done.textContent = all ? "Yes gorgeous, you're ready!" : '';
    bookBtn?.classList.toggle('is-ready', all);
    if (all) { emit('slay:celebrate'); burst(bookBtn); }
  }));

  function burst(el) {
    if (!el || reduce || !window.gsap) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('i');
      const size = 6 + Math.random() * 10;
      Object.assign(s.style, {
        position: 'fixed', left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`, width: `${size}px`, height: `${size}px`,
        zIndex: 130, pointerEvents: 'none', background: Math.random() > .4 ? '#ff4fb8' : '#fff',
        clipPath: 'polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)',
        filter: 'drop-shadow(0 0 6px #ff2aa6)'
      });
      document.body.appendChild(s);
      const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 160;
      gsap.to(s, {
        x: Math.cos(a) * d, y: Math.sin(a) * d - 40, rotation: Math.random() * 360, scale: 0, duration: 1 + Math.random() * .6,
        ease: 'expo.out', onComplete: () => s.remove()
      });
    }
  }

  /* ---------- nav state, book bar (no GSAP needed) ---------- */
  const nav = $('[data-nav]');
  const bookbar = $('.bookbar');
  const bookSection = $('#book');
  const buildSection = $('#build');
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    const goingDown = y > lastY + 4, goingUp = y < lastY - 4;
    if (menu.hidden) {
      if (goingDown && y > 500) nav.classList.add('is-hidden');
      if (goingUp || y < 200) nav.classList.remove('is-hidden');
    }
    lastY = y;
    const br = bookSection.getBoundingClientRect();
    const inBook = br.top < innerHeight * .85 && br.bottom > 0;
    const bu = buildSection.getBoundingClientRect();
    const inBuild = bu.top < innerHeight * .5 && bu.bottom > innerHeight * .5;
    bookbar.classList.toggle('is-visible', y > innerHeight * .7 && !inBook && !inBuild);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- glitter trail (finger or cursor) ---------- */
  const trail = $('#trail');
  if (trail && !reduce) {
    const ctx = trail.getContext('2d');
    const dpr = Math.min(devicePixelRatio, 2);
    const parts = [];
    let raf = 0, lx = null, ly = null;
    const size = () => { trail.width = innerWidth * dpr; trail.height = innerHeight * dpr; };
    size(); addEventListener('resize', size);
    const colors = ['#ffffff', '#ffb8e0', '#ff4fb8', '#ff8ad0'];
    function spawn(x, y) {
      const d = lx === null ? 0 : Math.hypot(x - lx, y - ly);
      const n = Math.min(4, 1 + (d / 14) | 0);
      for (let i = 0; i < n; i++) {
        parts.push({ x: x + (Math.random() - .5) * 10, y: y + (Math.random() - .5) * 10, vx: (Math.random() - .5) * .8, vy: Math.random() * .6 + .2,
          r: 2 + Math.random() * 5, life: 1, c: colors[(Math.random() * colors.length) | 0], rot: Math.random() * Math.PI });
      }
      lx = x; ly = y;
      if (parts.length > 220) parts.splice(0, parts.length - 220);
      if (!raf) raf = requestAnimationFrame(draw);
    }
    function star(x, y, r, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
      for (let k = 0; k < 8; k++) { const rr = k % 2 ? r * .28 : r; const a = k * Math.PI / 4; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= .022; p.x += p.vx; p.y += p.vy; p.vy += .03; p.rot += .05;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life; ctx.fillStyle = p.c; ctx.shadowColor = '#ff2aa6'; ctx.shadowBlur = 8;
        star(p.x, p.y, p.r * p.life, p.rot);
      }
      raf = parts.length ? requestAnimationFrame(draw) : 0;
      if (!raf) { lx = null; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') spawn(e.clientX, e.clientY); }, { passive: true });
    addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) spawn(t.clientX, t.clientY); }, { passive: true });
    addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) { lx = null; spawn(t.clientX, t.clientY); } }, { passive: true });
  }

  /* ---------- everything below needs GSAP ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    $('.loader')?.remove();
    emit('slay:intro');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor links: smooth, with focus handoff for keyboard/screen-reader users
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? $('#top') : (id.length > 1 ? $(id) : null);
    if (!target) return;
    e.preventDefault();
    closeMenu(false);
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- hero title split ---------- */
  const slayed = $('[data-split]');
  if (slayed) {
    slayed.innerHTML = [...slayed.textContent].map((c) => `<span class="ch">${c}</span>`).join('');
  }
  const chars = $$('.hero__slayed .ch');

  function intro() {
    emit('slay:intro');
    if (reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(chars, { yPercent: 120, rotateX: -95, opacity: 0, duration: 1.3, stagger: .07 })
      .fromTo('.hero__by', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.inOut' }, '-=.8')
      .from('[data-hero-fade]', { y: 26, opacity: 0, duration: 1, stagger: .09 }, '-=1.1')
      .from('.hero__scroll', { opacity: 0, duration: .8 }, '-=.6');
  }

  // Letters bounce when you touch them
  chars.forEach((ch) => {
    const bounce = () => {
      if (reduce || gsap.isTweening(ch)) return;
      gsap.timeline()
        .to(ch, { y: -28, scaleY: 1.12, rotation: gsap.utils.random(-8, 8), duration: .22, ease: 'power2.out' })
        .to(ch, { y: 0, scaleY: 1, rotation: 0, duration: .9, ease: 'elastic.out(1, .35)' });
    };
    ch.addEventListener('pointerenter', bounce);
    ch.addEventListener('pointerdown', bounce);
  });

  /* ---------- preloader ---------- */
  const loader = $('.loader');
  if (!loader || reduce) {
    loader?.remove();
    intro();
  } else {
    lenis?.stop();
    const count = $('.loader__count span');
    const fill = $('.loader__fill');
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
    const state = { p: 0 };
    const tl = gsap.timeline({ paused: true });
    tl.to(state, {
      p: 100, duration: 1.4, ease: 'power2.inOut',
      onUpdate() { count.textContent = Math.round(state.p); fill.style.clipPath = `inset(${100 - state.p}% 0 0 0)`; }
    })
      .fromTo('.loader__script', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6 }, '-=.5')
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '+=.15')
      .add(() => { lenis?.start(); intro(); }, '-=.55')
      .add(() => loader.remove());
    fonts.then(() => tl.play());
    setTimeout(() => { if (document.contains(loader) && tl.progress() === 0) tl.play(); }, 3000);
  }

  if (reduce) {
    // Final states only; no scroll-driven motion.
    return;
  }

  /* ---------- scroll progress ---------- */
  gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* ---------- hero parallax out ---------- */
  gsap.to('.hero__inner', {
    yPercent: -18, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ---------- THE BUILD: pinned scroll story driving the 3D nail ---------- */
  const build = $('#build');
  if (build) {
    build.classList.add('is-anim');
    const steps = $$('.build__step', build);
    const bars = $$('.build__meter li', build);
    // step windows line up with the stages in scene.js (sculpt, color, shine, crystals, slayed)
    const windows = [[.04, .28], [.3, .5], [.5, .68], [.68, .86], [.86, 1.01]];
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: {
        trigger: build, start: 'top top', end: '+=450%', pin: true, scrub: .8, anticipatePin: 1,
        onUpdate: (self) => {
          window.__slayBuild = self.progress;
          bars.forEach((b, i) => b.style.setProperty('--f', Math.min(1, Math.max(0, (self.progress - windows[i][0]) / (windows[i][1] - windows[i][0])))));
        }
      }
    });
    tl.set({}, {}, 1); // total length = 1 so positions below are progress fractions
    steps.forEach((step, i) => {
      const [a, b] = windows[i];
      const last = i === steps.length - 1;
      tl.fromTo(step, { autoAlpha: 0, y: 60, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .05 }, a);
      if (!last) tl.to(step, { autoAlpha: 0, y: -60, filter: 'blur(10px)', duration: .04, ease: 'power2.in' }, b - .045);
      else {
        const letters = $('h2 span', step);
        letters.innerHTML = [...letters.textContent].map((c) => `<span class="ch" style="display:inline-block">${c}</span>`).join('');
        tl.from($$('.ch', letters), { yPercent: 120, rotateX: -90, opacity: 0, stagger: .008, duration: .06, ease: 'back.out(2)' }, a + .01);
      }
    });
    tl.to('.build__hint', { autoAlpha: 0, duration: .05 }, .9);
    window.addEventListener('slay:slayed', () => burst($('.build__step--final .btn')));
  }

  /* ---------- reveals ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 60, opacity: 0, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  // Headings: the script word "writes" itself in
  $$('.duo__script').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.inOut',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- neon signs flicker on ---------- */
  $$('.neon').forEach((el) => {
    el.classList.add('is-off');
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => { el.classList.remove('is-off'); el.classList.add('is-lit'); }
    });
  });

  /* ---------- counters ---------- */
  $$('[data-count]').forEach((el) => {
    const n = +el.dataset.count, o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, {
      v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* ---------- marquees react to scroll speed ---------- */
  $$('[data-marquee]').forEach((row) => {
    const dir = +row.dataset.marquee;
    const inner = document.createElement('div');
    inner.style.cssText = 'display:flex;gap:inherit;align-items:center;width:max-content;will-change:transform';
    inner.append(...row.childNodes);
    const copy = inner.innerHTML;
    inner.innerHTML = copy + copy + copy;
    row.appendChild(inner);
    const tween = gsap.fromTo(inner, { xPercent: dir > 0 ? 0 : -33.333 }, { xPercent: dir > 0 ? -33.333 : 0, duration: 28, ease: 'none', repeat: -1 });
    let boost = 1;
    ScrollTrigger.create({
      onUpdate: (self) => {
        boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6);
        tween.timeScale(boost * (self.direction || 1));
        gsap.to(tween, { timeScale: self.direction || 1, duration: 1.2, overwrite: true, delay: .05 });
      }
    });
  });

  /* ---------- clock hands spin through the section ---------- */
  if (handM && handH) {
    gsap.from(handM, { rotation: angM - 720, svgOrigin: '50 50', ease: 'none', scrollTrigger: { trigger: '.hours', start: 'top bottom', end: 'center center', scrub: 1 } });
    gsap.from(handH, { rotation: angH - 60, svgOrigin: '50 50', ease: 'none', scrollTrigger: { trigger: '.hours', start: 'top bottom', end: 'center center', scrub: 1 } });
  }

  /* ---------- policy cards stack ---------- */
  const cards = $$('.stack__card');
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: .9 + i * .012, filter: 'brightness(.55)', ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true }
    });
  });

  /* ---------- things-to-remember: horizontal ride on desktop ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    const track = $('.remember__track');
    const distance = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: '.remember', start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
    $$('.rcard', track).forEach((c) => {
      gsap.from(c, {
        rotateY: -25, rotateZ: 3, opacity: .25, scale: .9, ease: 'none', transformPerspective: 900,
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 100%', end: 'left 55%', scrub: true }
      });
    });
    return () => gsap.set(track, { clearProps: 'x' });
  });

  /* ---------- active section → nav + dots ---------- */
  const navLinks = $$('.nav__links a, .dots a');
  $$('[data-section]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => {
        if (!self.isActive) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${sec.id}`));
      }
    });
  });

  /* ---------- book title ---------- */
  gsap.from('.book__title span', {
    yPercent: 60, opacity: 0, rotateX: -50, stagger: .12, duration: 1.3, ease: 'expo.out', transformPerspective: 700,
    scrollTrigger: { trigger: '.book__title', start: 'top 85%', once: true }
  });

  /* ---------- fine-pointer toys: cursor, magnetic, tilt ---------- */
  if (finePointer) {
    const cursor = $('.cursor');
    const cx = gsap.quickTo(cursor, 'x', { duration: .45, ease: 'power3.out' });
    const cy = gsap.quickTo(cursor, 'y', { duration: .45, ease: 'power3.out' });
    addEventListener('pointermove', (e) => { cursor.classList.add('is-on'); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, label, input, [data-tilt], .hero__slayed .ch'));
    });
    window.addEventListener('slay:nailhover', (e) => cursor.classList.toggle('is-hover', e.detail));

    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .35);
        my((e.clientY - r.top - r.height / 2) * .45);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });

    $$('[data-tilt]').forEach((el) => {
      const inner = $('.tilt__inner', el);
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        inner.style.transition = 'transform .12s linear';
        inner.style.transform = `rotateY(${(px - .5) * 16}deg) rotateX(${(.5 - py) * 14}deg) scale(1.02)`;
        inner.style.setProperty('--mx', `${px * 100}%`);
        inner.style.setProperty('--my', `${py * 100}%`);
      });
      el.addEventListener('pointerleave', () => {
        inner.style.transition = '';
        inner.style.transform = '';
      });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
