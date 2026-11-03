// Draws the header, menu and footer on every public page and fills the menu with real data.
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { SITE } from "./config.js";
import { cachedCatalog, loadCatalog, cachedServices, loadServices, buildTree, slug, esc } from "./store.js";
import { cartCount } from "./cart.js";

const page = document.body.dataset.page || "";
const A = (href, text, key) => `<li><a href="${href}"${key === page ? ' class="on"' : ""}>${text}</a></li>`;
const enc = encodeURIComponent;

const head = document.getElementById("site-head");
if (head) head.innerHTML = `
${SITE.freeDeliveryAbove ? `<div class="sh-bar">Free delivery on orders above Rs. ${Number(SITE.freeDeliveryAbove).toLocaleString()}</div>` : ""}
<header class="sh-head">
  <a class="sh-brand" href="index.html"><img src="logo.png" alt="" onerror="this.style.display='none'">${esc(SITE.name)}</a>
  <form class="sh-search" action="shop.html" method="get" role="search"><input name="q" type="search" placeholder="Search products" autocomplete="off" aria-label="Search products" value="${esc(new URLSearchParams(location.search).get("q") || "")}"></form>
  <div class="sh-right">
    <a class="cartlink" href="cart.html">Cart (<span id="sh-cc">0</span>)</a>
    <div id="sh-account"><a class="btn ghost sm" href="login.html">Log in</a><a class="btn sm" href="register.html">Register</a></div>
    <button class="sh-burger" id="sh-bg" aria-label="Menu" aria-expanded="false">&#9776;</button>
  </div>
</header>
<nav class="mn" id="mn" aria-label="Main"><ul>
  ${A("index.html", "Home", "home")}
  ${A("shop.html", "Shop", "shop")}
  <li class="dd"><button type="button" aria-haspopup="true">Companies &#9662;</button><div class="menu" id="m-co"></div></li>
  <li class="dd"><button type="button" aria-haspopup="true">Categories &#9662;</button><div class="menu" id="m-ca"></div></li>
  <li class="dd"><button type="button" aria-haspopup="true">Services &#9662;</button><div class="menu" id="m-sv"></div></li>
  ${A("packages.html", "Packages", "packages")}
  ${A("about.html", "About", "about")}
  ${A("dashboard.html#orders", "Track order", "")}
  ${A("info.html#contact", "Support", "info")}
</ul></nav>`;

const foot = document.getElementById("site-foot");
const wa = String(SITE.whatsapp || "").replace(/\D/g, "");
if (foot) foot.innerHTML = `
<footer class="sh-foot">
  <div class="fcols">
    <div><h3>${esc(SITE.name)}</h3><ul><li>${esc(SITE.tagline)}</li><li><a href="about.html">About us</a></li><li><a href="install.html">Book installation</a></li><li><a href="info.html#contact">Contact us</a></li></ul></div>
    <div><h3>Shop</h3><ul><li><a href="shop.html">All products</a></li><li><a href="packages.html">CCTV packages</a></li><li><a href="services.html">Services</a></li></ul></div>
    <div><h3>Companies</h3><ul id="f-co"></ul></div>
    <div><h3>Support</h3><ul><li><a href="dashboard.html#orders">Track order</a></li><li><a href="info.html#shipping">Shipping and delivery</a></li><li><a href="info.html#refund">Refund and returns</a></li><li><a href="info.html#privacy">Privacy policy</a></li></ul></div>
    <div><h3>Contact</h3><ul>${[SITE.phone && `<li>${esc(SITE.phone)}</li>`, SITE.email && `<li><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>`, SITE.address && `<li>${esc(SITE.address)}</li>`, SITE.facebook && `<li><a href="${esc(SITE.facebook)}" rel="noopener">Facebook</a></li>`, SITE.instagram && `<li><a href="${esc(SITE.instagram)}" rel="noopener">Instagram</a></li>`].filter(Boolean).join("") || '<li><a href="info.html#contact">Contact page</a></li>'}</ul></div>
    <div><h3>Account</h3><ul><li><a href="login.html">Log in</a></li><li><a href="register.html">Register</a></li><li><a href="cart.html">Cart</a></li></ul></div>
  </div>
  <p class="copy">&copy; ${esc(SITE.name)}. All rights reserved.</p>
</footer>${wa ? `<a class="wa" href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp us</a>` : ""}`;

// ---- menus (real products and services only; nothing is invented) ----
function drawMenus(cat) {
  const t = buildTree(cat.products, cat.companies), co = document.getElementById("m-co"), ca = document.getElementById("m-ca"), fc = document.getElementById("f-co");
  if (!co) return;
  const none = '<p>Products are coming soon.</p>';
  co.innerHTML = t.brands.length ? t.brands.map(b => `<a href="shop.html?brand=${enc(b.name)}">${esc(b.name)} <small>(${b.count})</small></a>`).join("") : none;
  ca.innerHTML = t.brands.length ? t.brands.map(b => `<a class="hd" href="shop.html?brand=${enc(b.name)}">${esc(b.name)}</a>` +
    b.types.map(x => `<a class="sub" href="shop.html?brand=${enc(b.name)}&type=${enc(x.name)}">${esc(x.name)} <small>(${x.count})</small></a>`).join("")).join("") : none;
  if (fc) fc.innerHTML = t.brands.filter(b => b.name !== "Other").slice(0, 6).map(b => `<li><a href="shop.html?brand=${enc(b.name)}">${esc(b.name)}</a></li>`).join("") || '<li><a href="shop.html">Shop</a></li>';
}
function drawServices(list) {
  const el = document.getElementById("m-sv"); if (!el) return;
  el.innerHTML = list.map(v => `<a href="services.html#${slug(v.title)}">${esc(v.title)}</a>`).join("") + '<a href="install.html"><b>Book installation</b></a>';
}
drawMenus(cachedCatalog()); drawServices(cachedServices());
loadCatalog().then(drawMenus).catch(() => {});
loadServices().then(drawServices).catch(() => {});

// ---- menu behaviour ----
const mn = document.getElementById("mn"), bg = document.getElementById("sh-bg");
if (mn) mn.addEventListener("click", e => {
  const t = e.target;
  if (t.matches(".dd>button")) { const li = t.parentElement, o = li.classList.contains("open"); mn.querySelectorAll(".open").forEach(x => x.classList.remove("open")); if (!o) li.classList.add("open"); }
});
document.addEventListener("click", e => { if (!e.target.closest(".dd")) document.querySelectorAll(".mn .open").forEach(x => x.classList.remove("open")); });
if (bg) bg.onclick = () => { const o = mn.classList.toggle("show"); bg.setAttribute("aria-expanded", o); };

// ---- cart count + account ----
const cc = document.getElementById("sh-cc"), upd = () => { if (cc) cc.textContent = cartCount(); };
upd(); window.addEventListener("cartchange", upd);
const acc = document.getElementById("sh-account");
const guest = acc ? acc.innerHTML : "";
onAuthStateChanged(auth, async u => {
  if (!acc) return;
  if (!u) { acc.innerHTML = guest; return; }
  let admin = false;
  try { admin = (await getDoc(doc(db, "admins", u.uid))).exists(); } catch (e) {}
  if (!auth.currentUser) return;
  const name = (u.displayName || u.email || "").split(" ")[0];
  acc.innerHTML = `<span>Hi, ${esc(name)}</span><a class="btn ghost sm" href="${admin ? "admin.html" : "dashboard.html"}">${admin ? "Admin" : "My account"}</a><button class="btn sm" id="sh-out">Log out</button>`;
  document.getElementById("sh-out").onclick = () => signOut(auth);
});
