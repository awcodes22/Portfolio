// Cursor
(function () {
  const dot = document.getElementById('cursor-dot');
  let idleTimer = null;

  if (window.innerWidth < 992) {
    dot.style.display = 'none';
    return;
  }

  dot.style.opacity = '1';

  const navName  = document.querySelector('.nav-name');
  const textTags = new Set(['H1','H2','H3','H4','P','SPAN','A','LI','LABEL']);

  if (navName) {
    const NAME_RADIUS = 150;
    document.addEventListener('mousemove', (e) => {
      const rect  = navName.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dist  = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      navName.style.color = dist < NAME_RADIUS ? '#000' : '';
    });
  }

  document.addEventListener('mouseover', (e) => {
    if (textTags.has(e.target.tagName) && !e.target.closest('.nav-name')) {
      dot.classList.add('inverted');
    } else {
      dot.classList.remove('inverted');
    }
  });

  window.addEventListener('mousemove', (e) => {
    dot.style.transform = `translate(${e.clientX - 9}px, ${e.clientY - 9}px)`;
    dot.style.opacity   = '1';

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      dot.style.opacity = '1';
    }, 300);
  }, { capture: true });
})();


// Hamburger menu
(function () {
  const btn  = document.querySelector('.nav-hamburger');
  const menu = document.getElementById('nav-mobile');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


// Current year
document.querySelectorAll('[data-current-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});


// Local time (Toronto)
function updateTime() {
  const toronto = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date()).replace('a.m.', 'AM').replace('p.m.', 'PM');

  document.querySelectorAll('.local-time').forEach(el => {
    el.textContent = toronto;
  });
}
updateTime();
setInterval(updateTime, 60000);


// Magnetic buttons
(function () {
  const magnets = document.querySelectorAll('.hero-cta, .nav-cta');
  const RADIUS   = 30;
  const STRENGTH = 0.45;

  const state = Array.from(magnets).map(el => ({
    el,
    active: false,
    currentX: 0, currentY: 0,
    targetX: 0,  targetY: 0,
    rafId: null
  }));

  function animateBtn(s) {
    s.currentX += (s.targetX - s.currentX) * 0.08;
    s.currentY += (s.targetY - s.currentY) * 0.08;
    s.el.style.transform = `translate(${s.currentX}px, ${s.currentY}px)`;

    if (Math.abs(s.targetX - s.currentX) > 0.01 || Math.abs(s.targetY - s.currentY) > 0.01) {
      s.rafId = requestAnimationFrame(() => animateBtn(s));
    } else {
      s.el.style.transform = `translate(${s.targetX}px, ${s.targetY}px)`;
      s.rafId = null;
    }
  }

  window.addEventListener('mousemove', (e) => {
    let anyActive = false;

    state.forEach(s => {
      const rect    = s.el.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const dx      = e.clientX - centerX;
      const dy      = e.clientY - centerY;
      const dist    = Math.sqrt(dx * dx + dy * dy);
      const trigger = Math.max(rect.width, rect.height) / 2 + RADIUS;

      if (dist < trigger) {
        anyActive = true;
        if (!s.active) {
          s.active = true;
          s.el.classList.add('mag-hover');
        }
        s.targetX = dx * STRENGTH;
        s.targetY = dy * STRENGTH;
        if (!s.rafId) s.rafId = requestAnimationFrame(() => animateBtn(s));
      } else if (s.active) {
        s.active  = false;
        s.el.classList.remove('mag-hover');
        s.targetX = 0;
        s.targetY = 0;
        if (!s.rafId) s.rafId = requestAnimationFrame(() => animateBtn(s));
      }
    });

    if (anyActive) e.stopImmediatePropagation();
  }, { capture: true });
})();


// 3D tilt
(function () {
  const cards = document.querySelectorAll('.process-card, .project-card');
  const LERP  = 0.07;

  cards.forEach(card => {
    const MAX_TILT = card.classList.contains('project-card') ? 6 : 12;
    let curX = 0, curY = 0, tarX = 0, tarY = 0;
    let curScale = 1, tarScale = 1;
    let rafId = null;

    function tick() {
      curX     += (tarX     - curX)     * LERP;
      curY     += (tarY     - curY)     * LERP;
      curScale += (tarScale - curScale) * LERP;

      card.style.transform =
        `perspective(1000px) rotateX(${curX}deg) rotateY(${curY}deg) scale(${curScale})`;

      const settled =
        Math.abs(tarX - curX)         < 0.005 &&
        Math.abs(tarY - curY)         < 0.005 &&
        Math.abs(tarScale - curScale) < 0.0005;

      rafId = settled ? null : requestAnimationFrame(tick);
    }

    card.addEventListener('mouseenter', () => {
      tarScale = 1.06;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      tarX = ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -MAX_TILT;
      tarY = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  MAX_TILT;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    card.addEventListener('mouseleave', () => {
      tarX = 0; tarY = 0; tarScale = 1;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
  });
})();


// Scroll reveal
(function () {
  const els = document.querySelectorAll('.fade-up');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const siblings = Array.from(e.target.parentElement.children).filter(
          el => el.classList.contains('fade-up')
        );
        const index = siblings.indexOf(e.target);
        const delay = `${index * 0.12}s`;
        e.target.style.animationDelay = `${delay}, ${delay}`;
        e.target.classList.add('visible');
        io.unobserve(e.target);

        e.target.addEventListener('animationend', () => {
          e.target.style.animation = 'none';
          e.target.style.opacity   = '1';
          e.target.style.transform = '';
        }, { once: true });
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();
