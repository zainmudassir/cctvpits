// Shared catalog loading for every page. Real data only: nothing here invents products or companies.
import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { rs, esc, addToCart } from "./cart.js";

export { rs, esc };
const K = { p: "cctvpits_products_v2", c: "cctvpits_companies_v2", s: "cctvpits_services_v2" };
// remove caches written by older versions (they could hold demo data)
["cctvpits_products", "cctvpits_companies", "cctvpits_services"].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
const rd = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const noData = o => ({ ...o, image: o.image && !o.image.startsWith("data:") ? o.image : "" });
const real = p => p && p.name && !/^demo\d*$/i.test(p.id || "");

export const DEFAULT_SERVICES = [
  { title: "Home CCTV", description: "Indoor and outdoor cameras set up so you can watch live on your phone." },
  { title: "Shop and office", description: "Multi-camera systems with recording, planned around your space." },
  { title: "Wi-Fi cameras", description: "Plug-in cameras with mobile alerts and cloud or card storage." },
  { title: "Locks and sensors", description: "Smart locks, door sensors and alarms installed and connected." },
  { title: "Repair and upgrade", description: "We fix and improve your existing camera system." }
];
export const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const ORDER = ["Hikvision", "Dahua", "EZVIZ", "Imou", "Uniview (UNV)", "HiLook", "TP-Link Tapo", "Reolink"];
export const brandOf = p => String(p.brand || "").trim() || "Other";
export const typeOf = p => String(p.category || "").trim() || "Other";
const rank = n => { const i = ORDER.indexOf(n); return i < 0 ? 99 : i; };

// { brands: [{name, image, count, types:[{name,count}]}] } built only from real products
export function buildTree(products, companies) {
  const logo = {}; (companies || []).forEach(c => { if (c.name && c.image) logo[c.name] = c.image; });
  const m = new Map();
  products.forEach(p => {
    const b = brandOf(p), t = typeOf(p);
    if (!m.has(b)) m.set(b, { name: b, image: logo[b] || "", count: 0, tm: new Map() });
    const o = m.get(b); o.count++; o.tm.set(t, (o.tm.get(t) || 0) + 1);
  });
  const brands = [...m.values()].map(o => ({ name: o.name, image: o.image, count: o.count,
    types: [...o.tm].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => (a.name === "Other") - (b.name === "Other") || rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
  return { brands };
}

let pending = null;
export const cachedCatalog = () => ({ products: rd(K.p).filter(real), companies: rd(K.c) });
export function loadCatalog() {
  return pending || (pending = (async () => {
    let products = null, companies = null;
    try { products = (await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")))).docs.map(d => ({ id: d.id, ...d.data() })).filter(real); } catch (e) {}
    try { companies = (await getDocs(collection(db, "companies"))).docs.map(d => d.data()).filter(c => c.name); } catch (e) {}
    if (products) wr(K.p, products.map(noData));
    if (companies) wr(K.c, companies.map(c => ({ name: c.name, image: c.image && !c.image.startsWith("data:") ? c.image : "" })));
    const c = cachedCatalog();
    return { products: products || c.products, companies: companies || c.companies, live: products !== null };
  })());
}
export const cachedServices = () => { const l = rd(K.s); return l.length ? l : DEFAULT_SERVICES; };
let sp = null;
export function loadServices() {
  return sp || (sp = (async () => {
    try {
      const l = (await getDocs(query(collection(db, "services"), orderBy("order")))).docs.map(d => d.data()).filter(v => v.title);
      if (l.length) { wr(K.s, l.map(noData)); return l; }
      try { localStorage.removeItem(K.s); } catch (e) {}
    } catch (e) {}
    return cachedServices();
  })());
}

const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.5"><path d="M3 6l13 4-2 6L3 12zM16 10l5-1v6l-5-1M8 16l-2 4h5"/></svg>';
export function productCard(p) {
  const sale = Number(p.comparePrice) > Number(p.price), out = p.stock === 0, href = "product.html?id=" + encodeURIComponent(p.id);
  const bds = (sale ? '<span class="bd sale">Sale</span>' : "") + (p.isNew ? '<span class="bd new">New</span>' : "") + (out ? '<span class="bd out">Out of stock</span>' : "");
  return `<article class="card" data-id="${esc(p.id)}">
    <a class="img" href="${href}">${icon}${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="this.remove()">` : ""}<div class="bds">${bds}</div></a>
    <div class="body"><small class="cb">${esc(brandOf(p))}</small><h3><a href="${href}">${esc(p.name)}</a></h3>
    <div class="price">${sale ? `<s>${rs(p.comparePrice)}</s>` : ""}${rs(p.price)}</div>
    ${out ? '<button class="btn sm" disabled>Out of stock</button>' : `<button class="btn sm" data-add="${esc(p.id)}">Add to cart</button>`}</div>
  </article>`;
}
// one click handler for every "Add to cart" button inside a container
export function bindCart(el, getList) {
  el.addEventListener("click", e => {
    const b = e.target.closest("button[data-add]"); if (!b) return;
    const p = getList().find(x => x.id === b.dataset.add); if (!p) return;
    addToCart(p); b.textContent = "Added \u2713"; setTimeout(() => b.textContent = "Add to cart", 1200);
  });
}
export const q = new URLSearchParams(location.search);
