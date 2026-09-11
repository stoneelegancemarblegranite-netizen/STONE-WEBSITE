# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for Stone Elegance Marble & Granite (countertop fabricator in Clifton, NJ), authored as one **Design Canvas component file**: `index.html` (was `Stone Elegance v2.dc.html`; renamed so Apache serves it as the document root). It still uses Design Canvas syntax internally — `<x-dc>`, `<helmet>`, `text/x-dc` — driven by `support.js`, despite the plain `.html` extension. That file is the entire site — template, styles, and logic. There is no framework project, no package manager, and no build step.

Alongside it, **six static sub-pages** that are plain HTML — no Design Canvas runtime — sharing `css/pages.css` and `js/pages.js`:

| Page | Purpose |
| --- | --- |
| `granite-countertops/`, `quartz-countertops/`, `marble-countertops/`, `quartzite-countertops/` | Indexable material/service pages. Copy comes from `SITE - STONE ELEGANCE MARBLE & GRANITE.md`. |
| `privacy-policy/`, `terms/` | Legal pages, linked from every footer (Google Ads requires them). |

Plus `lp/index.html` (Google Ads landing page, `noindex`), `thanks/index.html` (post-submit page, `noindex,nofollow`), `redirect/index.html` (digital business card for QR codes and link-in-bio, `noindex,follow`, ships `stone-elegance.vcf` next to it), `404.html`, and the site plumbing — `.htaccess`, `robots.txt`, `sitemap.xml`, `site.webmanifest`.

**Canonical host is `https://stonelegance.com` (no www).** It is hardcoded in: `.htaccess` (two RewriteRules), `robots.txt`, `sitemap.xml`, the `redirect` hidden field in every form (home, both LP forms, all four material pages), and the canonical / og:url / JSON-LD block in the head of the home page and each sub-page. Changing domains means editing all of them.

The home page's indexing tags — **`<title>`, meta description**, canonical, robots, Open Graph, Twitter, `LocalBusiness` + `WebSite` + `FAQPage` JSON-LD — live in the **real `<head>`**, not in `<helmet>`: they must be parseable before the Design Canvas runtime boots, otherwise a crawler that does not execute JS sees a home page with no title at all.

Do **not** put the title or description back in `<helmet>`. The runtime's helmet manager *appends* elements to the head rather than replacing them, so a copy in both places leaves the document with two `<title>` elements. `<helmet>` now holds only the favicon, the Google Fonts links and the global style block.

## The static sub-pages

They deliberately do **not** use the Design Canvas runtime: they exist to be indexed, so the copy must be in the markup before any script runs. All six share one stylesheet (`css/pages.css`) and one script (`js/pages.js`) — edit those, not each page, for anything visual or behavioural that is common.

- The visual language mirrors the home page (same brand tokens, Montserrat/Archivo, eyebrow + italic-gold-headline device), but expressed as classes instead of inline styles. `.sect`, `.sect-head`, `.card`, `.steps`, `.faq-list`, `.split`, `.contact-grid`, `.legal` are the layout primitives.
- **Image ratios are held by a `.shot` wrapper, never by the `<img>`.** An `aspect-ratio` set directly on a replaced element loses to its intrinsic size in enough browsers that the photo overflows its slot — which is exactly what broke the first version of the gallery. Every photo is `<div class="shot"><img ...></div>`, with the ratio on `.shot`. Same pattern the home page uses inline.
- All 23 photos in `img/` are portrait: `p01`–`p03` are 1086×1448, the rest 1200×1600. Keep `width`/`height` attributes truthful.
- The "Recent installations" block is a **snap carousel**, not a grid: `.rail-wrap` > `.rail` with `[data-rail-prev]` / `[data-rail-next]` arrows driven by `js/pages.js`. The rail scrolls and snaps natively, so the arrows are pure enhancement; they are hidden below 860px, where the rail bleeds to the screen edges and each card is 68vw.
- Reveal animation follows the same rule as the home page: `js/pages.js` sets `data-reveal-on` on `<html>` before any element is hidden, so **content stays visible if JS fails**. Preserve that. `prefers-reduced-motion` skips the reveal entirely.
- Each material page carries a JSON-LD `@graph`: `LocalBusiness` (self-contained, not just an `@id` reference), `Service`, `WebPage`, `BreadcrumbList` and `FAQPage`. The FAQ JSON-LD must stay word-for-word in sync with the visible `<details>` copy.
- Local SEO lives in the `#areas` section of each page: county list, a prose line naming ~40 municipalities, an embedded Clifton map, plus `areaServed` in the schema. The same city line is duplicated on the home page.
- Every page's form is `#form01` posting to Web3Forms with a page-specific `subject` and `source` so leads can be attributed.
- **Nothing on these pages loads GTM yet** — same gap as the home page; only `lp/` and `thanks/` are tagged.

### The Services dropdown

The header is the same on all seven pages: hovering (or tabbing into) **Services** opens a panel listing the four material pages plus "Backsplashes, sinks & edges". It is **CSS-only** — `.nav-has-drop:hover/:focus-within` reveals `.nav-drop`; there is no JS. An invisible `.nav-has-drop::after` bridges the gap between the trigger and the panel, so the pointer never crosses dead space; it is a pseudo-element rather than padding so the header keeps its height.

The markup is duplicated in seven places, and the styling lives in two: `css/pages.css` for the six sub-pages, and the `<helmet>` `<style>` block for the home page — the one case where the home needs real `:hover` CSS instead of `style-hover`, because the hover has to reveal a *sibling* rather than restyle the hovered node. Changing the service list means editing the desktop nav and the mobile panel on all seven pages. On mobile the panel has no dropdown: the four pages appear as indented `a.sub` items under Services.

`copy.md` is the client-approved copy source of truth (headlines, CTAs, FAQ, meta tags). When changing site text, reconcile against it. It also carries two base64 reference screenshots (`[image1]`, `[image2]`) that are design references, not assets to embed.

## Commands

There is no build, lint, or test setup. To preview, serve the folder over HTTP (the runtime pulls React and Babel from unpkg, so an internet connection is required):

```powershell
python -m http.server 8000
# then open http://localhost:8000/
```

`support.js` is generated (`// GENERATED from dc-runtime/src/*.ts — do not edit`). The `dc-runtime` source is not in this repo. Never hand-edit `support.js`.

## Anatomy of index.html (the Design Canvas file)

Three parts inside `<x-dc>`:

1. **`<helmet>`** — `<title>`, meta description, favicon, Google Fonts, and the single global `<style>` block. Everything else on the page is styled inline.
2. **Template** — plain HTML with runtime extensions (below).
3. **`<script type="text/x-dc" data-dc-script>`** — `class Component extends DCLogic` (a React component base provided by the runtime).

### Runtime template extensions

- `{{ name }}` resolves against the object returned by `renderVals()` at the bottom of the class. Anything the template references — refs, handlers, computed strings, even React elements like `lightboxImg` — must be exposed there.
- `<sc-if value="{{ flag }}">` for conditionals; `hint-placeholder-val` is an editor hint only.
- `ref="{{ someRef }}"` and `onClick="{{ handler }}"` bind to class fields.
- **`style-hover="..."` / `style-focus="..."`** attributes are compiled by the runtime into real pseudo-class CSS. This is how hover states work despite everything being inline styles — do not try to add `:hover` any other way.
- The `data-props` JSON on the script tag declares editor-exposed props (`email`, `phone`), read as `this.props.email`. Code paths that use them also hardcode a fallback, so changing a prop default is not enough to change the site — grep for the literal value too.

### Styling model — important

Desktop styling lives in **inline `style` attributes**. Mobile styling lives entirely in **one `@media (max-width: 860px)` block** in `<helmet>`, which overrides by `#id` / `[data-attr]` selectors with `!important`. Any new section needs its mobile rules added to that block explicitly; it will not inherit sensible mobile behavior.

The site header is an exception: its position, background, blur, and logo width are set **imperatively** in `_scroll()` inside `componentDidMount`. Editing the header's inline styles for those properties has no effect.

## Page transitions

Navigating between any two pages cross-fades: the outgoing page fades up and out over 260ms, the incoming one rises 16px and fades in over 440ms. This is the **cross-document View Transitions API** — `@view-transition{navigation:auto}` plus `::view-transition-old/new(root)` animations. No JS, no router, no interception of clicks; browsers without the API navigate instantly exactly as before.

Both the outgoing *and* the incoming document must carry the opt-in, so the same block is repeated in six places: `css/pages.css` (covers the four material pages and the two legal pages), and the inline `<style>` of `lp/`, `thanks/`, `404.html`, `redirect/` — and, for the home page, **a real `<style>` in the actual `<head>`, not in `<helmet>`**. The runtime injects `<helmet>` long after first render, which is too late for the incoming side of a transition; that head block also repeats `body{margin:0;background:#FAF9F7}` so the snapshot is never taken against an unpainted white page.

The global `*{animation-duration:.001ms}` reduced-motion rule does **not** reach these pseudo-elements — `*` never matches them — so each copy switches them off by name explicitly. Keep that if you edit the block.

## Animation system

`componentDidMount` drives all motion. Key mechanism: a long selector list auto-tags most elements with `data-reveal` and a staggered `data-delay`, then an IntersectionObserver sets opacity/transform in JS. Reveal states are applied by script, never by CSS, so **content stays visible if JS fails** — preserve that property when adding effects.

Hook attributes recognized by the mount code:

| Attribute | Effect |
| --- | --- |
| `data-reveal` / `data-delay` | Scroll-in fade + translate, staggered (delay 0–3) |
| `data-par` / `data-rot` | Scroll-linked parallax offset, preserving a base rotation |
| `data-polaroid` | Tilted photo entrance; hidden below 1280px wide |
| `data-pull` | Negative top margin only at ≥1100px (About photos overlapping the stats band) |
| `data-cycle-group` / `data-cycle` | Auto-rotating highlighted card every 5s, pauses on hover |
| `data-count` / `data-prefix` / `data-suffix` | Count-up number animation |
| `data-rail` / `data-slide` | Horizontal snap carousel driven by `railPrev` / `railNext` |
| `data-marquee` / `data-marquee-track` | Infinite CSS marquee (portfolio) |
| `data-src` | Marks a portfolio thumb as lightbox-openable |

All listeners, observers, intervals, and rAF handles registered in `componentDidMount` are torn down in `componentWillUnmount` — add cleanup for anything new. `prefers-reduced-motion` is respected throughout.

## Gotchas

- **Portfolio marquee is duplicated.** The track contains the full set of 23 thumbnails twice, the second copy marked `aria-hidden="true"`, to make the loop seamless. Adding, removing, or reordering a photo requires editing **both** copies identically.
- **All three forms post to Web3Forms.** `#form01` on the home page and `#form01` / `#form02` in `lp/index.html` are plain `method="POST"` forms pointing at `https://api.web3forms.com/submit`, with hidden `access_key`, `redirect` (`https://stonelegance.com/thanks/`), `from_name`, `subject` and `source` fields, plus a `botcheck` honeypot. There is no JS handler. Web3Forms does not take file uploads on the free plan, so the home form's photo input was removed. `send.php` is the old Hostinger handler; it is gitignored and no longer wired to anything.
- **Not everything on disk is in the repo.** `.gitignore` keeps `uploads/` (pasted reference screenshots), `assets/` (social cover + Elementor references), `.thumbnail` and `send.php` local. The repo is the deployable site and nothing else.
- Section ids (`#home`, `#about`, `#materials`, `#why`, `#process`, `#portfolio`, `#reviews`, `#faq`, `#areas`, `#contact`) are referenced by the nav, the footer, every CTA, the mobile media query **and every sub-page header, footer and breadcrumb** (`/#materials`, `/#portfolio`, `/#areas`, `/#contact`…). Renaming one means updating all of them.
- The four material cards in the home page's `#materials` rail now link out to their own pages instead of `#contact`; the Backsplashes and Sinks &amp; Edges cards still point at `#contact`.
- Photos are `img/p01.jpg` … `img/p23.jpg`, reused across hero, materials cards, why-us cards, About collage, polaroids, and the portfolio marquee. Replacing a numbered file changes it in several sections at once.

## Brand tokens

Greens `#4E5738` (primary CTA) / `#63704A` (hover); golds `#C8912F`, `#E2B866` (on dark), `#8A5F18` (on light); paper `#FAF9F7`, `#F4F2EE`, `#F1EFEC`; ink `#121212`, `#0D0D0D`, `#141414`. Headings use Montserrat, body uses Archivo. Italic light-weight spans in the accent gold are the recurring headline device.
