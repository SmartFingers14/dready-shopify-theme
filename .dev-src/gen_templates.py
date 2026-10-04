import json, os
root = os.path.join(os.path.dirname(__file__), '..', 'templates')

def w(name, sections, order):
    path = os.path.join(root, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump({"sections": sections, "order": order}, f, indent=2, ensure_ascii=False)
    print('wrote', name)

w('collection.json', {"main": {"type": "main-collection", "settings": {"per_page": 24, "columns": 4, "show_description": True, "enable_filtering": True, "enable_sorting": True}}}, ["main"])
w('list-collections.json', {"main": {"type": "main-list-collections", "settings": {"heading": "Shop"}}}, ["main"])
w('product.json', {
  "main": {"type": "main-product", "blocks": {
    "t1": {"type": "trust", "settings": {"icon": "truck", "text": "Worldwide shipping"}},
    "t2": {"type": "trust", "settings": {"icon": "refresh", "text": "30-day returns"}},
    "t3": {"type": "trust", "settings": {"icon": "star", "text": "Made in small batches"}}},
    "block_order": ["t1", "t2", "t3"],
    "settings": {"show_vendor": False, "show_quantity": True, "show_dynamic_checkout": False, "swatches": True,
                 "made_to_order_text": "Hand-embroidered to order. Please allow 5 working days before dispatch."}},
  "recs": {"type": "product-recommendations", "settings": {"heading": "Complete the look", "limit": 4}}
}, ["main", "recs"])
w('cart.json', {"main": {"type": "main-cart", "settings": {"show_note": True}}}, ["main"])
w('blog.json', {"main": {"type": "main-blog", "settings": {"eyebrow": "Dready culture", "per_page": 12, "columns": 3, "show_excerpt": True}}}, ["main"])
w('article.json', {"main": {"type": "main-article", "settings": {"show_image": True, "show_author": False}}}, ["main"])
w('page.json', {"main": {"type": "main-page", "settings": {}}}, ["main"])
w('page.contact.json', {"main": {"type": "main-contact", "blocks": {
    "c1": {"type": "channel", "settings": {"title": "General", "text": "info@dreadyoriginal.com", "link": "mailto:info@dreadyoriginal.com"}},
    "c2": {"type": "channel", "settings": {"title": "Wholesale", "text": "wholesale@dreadyoriginal.com", "link": "mailto:wholesale@dreadyoriginal.com"}},
    "c3": {"type": "channel", "settings": {"title": "Licensing & collabs", "text": "collabs@dreadyoriginal.com", "link": "mailto:collabs@dreadyoriginal.com"}}},
    "block_order": ["c1", "c2", "c3"], "settings": {"eyebrow": "Get in touch"}}}, ["main"])
w('search.json', {"main": {"type": "main-search", "settings": {}}}, ["main"])
w('404.json', {"main": {"type": "main-404", "settings": {}}}, ["main"])
w('password.json', {"main": {"type": "main-password", "settings": {"eyebrow": "Dready Original", "heading": "Something's brewing", "text": "The new Dready store is nearly ready. Leave your email and be first through the door."}}}, ["main"])
w('customers/login.json', {"main": {"type": "main-login", "settings": {}}}, ["main"])
w('customers/register.json', {"main": {"type": "main-register", "settings": {}}}, ["main"])
w('customers/account.json', {"main": {"type": "main-account", "settings": {}}}, ["main"])
w('customers/order.json', {"main": {"type": "main-order", "settings": {}}}, ["main"])
w('customers/addresses.json', {"main": {"type": "main-addresses", "settings": {}}}, ["main"])
w('customers/reset_password.json', {"main": {"type": "main-reset-password", "settings": {}}}, ["main"])
w('customers/activate_account.json', {"main": {"type": "main-reset-password", "settings": {}}}, ["main"])
