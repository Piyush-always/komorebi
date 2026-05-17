# Komorebi — Studio Website

Vertical slice (Phase 1) of the Komorebi artist site. Pure static HTML / CSS / JS, no build step. Open `index.html` directly or serve the folder with any static server.

```
python -m http.server 8000     # or
npx serve .                    # or just drag index.html into a browser
```

> If you open `index.html` directly via `file://`, the JSON fetches may be blocked by the browser. **Run a local server** (one of the commands above) — that's the only "setup" the site needs.

---

## What's in the slice

| Page | File |
|---|---|
| Home (hero, manifesto, featured series, available strip, studio) | `index.html` |
| Work index (all paintings, filter by series) | `work.html` |
| Artwork detail (zoom, prints, adaptive color theme, JSON-LD) | `artwork.html?id=…` |
| Shop (originals + prints, two tracks) | `shop.html` |
| Cart (localStorage, qty, checkout handoff) | `cart.html` |

Phase 2 (preloader, Lenis smooth scroll, page transitions, full custom cursor states) and Phase 3 (WebGL gallery, shader transitions, runtime canvas color extraction) are not in this slice — but the foundations are wired so they slot in cleanly.

---

## Adding a new painting

Everything the artist needs is in **`data/works.json`**. Each painting is one object:

```json
{
  "id": "new-piece-slug",          // url-safe, becomes artwork.html?id=new-piece-slug
  "title": "Title of the work",
  "series": "understory",          // must match an id in data/series.json
  "year": 2026,
  "medium": "Oil on linen",
  "dimensions": "120 × 90 cm",
  "image": "assets/images/new-piece-slug.jpg",
  "description": "One or two sentences. This is what shows under the title.",
  "status": "available",           // available | sold | prints-only
  "originalPrice": 4800,           // number, USD. Null for prints-only/sold.
  "originalLink": "https://buy.stripe.com/...",  // see "Payment links" below
  "prints": [
    { "size": "A4", "price": 80,  "link": "https://buy.stripe.com/..." },
    { "size": "A3", "price": 140, "link": "https://buy.stripe.com/..." }
  ],
  "dominantColors": ["#1f2a1c", "#7a8a5a", "#d4a849"]
}
```

**Steps:**

1. Drop the painting photo into `assets/images/` as `new-piece-slug.jpg` (any aspect — the layout adapts). Keep it under ~500 KB if you can — the site uses lazy loading + a fade-in.
2. Add a new object to `data/works.json` following the shape above. Make sure `id`, `image` filename, and the slug all match.
3. Pick three `dominantColors` from the painting (a screenshot + a color picker like macOS Digital Color Meter works fine). These power the painted placeholder during loading **and** retarget the page's accent color when someone views the piece.
4. Save. Reload. The painting appears in: the work index, the relevant series, the shop, and (if `status === "available"`) the "currently available" strip on the home page.

**To add a whole new series**: add an entry to `data/series.json` and reference its `id` from your works.

---

## Payment links

The site does no payment processing itself. It hands off to whatever provider the studio uses.

**Recommended setup (cheapest, no monthly fee):**

- **Originals** → [Stripe Payment Links](https://stripe.com/payments/payment-links) (one link per painting) **or** inquiry email. The default in `works.json` uses placeholder fragments like `"#inquire-tidal-memory"` — replace each with a real URL.
- **Prints** → Stripe Payment Links, one per (work × size). Or migrate later to Shopify / Gumroad — the JSON shape doesn't care.

**Where to put each link:**

| Field in JSON | What goes there |
|---|---|
| `originalLink` | URL the "Acquire the original" button opens. Use `mailto:` for inquiry-only, e.g. `mailto:studio@komorebi.studio?subject=Tidal%20Memory` |
| `prints[].link` | URL for that specific print size |

The cart's checkout button currently opens each item's payment link in a new tab (one per item). For a unified checkout (recommended once volume picks up), swap the `checkoutBtn` handler at the bottom of `cart.html` for a Stripe Checkout Session URL.

---

## Adapting the design

| What | Where |
|---|---|
| Colors (base, accent, surfaces) | `css/base.css` → `:root { --bg, --fg, --accent, … }` |
| Fonts | `index.html` (and siblings) — `<link rel="stylesheet" href="https://fonts.googleapis.com/…">`. Default is Fraunces (display) + Inter (body). Swap both in the Google Fonts URL and in `--font-display` / `--font-body`. |
| Page-wide copy (manifesto, hero, studio) | `index.html` directly. The poetic lines were written for this slice — feel free to rewrite. |
| Site identity (brand, footer, socials, emails) | Search each HTML file for `studio@komorebi.studio` and the Instagram link, and replace. |

---

## What still has placeholders

These are intentionally not real yet — they're the bits that need the artist's actual material:

- **`assets/images/*.jpg`** — every artwork image. The site currently renders a painted CSS gradient using each work's `dominantColors` whenever the image is missing, so the layout looks composed from day one. Drop in the real photos and the placeholders disappear automatically.
- **`originalLink` / `prints[].link`** in `data/works.json` — hash placeholders like `"#inquire-…"`. Replace with real Stripe / inquiry URLs.
- **Open Graph image** — `assets/images/og-default.jpg` for social previews. 1200×630 recommended.
- **Real artist name** — only "Komorebi" (the studio name) appears in the current copy. If a personal byline is wanted, search the HTML for `the artist` / `one woman` and adjust.

---

## File map

```
index.html        home
work.html         all paintings, series filter
artwork.html      single artwork (uses ?id=)
shop.html         originals + prints
cart.html         cart + checkout handoff

css/
  base.css        tokens, reset, type
  layout.css      nav, hero, sections, footer, grids
  components.css  buttons, cards, badges, forms, cart
  animations.css  reveal classes, keyframes, reduced-motion

js/
  main.js         site entry — initSite(), observeReveal()
  data.js         JSON loader + card render helpers
  cart.js         localStorage cart, pub/sub, toast
  color-theme.js  adaptive accent retargeting per artwork
  cursor.js       minimal custom cursor (no-op on touch / reduced-motion)

data/
  works.json      all paintings — the "CMS"
  series.json     three series
```

---

## Roadmap (next phases)

**Phase 2 — signature motion.** Designed preloader sequence with real progress; Lenis smooth scroll + GSAP ScrollTrigger choreography; full custom cursor with hover labels ("View" / "Drag" / "Buy"); page transitions (intercept internal links, animate out → fetch → animate in, no white flash); full-screen overlay menu.

**Phase 3 — WebGL & deep zoom.** Three.js shader gallery on the home hero, kinetic grid reacting to cursor; displacement transitions between artworks on `work.html`; true deep-zoom brushstroke viewer on `artwork.html` (current zoom is a 2.4× CSS transform — adequate, but Phase 3 will swap it for tile-based zoom). Runtime canvas-based color extraction to replace the hand-curated `dominantColors` in JSON.

All three phases are reachable without re-doing what's here.
