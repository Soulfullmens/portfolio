document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCounters();
  initNavbar();
  initProgress();
  initBgDrift();
  initParallax();
  initCursor();
  initMagnetic();
});

// 1. Reveal Animations
function initReveal() {
  document.documentElement.classList.add('js-ready');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        const d = parseInt(el.getAttribute('data-delay') || '0', 10);
        el.style.transitionDelay = d + 'ms';
        el.classList.add('is-revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
        io.unobserve(el);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    io.observe(el);
  });
}

// 2. Count-Up Animations
function initCounters() {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        runCount(e.target);
        cio.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));
}

function runCount(el) {
  const target = parseFloat(el.getAttribute('data-count'));
  const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 1400);
    const val = target * (1 - Math.pow(1 - t, 3));
    el.textContent = dec > 0 ? val.toFixed(dec) : Math.round(val).toString();
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = dec > 0 ? target.toFixed(dec) : Math.round(target).toString();
  };
  requestAnimationFrame(step);
}

// 3. Navbar Sticky Effect
function initNavbar() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const onNav = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onNav, { passive: true });
  onNav();
}

// 4. Scroll Progress Bar
function initProgress() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  const onScroll = () => {
    const st = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (st / max) * 100 : 0) + '%';
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// 5. Background Video Drift, Scale & Audio Control
function initBgDrift() {
  const v = document.getElementById('bg-video');
  if (!v) return;

  v.muted = true;
  v.defaultMuted = true;
  v.setAttribute('muted', '');

  const tryPlay = () => {
    const p = v.play && v.play();
    if (p && p.catch) p.catch(() => {});
  };

  tryPlay();
  ['canplay', 'loadeddata', 'canplaythrough'].forEach((ev) => v.addEventListener(ev, tryPlay));

  let tries = 0;
  const iv = setInterval(() => {
    if (!v.paused || tries++ > 20) {
      clearInterval(iv);
    } else {
      tryPlay();
    }
  }, 400);

  // Audio unmute gesture handler
  let hasUnmutedOnGesture = false;
  const onGesture = (e) => {
    tryPlay();
    // Don't auto-unmute if user explicitly clicked the sound toggle button
    if (e && e.target && (e.target.id === 'sound-toggle' || e.target.closest('#sound-toggle'))) {
      return;
    }
    if (!hasUnmutedOnGesture && v.muted) {
      v.muted = false;
      v.volume = 0.8;
      hasUnmutedOnGesture = true;
      updateSoundUI(true);
    }
  };
  window.addEventListener('pointerdown', onGesture, { passive: true });

  // Sound Toggle Button Handler
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (v.muted) {
        v.muted = false;
        v.volume = 0.8;
        tryPlay();
        updateSoundUI(true);
      } else {
        v.muted = true;
        updateSoundUI(false);
      }
    });
  }

  function updateSoundUI(isUnmuted) {
    const icon = document.getElementById('sound-icon');
    const text = document.getElementById('sound-text');
    if (icon) icon.textContent = isUnmuted ? '🔊' : '🔇';
    if (text) text.textContent = isUnmuted ? 'Sound On' : 'Sound Off';
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      const scale = 1.06 + p * 0.14;
      const shift = p * -6;
      v.style.transform = `translateY(${shift.toFixed(2)}%) scale(${scale.toFixed(3)})`;
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// 6. Parallax Cards
function initParallax() {
  const cards = Array.from(document.querySelectorAll('[data-parallax-img]'));
  cards.forEach((el) => {
    const img = el.querySelector('[data-img]');
    if (img) img.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)';
    el.dataset.hover = '0';
    el.addEventListener('mouseenter', () => {
      el.dataset.hover = '1';
      updateCard(el);
    });
    el.addEventListener('mouseleave', () => {
      el.dataset.hover = '0';
      updateCard(el);
    });
  });

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      cards.forEach((c) => updateCard(c));
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function updateCard(el) {
  const img = el.querySelector('[data-img]');
  if (!img) return;
  const r = el.getBoundingClientRect();
  const off = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
  const sc = el.dataset.hover === '1' ? 1.15 : 1.06;
  img.style.transform = `translateY(${(off * -34).toFixed(1)}px) scale(${sc})`;
}

// 7. Custom Cursor Physics
function initCursor() {
  const ring = document.getElementById('cursor-ring');
  const label = document.getElementById('cursor-label');
  if (!ring) return;

  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    ring.style.display = 'none';
    return;
  }

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;

  const move = (e) => {
    mx = e.clientX;
    my = e.clientY;
  };
  window.addEventListener('mousemove', move, { passive: true });

  const loop = () => {
    rx += (mx - rx) * 0.22;
    ry += (my - ry) * 0.22;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  };
  loop();

  const base = () => {
    ring.style.width = '12px';
    ring.style.height = '12px';
    ring.style.margin = '-6px 0 0 -6px';
    ring.style.background = 'transparent';
    ring.style.borderColor = '#5457f6';
    if (label) label.style.opacity = '0';
  };

  const link = () => {
    ring.style.width = '44px';
    ring.style.height = '44px';
    ring.style.margin = '-22px 0 0 -22px';
    ring.style.background = 'rgba(84,87,246,0.10)';
    ring.style.borderColor = '#5457f6';
    if (label) label.style.opacity = '0';
  };

  const view = () => {
    ring.style.width = '84px';
    ring.style.height = '84px';
    ring.style.margin = '-42px 0 0 -42px';
    ring.style.background = '#5457f6';
    ring.style.borderColor = '#5457f6';
    if (label) label.style.opacity = '1';
  };

  document.querySelectorAll('a, button, [data-magnetic]').forEach((t) => {
    if (t.getAttribute('data-cursor') === 'view') return;
    t.addEventListener('mouseenter', link);
    t.addEventListener('mouseleave', base);
  });

  document.querySelectorAll('[data-cursor="view"]').forEach((t) => {
    t.addEventListener('mouseenter', view);
    t.addEventListener('mouseleave', base);
  });

  base();
}

// 8. Magnetic Buttons
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.style.willChange = 'transform';
    el.style.transition = 'transform .35s cubic-bezier(.2,.7,.2,1), background .3s ease, color .3s ease';
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.28}px,${y * 0.4}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });
}
