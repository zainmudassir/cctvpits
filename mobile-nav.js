// Mobile bottom icon bar (Home / Products / Packages / Cart / Account) shown on phones only (<= 767px).
// Cart badge reads the same localStorage cart as cart.js. Account link follows the login state saved by account-link.js.
// To change a link or icon, edit the ITEMS list below.
(function () {
  if (document.getElementById("m-nav")) return;

  var I = function (d) {
    return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  };
  var ITEMS = [
    { id: "home", label: "Home", href: "/", match: /^\/(index\.html)?$/, icon: I('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>') },
    { id: "products", label: "Products", href: "/products/", match: /^\/products/, icon: I('<path d="M4 7h11l2 3h3v6H4z"/><circle cx="8" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>') },
    { id: "packages", label: "Packages", href: "/packages/", match: /^\/packages/, icon: I('<path d="M21 8 12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>') },
    { id: "cart", label: "Cart", href: "/checkout.html", match: /^\/checkout/, icon: I('<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.4a1.6 1.6 0 0 0 1.6 1.2h8.2a1.6 1.6 0 0 0 1.6-1.2L21 7H6"/>'), badge: true },
    { id: "account", label: "Account", href: "/login.html", match: /^\/(login|register|dashboard|admin)/, icon: I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>') }
  ];

  var css = document.createElement("style");
  css.textContent =
    "#m-nav{display:none}" +
    "@media(max-width:767px){" +
    "#m-nav{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:99998;background:#0b1424;border-top:1px solid rgba(255,255,255,.12);box-shadow:0 -6px 20px rgba(0,0,0,.35);padding-bottom:env(safe-area-inset-bottom,0px)}" +
    "#m-nav a{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:9px 2px 8px;color:#b8c2d3;text-decoration:none;font:600 11px/1 'Public Sans',Roboto,sans-serif;-webkit-tap-highlight-color:transparent;position:relative}" +
    "#m-nav a.on{color:#ed1d24}" +
    "#m-nav a:active{background:rgba(255,255,255,.06)}" +
    "#m-nav .mb{position:absolute;top:4px;left:calc(50% + 6px);min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#ed1d24;color:#fff;font:700 10px/17px 'Public Sans',Roboto,sans-serif;text-align:center}" +
    "#m-nav .mb:empty{display:none}" +
    "body{padding-bottom:calc(64px + env(safe-area-inset-bottom,0px)) !important}" +
    "#acct-links{display:none !important}" +
    "#wa-float{bottom:calc(78px + env(safe-area-inset-bottom,0px)) !important}" +
    "#top-to-bottom{bottom:78px !important}" +
    "}";
  document.head.appendChild(css);

  var path = location.pathname;
  var nav = document.createElement("nav");
  nav.id = "m-nav";
  nav.setAttribute("aria-label", "Quick navigation");
  nav.innerHTML = ITEMS.map(function (it) {
    var on = it.match.test(path) ? " on" : "";
    return '<a href="' + it.href + '" data-id="' + it.id + '" class="' + on.trim() + '">' + it.icon +
      (it.badge ? '<span class="mb" id="m-cart-count"></span>' : "") + "<span>" + it.label + "</span></a>";
  }).join("");
  document.body.appendChild(nav);

  // Cart badge
  function count() {
    var n = 0;
    try { n = (JSON.parse(localStorage.getItem("cctvpits_cart")) || []).reduce(function (s, x) { return s + (x.qty || 0); }, 0); } catch (e) {}
    var b = document.getElementById("m-cart-count");
    if (b) b.textContent = n > 0 ? String(n) : "";
  }
  count();
  window.addEventListener("cartchange", count);
  window.addEventListener("storage", count);

  // Account link follows login state (account-link.js stores it as "acct-hint": guest / user / admin)
  function acct() {
    var k = "guest";
    try { k = localStorage.getItem("acct-hint") || "guest"; } catch (e) {}
    var a = nav.querySelector('[data-id="account"]');
    if (!a) return;
    a.href = k === "admin" ? "/admin.html" : k === "user" ? "/dashboard.html" : "/login.html";
    a.lastChild.textContent = k === "guest" ? "Login" : k === "admin" ? "Admin" : "Account";
  }
  acct();
  setInterval(acct, 2000);
})();
