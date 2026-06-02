// cart.js — localStorage cart with pub/sub.

const KEY = 'itzel.cart.v1';
const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Cart write failed', err);
  }
  listeners.forEach((fn) => fn(items));
}

export function getItems() {
  return read();
}

export function count() {
  return read().reduce((sum, item) => sum + item.qty, 0);
}

export function subtotal() {
  return read().reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Add a print to the cart.
 * @param {{workId:string, title:string, size:string, price:number, link:string, image:string}} p
 */
export function addPrint(p) {
  const items = read();
  const key = `${p.workId}::${p.size}`;
  const existing = items.find((i) => i.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    items.push({
      key,
      kind: 'print',
      workId: p.workId,
      title: p.title,
      size: p.size,
      price: p.price,
      link: p.link,
      image: p.image,
      qty: 1,
    });
  }
  write(items);
}

export function setQty(key, qty) {
  const items = read();
  const item = items.find((i) => i.key === key);
  if (!item) return;
  if (qty <= 0) {
    write(items.filter((i) => i.key !== key));
  } else {
    item.qty = qty;
    write(items);
  }
}

export function remove(key) {
  write(read().filter((i) => i.key !== key));
}

export function clear() {
  write([]);
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(read());
  return () => listeners.delete(fn);
}

/** Update every .site-nav__cart-count on the page. Call once per page. */
export function wireNavCount() {
  const update = () => {
    const c = count();
    document.querySelectorAll('.site-nav__cart-count').forEach((el) => {
      el.dataset.count = String(c);
      el.textContent = String(c);
    });
  };
  update();
  subscribe(update);
  // Cross-tab sync
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) update();
  });
}

export function showToast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('is-visible'), 2400);
}
