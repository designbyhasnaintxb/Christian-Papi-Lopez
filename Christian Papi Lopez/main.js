/* ==========================================================================
   VAMOSPICKLE — page behaviour
   Progressive enhancement: every section reads fine with no JS and no motion;
   without JS the inquiry steps simply stack into one normal form.
   ========================================================================== */
(() => {
  'use strict';

  const d = document;
  const root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];

  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = !!(G && ST) && !reduce;
  if (!motion) root.classList.remove('motion');
  if (G && ST) G.registerPlugin(ST);

  /* ---------- Media slots: show the labelled placeholder until real files exist ---------- */
  $$('.media img').forEach((img) => {
    const fig = img.closest('.media');
    const fail = () => { fig.classList.add('is-empty'); img.style.visibility = 'hidden'; };
    img.addEventListener('error', fail, { once: true });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') fail();
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Logo loop (SMIL): freeze in its landed state for reduced motion ---------- */
  if (reduce) $$('svg.wm').forEach((s) => { try { s.setCurrentTime(2); s.pauseAnimations(); } catch (e) { /* no SMIL */ } });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.1 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
    history.replaceState(null, '', id);
  }));

  /* ---------- Header: hide on scroll down, active section link ---------- */
  const nav = $('#nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-hidden', y > 400 && y > lastY + 4 && !menuOpen);
    if (y < lastY - 4 || y < 400) nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  const navLinks = $$('.nav__links a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s) io.observe(s); });
  const heroSec = $('#top');
  if (heroSec) new IntersectionObserver((en) => { if (en[0].isIntersecting) navLinks.forEach((a) => a.classList.remove('is-active')); }, { rootMargin: '-45% 0px -50% 0px' }).observe(heroSec);

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('.nav__menu');
  const menu = $('#menu');
  let menuOpen = false;
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start();
    d.body.style.overflow = '';
  }
  menuBtn.addEventListener('click', () => {
    if (menuOpen) { closeMenu(); menuBtn.focus(); return; }
    menuOpen = true;
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    if (lenis) lenis.stop();
    d.body.style.overflow = 'hidden';
    const first = $('a', menu); if (first) first.focus();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { closeMenu(); menuBtn.focus(); } });

  /* ---------- Hero: intro + the Vamos Path ball loop ---------- */
  const heroPath = $('#heroPath');
  const heroBall = $('.hero__ball');
  const heroLand = $('.hero__land');
  if (motion) {
    const tl = G.timeline({ defaults: { ease: 'expo.out' } });
    const heroClip = matchMedia('(max-width: 900px)').matches
      ? 'polygon(0% 0%, 100% 0%, 100% 100%, 10% 100%, 0% 84%)'
      : 'polygon(0% 0%, 100% 0%, 100% 100%, 14% 100%, 0% 86%)';
    tl.to('.hero .line__in', { y: 0, duration: 1.1, stagger: 0.08 })
      .to('.media--hero', { clipPath: heroClip, duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .to('.hc path:not(.hc__net)', { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'power2.inOut' }, 0.4)
      .fromTo('.hero__speed i', { xPercent: -110, opacity: 1 }, { xPercent: 380, opacity: 0, duration: 1.6, stagger: 0.15, ease: 'power2.inOut' }, 0.2)
      .to('.hero .reveal', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.55);

    if (heroPath && heroBall) {
      const len = heroPath.getTotalLength();
      const p = { t: 0 };
      const place = () => {
        const pt = heroPath.getPointAtLength(p.t * len);
        heroBall.setAttribute('cx', pt.x); heroBall.setAttribute('cy', pt.y);
      };
      const loop = G.timeline({ repeat: -1, repeatDelay: 4.2, delay: 1.6 });
      loop.set(heroBall, { opacity: 1 })
        .fromTo(p, { t: 0 }, { t: 1, duration: 1.15, ease: 'power1.inOut', onUpdate: place })
        .fromTo(heroLand, { opacity: 0.9, attr: { r: 5 } }, { opacity: 0, attr: { r: 26 }, duration: 0.9, ease: 'power2.out' })
        .to(heroBall, { opacity: 0, duration: 0.4 }, '+=0.8');
      ST.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? loop.play() : loop.pause()) });
    }
  } else if (heroBall && heroPath) {
    const end = heroPath.getPointAtLength(heroPath.getTotalLength());
    heroBall.setAttribute('cx', end.x); heroBall.setAttribute('cy', end.y);
  }

  /* ---------- Scroll reveals + the recurring path ---------- */
  if (motion) {
    $$('.sec-head, .papi__copy, .aud__card, .collab__item, .words__big, .prod').forEach((el) => {
      G.from(el, { y: 36, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.vpath').forEach((p) => {
      G.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: p.closest('svg'), start: 'top 85%', end: 'bottom 55%', scrub: 0.6 } });
    });
    if (fine) {
      G.to('.media--portrait img', { yPercent: -6, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.papi', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  }

  /* ---------- 03 Training formats: tabs + scaling court ---------- */
  const svgNS = 'http://www.w3.org/2000/svg';
  const court = $('#court');
  const dotsG = $('#courtDots');
  const courtGroups = court ? $$('.court__grid > g', court) : [];
  const OFF = [[0, 0], [480, 0], [0, 260], [480, 260]];
  const SINGLE = [-30, -40, 500, 280];
  const MULTI = [-30, -40, 980, 540];
  const at = (c, x, y) => [OFF[c][0] + x, OFF[c][1] + y];
  const POST = [220, -24]; // coach on the sideline at the net post
  const doubles = [[90, 55], [90, 145], [350, 55], [350, 145]];
  const LAYOUTS = {
    private: { view: SINGLE, courts: [0], coaches: [at(0, 300, 100)], players: [at(0, 110, 100)], kind: 'player' },
    small: { view: SINGLE, courts: [0], coaches: [at(0, ...POST)], players: doubles.map(([x, y]) => at(0, x, y)), kind: 'player' },
    clinic: { view: SINGLE, courts: [0], coaches: [at(0, ...POST)], players: [[50, 50], [50, 150], [120, 50], [120, 150], [320, 50], [320, 150], [390, 50], [390, 150]].map(([x, y]) => at(0, x, y)), kind: 'player' },
    large: { view: MULTI, courts: [0, 1, 2, 3], coaches: [0, 1, 2, 3].map((c) => at(c, ...POST)), players: [0, 1, 2, 3].flatMap((c) => doubles.map(([x, y]) => at(c, x, y))), kind: 'player' },
    youth: {
      view: MULTI, courts: [0, 1, 2],
      coaches: [at(0, 300, 100), at(1, 300, 100), at(2, 300, 100)],
      players: [
        ...[30, 65, 100, 135, 170].map((y) => at(0, 60, y)),
        ...[[60, 50], [60, 150], [130, 50], [130, 150]].map(([x, y]) => at(1, x, y)),
        ...[[50, 40], [50, 100], [50, 160], [120, 40], [120, 100], [120, 160]].map(([x, y]) => at(2, x, y)),
      ],
      kind: 'youth',
    },
  };

  if (court && dotsG) {
    const mk = (cls) => {
      const g = d.createElementNS(svgNS, 'g');
      g.setAttribute('class', `cdot ${cls} is-off`);
      g.style.transform = 'translate(220px, 100px)';
      const c = d.createElementNS(svgNS, 'circle');
      c.setAttribute('r', cls === 'cdot--coach' ? 15 : 12);
      g.appendChild(c);
      dotsG.appendChild(g);
      return g;
    };
    const coachDots = Array.from({ length: 4 }, () => mk('cdot--coach'));
    const playerDots = Array.from({ length: 16 }, () => mk('cdot--player'));
    const vb = { x: SINGLE[0], y: SINGLE[1], w: SINGLE[2], h: SINGLE[3] };
    const setVB = () => court.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);

    const place = (dots, pts, cls) => dots.forEach((g, i) => {
      const pt = pts[i];
      if (cls) g.setAttribute('class', `cdot ${cls}${pt ? '' : ' is-off'}`);
      else g.classList.toggle('is-off', !pt);
      if (pt) {
        g.style.transitionDelay = motion ? `${i * 0.025}s` : '0s';
        g.style.transform = `translate(${pt[0]}px, ${pt[1]}px)`;
      }
    });

    const render = (key) => {
      const L = LAYOUTS[key];
      if (!L) return;
      courtGroups.forEach((g, i) => {
        g.classList.toggle('is-off', !L.courts.includes(i));
        g.classList.toggle('is-active', L.courts.includes(i));
      });
      place(coachDots, L.coaches);
      place(playerDots, L.players, L.kind === 'youth' ? 'cdot--youth' : 'cdot--player');
      const [x, y, w, h] = L.view;
      if (motion) G.to(vb, { x, y, w, h, duration: 1, ease: 'expo.inOut', onUpdate: setVB });
      else { Object.assign(vb, { x, y, w, h }); setVB(); }
    };

    const tabs = $$('.xp__tab');
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        const panel = $(`#${t.getAttribute('aria-controls')}`);
        panel.hidden = !on;
        if (on) { panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering'); }
      });
      if (focus) tab.focus();
      render(tab.dataset.format);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        let n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0];
        if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); n.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      });
    });
    // first render once the court is in view, so the dots visibly walk on
    const cio = new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { render($('.xp__tab[aria-selected="true"]').dataset.format); cio.disconnect(); }
    }, { threshold: 0.3 });
    cio.observe(court);
  }

  /* ---------- 04 Method: step sequence drives the court visual ---------- */
  const mvis = $('.mvis');
  const steps = $$('.mstep');
  if (mvis && steps.length) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        steps.forEach((s) => s.classList.toggle('is-on', s === en.target));
        mvis.dataset.step = en.target.dataset.step;
      });
    }, { rootMargin: '-42% 0px -42% 0px' });
    steps.forEach((s) => sio.observe(s));
  }

  /* ---------- 05 Video: deferred loop, pause offscreen, lightbox ---------- */
  const saveData = navigator.connection && navigator.connection.saveData;
  // each film ships as MP4 (H.264) and WebM (VP9); pick what this browser plays
  const probe = d.createElement('video');
  const VEXT = probe.canPlayType('video/mp4; codecs="avc1.42E01E"') ? '.mp4' : '.webm';
  $$('.vid__loop').forEach((v) => {
    if (reduce || saveData) return;
    const vio = new IntersectionObserver((en) => {
      if (en[0].isIntersecting) {
        if (!v.src) {
          v.src = v.dataset.src + VEXT;
          v.addEventListener('error', () => v.remove(), { once: true });
          v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
        }
        const p = v.play(); if (p) p.catch(() => {});
      } else if (v.src) v.pause();
    }, { threshold: 0.25 });
    vio.observe(v);
  });

  const lb = $('#lightbox');
  const lbV = lb && $('.lightbox__v', lb);
  const lbT = lb && $('.lightbox__t', lb);
  const vids = $$('.vid[data-video]');
  // mark slots whose film isn't uploaded yet (skipped where fetch can't run, e.g. file://)
  if (location.protocol.startsWith('http')) {
    vids.forEach((b) => {
      fetch(b.dataset.video + VEXT, { method: 'HEAD' }).then((r) => {
        if (!r.ok) { b.classList.add('is-novideo'); b.setAttribute('aria-disabled', 'true'); }
      }).catch(() => {});
    });
  }
  vids.forEach((b) => b.addEventListener('click', () => {
    if (!lb || b.classList.contains('is-novideo')) return;
    lbV.src = b.dataset.video + VEXT;
    lbT.textContent = b.dataset.title || '';
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    if (lenis) lenis.stop();
    const p = lbV.play(); if (p) p.catch(() => {});
  }));
  if (lb) {
    const close = () => { lbV.pause(); lbV.removeAttribute('src'); lbV.load(); if (lb.open) lb.close(); if (lenis) lenis.start(); };
    $('.lightbox__x', lb).addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    lb.addEventListener('close', () => { lbV.pause(); if (lenis) lenis.start(); });
  }

  /* ---------- Horizontal rails ---------- */
  $$('[data-scroll]').forEach((b) => b.addEventListener('click', () => {
    const t = $(`#${b.dataset.scroll}`);
    if (t) t.scrollBy({ left: Number(b.dataset.dir) * t.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- 08 Inquiry: four steps, the path ends at the chosen format ---------- */
  const form = $('#inquiryForm');
  if (form) {
    const fsets = $$('.istep', form);
    const nodes = $$('.iform__nodes li', form);
    const bar = $('.iform__bar', form);
    const back = $('.iform__back', form);
    const next = $('.iform__next', form);
    const sum = $('.iform__sum', form);
    let cur = 0;

    const val = (n) => { const el = form.querySelector(`input[name="${n}"]:checked`); return el ? el.value : ''; };
    const err = (i, msg) => { const e = $('.istep__err', fsets[i]); if (e) e.textContent = msg || ''; };
    const NAMES = ['format', 'who', 'level'];
    const MSG = ['Pick what you’re looking for — or “Not sure yet”.', 'Tell us who’s training.', 'Pick a level — “Other / not sure” is fine.'];

    const show = (i, focus) => {
      cur = Math.max(0, Math.min(fsets.length - 1, i));
      fsets.forEach((f, k) => f.classList.toggle('is-on', k === cur));
      nodes.forEach((n, k) => n.classList.toggle('is-on', k <= cur));
      if (bar) bar.style.setProperty('--p', String(cur / (fsets.length - 1)));
      back.hidden = cur === 0;
      form.classList.toggle('is-last', cur === fsets.length - 1);
      const f = val('format');
      nodes[0].textContent = f || 'Format';
      if (cur === fsets.length - 1) {
        sum.innerHTML = '';
        [val('format'), val('who'), val('level')].filter(Boolean).forEach((t) => {
          const s = d.createElement('span'); s.textContent = t; sum.appendChild(s);
        });
      }
      if (focus) { const first = $('input:checked, input, textarea', fsets[cur]); if (first) first.focus({ preventScroll: true }); }
    };
    const okStep = (i) => {
      if (i < NAMES.length) {
        const ok = !!val(NAMES[i]);
        err(i, ok ? '' : MSG[i]);
        return ok;
      }
      return true;
    };
    next.addEventListener('click', () => { if (okStep(cur)) show(cur + 1, true); });
    back.addEventListener('click', () => show(cur - 1, true));
    form.addEventListener('change', (e) => { const i = fsets.indexOf(e.target.closest('.istep')); if (i > -1) err(i, ''); });
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && cur < fsets.length - 1 && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (okStep(cur)) show(cur + 1, true);
      }
    });

    form.addEventListener('submit', (e) => {
      for (let i = 0; i < NAMES.length; i++) {
        if (!okStep(i)) { e.preventDefault(); show(i, true); return; }
      }
      const last = fsets.length - 1;
      const name = form.elements.name;
      const email = form.elements.email;
      const bad = [];
      [name, email].forEach((el) => {
        const ok = el.value.trim() && el.checkValidity();
        el.closest('.field').classList.toggle('is-bad', !ok);
        if (!ok) bad.push(el);
      });
      if (bad.length) {
        e.preventDefault();
        err(last, bad.includes(email) && email.value.trim() ? 'That email doesn’t look right.' : 'Add your name and email so we can reply.');
        bad[0].focus();
      }
    });

    // program CTAs elsewhere on the page pre-fill the first steps
    $$('[data-pick]').forEach((a) => a.addEventListener('click', () => {
      const pick = (n, v) => { const r = form.querySelector(`input[name="${n}"][value="${v}"]`); if (r) r.checked = true; };
      pick('format', a.dataset.pick);
      if (a.dataset.who) pick('who', a.dataset.who);
      const firstEmpty = NAMES.findIndex((n) => !val(n));
      show(firstEmpty === -1 ? fsets.length - 1 : firstEmpty);
      NAMES.forEach((_, i) => err(i, ''));
    }));

    show(0);
  }

  /* ---------- Magnetic CTAs (fine pointers only) ---------- */
  if (motion && fine) {
    $$('[data-magnetic]').forEach((b) => {
      const xTo = G.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = G.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  if (ST) addEventListener('load', () => ST.refresh());
})();
