// Projects page: the cards come from the "projects" collection (Admin > Projects), same approach as brands-render.js:
// list via the Firestore REST API (no Firebase SDK download), photos fetched in parallel and cached in the browser.
// If the backend is unreachable or no projects exist yet, the cards already in the page are left untouched.
const API = "https://firestore.googleapis.com/v1/projects/cctv-pits/databases/(default)/documents/projects", KEY = "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w";
const LIST = API + "?pageSize=100&orderBy=order&mask.fieldPaths=title&mask.fieldPaths=location&mask.fieldPaths=order&key=" + KEY, LS = "projects:list";
const row = document.querySelector(".rt-portfolio-style2 .grid > .row");
const sv = f => f && (f.stringValue !== undefined ? f.stringValue : "");
const parse = d => { const f = d.fields || {}; return { id: d.name.split("/").pop(), t: d.updateTime || "", title: sv(f.title).trim(), location: sv(f.location).trim() }; };
const reveal = () => { const h = document.getElementById("proj-hide"); if (h) h.remove(); };
if (row) main(); else reveal();

async function main() {
  let rendered = false, fromSdk = false; const imgs = new Map();

  function getImage(v) {
    if (v.image !== undefined) return Promise.resolve(v.image);
    if (!imgs.has(v.id)) imgs.set(v.id, (async () => {
      const ck = "projimg:" + v.id + ":" + v.t;
      try { const c = localStorage.getItem(ck); if (c !== null) return c; } catch (e) {}
      const r = await fetch(API + "/" + v.id + "?mask.fieldPaths=image&key=" + KEY);
      if (!r.ok) return "";
      const s = sv(((await r.json()).fields || {}).image);
      try { Object.keys(localStorage).filter(k => k.startsWith("projimg:" + v.id + ":")).forEach(k => localStorage.removeItem(k)); localStorage.setItem(ck, s); } catch (e) {}
      return s;
    })().catch(() => ""));
    return imgs.get(v.id);
  }
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };

  function render(list) {
    row.replaceChildren();
    list.forEach(v => {
      const col = el("div", "col-lg-4 col-md-6 col-sm-6 col-12 rts__portfolio__box"), card = el("div", "d-block hover"), box = el("div", "relative overflow-hidden");
      box.style.background = "#0b1424"; box.style.aspectRatio = "3 / 2";
      const content = el("div", "rts__portfolio__content"), h4 = el("h4", "rts__portfolio__content__title", v.title);
      content.appendChild(h4);
      if (v.location) content.appendChild(el("p", "rts__portfolio__content__location mb-0", v.location));
      content.appendChild(el("div", "triangle-bottomright-dark"));
      card.append(box); col.append(card, content); row.appendChild(col);
      getImage(v).then(src => {
        if (!/^data:image\//.test(src || "")) return;
        const img = new Image(); img.className = "img-fluid hover-scale-1-2"; img.alt = v.title; img.decoding = "async"; img.loading = "lazy";
        img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .35s";
        img.onload = () => { img.style.opacity = 1; }; box.appendChild(img); img.src = src;
      });
    });
    rendered = true; reveal();
  }

  let cached = null; try { cached = JSON.parse(localStorage.getItem(LS)); } catch (e) {}
  if (cached && cached.length) render(cached);
  let fresh = null;
  try { const r = await (window.__proj || fetch(LIST)); if (r && r.ok) fresh = ((await r.json()).documents || []).map(parse).filter(v => v.title); } catch (e) {}
  if (fresh === null) {            // REST blocked or offline: fall back to the Firebase SDK
    try {
      const { db } = await import("/firebase-lite.js"), { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
      fresh = (await getDocs(query(collection(db, "projects"), orderBy("order")))).docs.map(d => ({ id: d.id, t: "", image: d.data().image || "", title: String(d.data().title || "").trim(), location: String(d.data().location || "").trim() })).filter(v => v.title); fromSdk = true;
    } catch (e) {}
  }
  if (fresh === null) { reveal(); return; }                       // keep whatever is on screen
  if (!fresh.length) { try { localStorage.removeItem(LS); } catch (e) {} if (rendered) location.reload(); else reveal(); return; }   // no projects yet: original cards stay
  if (JSON.stringify(fresh) !== JSON.stringify(cached)) { if (!fromSdk) try { localStorage.setItem(LS, JSON.stringify(fresh)); } catch (e) {} render(fresh); } else reveal();
}
