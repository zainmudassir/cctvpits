// Products page: search, brand, category and sort over the products from Admin > Products.
// /products/?brand=Hikvision&category=Cameras&q=dome opens with those filters already applied.
import { loadProducts, injectStyles, cardHtml, hydrateImages, esc } from "/products-data.js";
injectStyles();
const $ = id => document.getElementById(id), PER = 24;
const grid = $("prd-grid"), more = $("prd-more"), count = $("prd-count"), q = $("prd-q"), selB = $("prd-brand"), selC = $("prd-cat"), selS = $("prd-sort");
let all = [], shown = PER, view = [];
const byId = new Map();

const opts = (el, label, vals, cur) => { el.innerHTML = '<option value="">' + label + '</option>' + vals.map(v => '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + '>' + esc(v) + '</option>').join(""); if (cur && !vals.includes(cur)) el.value = ""; };
const uniq = a => [...new Set(a.filter(Boolean))].sort((x, y) => x.localeCompare(y));
function syncUrl() {
  const p = new URLSearchParams(); if (q.value.trim()) p.set("q", q.value.trim()); if (selB.value) p.set("brand", selB.value); if (selC.value) p.set("category", selC.value);
  try { history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "")); } catch (e) {}
}
function draw(reset) {
  if (reset) shown = PER;
  const term = q.value.trim().toLowerCase(), b = selB.value, c = selC.value, s = selS.value;
  view = all.filter(p => (!b || p.brand === b) && (!c || p.category === c) && (!term || (p.name + " " + p.brand + " " + p.category + " " + p.description).toLowerCase().includes(term)));
  if (s === "low") view.sort((x, y) => (x.price || 1e12) - (y.price || 1e12)); else if (s === "high") view.sort((x, y) => y.price - x.price); else if (s === "name") view.sort((x, y) => x.name.localeCompare(y.name));
  count.textContent = view.length + " product" + (view.length === 1 ? "" : "s");
  grid.innerHTML = view.length ? view.slice(0, shown).map(cardHtml).join("") : '<p class="prd-msg">No products match your search. Try a different word or clear the filters.</p>';
  more.hidden = view.length <= shown; hydrateImages(grid, byId);
}
const fill = () => { opts(selC, "All categories", uniq(all.filter(p => !selB.value || p.brand === selB.value).map(p => p.category)), selC.value); };

(async () => {
  const list = await loadProducts();
  if (list === null) { grid.innerHTML = '<p class="prd-msg">We could not load the products right now. Please refresh, or message us on WhatsApp.</p>'; count.textContent = ""; return; }
  if (!list.length) { grid.innerHTML = '<p class="prd-msg">Products are coming soon. Message us on WhatsApp for prices and availability.</p>'; count.textContent = ""; return; }
  all = list; all.forEach(p => byId.set(p.id, p));
  const u = new URLSearchParams(location.search), brands = uniq(all.map(p => p.brand));
  q.value = u.get("q") || ""; opts(selB, "All brands", brands, u.get("brand") || ""); selC.dataset.want = u.get("category") || "";
  opts(selC, "All categories", uniq(all.filter(p => !selB.value || p.brand === selB.value).map(p => p.category)), selC.dataset.want);
  draw(true);
})();
let tm; q.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => { syncUrl(); draw(true); }, 200); });
selB.addEventListener("change", () => { fill(); syncUrl(); draw(true); });
selC.addEventListener("change", () => { syncUrl(); draw(true); });
selS.addEventListener("change", () => draw(true));
more.querySelector("button").addEventListener("click", () => { shown += PER; draw(false); });
