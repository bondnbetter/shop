// Bond & Better shop. Shows the shop web app full screen and hands it everything after the "?" in the address:
// Meta's cart (products=…, coupon=…, cart_origin=…), a product link (item=…) and the return from Stripe (order=…).
var SHOP = 'https://script.google.com/macros/s/AKfycbxHDysj2Av9_SwTcDjbH6A0yMohdJyq3_LyhXvoXUH9QCBeZjH2FSvGTKKZ66m9wnS1/exec';
document.getElementById('shop').src = SHOP + (location.search || '');
