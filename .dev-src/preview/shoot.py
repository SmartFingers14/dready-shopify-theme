"""Screenshots the preview with Playwright. All output images are capped at
1000px wide (user requirement). Desktop is rendered at 1440 and downscaled;
mobile at 390 (native).  Run: python3 .dev-src/preview/shoot.py
"""
import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
SHOTS = os.path.join(HERE, 'shots')
os.makedirs(SHOTS, exist_ok=True)
URL = 'file://' + os.path.join(OUT, 'index.html')
MAX_W = 1000

def cap(path):
    im = Image.open(path)
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        im.save(path)
    # also cap height to keep individual images readable; split into slices if huge
    return im.size

def shoot_sections(page, prefix, sections, viewport):
    page.set_viewport_size(viewport)
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(600)
    page.evaluate("document.querySelectorAll('.reveal,.reveal-stagger').forEach(e=>e.classList.add('is-visible'))")
    results = []
    for name, sel in sections:
        el = page.query_selector(sel)
        if not el:
            print('skip', name); continue
        if sel == '.hero':
            # Hero: shoot from true page top so the transparent-over-video header state is visible
            page.evaluate("window.scrollTo(0,0); document.querySelector('.announcement-bar')?.remove()")
            page.evaluate("document.querySelector('[data-header]')?.classList.remove('is-scrolled')")
            page.wait_for_timeout(250)
            path = os.path.join(SHOTS, f'{prefix}-{name}.png')
            page.screenshot(path=path, clip={'x': 0, 'y': 0, 'width': viewport['width'], 'height': viewport['height']})
            results.append((path, cap(path)))
            continue
        # Other sections: hide the sticky header so the section is captured cleanly
        page.evaluate("document.querySelector('.shopify-section-header').style.visibility='hidden'")
        el.scroll_into_view_if_needed()
        page.wait_for_timeout(250)
        path = os.path.join(SHOTS, f'{prefix}-{name}.png')
        el.screenshot(path=path)
        results.append((path, cap(path)))
    return results

SECTIONS = [
    ('01-hero', '.hero'),
    ('02-products', '.featured-products'),
    ('03-tiers', '.tier-split'),
    ('04-look', '.shop-look'),
    ('05-dbay', '.dbay'),
    ('06-collabs', '.collabs'),
    ('07-comic', '.comic'),
    ('08-music', '.music'),
    ('09-events', '.events'),
    ('10-community', '.community'),
    ('11-footer', '.footer'),
]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    ctx = browser.new_context(device_scale_factor=1)
    page = ctx.new_page()
    desk = shoot_sections(page, 'desktop', SECTIONS, {'width': 1440, 'height': 900})
    # mega menu open state
    page.set_viewport_size({'width': 1440, 'height': 900})
    page.goto(URL, wait_until='networkidle'); page.wait_for_timeout(400)
    page.evaluate("window.scrollTo(0, 900)"); page.wait_for_timeout(300)
    page.hover('[data-mega-trigger]'); page.wait_for_timeout(400)
    path = os.path.join(SHOTS, 'desktop-00-megamenu.png'); page.screenshot(path=path, clip={'x':0,'y':0,'width':1440,'height':520}); cap(path)
    # product card hover state
    page.evaluate("window.scrollTo(0, 0)"); page.wait_for_timeout(200)
    card = page.query_selector('.featured-products .product-card'); card.scroll_into_view_if_needed(); card.hover(); page.wait_for_timeout(500)
    path = os.path.join(SHOTS, 'desktop-02b-card-hover.png'); card.screenshot(path=path); cap(path)
    mob_page = ctx.new_page()
    mob = shoot_sections(mob_page, 'mobile', [('01-hero', '.hero'), ('02-products', '.featured-products'), ('03-tiers', '.tier-split'), ('05-dbay', '.dbay'), ('09-events', '.events'), ('11-footer', '.footer')], {'width': 390, 'height': 844})
    browser.close()

for path, size in desk + mob:
    print(os.path.basename(path), size)
