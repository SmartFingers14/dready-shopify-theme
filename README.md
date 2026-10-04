# Dready Original — Shopify Theme

Custom Shopify Online Store 2.0 theme for [dreadyoriginal.com](https://dreadyoriginal.com).
Premium streetwear storefront inspired by Daily Paper's commerce architecture and Nervous Records' cultural edge.

## Homepage sections
Announcement marquee · Transparent-to-solid header with mega menu, search & cart drawers · Video hero ·
Featured products (hover image swap + size quick-add) · Premium & Standard split · Shop the Look (hotspots) ·
DBAY (sales & returns) · Collabs · Comic strip slider · Music · Events (interactive flyers) · Join the community · Footer

All sections are JSON-templated and fully editable/reorderable in the Shopify theme editor.

## Structure
```
assets/     CSS tokens, components, vanilla JS web components, logo
config/     settings_schema.json
layout/     theme.liquid, password.liquid
locales/    en.default.json
sections/   homepage + main-* page sections
snippets/   product-card, mega-menu, drawers, variant picker, etc.
templates/  JSON templates (index, product, collection, blog, account…)
.dev-src/   source partials + build/preview scripts (not loaded by Shopify)
```

## Connect to Shopify
Shopify Admin → Online Store → Themes → **Add theme → Connect from GitHub** → select this repo & `main` branch.

## Local dev
```bash
bash .dev-src/build.sh             # rebuild assets/base.css, components.css, global.js from .dev-src
shopify theme dev --store <store>  # live preview against a store
shopify theme check                # lint
```
