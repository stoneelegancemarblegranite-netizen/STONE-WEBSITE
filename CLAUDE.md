# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for Stone Elegance Marble & Granite (countertop fabricator in Clifton, NJ), authored as one **Design Canvas component file**: `index.html` (was `Stone Elegance v2.dc.html`; renamed so Apache serves it as the document root). It still uses Design Canvas syntax internally — `<x-dc>`, `<helmet>`, `text/x-dc` — driven by `support.js`, despite the plain `.html` extension. That file is the entire site — template, styles, and logic. There is no framework project, no package manager, and no build step.

Alongside it: `lp/index.html` (Google Ads landing page, `noindex`), `thanks/index.html` (post-submit page, `noindex,nofollow`), `redirect/index.html` (digital business card for QR codes and link-in-bio, `noindex,follow`, ships `stone-elegance.vcf` next to it), `404.html`, and the site plumbing — `.htaccess`, `robots.txt`, `sitemap.xml`, `site.webmanifest`.

**Canonical host is `https://stonelegance.com` (no www).** It is hardcoded in five places: `.htaccess` (two RewriteRules), `robots.txt`, `sitemap.xml`, the `redirect` hidden field in all three forms, and the canonical / og:url / JSON-LD block in the home page head. Changing domains means editing all of them.

The home page's indexing tags (canonical, robots, Open Graph, Twitter, `LocalBusiness` + `WebSite` JSON-LD) live in the **real `<head>`**, not in `<helmet>` — they must be parseable before the Design Canvas runtime boots.

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
- Section ids (`#home`, `#about`, `#materials`, `#why`, `#process`, `#portfolio`, `#reviews`, `#faq`, `#areas`, `#contact`) are referenced by the nav, the footer, every CTA, and the mobile media query. Renaming one means updating all four places.
- Photos are `img/p01.jpg` … `img/p23.jpg`, reused across hero, materials cards, why-us cards, About collage, polaroids, and the portfolio marquee. Replacing a numbered file changes it in several sections at once.

## Brand tokens

Greens `#4E5738` (primary CTA) / `#63704A` (hover); golds `#C8912F`, `#E2B866` (on dark), `#8A5F18` (on light); paper `#FAF9F7`, `#F4F2EE`, `#F1EFEC`; ink `#121212`, `#0D0D0D`, `#141414`. Headings use Montserrat, body uses Archivo. Italic light-weight spans in the accent gold are the recurring headline device.
