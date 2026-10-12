# Old site vs new theme — full page audit

Audited 13 Oct 2026. Discovery: Firecrawl `map` of dreadyoriginal.com (1,021 URLs: 237 products,
65 collections, 25 pages, blog + 12 articles, home, and full /da + /es language copies) plus every
link in the old theme's header, footer and homepage. Each page was rendered in both themes
(old: Broadcast `138876223645`, new: `193788543351`) and compared.

## Content pages (25 + menu links)

| Page | Old theme | New theme now | Action |
|---|---|---|---|
| /pages/gallery (Caught on Camera) | PageFly, 27 photos | ✅ `gallery` template, 69 photos | — |
| /pages/graffiti | PageFly, 19 photos | ❌ blank (default template) | Assign `gallery` template |
| /pages/street-art (Fan Art) | PageFly, 31 photos | ❌ blank | Assign `gallery` template |
| /pages/music | PageFly | ✅ `music` template | — |
| /pages/music-news-tv | PageFly, Izachar video | ❌ blank | Assign `music` template |
| /pages/news | PageFly news list | ✅ `news` template | — |
| /pages/collabs | PageFly (not linked from menus) | ✅ `collabs` template | — |
| /pages/collaborations (menu: Contact › Collabs) | "Please email victoria@" | ✅ `collabs` template | — (user assigned) |
| /pages/dready (Dr. Dready) | PageFly | ✅ `coming-soon` template | — |
| /pages/testimonials | PageFly, 6 quotes (one quote copied 6×) | ❌ blank, in Google sitemap | Rebuild with real quotes, or unpublish |
| /pages/contact | form + phone/address/email | ✅ works | Form lost the "How did you hear about us?" field |
| /pages/wholesale-enquiries | text | ✅ same | — |
| /pages/licensing-enquiries | text | ✅ same | — |
| /pages/data-sharing-opt-out | Shopify privacy page | ✅ same | — |
| /pages/history-about-us | placeholder "sdfghjk" | same (placeholder) | Needs real About/History copy |
| /pages/wellbeing | placeholder "ertyujnbv" | same | Write or unpublish |
| /pages/about-us (menu: Roots › About Us) | 404 | 404 | Menu should point to history-about-us |
| /pages/bundles, /pages/fastbundles, /pages/collection-bundle | empty (bundle app shows nothing) | empty | Unpublish (dead app pages) |
| /pages/avada-sitemap(+5) | AVADA HTML sitemaps | same | Keep or remove with AVADA |

## Store-wide

- **Language versions /da and /es** — old theme translated the shop UI (e.g. "Agregar al carrito");
  new theme only ships `en.default.json`, so Danish/Spanish visitors see English buttons/labels.
- **16 empty collections** (BTKA, Handspun Records, Don't Do The Dodo, Have A Nice Day, Gems,
  Jewellery-1, Bundles ×2, Trainers, Vortex ×2, Original 90's Guest Brands, Shurl the girl,
  Sam the Man, Sista Joggers…) — empty on BOTH themes (products unpublished); still in the sitemap.
- **gift_card.liquid missing** in the new theme — the page buyers of the Dready Gift Card land on.

## Product page — old features not in the new theme

- Afterpay/Clearpay "4 interest-free payments" message (script loads, no placement → nothing shows)
- "Buy it now" dynamic checkout buttons (setting exists, currently off)
- Facebook / Pinterest share links
- Structured data (Product, Breadcrumb, Organization, WebSite — was AVADA)
- (Reviews badge was empty on the old site — the Shopify Product Reviews app is discontinued — nothing lost)

## Homepage — old content not on the new homepage

- "Shop by category" tiles: Tees, Hoods, Front & back prints, Embroidery, Beanies/Hats,
  Smoking corner, Sweatshirts, SISTA (with the collection photos)
- Graffiti "Dready" wordmark hero with ROOTS • CULTURE • PEACE
- "Roots of an icon" block with the Peace graffiti illustration
- Homepage video linked to the YouTube channel @dreadyselecta
