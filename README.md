# CX Machinery — product website

A data-driven **Next.js (App Router)** site for a plastic film & bag-making
machinery manufacturer. Every model and spec table from the source deck is
typed in `lib/products.ts` and rendered consistently across the catalogue.

## Run it

```bash
npm install     # needs internet (pulls Next, React, three.js, fonts)
npm run dev     # http://localhost:3000
```

> The build was assembled offline, so dependencies aren't installed yet —
> `npm install` is required on first run.

## What's inside

| Route | Page |
|-------|------|
| `/` | Home — 3D blown-film hero, production-pipeline overview, flagship line, full family index |
| `/products` | Catalogue index grouped by production stage |
| `/products/[category]` | Category page with every family's full bilingual spec table |
| `/contact` | Quote-request form (front-end only — wire up to your mail/form service) |

Categories: `film-blowing`, `bag-making`, `recycling`.

## Design

- **Palette:** graphite + steel with a single molten-orange accent (extrusion heat)
- **Type:** Saira (display) · Inter (body) · IBM Plex Mono (spec data & model codes)
- **Signature:** a procedural blown-film "bubble" rendered in react-three-fiber,
  plus a dimension-tick motif. It's decorative and code-generated — swap in real
  GLB exports from your SketchUp/CAD models for a true product viewer later.

## Editing the catalogue

All product data lives in **`lib/products.ts`**. Add or edit a `ProductFamily`
object (series, name, models, specs) and every page updates automatically.

## Before launch — replace placeholders

- `BRAND` constant in `lib/products.ts` (currently "CX Machinery")
- Contact email / phone in `app/contact/page.tsx` and the footer
- Some bag-making families had no model code in the source deck; they're
  labelled by bag width — confirm the real model numbers.
- Wire the contact form to a real handler (e.g. Formspree, Resend, an API route).

## .claude/

The `.claude/skills/` folder carries the design skills bundled earlier and is
unrelated to the running app. `install-extra-skills.sh` fetches the remaining
community skills on a machine with internet + Node.


## Machine images

Real product renders were extracted from your source deck into
`public/machines/` — one per family, named to match its slug
(`public/machines/<family-slug>.png`). They appear in:

- the **hero** (flagship tower, bag line, recycling line — crossfading on scroll)
- the **gallery** band and **spec callouts** on the home page
- every **family card** and beside every **spec table** on the catalogue pages

For production, consider converting them to **WebP** (~60% smaller) and updating
the `/machines/*.png` references, or swap to `next/image` for automatic optimization.
