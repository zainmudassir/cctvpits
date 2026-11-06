// Shared by the Products page (products-render.js) and the Products section on the home page (home-products.js).
// Products come from the "products" collection (Admin > Products) through the Firestore REST API. The list is loaded WITHOUT photos
// (photos are stored inside the documents and are large); each photo is fetched only when its card scrolls into view.
export const WA = "923053871991"; // same number as wa-float.js
const BASE = "https://firestore.googleapis.com/v1/projects/cctv-pits/databases/(default)/documents/products", KEY = "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w";
const FIELDS = ["name", "price", "brand", "category", "stock", "comparePrice", "isNew", "description", "createdAt"];
const LS = "products:list", TTL = 5 * 60 * 1000;
const sv = f => f && f.stringValue !== undefined ? f.stringValue : "";
const nv = f => f ? (f.integerValue !== undefined ? Number(f.integerValue) : f.doubleValue !== undefined ? Number(f.doubleValue) : 0) : 0;
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const money = n => "Rs. " + Number(n).toLocaleString("en-US");
const parse = d => {
  const f = d.fields || {};
  return { id: d.name.split("/").pop(), name: sv(f.name).trim(), price: nv(f.price), brand: sv(f.brand).trim(), category: sv(f.category).trim(),
    stock: f.stock ? nv(f.stock) : null, comparePrice: nv(f.comparePrice), isNew: !!(f.isNew && f.isNew.booleanValue), description: sv(f.description).trim(),
    t: f.createdAt && f.createdAt.timestampValue ? Date.parse(f.createdAt.timestampValue) || 0 : 0 };
};
const clean = list => list.filter(p => p.name).sort((a, b) => b.t - a.t || a.name.localeCompare(b.name));

// Returns an array of products, or null if the database could not be reached.
export async function loadProducts() {
  try { const c = JSON.parse(sessionStorage.getItem(LS)); if (c && Date.now() - c.at < TTL && c.list.length) return c.list; } catch (e) {}
  let list = null;
  try {
    let out = [], tok = "";
    do {
      const r = await fetch(BASE + "?pageSize=300&" + FIELDS.map(x => "mask.fieldPaths=" + x).join("&") + "&key=" + KEY + (tok ? "&pageToken=" + encodeURIComponent(tok) : ""));
      if (!r.ok) throw new Error(r.status);
      const j = await r.json(); out = out.concat((j.documents || []).map(parse)); tok = j.nextPageToken || "";
    } while (tok);
    list = clean(out);
  } catch (e) {
    try {   // REST blocked or offline: fall back to the Firebase SDK (photos come with the documents here)
      const { db } = await import("/firebase-lite.js"), { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
      list = clean((await getDocs(collection(db, "products"))).docs.map(d => { const v = d.data(); return { id: d.id, name: String(v.name || "").trim(), price: Number(v.price) || 0, brand: String(v.brand || "").trim(),
        category: String(v.category || "").trim(), stock: v.stock == null ? null : Number(v.stock), comparePrice: Number(v.comparePrice) || 0, isNew: !!v.isNew, description: String(v.description || "").trim(),
        image: String(v.image || ""), t: v.createdAt && v.createdAt.toMillis ? v.createdAt.toMillis() : 0 }; }));
    } catch (e2) { return null; }
  }
  if (!list.some(p => p.image !== undefined)) try { sessionStorage.setItem(LS, JSON.stringify({ at: Date.now(), list })); } catch (e) {}
  return list;
}

// ---------- photos (lazy) ----------
const imgs = new Map();
const resolveImg = s => !s ? "" : /^(data:|https?:)/i.test(s) ? s : "/" + s.replace(/^\/+/, "");
function getImage(p) {
  if (p.image !== undefined) return Promise.resolve(resolveImg(p.image));
  if (!imgs.has(p.id)) imgs.set(p.id, fetch(BASE + "/" + p.id + "?mask.fieldPaths=image&key=" + KEY).then(r => r.ok ? r.json() : null).then(j => resolveImg(sv(((j || {}).fields || {}).image))).catch(() => ""));
  return imgs.get(p.id);
}
export function hydrateImages(root, byId) {
  const load = el => {
    const p = byId.get(el.dataset.id); if (!p) return;
    getImage(p).then(src => {
      if (!src) return;
      const img = new Image(); img.alt = p.name; img.decoding = "async"; img.onload = () => { el.textContent = ""; el.appendChild(img); requestAnimationFrame(() => { img.style.opacity = 1; }); }; img.src = src;
    });
  };
  const els = [...root.querySelectorAll(".prd-img[data-id]:not([data-done])")];
  if (!("IntersectionObserver" in window)) return els.forEach(el => { el.dataset.done = 1; load(el); });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); e.target.dataset.done = 1; load(e.target); } }), { rootMargin: "300px" });
  els.forEach(el => io.observe(el));
}

// ---------- card ----------
export const waLink = p => "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi, I want to order: " + p.name + (p.price > 0 ? " (" + money(p.price) + ")" : "") + ".");
export function cardHtml(p) {
  const out = p.stock !== null && p.stock <= 0, off = p.comparePrice > p.price && p.price > 0 ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
  return '<div class="prd-card"><div class="prd-img" data-id="' + esc(p.id) + '"><i class="fas fa-video" aria-hidden="true"></i>' +
    (p.isNew ? '<span class="prd-badge prd-new">New</span>' : "") + (off > 0 ? '<span class="prd-badge prd-off">-' + off + '%</span>' : "") + '</div>' +
    '<div class="prd-body">' + (p.brand ? '<span class="prd-brand">' + esc(p.brand) + '</span>' : "") + '<h3 class="prd-name">' + esc(p.name) + '</h3>' +
    (p.description ? '<p class="prd-desc">' + esc(p.description) + '</p>' : "") +
    '<div class="prd-price">' + (p.price > 0 ? money(p.price) + (off > 0 ? ' <s>' + money(p.comparePrice) + '</s>' : "") : '<span class="prd-call">Call for price</span>') + '</div>' +
    '<div class="prd-stock ' + (out ? "out" : "in") + '">' + (out ? "Out of stock" : "In stock") + '</div>' +
    '<a class="rts__main__btn rts__btn__slideup" href="' + waLink(p) + '" target="_blank" rel="noopener" data-hover="' + (out ? "Ask on WhatsApp" : "Order on WhatsApp") + '"><span>' + (out ? "Ask on WhatsApp" : "Order on WhatsApp") + '</span></a></div></div>';
}

export function injectStyles() {
  if (document.getElementById("prd-css")) return;
  const st = document.createElement("style"); st.id = "prd-css";
  st.textContent = `.prd-wrap{width:100%}.prd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;width:100%}
.prd-card{background:#0b1a30;border:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;transition:border-color .3s,transform .3s;min-width:0}
.prd-card:hover{border-color:#ed1d24;transform:translateY(-6px)}
.prd-img{position:relative;aspect-ratio:4/3;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}
.prd-img>i{font-size:44px;color:#c9d1dc}.prd-img img{display:block;width:100%;height:100%;object-fit:contain;padding:10px;box-sizing:border-box;opacity:0;transition:opacity .35s}
.prd-badge{position:absolute;top:10px;font:700 12px/1 'Public Sans',sans-serif;letter-spacing:.5px;text-transform:uppercase;padding:6px 9px;color:#fff;z-index:2}
.prd-new{left:10px;background:#ed1d24}.prd-off{right:10px;background:#0b1a30}
.prd-body{padding:22px 22px 24px;display:flex;flex-direction:column;gap:10px;flex:1}
.prd-brand{color:#ed1d24;font-size:13px;text-transform:uppercase;letter-spacing:1px}
.prd-name{color:#fff;font-size:19px;line-height:1.3;margin:0;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow:hidden}
.prd-desc{color:#c9d1dc;margin:0;font-size:14px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow:hidden}
.prd-price{color:#fff;font-family:Orbitron,sans-serif;font-size:18px;margin-top:auto;padding-top:12px;border-top:1px solid rgba(255,255,255,.12)}
.prd-price s{color:#8b97a8;font:400 13px 'Public Sans',sans-serif;margin-left:6px}.prd-call{font-size:15px}
.prd-stock{font-size:13px}.prd-stock.in{color:#4ade80}.prd-stock.out{color:#ff8a8a}
.prd-bar{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:14px;margin:0 0 18px;width:100%}
.prd-bar input,.prd-bar select{width:100%;height:50px;background:#0b1a30;color:#fff;border:1px solid rgba(255,255,255,.18);padding:0 14px;font:inherit;border-radius:0;box-sizing:border-box}
.prd-bar input::placeholder{color:#8b97a8}.prd-bar input:focus,.prd-bar select:focus{outline:0;border-color:#ed1d24}
.prd-bar option{background:#0b1a30;color:#fff}
.prd-count{color:#c9d1dc;margin:0 0 18px;width:100%}.prd-msg{color:#c9d1dc;text-align:center;width:100%;padding:50px 0;grid-column:1/-1}
.prd-more[hidden]{display:none}.prd-more{display:flex;justify-content:center;width:100%;margin-top:34px}.prd-more button{background:transparent;color:#fff;border:1px solid #ed1d24;padding:14px 34px;font:600 15px 'Public Sans',sans-serif;cursor:pointer;transition:.2s}.prd-more button:hover{background:#ed1d24}
.prd-cta{display:flex;justify-content:center;width:100%;margin-top:34px}
.prd-card .rts__main__btn{width:100%;justify-content:center;text-align:center;background:#ed1d24;border-color:#ed1d24;color:#fff}
@media(max-width:1200px){.prd-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:900px){.prd-grid{grid-template-columns:repeat(2,1fr)}.prd-bar{grid-template-columns:1fr 1fr}.prd-bar input{grid-column:1/-1}}
@media(max-width:520px){.prd-grid{gap:14px}.prd-body{padding:16px 14px 18px}.prd-name{font-size:16px}.prd-price{font-size:15px}}`;
  document.head.appendChild(st);
}