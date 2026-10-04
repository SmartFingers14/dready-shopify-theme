"""Builds a static HTML preview of the homepage using the real theme CSS/JS.
Liquid can't run locally without a store, so this hand-renders representative
markup matching the sections' output. Run: python3 .dev-src/preview/build_preview.py
"""
import os, shutil
HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)
shutil.copy(os.path.join(ROOT, 'assets/base.css'), OUT)
shutil.copy(os.path.join(ROOT, 'assets/components.css'), OUT)
shutil.copy(os.path.join(ROOT, 'assets/global.js'), OUT)
shutil.copy(os.path.join(ROOT, 'assets/dready-logo.png'), OUT)
for f in os.listdir(os.path.join(ROOT, '.dev-assets')):
    shutil.copy(os.path.join(ROOT, '.dev-assets', f), OUT)

ICON = {
 'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>','search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>','arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>',
 'arrow-left':'<path d="M19 12H5M11 6l-6 6 6 6"/>','pause':'<path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none"/>',
 'play':'<path d="M7 5v14l12-7z" fill="currentColor" stroke="none"/>','tag':'<path d="M3 12V4h8l9 9-8 8-9-9Z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
 'refresh':'<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M4 4v4h4M20 20v-4h-4"/>',
 'pin':'<path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z"/><circle cx="12" cy="11" r="2"/>',
 'ticket':'<path d="M3 9a2 2 0 0 0 2-2V5h14v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2H5v-2a2 2 0 0 0-2-2V9Z"/><path d="M13 5v14"/>',
 'close':'<path d="M18 6 6 18M6 6l12 12"/>','star':'<path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3Z"/>',
 'spotify':'<circle cx="12" cy="12" r="9"/><path d="M7 10c3-1 7-1 10 1M8 13c2.5-.8 5.5-.8 8 .7M9 16c2-.6 4-.6 6 .4"/>',
 'bandcamp':'<path d="M3 17h12l6-10H9z"/>','plus':'<path d="M12 5v14M5 12h14"/>','globe':'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 'instagram':'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>','facebook':'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z"/>',
 'alert':'<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>'}
def icon(n, s=20): return f'<svg class="icon" width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[n]}</svg>'

PRODUCTS = [
 ('Black Wheel It Up!! Embroidered Sweatshirt','£65.00','p-wheel-it-up-sweat.png','p-cargo-grey.jpg',['S','M','L','XL','2XL'],'premium'),
 ('Grey Dready Head 90s Heavy Fleece Cargo Sweatpants','£77.00','p-cargo-grey.jpg','p-wheel-it-up-sweat.png',['S','M','L','XL'],'new'),
 ('White Classic T-Shirt','£30.00','p-classic-tee.jpg','p-dj-dready-tee.png',['S','M','L','XL','2XL','3XL'],None),
 ('Black DJ Dready 90s T-Shirt','£32.00','p-dj-dready-tee.png','p-classic-tee.jpg',['S','M','L','XL'],None),
 ('Rasta Dready Beanie','£13.00','p-rasta-beanie.png','p-new-era-beanie.png',[],None),
 ('Royal Dready × New Era Walking Dread Beanie','£20.00','p-new-era-beanie.png','p-rasta-beanie.png',[],'sale'),
 ('Sand Dready Culture Embroidered Sweatshirt','£45.00','p-wheel-it-up-sweat.png','p-cargo-grey.jpg',['S','M','L','XL'],'premium'),
 ('Black Dready Head Cargo Sweatpants','£77.00','p-cargo-grey.jpg','p-wheel-it-up-sweat.png',['S','M','L','XL','2XL'],None),
]
def card(p, dark=False):
    title, price, a, b, sizes, badge = p
    badges = ''
    if badge=='sale': badges = '<span class="badge badge--sale">Sale</span>'
    elif badge=='new': badges = '<span class="badge badge--accent">New</span>'
    if badge=='premium': badges += '<span class="badge">Premium</span>'
    size_html = ''.join(f'<button type="button" class="product-card__size" data-quick-add="1">{s}</button>' for s in sizes) if sizes else '<button type="button" class="product-card__size product-card__size--single" data-quick-add="1">Add to basket</button>'
    compare = '<s class="price__compare">£35.00</s>' if badge=='sale' else ''
    return f'''<article class="product-card">
  <div class="product-card__media media media--portrait" data-card-media data-has-second>
    <a href="#" class="product-card__link" aria-label="{title}" tabindex="-1">
      <img src="{a}" alt="{title}" class="product-card__img product-card__img--primary" loading="lazy">
      <img src="{b}" alt="" class="product-card__img product-card__img--secondary" loading="lazy">
    </a>
    {f'<div class="product-card__badges">{badges}</div>' if badges else ''}
    <div class="product-card__sizes" role="group" aria-label="Quick add {title}">{size_html}</div>
  </div>
  <div class="product-card__info">
    <h3 class="product-card__title"><a href="#">{title}</a></h3>
    <div class="price{' price--sale' if badge=='sale' else ''}"><span class="price__current">{price}</span>{compare}</div>
  </div>
</article>'''

parts = ['p1-head.html', 'p2-hero-products-tiers.html', 'p3-dbay-collabs.html', 'p4-music.html', 'p5-events.html', 'p6-community-footer.html']
tpl = ''.join(open(os.path.join(HERE, p)).read() for p in parts)
look = ''.join(f'<li class="shop-look__item"><span class="shop-look__num">{i+1}</span>{card(p)}</li>' for i, p in enumerate(PRODUCTS[:2]))
html = tpl.replace('{{CARDS}}', '\n'.join(card(p) for p in PRODUCTS)) \
          .replace('{{CARDS_DBAY}}', '\n'.join(card(p) for p in PRODUCTS[4:8])) \
          .replace('{{LOOK_CARDS}}', look)
for k in ICON:
    html = html.replace('{{icon:'+k+'}}', icon(k)).replace('{{icon14:'+k+'}}', icon(k,14)).replace('{{icon18:'+k+'}}', icon(k,18)).replace('{{icon12:'+k+'}}', icon(k,12))
open(os.path.join(OUT, 'index.html'), 'w').write(html)
print('preview →', os.path.join(OUT, 'index.html'))
