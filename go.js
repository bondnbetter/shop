// Bond & Better shop. Shows the shop web app full screen and hands it everything after the "?" in the address:
// Meta's cart (products=…, coupon=…, cart_origin=…), a product link (item=…) and the return from Stripe (order=…).
var SHOP = 'https://script.google.com/macros/s/AKfycbxHDysj2Av9_SwTcDjbH6A0yMohdJyq3_LyhXvoXUH9QCBeZjH2FSvGTKKZ66m9wnS1/exec';
(function () {
  var q = location.search || '', ua = navigator.userAgent || '';
  // Instagram's and Facebook's built-in browsers (iPhone especially) won't load the shop inside a frame,
  // so shoppers coming from Meta go straight to the shop web app instead.
  var fromMeta = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger/i.test(ua) || /[?&](products|item|fbclid|cart_origin)=/.test(q) || /\/checkout\/?$/.test(location.pathname);
  if (fromMeta) { location.replace(SHOP + q); return; }
  document.getElementById('shop').src = SHOP + q;
})();
