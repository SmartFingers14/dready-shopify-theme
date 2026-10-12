# Old theme inventory — what to carry into the new Dready theme

Audited 13 Oct 2026 while the previous theme was live on dreadyoriginal.com.
Old theme: **Broadcast v1.6.3** (theme name "R 7 25", theme id 138876223645).

---

## 1. Must carry over — the store loses these when the new theme goes live

| What | How it works in the old theme | What to do in the new theme |
|---|---|---|
| **Klaviyo** (10% sign-up popup "Unlock 10% off", "Get 10% off!" teaser, reviews, onsite tracking) | App embed `klaviyo-onsite-embed` | Theme editor → App embeds → turn **Klaviyo** on |
| **Klaviyo "Viewed Product" tracking** (powers browse-abandonment emails) | Hand-added `_learnq.push(['track','Viewed Product'…])` snippet on the product page | Add the same snippet to `main-product` |
| **Shopify Inbox chat** bubble | App embed `inbox/chat` | Theme editor → App embeds → turn **Inbox** on |
| **Structured data + SEO title/meta** (Organization, WebSite, Product, Breadcrumb JSON-LD) | AVADA SEO Suite snippets in `<head>` | Either enable AVADA in the new theme or add our own JSON-LD (audit problem 7) |
| **Afterpay / Clearpay** "or 4 interest-free payments" on product pages | Afterpay widget script | Re-add the messaging block on the product page |
| **Homepage title** "Dready Original: Sustainable Streetwear & Lifestyle Brand" | AVADA / title tag | New theme shows "DREADY – Dready Original" — match the old title |
| **EU tax announcement** "EU CUSTOMERS: WE'VE GOT YOU COVERED! WE PAY ALL TAXES ON ORDERS UNDER €150. FOR ORDERS OVER €150, TAXES WILL BE PAYABLE UPON DELIVERY." | Header announcement | Put into the announcement bar |
| Other script apps — confirm still wanted: Instafeed (Instagram feed), GetSiteControl (popups), SpurIT installment payments, Enorm bundle app, Automizely/AfterShip conversions | Script tags / theme snippets | Check each in Shopify admin → Apps; re-enable only what's used |

**PageFly pages** — Music, News, Music-News-TV, Gallery, Graffiti, Street Art (Fan Art), Collabs, Testimonials, Dr. Dready were built with the PageFly app. Their layout lives inside each page, so they need checking in the new theme (PageFly's app embed may also need enabling).

---

## 2. Brand assets already in Shopify Files (usable straight from the theme editor)

| Asset | File | Use for |
|---|---|---|
| **Graffiti "Dready" wordmark + ® + "ROOTS • CULTURE • PEACE"** in Rasta colours | `files/EBDDCE4A-459F-4865-8595-0A1E42F67EA0.png` | Hero / about / footer brand block (strongest brand mark on the old site) |
| Dready head (Rasta hat) logo | `files/DREADY_Head_4ef627b5-1a37-4379-9d61-9d2901606d7b.png` (4000px) | Logo / share image |
| Head icon without leaf | `files/dready-icon-_without_leaf_and_white_oultine.png`, favicon `dready-icon-_without_leaf.png` | Favicon / small marks |
| **"Peace" graffiti illustration** (Dready character on a brick wall) | `files/in-the-beginning-image-v2.jpg` | Roots / story section, comic-strip feel |
| Collection banners: group in Dready tees, outfit shot (used for Shop the Look), model with tee, shop rail of tees | collection images for dready-tees, premium-hoods, front-and-back-prints, dready (embroidery) | Collection tiles / Premium & Standard split |
| Graffiti wall photos (19), "Caught on Camera" photos (27), Fan Art (32) | Gallery / Graffiti / Street Art pages | Gallery section, culture band |
| Homepage video (`03cbc74b…mp4`) — clicks through to YouTube @dreadyselecta | already used by our hero | Add the YouTube link to the hero / music section |

---

## 3. Copy & information to reuse

**Brand line / meta:** "Shop DREADY – Independent British streetwear rooted in art and culture. Original graphic clothing and accessories since 1983."
Tagline: **Roots • Culture • Peace**.

**Product promise** (end of product descriptions): "All orders are made with love and good energy, in the UK by hands of well paid adults. Peace & Love." + "Please allow five working days." → good for the product-page trust strip / made-to-order note.

**Contact & departments**
- Phone 01392 247 977 · Address: Dready Original, Queensgate House, 48 Queen Street, Exeter, EX4 3SR · Info@dreadyoriginal.com
- Wholesale & Collabs: victoria@dreadyoriginal.com
- Licensing: Robert — robert@dreadyoriginal.com
- Contact form asks "How did you hear about us?" (Instagram/Facebook, Web search, Print ad, From a friend)

**Socials:** Instagram @dreadybrand · Facebook (profile id 100083340129198) · Twitter/X @dreadybrand · YouTube @dreadyselecta

**Music (→ our Music section, real content instead of sample data)**
- Dready x Reds (06/10/23) — YouTube
- **Dready Selecta "Volume On!"** album (20/04/23) — on Amazon Music
- Dready x Ash Walker — New Year Dready Roots mix (31/12/22)
- Dready Selecta Mix #1 — Izachar (07/12/22), YouTube, with tracklist

**Collabs / News (→ our Collabs section)**
- Dready x Nike · Dready x New Era (Walking Dread beanie) · Dready x Johnny Hoxton (jewellery) · Dready x GB Wearable Art (custom kicks) · Dready x Weekend Offender · Dready x Urban Vault · Dready x Jungle Cakes · ERNS x Dready x Derz · Lookbook featuring DJ Oneman
- **Jamaica Skate Culture Foundation partnership** — a % of profits helps build skateparks in Jamaica (strong "cause" story for the About/Community section)

**Testimonials:** Aaron Thalmann (Weekend Offender) quote about distributing Dready across the UK, France and Italy in the 90s. ⚠️ The same quote is copy-pasted under 5 other names (Edson Patta, Chris Donnelly/Gio-Goi, Daz/Green Pound Gang, Rob Ackroyd/Florence & the Machine, Rhys Sylvester aka Mist) — need their real quotes before reuse.

**Typography of the old brand:** Titan One (chunky headings) + Fjalla One (condensed body/nav). Our theme uses a clean grotesk; Titan One could return as an accent font for culture sections if the client wants the old feel.

---

## 4. Problems found on the old store content (fix whatever theme is live)

- **History / About Us page body is placeholder text "sdfghjk"** — the hero "Our roots" button now points here. Needs a real story (the old homepage's Roots button pointed to /pages/news instead).
- **Wellbeing page body is "ertyujnbv"** (placeholder).
- **Testimonials** — duplicate quote (see above).
- "Dr. Dready" page — Blockcbd capsules/gummies/drinks "coming soon" (CBD; check it's still planned and legally reviewed before featuring).
- Typos in collection tiles: "Embroidery **Achieve**" (Archive), "**Emboidery**".
- Bundles / Mix and Match pages are empty.
- `/pages/about-us`, `/pages/incubata`, `/pages/lifestyle`, `/pages/artist-profiles` don't exist but are linked from menus.
