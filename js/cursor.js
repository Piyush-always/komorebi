// cursor.js — minimal custom cursor. Phase 2 will add morph/label states.
// In phase 1 this provides a subtle accent dot that respects touch + reduced motion.

export function initCursor() {
  if (matchMedia('(pointer: coarse)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);

  let x = 0, y = 0, tx = 0, ty = 0, visible = false;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) {
      visible = true;
      el.style.opacity = '0.85';
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    el.style.opacity = '0';
    visible = false;
  });

  function tick() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Grow over interactive elements
  const selector = 'a, button, .work-card, .product-card, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(selector)) {
      el.style.width = '38px';
      el.style.height = '38px';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(selector)) {
      el.style.width = '14px';
      el.style.height = '14px';
    }
  });
}
