/* ==========================================================================
   COACH HANS — Baseball Coach
   Page behaviour. Progressive enhancement: all content is readable with no JS
   and no motion; without JS the inquiry steps stack into one normal form.
   ========================================================================== */
(() => {
  'use strict';

  const d = document;
  const root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = !!(G && ST) && !reduce;

  if (!motion) root.classList.remove('motion');
  if (G && ST) G.registerPlugin(ST);

  /* ---------- Media slots: fall back to the labelled placeholder ---------- */
  $$('.media img').forEach((img) => {
    const fig = img.closest('.media');
    const fail = () => { fig.classList.add('is-empty'); (img.closest('picture') || img).remove(); };
    img.addEventListener('error', fail, { once: true });
    // images that already failed before this script ran (checked once the page has loaded)
    addEventListener('load', () => { if (img.isConnected && img.complete && img.naturalWidth === 0 && img.loading !== 'lazy') fail(); }, { once: true });
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToTarget = (target) => {
    if (lenis) return lenis.scrollTo(target, { offset: -20, duration: 1.2 });
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- Header: chalk-line indicator, active link, progress ---------- */
  const nav = $('#nav');
  const links = $$('.nav__links a');
  const pill = $('.nav__pill');
  const movePill = (a) => {
    if (!a) { pill.style.opacity = '0'; return; }
    pill.style.width = `${a.offsetWidth - 24}px`;
    pill.style.transform = `translateX(${a.offsetLeft + 12}px)`;
    pill.style.opacity = '1';
  };
  links.forEach((a) => {
    a.addEventListener('pointerenter', () => movePill(a));
    a.addEventListener('focus', () => movePill(a));
  });
  $('.nav__links').addEventListener('pointerleave', () => movePill(null));
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = `#${en.target.id}`;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => secIO.observe(s));

  /* ---------- Menu ---------- */
  const menu = $('#menu');
  const burger = $('.nav__menu');
  $$('.menu__links li').forEach((li, i) => li.style.setProperty('--i', i));
  menu.inert = true;
  const openMenu = () => {
    const br = burger.getBoundingClientRect();
    menu.style.setProperty('--mx', `${br.left + br.width / 2}px`);
    menu.style.setProperty('--my', `${br.top + br.height / 2}px`);
    menu.classList.add('is-open');
    menu.inert = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    nav.classList.remove('is-hidden');
    lenis && lenis.stop();
    setTimeout(() => $('.menu__links a').focus({ preventScroll: true }), 300);
  };
  const closeMenu = (restoreFocus) => {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.inert = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    lenis && lenis.start();
    if (restoreFocus) burger.focus();
  };
  burger.addEventListener('click', () => (menu.classList.contains('is-open') ? closeMenu(true) : openMenu()));
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(true); });

  // focus hooks for links that land on a section ("start" = the current inquiry step)
  const focusHooks = {};
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 && d.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMenu(false);
    scrollToTarget(target);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    const key = a.dataset.focus;
    if (key) setTimeout(() => (focusHooks[key] ? focusHooks[key]() : d.getElementById(key)?.focus({ preventScroll: true })), lenis ? 1250 : 300);
  });

  /* ---------- Cursor (desktop only) ---------- */
  if (fine) {
    root.classList.add('has-cursor');
    const cur = $('.cursor');
    const label = $('.cursor__label');
    const setPos = G
      ? (() => {
          G.set(cur, { x: -100, y: -100 });
          const xTo = G.quickTo(cur, 'x', { duration: reduce ? 0 : 0.2, ease: 'power3' });
          const yTo = G.quickTo(cur, 'y', { duration: reduce ? 0 : 0.2, ease: 'power3' });
          return (x, y) => { xTo(x); yTo(y); };
        })()
      : (x, y) => { cur.style.transform = `translate(${x}px, ${y}px)`; };
    addEventListener('pointermove', (e) => setPos(e.clientX, e.clientY), { passive: true });
    d.addEventListener('pointerover', (e) => {
      const t = e.target;
      if (t.closest('input, textarea, select')) { cur.classList.add('is-hidden'); return; }
      cur.classList.remove('is-hidden');
      const interactive = t.closest('a, button, label');
      const el = t.closest('[data-cursor]');
      // a label shows over labelled areas, and over controls that carry their own label (gallery "View")
      const text = el && (!interactive || interactive === el || interactive.contains(el)) ? el.dataset.cursor : '';
      label.textContent = text;
      cur.classList.toggle('is-label', !!text);
      cur.classList.toggle('is-hover', !text && !!interactive);
    });
    root.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
    root.addEventListener('pointerenter', () => cur.classList.remove('is-hidden'));
  }

  if (fine && motion) {
    $$('[data-magnetic]').forEach((el) => {
      const xTo = G.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      const yTo = G.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.15);
        yTo((e.clientY - r.top - r.height / 2) * 0.25);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Split headings into words ---------- */
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(' ')); return; }
            const w = d.createElement('span');
            const inner = d.createElement('span');
            w.className = 'w';
            inner.className = 'w__in';
            inner.style.setProperty('--wi', i++);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  };
  if (motion) $$('.split').forEach(splitWords);

  /* Small helper: move an absolutely positioned marker between % coordinates */
  const setXY = (el, [x, y]) => { el.style.left = `${x}%`; el.style.top = `${y}%`; };

  /* ==========================================================================
     HERO — field geometry draws, headline rises, the photo opens, the base
     path draws over it, then a ball runs Home → 1st → 2nd → 3rd → Home
     ========================================================================== */
  const hero = $('.hero');
  const heroPhoto = $('.hero__photo');
  const runner = $('.hero__runner');
  const hBases = $$('.hbase', heroPhoto);          // home, 1st, 2nd, 3rd
  const chipBases = $$('.hchip__bases b');         // Home, 1st, 2nd, 3rd, Home
  const RUN = hBases.map((b) => [parseFloat(b.style.getPropertyValue('--x')), parseFloat(b.style.getPropertyValue('--y'))]);
  RUN.push(RUN[0]);
  const reach = (k) => {
    hBases.forEach((b, i) => b.classList.toggle('is-hit', i === k % 4));
    chipBases.forEach((b, i) => { b.classList.toggle('is-on', i === k); b.classList.toggle('is-done', i < k); });
  };
  setXY(runner, RUN[0]);

  if (motion) {
    const tl = G.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
    tl.add(() => hero.classList.add('is-in'), 0)
      .fromTo('.hero__eyebrow', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0)
      .to('.hero__title .line__in', { y: 0, yPercent: 0, duration: 1.2, stagger: 0.12 }, 0.1)
      .add(() => heroPhoto.classList.add('in'), 0.25)
      .add(() => $$('.hero .fade').forEach((el, i) => setTimeout(() => el.classList.add('in'), i * 110)), 0.55)
      .fromTo(runner, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 2.1)
      .add(() => reach(0), 2.1);
    RUN.slice(1).forEach((p, i) => {
      tl.to(runner, { left: `${p[0]}%`, top: `${p[1]}%`, rotation: `+=${200}`, duration: 0.5, ease: 'power1.inOut', onComplete: () => reach(i + 1) }, 2.55 + i * 0.6);
    });
    G.to('.hero__visual', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  } else {
    reach(4);
    hBases.forEach((b) => b.classList.remove('is-hit'));
    hBases[0].classList.add('is-hit');
  }

  /* ==========================================================================
     Scroll reveals & effects
     ========================================================================== */
  if (motion) {
    const once = (el, fn, start = 'top 86%') => ST.create({ trigger: el, start, once: true, onEnter: fn });
    const notHero = (el) => !el.closest('.hero');

    $$('.split').forEach((el) => once(el, () => { el.classList.add('in'); const m = $('.mark', el); if (m) m.classList.add('in'); }));
    $$('.fade').filter(notHero).forEach((el) => once(el, () => el.classList.add('in')));
    $$('.reveal-img').filter(notHero).forEach((el) => once(el, () => el.classList.add('in'), 'top 82%'));
    $$('.seam').forEach((el) => once(el, () => el.classList.add('in'), 'top 90%'));
    $$('.snap__row').forEach((el) => once(el, () => el.classList.add('in'), 'top 80%'));
    once($('#diamond'), () => $('#diamond').classList.add('in'), 'top 78%');
    $$('.zones').forEach((group) => $$('.fade', group).forEach((el, i) => { el.style.transitionDelay = `${(i % 2) * 0.08}s`; }));

    // At a glance: the field photo drifts inside its frame
    G.fromTo('.snap__media img', { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.snap', start: 'top bottom', end: 'bottom top', scrub: true } });

    // About intro fills in word by word
    const intro = $('.about__intro');
    intro.innerHTML = intro.textContent.trim().split(/\s+/).map((w) => `<span class="fw">${w}</span>`).join(' ');
    G.fromTo($$('.fw', intro), { opacity: 0.16 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: intro, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });

    // Training overview: horizontal track on desktop; a baseball rolls along the rail
    // and each training option lights up as the ball reaches it
    const tour = $('.tour');
    const track = $('.tour__track');
    const stops = $$('.stop');
    const tBall = $('.tour__ball');
    const tLine = $('.tour__line');
    const marks = $$('.tour__marks i');
    G.matchMedia().add('(min-width: 1024px)', () => {
      tour.classList.add('is-h');
      const dist = () => track.scrollWidth - innerWidth;
      let thresholds = [];
      const placeMarks = () => {
        const D = dist();
        const w = tLine.offsetWidth - tBall.offsetWidth;
        thresholds = stops.map((s) => Math.min(1, Math.max(0, (s.offsetLeft - innerWidth * 0.62) / D)));
        marks.forEach((m, i) => { m.style.left = `${thresholds[i] * w + tBall.offsetWidth / 2}px`; });
      };
      const tween = G.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: $('.tour__pin'), start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onRefresh: placeMarks,
          onUpdate: (self) => {
            const w = tLine.offsetWidth - tBall.offsetWidth;
            const x = self.progress * w;
            tLine.style.setProperty('--p', self.progress.toFixed(4));
            G.set(tBall, { x, rotation: (x / (tBall.offsetWidth / 2)) * (180 / Math.PI) });
            stops.forEach((s, i) => { const on = self.progress >= thresholds[i] - 0.001; s.classList.toggle('is-on', on); marks[i].classList.toggle('is-on', on); });
          },
        },
      });
      return () => { tour.classList.remove('is-h'); tween.kill(); G.set(track, { clearProps: 'transform' }); stops.forEach((s) => s.classList.remove('is-on')); };
    });
    // Vertical timeline (tablet / mobile): options light up as they reach the reading line
    G.matchMedia().add('(max-width: 1023px)', () => {
      const triggers = stops.map((s) => ST.create({ trigger: s, start: 'top 70%', onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') }));
      return () => triggers.forEach((t) => t.kill());
    });

    // Gallery feature grows to full width
    G.fromTo('.reel__feature', { clipPath: 'inset(0% 14% 0% 14% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none',
      scrollTrigger: { trigger: '.reel', start: 'top 90%', end: 'center 55%', scrub: true },
    });
    G.fromTo('.reel__feature img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.reel', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Kinetic band
    const rows = $$('.kinetic__row').map((row, i) => {
      const t = $('.kinetic__track', row);
      t.innerHTML += t.innerHTML;
      return { row, t, x: i ? -t.scrollWidth / 4 : 0, dir: i ? 1 : -1 };
    });
    let skew = 0, kOn = false;
    new IntersectionObserver(([en]) => { kOn = en.isIntersecting; }).observe($('.kinetic'));
    G.ticker.add(() => {
      if (!kOn) return;
      const v = lenis ? lenis.velocity : 0;
      skew += (Math.max(-8, Math.min(8, v * 0.35)) - skew) * 0.12;
      rows.forEach((r) => {
        const half = r.t.scrollWidth / 2;
        r.x += r.dir * (0.6 + Math.abs(v) * 0.4);
        if (r.x <= -half) r.x += half;
        if (r.x > 0) r.x -= half;
        r.t.style.transform = `translate3d(${r.x}px,0,0)`;
        r.row.style.transform = `skewX(${-skew}deg)`;
      });
    });

    once($('.fcta__title'), () => G.to('.fcta__title .line__in', { y: 0, yPercent: 0, duration: 1.2, stagger: 0.14, ease: 'expo.out' }), 'top 85%');

    ST.sort();
    d.fonts && d.fonts.ready.then(() => { ST.sort(); ST.refresh(); });
  }

  /* ==========================================================================
     Coaching approach — one ball trajectory joins the steps. It draws as you
     scroll; each step lights up as the ball reaches it.
     ========================================================================== */
  const jStage = $('.journey__stage');
  const jSvg = $('.journey__path');
  const jBase = $('.journey__base');
  const jDraw = $('.journey__draw');
  const jBall = $('.journey__ball');
  const jSteps = $$('.jstep');
  const jDots = $$('.jstep__dot');
  const journey = { L: 0, t: motion ? 0 : 1, marks: [] };
  const placeJourney = () => {
    const t = journey.t;
    jDraw.style.strokeDashoffset = journey.L * (1 - t);
    if (journey.L) {
      const p = jDraw.getPointAtLength(journey.L * t);
      jBall.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${t * 720}deg)`;
    }
    jSteps.forEach((s, i) => s.classList.toggle('is-on', t >= journey.marks[i] - 0.005));
  };
  const layoutJourney = () => {
    const g = jStage.getBoundingClientRect();
    const pts = jDots.map((dot) => { const r = dot.getBoundingClientRect(); return [r.left - g.left + r.width / 2, r.top - g.top + r.height / 2]; });
    let dStr = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    const partial = [dStr];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
      // arc like a fly ball: bulge perpendicular to the segment, always "upward" / outward
      const k = Math.min(160, len * 0.32) * (dx >= 0 ? 1 : -1);
      const cx = mx + (dy / len) * k, cy = my - (Math.abs(dx) / len) * Math.abs(k);
      dStr += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
      partial.push(dStr);
    }
    jSvg.setAttribute('viewBox', `0 0 ${g.width} ${g.height}`);
    jBase.setAttribute('d', dStr);
    jDraw.setAttribute('d', dStr);
    journey.L = jDraw.getTotalLength();
    jDraw.style.strokeDasharray = journey.L;
    const tmp = d.createElementNS('http://www.w3.org/2000/svg', 'path');
    jSvg.appendChild(tmp);
    journey.marks = partial.map((p) => { tmp.setAttribute('d', p); return journey.L ? tmp.getTotalLength() / journey.L : 0; });
    tmp.remove();
    placeJourney();
  };
  layoutJourney();
  d.fonts && d.fonts.ready.then(layoutJourney);
  if (motion) {
    ST.create({
      trigger: jStage, start: 'top 75%', end: 'bottom 55%', scrub: 0.8,
      onUpdate: (self) => { journey.t = self.progress; placeJourney(); },
    });
  }

  /* ==========================================================================
     Selection memory — what a visitor picks in the training explorer or the
     player-development diamond is carried into the inquiry form (and kept for
     the rest of the visit).
     ========================================================================== */
  const form = $('#inquiryForm');
  const carry = $('.inq__carry');
  const STORE = 'coachHans.selection';
  const flash = (el) => { el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash'); };
  const updateCarry = () => {
    const interest = $('input[name="interest"]:checked', form);
    const goals = $$('input[name="goal"]:checked', form).map((g) => g.value);
    const parts = [interest && interest.value, goals.length && goals.join(', ')].filter(Boolean);
    carry.hidden = !parts.length;
    $('b', carry).textContent = parts.join(' · ');
    try { sessionStorage.setItem(STORE, JSON.stringify({ interest: interest ? interest.value : '', goals })); } catch (e) { /* storage unavailable */ }
  };
  const setInterest = (value, show = true) => {
    const r = $$('input[name="interest"]', form).find((x) => x.value === value);
    if (!r) return;
    r.checked = true;
    if (show) setTimeout(() => flash(r.closest('.ocard')), lenis ? 900 : 200);
  };
  const addGoals = (list, show = true) => list.forEach((value) => {
    const box = $$('input[name="goal"]', form).find((x) => x.value === value);
    if (!box) return;
    box.checked = true;
    if (show) setTimeout(() => flash(box.closest('.chip-opt')), lenis ? 900 : 200);
  });
  const remember = ({ interest, goal }) => {
    if (interest) setInterest(interest);
    if (goal) addGoals(goal.split(','));
    updateCarry();
    if (!carry.hidden) setTimeout(() => flash(carry), lenis ? 1100 : 250);
  };
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-interest], a[data-goal]');
    if (a) remember({ interest: a.dataset.interest, goal: a.dataset.goal });
  });
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (saved) { if (saved.interest) setInterest(saved.interest, false); addGoals(saved.goals || [], false); }
  } catch (e) { /* storage unavailable */ }
  form.addEventListener('change', (e) => { if (e.target.name === 'interest' || e.target.name === 'goal') updateCarry(); });
  updateCarry();

  /* ==========================================================================
     Player development — choose a base: the ball runs the base path to it
     (or flies out to the outfield), the photo wipes open from that corner and
     the copy + accent colour change. The CTA carries the area into the form.
     ========================================================================== */
  const devSec = $('.dev');
  const diamond = $('#diamond');
  const bases = $$('.base', diamond);
  const panes = $$('.dpane');
  const devPhoto = $('.dev__photo');
  const devImgs = $$('img', devPhoto);
  const devCta = $('.dev__cta');
  const dMarker = $('.diamond__marker');
  const BASE_XY = bases.map((b) => [parseFloat(b.style.getPropertyValue('--x')), parseFloat(b.style.getPropertyValue('--y'))]);
  let devActive = 0;
  let markerXY = BASE_XY[0];
  let markerTl = null;
  setXY(dMarker, markerXY);

  const moveMarker = (from, to) => {
    markerTl && markerTl.kill();
    if (!motion) { markerXY = BASE_XY[to]; setXY(dMarker, markerXY); return; }
    markerTl = G.timeline();
    const onPath = (i) => i < 4;
    if (onPath(from) && onPath(to)) {
      // run the bases in order (counter-clockwise), touching each one on the way
      for (let i = from; i !== to;) {
        i = (i + 1) % 4;
        markerTl.to(dMarker, { left: `${BASE_XY[i][0]}%`, top: `${BASE_XY[i][1]}%`, rotation: '+=180', duration: 0.38, ease: 'power1.inOut' });
      }
      markerXY = BASE_XY[to];
    } else {
      // a fly ball: arc from wherever the ball is to the new spot
      const [sx, sy] = markerXY;
      const [ex, ey] = BASE_XY[to];
      const cx = (sx + ex) / 2, cy = Math.min(sy, ey) - 22;
      const o = { t: 0 };
      markerTl.to(o, {
        t: 1, duration: 0.85, ease: 'power2.inOut',
        onUpdate: () => {
          const t = o.t, u = 1 - t;
          setXY(dMarker, [u * u * sx + 2 * u * t * cx + t * t * ex, u * u * sy + 2 * u * t * cy + t * t * ey]);
        },
      }).to(dMarker, { rotation: '+=360', duration: 0.85, ease: 'power2.inOut' }, 0)
        .fromTo(dMarker, { scale: 1 }, { scale: 1.35, duration: 0.42, ease: 'sine.out', yoyo: true, repeat: 1 }, 0);
      markerXY = BASE_XY[to];
    }
  };
  const setDev = (k) => {
    if (k === devActive) return;
    const prev = devActive;
    devActive = k;
    bases.forEach((b, i) => { b.classList.toggle('is-active', i === k); b.setAttribute('aria-pressed', String(i === k)); });
    panes.forEach((p, i) => { p.hidden = i !== k; });
    devSec.style.setProperty('--acc', panes[k].dataset.acc);
    devPhoto.style.setProperty('--cx', `${BASE_XY[k][0]}%`);
    devPhoto.style.setProperty('--cy', `${BASE_XY[k][1]}%`);
    devImgs.forEach((img, i) => {
      img.classList.toggle('is-prev', i === prev);
      img.classList.toggle('is-on', i === k);
    });
    devCta.dataset.goal = panes[k].dataset.goal;
    moveMarker(prev, k);
  };
  bases.forEach((b, i) => b.addEventListener('click', () => setDev(i)));
  // the alternate photos (here and in the explorer) are hidden until chosen, so lazy loading
  // would only fetch them on click — fetch them quietly once the page has finished loading
  const warm = () => [...devImgs, ...$$('.xpane img')].forEach((img) => { img.loading = 'eager'; });
  addEventListener('load', () => (window.requestIdleCallback ? requestIdleCallback(warm, { timeout: 3000 }) : setTimeout(warm, 1500)), { once: true });
  // arrow keys step around the field
  diamond.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step || !e.target.closest('.base')) return;
    e.preventDefault();
    const k = (devActive + step + bases.length) % bases.length;
    setDev(k);
    bases[k].focus();
  });

  /* ==========================================================================
     Training explorer — a lineup card of training types; a baseball moves to
     the selected row and the scoreboard panel flips over. The selection is
     remembered for the inquiry form.
     ========================================================================== */
  const xpTabs = $$('.xp__opt');
  const xpPanes = $$('.xpane');
  const xpBall = $('.xp__ball');
  const xpScore = { n: $('.xp__s-n'), f: $('.xp__s-f'), s: $('.xp__s-s') };
  const XP_INTEREST = ['Private training', 'Player development', 'Group training — interest', 'Team training — interest'];
  let xpActive = 0;
  const placeXpBall = (animate) => {
    const t = xpTabs[xpActive];
    const y = t.offsetTop + t.offsetHeight / 2;
    if (G && motion && animate) G.to(xpBall, { y, rotation: `+=${y > (G.getProperty(xpBall, 'y') || 0) ? 240 : -240}`, duration: 0.6, ease: 'back.out(1.3)' });
    else if (G) G.set(xpBall, { y });
    else xpBall.style.transform = `translateY(${y}px)`;
  };
  const flip = (el, text) => {
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove('is-flip'); void el.offsetWidth; el.classList.add('is-flip');
  };
  const selectXp = (i, focus) => {
    xpActive = i;
    xpTabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      xpPanes[k].hidden = !on;
    });
    if (focus) xpTabs[i].focus();
    flip(xpScore.n, String(i + 1).padStart(2, '0'));
    flip(xpScore.f, xpTabs[i].dataset.format);
    flip(xpScore.s, xpTabs[i].dataset.status);
    placeXpBall(true);
    setInterest(XP_INTEREST[i], false);
    updateCarry();
  };
  xpTabs.forEach((t, i) => {
    t.addEventListener('click', () => selectXp(i));
    t.addEventListener('keydown', (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      selectXp((i + step + xpTabs.length) % xpTabs.length, true);
    });
  });
  placeXpBall(false);
  new ResizeObserver(() => placeXpBall(false)).observe($('.xp__opts'));

  /* ==========================================================================
     Get started — guided player / parent inquiry. One step at a time; the
     ball works its way around the bases as the form advances. Submits to the
     same Netlify Forms backend as before (AJAX on Netlify, plain POST without JS).
     ========================================================================== */
  const steps = $$('.istep', form);
  const N = steps.length;
  const nextBtn = $('.iform__next', form);
  const backBtn = $('.iform__back', form);
  const countN = $('.iform__n', form);
  const bars = $$('.iform__bar li', form);
  const run = $('.run');
  const runBall = $('.run__ball');
  const runBags = $$('.run__bag');
  const runLbls = $$('.run__lbl');
  const runStep = $('.run__step');
  const runName = $('.run__name');
  const status = $('#formStatus');
  const done = $('.iform__done', form);
  // where the ball sits for each step: home, 1st, 2nd, 3rd, rounding third, home again
  const RUN_XY = [[50, 90], [90, 50], [50, 10], [10, 50], [30, 70], [50, 90]];
  const RUN_P = [0, 0.25, 0.5, 0.75, 0.875, 1];
  let cur = 0;
  let runTl = null;
  form.classList.add('is-wizard');
  setXY(runBall, RUN_XY[0]);

  const MSG = {
    player_name: 'Please enter the player\'s name.',
    player_age: 'Please enter the player\'s age.',
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
  };
  const validateField = (el) => {
    const err = d.getElementById(`${el.id}-err`);
    const ok = el.value.trim() !== '' && el.checkValidity();
    el.setAttribute('aria-invalid', String(!ok));
    if (err) {
      err.textContent = ok ? '' : MSG[el.name] || 'Please check this field.';
      if (!ok) el.setAttribute('aria-describedby', err.id); else el.removeAttribute('aria-describedby');
    }
    return ok;
  };
  $$('input[required]:not([type="radio"])', form).forEach((el) => {
    el.addEventListener('blur', () => { if (el.value || el.getAttribute('aria-invalid') === 'true') validateField(el); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validateField(el); });
  });
  const stepError = (i, text) => { const e = $('.istep__err', steps[i]); if (e) e.textContent = text; };
  const validateStep = (i, quiet) => {
    const s = steps[i];
    const group = (name, text) => {
      const ok = !!$(`input[name="${name}"]:checked`, s);
      if (!quiet) stepError(i, ok ? '' : text);
      if (!ok && !quiet) $(`input[name="${name}"]`, s).focus();
      return ok;
    };
    if ($('input[name="role"]', s)) return group('role', 'Please choose one option.');
    if ($('input[name="interest"]', s)) return group('interest', 'Please choose a training interest — "Not sure" is fine too.');
    if ($('input[name="goal"]', s)) return group('goal', 'Please choose at least one — "Not sure" is fine too.');
    const fields = $$('input[required]', s);
    if (quiet) return fields.every((el) => el.value.trim() !== '' && el.checkValidity());
    let firstBad = null;
    fields.forEach((el) => { if (!validateField(el) && !firstBad) firstBad = el; });
    if (firstBad) firstBad.focus();
    return !firstBad;
  };
  // clear a group's error as soon as something is chosen
  form.addEventListener('change', (e) => { const s = e.target.closest('.istep'); if (s && e.target.type !== 'text') stepError(steps.indexOf(s), ''); });

  // A team rep may be asking about a team rather than one player
  const playerLbl = $('.f-player-lbl', form);
  const ageLbl = $('.f-age-lbl', form);
  form.addEventListener('change', (e) => {
    if (e.target.name !== 'role') return;
    const team = e.target.value === 'Coach / team representative';
    playerLbl.textContent = team ? 'Player or team name' : 'Player name';
    ageLbl.textContent = team ? 'Player age (or age range)' : 'Player age';
  });

  const moveRun = (from, to) => {
    runTl && runTl.kill();
    if (!motion || from === to) { setXY(runBall, RUN_XY[to]); return; }
    runTl = G.timeline();
    const dir = to > from ? 1 : -1;
    for (let i = from; i !== to;) {
      i += dir;
      runTl.to(runBall, { left: `${RUN_XY[i][0]}%`, top: `${RUN_XY[i][1]}%`, rotation: `+=${dir * 200}`, duration: 0.42, ease: 'power1.inOut' });
    }
  };
  const valueOf = (name) => { const el = form.elements[name]; return el ? String(el.value || '').trim() : ''; };
  const fillReview = () => {
    const role = $('input[name="role"]:checked', form);
    const interest = $('input[name="interest"]:checked', form);
    const goals = $$('input[name="goal"]:checked', form).map((g) => g.value);
    const age = valueOf('player_age');
    const msg = valueOf('message');
    const set = (k, v) => { $(`[data-r="${k}"]`, form).textContent = v; };
    set('player', [valueOf('player_name') + (age ? ` · Age ${age}` : ''), role ? `Asking as: ${role.value}` : ''].filter(Boolean).join('\n'));
    set('interest', interest ? interest.value : '');
    set('goal', goals.join(', '));
    set('contact', [valueOf('name'), valueOf('email'), valueOf('phone'), msg && `“${msg}”`].filter(Boolean).join('\n'));
  };
  const focusStep = () => {
    if (form.classList.contains('is-sent')) { done.focus({ preventScroll: true }); return; }
    $('.istep__t', steps[cur]).focus({ preventScroll: true });
  };
  focusHooks.start = focusStep;

  const go = (j, opts = {}) => {
    j = Math.max(0, Math.min(N - 1, j));
    const from = cur;
    cur = j;
    steps.forEach((s, i) => { s.classList.toggle('is-active', i === j); s.classList.toggle('is-back', !!opts.back); });
    backBtn.hidden = j === 0;
    form.classList.toggle('is-last', j === N - 1);
    countN.textContent = j + 1;
    bars.forEach((b, i) => { b.classList.toggle('is-done', i < j); b.classList.toggle('is-on', i === j); });
    run.style.setProperty('--p', RUN_P[j]);
    runBags.forEach((b, i) => b.classList.toggle('is-on', i === 0 ? j === N - 1 : j >= i));
    runLbls.forEach((l, i) => { l.classList.toggle('is-done', j > i); l.classList.toggle('is-now', j === i); });
    runStep.textContent = `Step ${j + 1} of ${N}`;
    runName.textContent = steps[j].dataset.name;
    runName.classList.remove('is-swap'); void runName.offsetWidth; runName.classList.add('is-swap');
    moveRun(from, j);
    if (j === N - 1) fillReview();
    if (opts.focus === false) return;
    focusStep();
    // keep the top of the form in view when a step changes (mainly on phones)
    const top = form.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.6) scrollToTarget(form);
  };
  nextBtn.addEventListener('click', () => { if (validateStep(cur)) go(cur + 1); });
  backBtn.addEventListener('click', () => go(cur - 1, { back: true }));
  $$('.review__edit', form).forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.go), { back: true })));
  // Enter moves forward instead of submitting half a form
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || cur === N - 1) return;
    if (e.target.matches('textarea, button, a')) return;
    e.preventDefault();
    nextBtn.click();
  });
  go(0, { focus: false });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    for (let i = 0; i < N - 1; i++) {
      if (!validateStep(i, true)) { go(i, { back: true }); validateStep(i); return; }
    }
    const data = new FormData(form);
    const first = String(data.get('name') || '').trim().split(/\s+/)[0];
    // On Netlify the form posts to Netlify Forms; opened locally, nothing is sent
    const local = ['localhost', '127.0.0.1', ''].includes(location.hostname) || location.protocol === 'file:';
    const btn = $('[type="submit"]', form);
    btn.disabled = true;
    status.classList.remove('is-error');
    status.textContent = '';
    try {
      if (!local) {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(),
        });
        if (!res.ok) throw new Error(res.statusText);
      }
      $('.iform__done-p', form).textContent = local
        ? `Thanks, ${first}. (Preview mode — the form sends for real once the site is live on Netlify.)`
        : `Thanks, ${first}. Your coaching inquiry is on its way to Coach Hans, who will reply by email${valueOf('phone') ? ' or phone' : ''}.`;
      form.classList.add('is-sent');
      done.hidden = false;
      run.style.setProperty('--p', 1);
      runBags.forEach((b) => b.classList.add('is-on'));
      runStep.textContent = 'Inquiry sent';
      runName.textContent = 'Safe at home';
      done.focus({ preventScroll: true });
      if (form.getBoundingClientRect().top < 0) scrollToTarget(form);
    } catch (err) {
      status.textContent = 'Something went wrong sending your inquiry. Please try again in a moment.';
      status.classList.add('is-error');
    }
    btn.disabled = false;
  });
  $('.iform__again', form).addEventListener('click', () => {
    form.reset();
    $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
    form.classList.remove('is-sent');
    done.hidden = true;
    updateCarry();
    go(0);
  });

  /* ==========================================================================
     Gallery viewer — a larger look at any frame
     ========================================================================== */
  const lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const lbImg = $('img', lb);
    const lbCap = $('.lightbox__cap', lb);
    let opener = null;
    $$('.tile__open').forEach((btn) => btn.addEventListener('click', () => {
      const fig = btn.closest('figure');
      const img = $('img', fig);
      const cap = $('figcaption', fig);
      opener = btn;
      lbImg.src = btn.dataset.full;
      lbImg.alt = img ? img.alt : '';
      lbCap.innerHTML = cap ? cap.innerHTML : '';
      lb.showModal();
      lenis && lenis.stop();
    }));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => { lenis && lenis.start(); opener && opener.focus({ preventScroll: true }); });
  } else {
    $$('.tile__open').forEach((btn) => btn.remove());
  }

  /* ==========================================================================
     Header & footer extras
     ========================================================================== */

  // Logo intro: plays once on load (header) and once when the footer logo
  // first comes into view — no repeats
  if (motion) {
    const playLogo = (el) => { if (!el.classList.contains('is-anim')) el.classList.add('is-anim'); };
    const navLogo = $('.nav .logo');
    const footLogo = $('.flogo');
    playLogo(navLogo);
    const footIO = new IntersectionObserver(([en]) => { if (en.isIntersecting) { footIO.disconnect(); playLogo(footLogo); } }, { threshold: 0.6 });
    footIO.observe(footLogo);
  }

  // Ticker loops seamlessly
  const tickerTrack = $('.nav__ticker-track');
  if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;

  // Rolling text on hover
  $$('.nav__links a, .flink').forEach((a) => {
    const t = a.textContent.trim();
    const roll = d.createElement('span');
    const inner = d.createElement('span');
    roll.className = 'roll';
    roll.dataset.text = t;
    inner.textContent = t;
    roll.appendChild(inner);
    a.replaceChildren(roll);
  });

  // Footer wordmark: a spotlight follows the cursor and drifts on its own when idle
  const fword = $('.fword');
  if (fword) {
    let last = 0, on = false;
    const drift = (t) => {
      if (!on) return;
      if (!reduce && t - last > 2000) {
        const r = fword.getBoundingClientRect();
        fword.style.setProperty('--mx', `${r.width * (0.5 + Math.sin(t / 1600) * 0.42)}px`);
        fword.style.setProperty('--my', `${r.height * (0.5 + Math.cos(t / 1100) * 0.25)}px`);
      }
      requestAnimationFrame(drift);
    };
    fword.parentElement.addEventListener('pointermove', (e) => {
      const r = fword.getBoundingClientRect();
      fword.style.setProperty('--mx', `${e.clientX - r.left}px`);
      fword.style.setProperty('--my', `${e.clientY - r.top}px`);
      last = performance.now();
    });
    new IntersectionObserver(([en]) => { on = en.isIntersecting; if (on) requestAnimationFrame(drift); }).observe(fword);
  }

  // Back to top
  const topBtn = $('.ftop');
  if (topBtn) topBtn.addEventListener('click', () => { scrollToTarget($('#top')); $('.logo').focus({ preventScroll: true }); });

  // Layout-dependent pieces follow resizes
  let rz = 0;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { layoutJourney(); placeXpBall(false); motion && ST.refresh(); }); });

  /* ==========================================================================
     Header state
     ========================================================================== */
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const max = root.scrollHeight - innerHeight;
    nav.style.setProperty('--prog', (max > 0 ? y / max : 0).toFixed(4));
    nav.classList.toggle('is-solid', y > 30);
    if (!menu.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > innerHeight * 0.8);
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
})();
