// ATELIER 27 — the single scroll driver.
// One passive scroll listener, throttled with requestAnimationFrame, writes
// CSS custom properties; all movement is done in CSS with transforms.
//
// Scroll-linked:
//   1. Approach — the grid line resolves into alignment (--p on [data-approach])
//   2. Studio   — the 27 moves slightly slower than the content (--y on [data-studio])
//   +  Hero     — subtle image scale and headline lift (--p on [data-hero])
// Also: navigation colour / hide-on-scroll, image reveals, mobile menu.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 900px) and (min-height: 640px)');

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const header = document.querySelector<HTMLElement>('[data-nav-root]');
const hero = document.querySelector<HTMLElement>('[data-hero]');
const approach = document.querySelector<HTMLElement>('[data-approach]');
const studio = document.querySelector<HTMLElement>('[data-studio]');
const themed = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'));

/* ---------- Scroll-linked values ---------- */

const DEPTH = 0.025; // the 27 travels 2.5 % slower than the page

function updateMotion(vh: number) {
  if (reduceMotion.matches) return;

  if (hero) {
    const r = hero.getBoundingClientRect();
    if (r.bottom > 0) hero.style.setProperty('--p', clamp(-r.top / r.height).toFixed(4));
  }

  if (approach) {
    const r = approach.getBoundingClientRect();
    {
      let raw: number;
      if (desktop.matches) {
        // Starts just before the stage pins, resolves at 85 % of the sticky hold
        const hold = r.height - vh;
        const lead = vh * 0.12;
        raw = (lead - r.top) / (lead + hold * 0.85);
      } else {
        // Short travel while the section enters the viewport
        raw = (vh * 0.85 - r.top) / (vh * 0.5);
      }
      approach.style.setProperty('--p', easeOut(clamp(raw)).toFixed(4));
    }
  }

  if (studio) {
    const r = studio.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) {
      studio.style.setProperty('--y', ((vh - r.top) * DEPTH).toFixed(2));
    }
  }
}

/* ---------- Navigation: colour per section, hide on the way down ---------- */

let lastY = window.scrollY;

function updateNav(y: number) {
  if (!header) return;

  const probe = header.offsetHeight / 2;
  for (const el of themed) {
    const r = el.getBoundingClientRect();
    if (r.top <= probe && r.bottom > probe) {
      header.dataset.theme = el.dataset.nav;
      break;
    }
  }

  const delta = y - lastY;
  if (y < 120) header.classList.remove('is-hidden');
  else if (delta > 6) header.classList.add('is-hidden');
  else if (delta < -6) header.classList.remove('is-hidden');
  if (Math.abs(delta) > 6) lastY = y;
}

let ticking = false;

function frame() {
  ticking = false;
  updateMotion(window.innerHeight);
  updateNav(window.scrollY);
}

function requestFrame() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(frame);
}

window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', requestFrame, { passive: true });
desktop.addEventListener('change', requestFrame);
reduceMotion.addEventListener('change', () => {
  // Hand control back to the static CSS values
  for (const el of [hero, approach, studio]) {
    el?.style.removeProperty('--p');
    el?.style.removeProperty('--y');
  }
  requestFrame();
});
frame();

/* ---------- Straight masked image reveals ---------- */

const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target;
        io.unobserve(target);
        // Reveal only once the (lazy) image has arrived, so the mask never opens on an empty frame
        const img = target.querySelector('img');
        if (img) img.loading = 'eager'; // a fully masked lazy image would never start loading
        const show = () => target.classList.add('is-in');
        if (!img || img.complete) show();
        else {
          img.addEventListener('load', show, { once: true });
          img.addEventListener('error', show, { once: true });
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  // Start loading masked images one viewport ahead
  const preload = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const img = entry.target.querySelector('img');
        if (img) img.loading = 'eager';
        preload.unobserve(entry.target);
      }
    },
    { rootMargin: '100% 0px 100% 0px' },
  );
  reveals.forEach((el) => {
    io.observe(el);
    preload.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}

/* ---------- Mobile menu ---------- */

const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const outside = Array.from(document.querySelectorAll<HTMLElement>('main, footer, .skip'));

function setMenu(open: boolean, restoreFocus = true) {
  if (!toggle || !menu || !header) return;
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '';
  header.classList.toggle('is-open', open);
  document.documentElement.style.overflow = open ? 'hidden' : '';
  outside.forEach((el) => (el.inert = open));
  if (!open && restoreFocus) toggle.focus();
}

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true', false);
  });

  menu.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => setMenu(false, false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  // Leaving the mobile layout closes the menu
  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, false);
  });
}
