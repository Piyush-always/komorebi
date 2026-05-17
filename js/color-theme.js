// color-theme.js — adaptive accent retargeting from artwork colors.
// Phase 1: use dominantColors from JSON (artist-curated).
// Phase 3 hook: replace setFromArtwork() with a canvas-based extractor.

const root = document.documentElement;

function clampHex(h) {
  if (!h) return null;
  return /^#[0-9a-f]{3,8}$/i.test(h) ? h : null;
}

/** Smoothly retarget --accent (and related vars) to a new palette. */
export function setFromColors(colors) {
  if (!Array.isArray(colors) || !colors.length) return;
  const a = clampHex(colors[2]) || clampHex(colors[1]) || clampHex(colors[0]);
  if (!a) return;

  root.style.setProperty('--accent', a);
  root.style.setProperty('--accent-soft', `${a}22`);

  // Subtly tint the background gradient too
  const tintBase = clampHex(colors[0]);
  if (tintBase) {
    root.style.setProperty('--bg-elev', mix(tintBase, '#0e0d0b', 0.18));
  }
}

export function setFromArtwork(work) {
  if (!work) return;
  setFromColors(work.dominantColors);
}

export function reset() {
  root.style.removeProperty('--accent');
  root.style.removeProperty('--accent-soft');
  root.style.removeProperty('--bg-elev');
}

/* Tiny hex mixer — t is fraction of `b`. */
function mix(a, b, t) {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const r = Math.round(pa.r * (1 - t) + pb.r * t);
  const g = Math.round(pa.g * (1 - t) + pb.g * t);
  const bl = Math.round(pa.b * (1 - t) + pb.b * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function parseHex(h) {
  let v = h.replace('#', '');
  if (v.length === 3) v = v.split('').map((c) => c + c).join('');
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
