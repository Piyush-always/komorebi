// data.js — load works.json + series.json and expose render helpers.

let _works = null;
let _series = null;

export async function loadData() {
  if (_works && _series) return { works: _works, series: _series };
  const [works, series] = await Promise.all([
    fetch('data/works.json').then((r) => r.json()),
    fetch('data/series.json').then((r) => r.json()),
  ]);
  _works = works;
  _series = series;
  return { works, series };
}

export function getWork(id) {
  return _works?.find((w) => w.id === id) || null;
}

export function getSeries(id) {
  return _series?.find((s) => s.id === id) || null;
}

export function worksInSeries(seriesId) {
  return (_works || []).filter((w) => w.series === seriesId);
}

/* ----- rendering helpers ----- */

const STATUS_LABEL = {
  available: 'Available',
  sold: 'Sold',
  'prints-only': 'Prints only',
};

const STATUS_CLASS = {
  available: 'badge--available',
  sold: 'badge--sold',
  'prints-only': 'badge--prints',
};

export function formatPrice(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function workCardHTML(work, opts = {}) {
  const { aspect = 'portrait', revealIndex = 0 } = opts;
  const aspectClass =
    aspect === 'landscape'
      ? 'work-card__frame--landscape'
      : aspect === 'square'
      ? 'work-card__frame--square'
      : '';
  const colors = work.dominantColors || [];
  const styleVars = `--c1:${colors[0] || '#1f2a1c'};--c2:${colors[1] || '#7a8a5a'};--c3:${colors[2] || '#d4a849'};`;
  const statusLabel = STATUS_LABEL[work.status] || '';
  const statusClass = STATUS_CLASS[work.status] || 'badge--available';
  const showBadge = work.status === 'sold' || work.status === 'prints-only';

  return `
    <a class="work-card" href="artwork.html?id=${work.id}" data-reveal="mask"
       style="--reveal-delay:${revealIndex * 80}ms">
      <div class="work-card__frame ${aspectClass}" style="${styleVars}">
        ${showBadge ? `<span class="badge ${statusClass} badge--corner">${statusLabel}</span>` : ''}
        <div class="work-card__placeholder" aria-hidden="true"></div>
        <img class="work-card__art" data-loading
             src="${work.image}"
             alt="${escapeAttr(work.title)} — ${escapeAttr(work.medium)}, ${work.year}"
             loading="lazy" decoding="async"
             onload="this.removeAttribute('data-loading')"
             onerror="this.style.display='none'" />
      </div>
      <div class="work-card__info">
        <div>
          <div class="work-card__title">${escapeHTML(work.title)}</div>
          <div class="muted" style="font-size:var(--step--2);letter-spacing:0.06em;text-transform:uppercase;margin-top:4px;">
            ${escapeHTML(work.medium)} · ${work.year}
          </div>
        </div>
        <div class="work-card__meta">${escapeHTML(work.dimensions)}</div>
      </div>
    </a>
  `;
}

export function productCardHTML(work, mode = 'original') {
  const colors = work.dominantColors || [];
  const styleVars = `--c1:${colors[0] || '#1f2a1c'};--c2:${colors[1] || '#7a8a5a'};--c3:${colors[2] || '#d4a849'};`;

  if (mode === 'original') {
    const sold = work.status === 'sold' || work.status === 'prints-only';
    const price = work.originalPrice ? formatPrice(work.originalPrice) : 'Held privately';
    const ctaLabel = sold ? 'View artwork' : 'Acquire original';
    const ctaHref = `artwork.html?id=${work.id}`;
    return `
      <article class="product-card" data-reveal>
        <a href="artwork.html?id=${work.id}" class="work-card__frame ${sold ? 'is-sold' : ''}" style="${styleVars}">
          ${sold ? `<span class="badge ${STATUS_CLASS[work.status]} badge--corner">${STATUS_LABEL[work.status]}</span>` : ''}
          <div class="work-card__placeholder" aria-hidden="true"></div>
          <img class="work-card__art" data-loading
               src="${work.image}"
               alt="${escapeAttr(work.title)}"
               loading="lazy" decoding="async"
               onload="this.removeAttribute('data-loading')"
               onerror="this.style.display='none'" />
        </a>
        <div class="product-card__head">
          <h3>${escapeHTML(work.title)}</h3>
          <span class="price">${price}</span>
        </div>
        <div class="product-card__meta">${escapeHTML(work.medium)} · ${escapeHTML(work.dimensions)}</div>
        <a class="btn btn--ghost" href="${ctaHref}">
          <span class="btn__label">${ctaLabel}</span>
          <span class="btn__arrow" aria-hidden="true">→</span>
        </a>
      </article>
    `;
  }

  // prints variant
  const prints = work.prints || [];
  const from = prints.length ? Math.min(...prints.map((p) => p.price)) : null;
  return `
    <article class="product-card" data-reveal data-work-id="${work.id}">
      <a href="artwork.html?id=${work.id}" class="work-card__frame" style="${styleVars}">
        <div class="work-card__placeholder" aria-hidden="true"></div>
        <img class="work-card__art" data-loading
             src="${work.image}"
             alt="${escapeAttr(work.title)} — fine art print"
             loading="lazy" decoding="async"
             onload="this.removeAttribute('data-loading')"
             onerror="this.style.display='none'" />
      </a>
      <div class="product-card__head">
        <h3>${escapeHTML(work.title)}</h3>
        <span class="price">${from != null ? `from ${formatPrice(from)}` : '—'}</span>
      </div>
      <div class="product-card__meta">${prints.map((p) => p.size).join(' · ')} · Open edition</div>
      <a class="btn btn--ghost" href="artwork.html?id=${work.id}#prints">
        <span class="btn__label">Choose a size</span>
        <span class="btn__arrow" aria-hidden="true">→</span>
      </a>
    </article>
  `;
}

export function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

export function escapeAttr(s) {
  return escapeHTML(s);
}
