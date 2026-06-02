// main.js — site-wide entry. Each page imports this and then runs its own logic.

import { wireNavCount } from './cart.js';

export function initSite() {
  wireNavCount();
  initReveal();
  highlightNav();
  initFooterYear();
}

let _io = null;

/** IntersectionObserver-driven reveal. Honors prefers-reduced-motion. */
function initReveal() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('[data-reveal], .split-line').forEach((el) =>
      el.classList.add('is-revealed')
    );
    return;
  }

  _io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          _io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );

  document.querySelectorAll('[data-reveal], .split-line').forEach((el) => _io.observe(el));
}

/** Call after injecting new DOM that contains [data-reveal] / .split-line. */
export function observeReveal(scope = document) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  scope.querySelectorAll('[data-reveal]:not(.is-revealed), .split-line:not(.is-revealed)').forEach((el) => {
    if (reduced) el.classList.add('is-revealed');
    else if (_io) _io.observe(el);
  });
}

function highlightNav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav__links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });
}

function initFooterYear() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = new Date().getFullYear();
}

/** Wrap each word/line in a span for split-reveal animation. */
export function splitLines(el) {
  if (!el) return;
  const text = el.textContent;
  // Treat <br> as line break, otherwise treat each child block (e.g. <em>) as its own line
  const html = Array.from(el.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return wrap(node.textContent);
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'br') return '<br>';
        const cls = node.className ? ` class="${node.className}"` : '';
        return `<${tag}${cls}>${wrap(node.textContent)}</${tag}>`;
      }
      return '';
    })
    .join('');
  el.innerHTML = html;
}

function wrap(text) {
  // Wrap whole phrase as one line; we keep this simple in phase 1
  return `<span class="split-line"><span class="split-line__inner">${text}</span></span>`;
}
