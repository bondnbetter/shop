// Bond & Better · checkout for Facebook & Instagram shoppers (shop.bondandbetter.com/checkout/).
// A plain web page (Instagram's and Facebook's in-app browsers won't load a Google web app). Prices, tax, codes and the
// order itself come from the online store web app, so everything lands in the books like any online order.
var API = 'https://script.google.com/macros/s/AKfycbxHDysj2Av9_SwTcDjbH6A0yMohdJyq3_LyhXvoXUH9QCBeZjH2FSvGTKKZ66m9wnS1/exec';
var Q = {}; (location.search || '').replace(/^\?/, '').split('&').forEach(function (kv) { if (!kv) return; var i = kv.indexOf('='), k = decodeURIComponent((i < 0 ? kv : kv.slice(0, i)).replace(/\+/g, ' ')), v = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); Q[k] = v; });
var D = { cat: null, cfg: null }, CK = null, PK = null;
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function money(n) { n = Math.round(Number(n) * 100) / 100; return (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function money0(n) { n = Math.round(Number(n) * 100) / 100; return n % 1 ? money(n) : '$' + n.toFixed(0); }
function view(h) { $('view').innerHTML = h; window.scrollTo(0, 0); }
var toastT = null;
function toast(m, err) { var t = $('toast'); t.textContent = m; t.className = 'show' + (err ? ' err' : ''); clearTimeout(toastT); toastT = setTimeout(function () { t.className = ''; }, err ? 6500 : 2600); }
var busyN = 0; function busy(on) { busyN += on ? 1 : -1; $('busy').style.display = busyN > 0 ? 'block' : 'none'; }
// Talk to the store (JSON). A plain-text POST needs no extra permission check, so it works from any browser.
function api(a, p, quiet) {
  busy(true);
  return fetch(API, { method: 'POST', body: JSON.stringify({ a: a, p: p || {} }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
    .then(function (r) { return r.json(); })
    .then(function (j) { busy(false); if (j.error) throw new Error(j.error); return j.r; })
    .catch(function (e) { busyN = Math.max(1, busyN); busy(false); if (!quiet) toast(String(e.message || e).replace(/^Failed to fetch$/, 'We couldn’t reach the shop — check your connection and try again.'), true); return undefined; });
}
function shopLink() { return (D.cfg && D.cfg.shop) || '/'; }
function fromApp() { return Q.cart_origin === 'instagram' ? 'Instagram' : Q.cart_origin === 'facebook' ? 'Facebook' : /Instagram/i.test(navigator.userAgent) ? 'Instagram' : /FBAN|FBAV/i.test(navigator.userAgent) ? 'Facebook' : 'Facebook & Instagram'; }

/* ---------- pieces: groups (sizes), families (linked metals) ---------- */
function item(sku) { return (D.cat || []).find(function (x) { return x.sku === sku; }); }
function groups(list) { var out = [], by = {}; (list || D.cat || []).forEach(function (x) { if (!x.style) { out.push({ key: x.sku, first: x, items: [x] }); return; } if (!by[x.style]) { by[x.style] = { key: x.style, first: x, items: [] }; out.push(by[x.style]); } by[x.style].items.push(x); }); return out; }
function fams(list) {
  var out = [], by = {};
  groups(list).forEach(function (g) { var mg = g.first.mg; if (!mg) { out.push({ key: g.key, gs: [g], g: g }); return; } if (!by[mg]) { by[mg] = { key: mg, gs: [], g: null }; out.push(by[mg]); } by[mg].gs.push(g); });
  out.forEach(function (f) { if (f.gs.length < 2) { f.key = f.gs[0].key; f.g = f.gs[0]; return; } f.gs.sort(function (a, b) { return a.first.mg_sort - b.first.mg_sort; }); f.g = f.gs.find(function (x) { return x.first.mg_main; }) || f.gs[0]; });
  return out;
}
function famOf(key) {
  var all = fams(), f = all.find(function (x) { return x.key === key; }); if (f) return { f: f, g: f.g };
  for (var i = 0; i < all.length; i++) { var g = all[i].gs.find(function (x) { return x.key === key || x.items.some(function (it) { return it.sku === key; }); }); if (g) return { f: all[i], g: g }; }
  return null;
}
function famName(f, g) { return f.gs.length > 1 ? (g.first.mg_name || g.first.name) : g.first.name; }
function swatch(sw, on) { var bg = { gold: 'linear-gradient(135deg,#E9CF8F,#C9A55A)', silver: 'linear-gradient(135deg,#F2F2F2,#B9BBBE)', rose: 'linear-gradient(135deg,#F1C7B6,#C98F7A)', mixed: 'linear-gradient(135deg,#E9CF8F 50%,#C9CBCE 50%)' }[sw] || '#D9D2CC'; return '<span class="sw" style="background:' + bg + (on ? ';border-color:currentColor' : '') + '"></span>'; }
function famPrice(f) { var ps = f.gs.map(function (g) { return g.first.price; }), lo = Math.min.apply(null, ps), hi = Math.max.apply(null, ps); return lo === hi ? money(lo) : 'From ' + money(lo); }
function descHtml(t) { return String(t || '').replace(/\r\n?/g, '\n').split('\n').map(function (ln) { var m = ln.match(/^\s*([^:]{1,40}):\s+(.+)$/); return m ? '<b>' + esc(m[1].trim()) + ':</b> ' + esc(m[2]) : esc(ln); }).join('<br>'); }
function alsoFor(f) {
  var x = f.g.first, all = fams(), out = [], seen = {}; seen[f.key] = 1; f.gs.forEach(function (g) { seen[g.key] = 1; });
  var add = function (h) { if (!h || out.length >= 4 || seen[h.f.key]) return; seen[h.f.key] = 1; out.push(h.f); };
  (x.also || []).forEach(function (k) { add(famOf(k)); });
  var near = function (test) { all.forEach(function (o) { if (out.length < 4 && !seen[o.key] && o.gs.some(function (g) { return test(g.first); })) add({ f: o }); }); };
  if (x.type) near(function (y) { return y.type === x.type; });
  if ((x.collections || []).length) near(function (y) { return (y.collections || []).some(function (c) { return x.collections.indexOf(c) >= 0; }); });
  near(function (y) { return y.cat === x.cat; });
  near(function () { return true; });
  return out;
}

/* ---------- one piece (from a product link) ---------- */
// Meta's price is the regular price (no online sale prices or promotions).
function product(key, keepSize) {
  var h = famOf(key);
  if (!h) { view('<section class="pad"><h2>That piece isn’t available anymore</h2><p><a class="btn" href="' + esc(shopLink()) + '">Browse the shop</a></p></section>'); return; }
  var f = h.f, g = h.g, x = g.first, sized = g.items.length > 1;
  var sz = sized ? (g.items.find(function (i) { return keepSize && i.size === keepSize; }) || g.items[0]) : x;
  PK = { key: key, g: g, sku: sz.sku, qty: 1 };
  var pics = (x.photo ? [x.photo] : []).concat(x.more || []);
  view('<div class="prodpage"><div>' + (pics.length ? '<div class="gal" id="gal" onscroll="galSync()">' + pics.map(function (u) { return '<img src="' + u + '" alt="' + esc(x.name) + '">'; }).join('') + '</div>' +
      (pics.length > 1 ? '<div class="gthumbs">' + pics.map(function (u, i) { return '<button' + (i ? '' : ' class="on"') + ' onclick="galTo(' + i + ')" aria-label="Photo ' + (i + 1) + '"><img src="' + u + '" alt=""></button>'; }).join('') + '</div>' : '') : '<div class="nophoto">Photo coming soon</div>') + '</div>' +
    '<div class="pad">' + (x.type ? '<span class="label">' + esc(x.type) + '</span>' : '') + '<h2>' + esc(x.name) + '</h2><div class="price" id="pp">' + money(sz.price) + '</div>' +
    (f.gs.length > 1 ? '<div class="f"><span>Metal · <b>' + esc(x.metal) + '</b></span><div class="chips">' + f.gs.map(function (y) { return '<button class="chip' + (y === g ? ' on' : '') + '" onclick="product(\'' + esc(y.key) + '\',PK&&item(PK.sku)?item(PK.sku).size:\'\')">' + swatch(y.first.swatch, y === g) + esc(y.first.metal) + '</button>'; }).join('') + '</div></div>' : '') +
    (sized ? '<label class="f">' + (x.cat === 'Rings' ? 'Ring size' : esc(x.opt || 'Size')) + '<select id="psz" onchange="PK.sku=this.value;$(\'pp\').textContent=money(item(this.value).price)">' + g.items.map(function (i) { return '<option value="' + esc(i.sku) + '"' + (i === sz ? ' selected' : '') + '>' + esc(i.size) + '</option>'; }).join('') + '</select></label>' : '') +
    (x.description ? '<div class="desc">' + descHtml(x.description) + '</div>' : '') + (x.material ? '<div class="small muted">' + esc(x.material) + '</div>' : '') +
    '<div class="qty"><button onclick="pq(-1)" aria-label="Less">−</button><span id="pqn">1</span><button onclick="pq(1)" aria-label="More">+</button></div>' +
    '<button class="btn wide" onclick="buyNow()">Check out</button><a class="link center" href="' + esc(shopLink()) + '">Browse the full shop</a>' +
    (D.cfg.ship_short ? '<div class="small muted">' + esc(D.cfg.ship_short) + '</div>' : '') + '</div></div>' +
    (function () { var a = alsoFor(f); return a.length ? '<section class="pad"><h3>You might also like</h3><div class="also">' + a.map(function (o) { var y = o.g.first; return '<button class="mini" onclick="product(\'' + esc(o.key) + '\')"><span class="ph">' + (y.photo ? '<img src="' + y.photo + '" alt="" loading="lazy">' : '') + '</span><span class="nm">' + esc(famName(o, o.g)) + '</span><span class="small">' + famPrice(o) + '</span>' + (o.gs.length > 1 ? '<span class="dots">' + o.gs.map(function (g2) { return swatch(g2.first.swatch); }).join('') + '</span>' : '') + '</button>'; }).join('') + '</div></section>' : ''; })());
}
function galTo(i) { var g = $('gal'); if (g) g.scrollTo({ left: i * g.clientWidth, behavior: 'smooth' }); }
function galSync() { var g = $('gal'); if (!g || !g.clientWidth) return; var i = Math.round(g.scrollLeft / g.clientWidth); [].forEach.call(document.querySelectorAll('.gthumbs button'), function (b, k) { b.className = k === i ? 'on' : ''; }); }
function pq(d) { PK.qty = Math.max(1, Math.min(99, PK.qty + d)); $('pqn').textContent = PK.qty; }
function buyNow() { var g = PK.g; startCart([{ id: g.key, qty: PK.qty, sizes: g.items.length > 1 ? [PK.sku] : [] }]); }

/* ---------- checkout (Meta's cart, or "Check out" on a piece) ---------- */
function startCart(lines, products) {
  CK = { lines: null, coupon: Q.coupon || '', q: null, first: true, bad: [] };
  view('<section class="pad muted">Getting your order ready…</section>');
  api('metaCart', lines ? { lines: lines, coupon: CK.coupon } : { products: products, coupon: CK.coupon }).then(function (q) {
    if (!q) { view('<section class="pad"><h2>We couldn’t load your order</h2><p><a class="btn" href="' + esc(shopLink()) + '">Go to the shop</a></p></section>'); return; }
    CK.lines = q.groups.map(function (g) { return { id: g.id, qty: g.qty, sizes: g.slots.map(function (x) { return x.sizes ? (x.chosen || '') : ''; }) }; });
    CK.bad = q.bad; CK.q = q; ckDraw();
  });
}
function stateOpts(v) { return '<option value="">State</option>' + D.cfg.states.map(function (s) { return '<option' + (s === v ? ' selected' : '') + '>' + s + '</option>'; }).join(''); }
function countyOpts(v, list) { return '<option value="">Choose…</option>' + (list || D.cfg.fl_counties).map(function (s) { return '<option' + (s === v ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join(''); }
var FLZ = null;
function flZip(zip) { var c = D.cfg; if (!FLZ) { FLZ = {}; String(c.fl_zips || '').split(' ').forEach(function (t) { var k = t.split(':'); if (k[1]) FLZ[k[0]] = k[1].split(',').map(function (n) { return c.fl_zip_cty[Number(n)]; }); }); } return FLZ[String(zip || '').trim().slice(0, 5)] || null; }
function flUpd() {
  var st = $('ck-st'), zp = $('ck-zip'), sel = $('ck-cty'); if (!st || !zp || !sel) return;
  var box = sel.parentNode, zip = String(zp.value || '').trim(), cur = sel.value;
  if (st.value !== 'FL' || !/^\d{5}/.test(zip)) { box.classList.add('hidden'); if (st.value !== 'FL') sel.value = ''; return; }
  var z = flZip(zip);
  if (z && z.length === 1) { sel.innerHTML = countyOpts(z[0], z); sel.value = z[0]; box.classList.add('hidden'); return; }
  sel.innerHTML = countyOpts(z && z.indexOf(cur) >= 0 ? cur : (z ? z[0] : cur), z || null); box.classList.remove('hidden');
}
function ckShip() { return $('ck-st') ? { address1: $('ck-a1').value, address2: $('ck-a2').value, city: $('ck-city').value, state: $('ck-st').value, zip: $('ck-zip').value, county: $('ck-cty').value } : null; }
function ckForm() { var a = ckShip(); return { first_name: $('ck-fn').value, last_name: $('ck-ln').value, email: $('ck-em').value, phone: $('ck-ph').value, birthday: $('ck-bd').value, optin: $('ck-opt').checked, address1: a.address1, address2: a.address2, city: a.city, state: a.state, zip: a.zip, county: a.county }; }
function ckDraw() {
  var q = CK.q;
  var bad = CK.bad && CK.bad.length ? '<div class="note bad">' + (CK.bad.length === 1 ? 'One piece' : CK.bad.length + ' pieces') + ' from your cart ' + (CK.bad.length === 1 ? 'isn’t' : 'aren’t') + ' available anymore, so ' + (CK.bad.length === 1 ? 'it was' : 'they were') + ' left out.</div>' : '';
  var cp = q.coupon ? '<div class="note ' + (q.coupon.ok ? 'ok' : 'bad') + '">' + esc(q.coupon.msg) + '</div>' : '';
  if (!q.groups.length) { view('<section class="pad"><h2>Your cart is empty</h2>' + bad + '<p><a class="btn" href="' + esc(shopLink()) + '">Visit the shop</a></p></section>'); return; }
  var keep = CK.first ? null : ckForm();
  view('<section class="pad"><span class="label">Your order from ' + fromApp() + '</span><h2>Checkout</h2>' + bad + cp +
    q.groups.map(function (g, j) {
      return '<div class="line"><span class="th">' + (g.photo ? '<img src="' + g.photo + '" alt="">' : '') + '</span><div class="li"><div class="t"><b>' + esc(g.name) + '</b><span>' + money(g.total) + '</span></div><span class="small muted">Qty ' + g.qty + (g.qty > 1 ? ' × ' + money(g.unit) : '') + '</span>' +
        g.slots.map(function (x, k) { if (!x.sizes) return g.kind === 'STACK' ? '<span class="small">' + esc(x.name) + '</span>' : ''; return '<label class="f">' + (g.kind === 'STACK' ? esc(x.name) + ' · ' : '') + (x.opt && x.opt !== 'Size' ? esc(x.opt) : 'Ring size') + '<select id="sz-' + j + '-' + k + '" onchange="ckSize(' + j + ',' + k + ',this.value)"><option value="">Choose…</option>' + x.sizes.map(function (z) { return '<option value="' + esc(z.sku) + '"' + (z.sku === CK.lines[j].sizes[k] ? ' selected' : '') + '>' + esc(z.size) + '</option>'; }).join('') + '</select></label>'; }).join('') +
        '<button class="link left" onclick="ckRemove(' + j + ')">Remove</button></div></div>';
    }).join('') +
    '<h3>Your details</h3><div class="grid"><label class="f">First name<input id="ck-fn" autocomplete="given-name"></label><label class="f">Last name<input id="ck-ln" autocomplete="family-name"></label></div>' +
    '<label class="f">Email<input id="ck-em" type="email" autocomplete="email"></label><div class="grid"><label class="f">Phone<input id="ck-ph" type="tel" autocomplete="tel"></label><label class="f">Birthday (optional)<input id="ck-bd" placeholder="MM/DD"></label></div>' +
    '<h3>Ship to</h3><label class="f">Street address<input id="ck-a1" autocomplete="address-line1"></label><label class="f">Apt, suite (optional)<input id="ck-a2" autocomplete="address-line2"></label>' +
    '<div class="grid"><label class="f">City<input id="ck-city" autocomplete="address-level2"></label><label class="f">State<select id="ck-st" onchange="flUpd()">' + stateOpts('') + '</select></label><label class="f">ZIP<input id="ck-zip" inputmode="numeric" autocomplete="postal-code" oninput="flUpd()"></label><label class="f hidden">County<select id="ck-cty">' + countyOpts('') + '</select></label></div>' +
    '<label class="ck"><input type="checkbox" id="ck-opt"> Send me emails and texts about new pieces and rewards</label>' +
    '<label class="f">Note for us (optional)<textarea id="ck-note" rows="2"></textarea></label>' +
    '<div class="box" id="ck-sum"></div><div class="small muted center">You’ll earn Better Bonds rewards on this order.' + (D.cfg.ship_short ? ' ' + esc(D.cfg.ship_short) : '') + '</div></section>');
  if (keep) { $('ck-fn').value = keep.first_name; $('ck-ln').value = keep.last_name; $('ck-em').value = keep.email; $('ck-ph').value = keep.phone; $('ck-bd').value = keep.birthday; $('ck-a1').value = keep.address1; $('ck-a2').value = keep.address2; $('ck-city').value = keep.city; $('ck-st').value = keep.state; $('ck-zip').value = keep.zip; flUpd(); $('ck-cty').value = keep.county; $('ck-opt').checked = keep.optin; }
  CK.first = false;
  ['ck-a1', 'ck-city', 'ck-st', 'ck-zip', 'ck-cty'].forEach(function (id) { $(id).addEventListener('change', ckQuote); });
  ckSum();
}
function ckSum() {
  var q = CK.q, sh = ckShip() || {}, needCounty = sh.state === 'FL' && !sh.county;
  $('ck-sum').innerHTML = '<h3>Total</h3><div class="tot"><div><span>Pieces</span><span>' + money(q.pre) + '</span></div>' + (q.disc ? '<div class="ok"><span>Code ' + esc(q.coupon.code) + '</span><span>−' + money(q.disc) + '</span></div>' : '') +
    '<div><span>Shipping</span><span>' + (q.shipping ? money(q.shipping) : 'Free') + '</span></div><div><span>Sales tax' + (q.county ? ' (' + esc(q.county) + ' County)' : '') + '</span><span>' + (!sh.state ? 'add your address' : needCounty ? 'choose county' : money(q.tax)) + '</span></div>' +
    '<div class="grand"><span>Total</span><span>' + money(q.total) + '</span></div></div>' + (q.shipping && q.free_min ? '<div class="small">Free shipping on orders of ' + money0(q.free_min) + ' or more.</div>' : '') +
    (q.need_size ? '<div class="small bad">Choose a ring size above to continue.</div>' : '') +
    '<div class="small muted">By placing your order you agree to our <button class="link" onclick="policy()">return policy</button>.</div>' +
    '<div id="ck-go"><button class="btn wide rose" onclick="ckPay()"' + (q.need_size ? ' disabled' : '') + '>Pay securely with Stripe</button></div><div class="small muted center">Card, Apple Pay and Google Pay.</div>';
}
function ckQuote() { var sh = ckShip(); return api('metaCart', { lines: CK.lines, coupon: CK.coupon, ship: sh && sh.state ? sh : null }, true).then(function (q) { if (!q) return; CK.q = q; if ($('ck-sum')) ckSum(); }); }
function ckSize(j, k, v) { CK.lines[j].sizes[k] = v; ckQuote(); }
function ckRemove(j) { CK.lines.splice(j, 1); var sh = ckShip(); api('metaCart', { lines: CK.lines, coupon: CK.coupon, ship: sh && sh.state ? sh : null }).then(function (q) { if (!q) return; CK.q = q; ckDraw(); }); }
function ckPay() {
  if (CK.q.need_size) { toast('Choose a ring size for each ring', true); return; }
  $('ck-go').innerHTML = '<div class="muted center">Getting your order ready…</div>';
  api('metaCheckout', { lines: CK.lines, coupon: CK.coupon, origin: Q.cart_origin || (/Instagram/i.test(navigator.userAgent) ? 'instagram' : /FBAN|FBAV/i.test(navigator.userAgent) ? 'facebook' : ''), ship: ckForm(), notes: $('ck-note').value }).then(function (r) {
    if (!r) { ckSum(); return; }
    $('ck-go').innerHTML = '<a class="btn wide rose" href="' + esc(r.url) + '">Continue to secure payment →</a>';
    location.href = r.url;
  });
}
function policy() { $('modal-body').innerHTML = '<h3>Returns &amp; defects</h3><div class="desc" style="white-space:pre-line">' + esc(D.cfg.policy || '') + '</div><button class="btn" onclick="$(\'modal\').className=\'\'">Close</button>'; $('modal').className = 'show'; }

/* ---------- back from Stripe ---------- */
function done() {
  view('<section class="pad muted">Checking your payment…</section>');
  api('confirm', { order_id: Q.order, s: Q.s, cancel: Q.cancel ? 1 : 0 }).then(function (r) {
    if (!r) { view('<section class="pad"><h2>We couldn’t find that order</h2><p><a class="btn" href="' + esc(shopLink()) + '">Visit the shop</a></p></section>'); return; }
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    if (r.canceled) { view('<section class="pad"><h2>Payment wasn’t completed</h2><p>No charge was made. To try again, go back to your cart on Facebook or Instagram and tap checkout.</p></section>'); return; }
    if (r.status === 'PAID') { view('<section class="pad"><span class="label">Order ' + esc(r.order_id) + '</span><h2 class="big">Thank <i>you!</i></h2><p>Your order is confirmed. A receipt is on its way to ' + esc(r.email) + ', and we’ll email your tracking number when it ships.</p><div class="small">' + r.lines.map(function (l) { return l.qty + ' × ' + esc(l.name); }).join('<br>') + '</div><div class="serif" style="font-size:26px">Total ' + money(r.total) + '</div><p><a class="btn ghost" href="' + esc(shopLink()) + '">Keep shopping</a></p></section>'); return; }
    view('<section class="pad"><h2>We’re still waiting on your payment</h2><p>If you finished paying, it can take a moment. <button class="link" onclick="done()">Check again</button></p></section>');
  });
}

/* ---------- start ---------- */
(function () {
  if (Q.order) { D.cfg = { shop: '/' }; done(); return; }
  if (Q.item && /^STACK-/i.test(Q.item) && !Q.products) Q.products = Q.item + ':1';
  api('page', {}).then(function (d) {
    if (!d) { view('<section class="pad"><h2>The shop couldn’t load</h2><p>Please try again in a moment.</p></section>'); return; }
    D.cat = d.cat; D.cfg = d.cfg;
    if (!D.cfg.open) { view('<section class="pad"><h2>We’ll be back soon</h2><p>The shop is closed for the moment — please check back soon.</p></section>'); return; }
    if (Q.products) startCart(null, Q.products);
    else if (Q.item) product(Q.item);
    else location.replace(shopLink());
  });
})();
