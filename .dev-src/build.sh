#!/usr/bin/env bash
# Concatenates .dev-src partials into the shipped theme assets.
# Run after editing anything in .dev-src/css or .dev-src/js:
#   bash .dev-src/build.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cat .dev-src/css/01-tokens.css \
    .dev-src/css/02-type-layout.css \
    .dev-src/css/03-forms-media.css \
    .dev-src/css/04-motion-scroller.css \
    .dev-src/css/05-misc.css > assets/base.css

cat .dev-src/css/c01-announcement.css \
    .dev-src/css/c02-nav.css \
    .dev-src/css/c03-search-cart.css \
    .dev-src/css/c04-product-card.css \
    .dev-src/css/c05-hero-tiers.css \
    .dev-src/css/c06-look-dbay.css \
    .dev-src/css/c07-culture.css \
    .dev-src/css/c08-community-footer.css \
    .dev-src/css/c09-pages.css \
    .dev-src/css/c10-blog-account.css \
    .dev-src/css/c11-culture-pages.css \
    .dev-src/css/c12-gift-card.css \
    .dev-src/css/c13-gift-shop.css \
    .dev-src/css/c14-pdp-extras.css \
    .dev-src/css/c15-home.css \
    .dev-src/css/c16-community.css > assets/components.css

# Page-specific styles, loaded only where needed (layout/theme.liquid)
cp .dev-src/css/c17-policies.css assets/policies.css
cp .dev-src/css/c18-about.css assets/about.css
cp .dev-src/css/c19-contact.css assets/contact.css
cp .dev-src/css/c20-listing.css assets/listing.css

cat .dev-src/js/01-core.js \
    .dev-src/js/02-header-motion.js \
    .dev-src/js/03-sliders.js \
    .dev-src/js/04-interactions.js \
    .dev-src/js/05-cart.js \
    .dev-src/js/06-variants.js \
    .dev-src/js/07-culture.js \
    .dev-src/js/08-gift.js \
    .dev-src/js/09-product-share.js \
    .dev-src/js/10-family.js > assets/global.js

# Page-specific scripts, loaded only where needed (layout/theme.liquid)
cp .dev-src/js/11-policy.js assets/policy.js
cp .dev-src/js/12-about.js assets/about.js
cp .dev-src/js/13-contact.js assets/contact.js
for f in assets/policy.js assets/about.js assets/contact.js; do node --check "$f"; done

node --check assets/global.js
python3 - <<'PY'
for f in ('assets/base.css', 'assets/components.css', 'assets/policies.css', 'assets/about.css', 'assets/contact.css', 'assets/listing.css'):
    s = open(f).read()
    assert s.count('{') == s.count('}'), f'brace mismatch in {f}'
    print(f'OK {f}: {s.count(chr(10))} lines')
PY
echo "OK assets/global.js"
