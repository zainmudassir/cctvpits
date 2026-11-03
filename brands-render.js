// Brands page: the logo row comes from the "companies" collection (Admin > Companies), same approach as services-render.js:
// the list comes from the Firestore REST API (no Firebase SDK download), logos load in parallel and are cached in the browser.
// If the backend is unreachable or has no companies yet, the original logos in the page are left untouched.
const API = "https://firestore.googleapis.com/v1/projects/cctv-pits/databases/(default)/documents/companies", KEY = "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w";
const LIST = API + "?pageSize=100&orderBy=name&mask.fieldPaths=name&key=" + KEY, LS = "brands:list";
const grid = document.querySelector(".elementor-element-9fa091b");
const sv = f => f && f.stringValue !== undefined ? f.stringValue : "";
const parse = d => ({ id: d.name.split("/").pop(), t: d.updateTime || "", name: sv((d.fields || {}).name).trim() });
const reveal = () => { const h = document.getElementById("brand-hide"); if (h) h.remove(); };
if (grid) main(); else reveal();

async function main() {
  const css = document.createElement("style");
  css.textContent = `.brand-co .brand-slot{display:flex;align-items:center;justify-content:center;width:100%;height:152px;box-sizing:border-box;background:#000;overflow:hidden}
.brand-co .brand-slot img{display:block;width:100%;height:100%;box-sizing:border-box;padding:36px 14%;object-fit:contain;opacity:0;transition:opacity .35s}
.brand-co .brand-slot span{font:700 20px/1.2 Orbitron,'Public Sans',sans-serif;letter-spacing:.5px;color:#fff;text-align:center;padding:0 14px}`;
  document.head.appendChild(css);
  let rendered = false, fromSdk = false; const imgs = new Map();

  function getImage(v) {
    if (v.image !== undefined) return Promise.resolve(v.image);
    if (!imgs.has(v.id)) imgs.set(v.id, (async () => {
      const ck = "brandimg:" + v.id + ":" + v.t;
      try { const c = localStorage.getItem(ck); if (c !== null) return c; } catch (e) {}
      const r = await fetch(API + "/" + v.id + "?mask.fieldPaths=image&key=" + KEY);
      if (!r.ok) return "";
      const s = sv(((await r.json()).fields || {}).image);
      try { Object.keys(localStorage).filter(k => k.startsWith("brandimg:" + v.id + ":")).forEach(k => localStorage.removeItem(k)); localStorage.setItem(ck, s); } catch (e) {}
      return s;
    })().catch(() => ""));
    return imgs.get(v.id);
  }
  function nameTile(slot, name) { slot.textContent = ""; const s = document.createElement("span"); s.textContent = name; slot.appendChild(s); }
  function render(list) {
    grid.replaceChildren();
    list.forEach(v => {
      const w = document.createElement("div"), box = document.createElement("div"), slot = document.createElement("div");
      w.className = "elementor-element elementor-widget elementor-widget-image brand-co"; box.className = "elementor-widget-container"; slot.className = "brand-slot";
      slot.title = v.name; box.appendChild(slot); w.appendChild(box); grid.appendChild(w);
      getImage(v).then(src => {
        if (!src) return nameTile(slot, v.name);
        const img = new Image(); img.alt = v.name; img.decoding = "async";
        img.onload = () => { img.style.opacity = 1; }; img.onerror = () => nameTile(slot, v.name);
        slot.appendChild(img); img.src = src;
      });
    });
    rendered = true; reveal();
  }

  let cached = null; try { cached = JSON.parse(localStorage.getItem(LS)); } catch (e) {}
  if (cached && cached.length) render(cached);
  let fresh = null;
  try { const r = await (window.__brands || fetch(LIST)); if (r && r.ok) fresh = ((await r.json()).documents || []).map(parse).filter(v => v.name); } catch (e) {}
  if (fresh === null) {            // REST blocked or offline: fall back to the Firebase SDK
    try {
      const { db } = await import("/firebase-lite.js"), { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
      fresh = (await getDocs(query(collection(db, "companies"), orderBy("name")))).docs.map(d => ({ id: d.id, t: "", image: d.data().image || "", name: String(d.data().name || "").trim() })).filter(v => v.name); fromSdk = true;
    } catch (e) {}
  }
  if (fresh === null) { reveal(); return; }                       // keep whatever is on screen
  if (!fresh.length) { try { localStorage.removeItem(LS); } catch (e) {} if (rendered) location.reload(); else reveal(); return; }   // no companies yet: original logos stay
  if (JSON.stringify(fresh) !== JSON.stringify(cached)) { if (!fromSdk) try { localStorage.setItem(LS, JSON.stringify(fresh)); } catch (e) {} render(fresh); } else reveal();
}
