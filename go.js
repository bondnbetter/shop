// Bond & Better shop. Shows the shop web app full screen and hands it everything after the "?" in the address.
// (Facebook & Instagram shoppers use /checkout/ — a plain page that works in their in-app browsers.)
var SHOP = 'https://script.google.com/macros/s/AKfycbxHDysj2Av9_SwTcDjbH6A0yMohdJyq3_LyhXvoXUH9QCBeZjH2FSvGTKKZ66m9wnS1/exec';
(function () {
  var q = location.search || '';
  // Meta's browser cookie (if this visitor has one), so a sale in the shop can be matched to your ads.
  var m = document.cookie.match(/(?:^|;\s*)_fbp=([^;]+)/);
  if (m) q += (q ? '&' : '?') + 'fbp=' + encodeURIComponent(m[1]);
  document.getElementById('shop').src = SHOP + q;
})();
