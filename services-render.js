// Services page, built for speed: the list comes from the Firestore REST API (no Firebase SDK download),
// photos load one at a time (open tab first) and are cached in the browser.
const API = "https://firestore.googleapis.com/v1/projects/cctv-pits/databases/(default)/documents/services", KEY = "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w";
const LIST = API + "?pageSize=100&orderBy=order&" + ["title", "heading", "description", "points", "order"].map(k => "mask.fieldPaths=" + k).join("&") + "&key=" + KEY;
const DEFAULT_IMG = "/wp-content/uploads/2024/12/camera-1.webp", LS = "svc:list";
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sv = f => f && (f.stringValue !== undefined ? f.stringValue : f.integerValue !== undefined ? Number(f.integerValue) : f.doubleValue);
const parse = d => { const f = d.fields || {}; return { id: d.name.split("/").pop(), t: d.updateTime || "", title: sv(f.title) || "", heading: sv(f.heading) || "", description: sv(f.description) || "",
  order: Number(sv(f.order)) || 0, points: ((f.points || {}).arrayValue || {}).values ? f.points.arrayValue.values.map(x => x.stringValue).filter(Boolean) : [] }; };
const menuUl = document.querySelector(".service__menu ul.menu"), tpl = document.querySelector(".service-tab-panel");
if (menuUl && tpl) main();

async function main() {
  const inner = tpl.parentNode, anchor = [...inner.children].filter(c => !c.classList.contains("service-tab-panel")).pop();
  const liT = menuUl.querySelector("li").cloneNode(true), pT = tpl.cloneNode(true);
  ["src", "srcset", "sizes"].forEach(a => pT.querySelector("img").removeAttribute(a));
  let items = [], current = "", shown = false, fromSdk = false; const imgs = new Map();

  function getImage(v) {
    if (v.image !== undefined) return Promise.resolve(v.image);
    if (!imgs.has(v.id)) imgs.set(v.id, (async () => {
      const ck = "svcimg:" + v.id + ":" + v.t;
      try { const c = localStorage.getItem(ck); if (c !== null) return c; } catch (e) {}
      const r = await fetch(API + "/" + v.id + "?mask.fieldPaths=image&key=" + KEY);
      if (!r.ok) return "";
      const s = (((await r.json()).fields || {}).image || {}).stringValue || "";
      try { Object.keys(localStorage).filter(k => k.startsWith("svcimg:" + v.id + ":")).forEach(k => localStorage.removeItem(k)); localStorage.setItem(ck, s); } catch (e) {}
      return s;
    })().catch(() => ""));
    return imgs.get(v.id);
  }
  function loadImage(s) {
    const it = items.find(x => x.s === s); if (!it || it.loaded) return; it.loaded = true;
    getImage(it.v).then(src => { it.img.src = src || DEFAULT_IMG; });
  }
  function prefetch() { const n = items.find(x => !x.loaded); if (n) { loadImage(n.s); setTimeout(prefetch, 400); } }

  function render(list) {
    inner.querySelectorAll(".service-tab-panel").forEach(p => p.remove()); menuUl.innerHTML = ""; items = [];
    const used = new Set();
    list.forEach((v, i) => {
      let s = slug(v.title) || "service-" + (i + 1); while (used.has(s)) s += "-" + (i + 1); used.add(s);
      const li = liT.cloneNode(true), a = li.querySelector("a");
      li.removeAttribute("id"); a.dataset.tab = s; a.setAttribute("href", "#" + s); a.querySelector("span").textContent = v.title; menuUl.appendChild(li);
      const p = pT.cloneNode(true), img = p.querySelector("img"), pts = (v.points || []).filter(Boolean).slice(0, 5);
      p.id = "tab-" + s; p.hidden = true; img.alt = v.heading || v.title; img.decoding = "async";
      img.style.cssText = "opacity:0;transition:opacity .35s"; img.onload = () => { img.style.opacity = 1; };
      img.onerror = () => { if (!img.dataset.f) { img.dataset.f = 1; img.src = DEFAULT_IMG; } };
      p.querySelector("h2").textContent = v.heading || v.title;
      p.querySelector(".elementor-widget-text-editor p").textContent = v.description || "";
      const h6 = p.querySelector("h6"), ul = p.querySelector("ul.elementor-icon-list-items"), li0 = ul.querySelector("li").cloneNode(true);
      h6.textContent = "Our " + v.title + " Services Include:"; ul.innerHTML = "";
      pts.forEach(t => { const x = li0.cloneNode(true); x.querySelector(".elementor-icon-list-text").textContent = t; ul.appendChild(x); });
      if (!pts.length) { h6.closest(".elementor-widget").hidden = true; ul.closest(".elementor-widget").hidden = true; }
      inner.insertBefore(p, anchor); items.push({ s, v, img, loaded: false });
    });
    if (!shown) { shown = true; const h = document.getElementById("svc-hide"); if (h) h.remove(); }
    show(current || location.hash.slice(1));
  }
  function show(s, upd) {
    const links = [...menuUl.querySelectorAll("a[data-tab]")];
    if (!items.some(x => x.s === s)) s = links[0] && links[0].dataset.tab;
    inner.querySelectorAll(".service-tab-panel").forEach(p => { p.hidden = p.id !== "tab-" + s; });
    links.forEach(a => { const on = a.dataset.tab === s, li = a.closest("li"); li.classList.toggle("current-menu-item", on); li.classList.toggle("current_page_item", on); if (on) document.title = a.textContent.trim() + " | CCTV PITS"; });
    current = s; if (upd) history.replaceState(null, "", "#" + s); loadImage(s);
  }
  menuUl.addEventListener("click", e => { const a = e.target.closest("a[data-tab]"); if (a) { e.preventDefault(); show(a.dataset.tab, true); } });
  addEventListener("hashchange", () => show(location.hash.slice(1)));
  const empty = () => {
    document.title = "Services | CCTV PITS";
    const m = document.createElement("p"); m.style.cssText = "grid-column:1/-1;text-align:center;color:#c9d1dc;padding:70px 0;font-size:18px";
    m.innerHTML = 'Our services are being updated. Please check back soon or <a href="/contact/" style="color:#ed1d24;font-weight:700">contact us</a>.';
    inner.insertBefore(m, inner.firstChild);
  };

  let cached = null; try { cached = JSON.parse(localStorage.getItem(LS)); } catch (e) {}
  if (cached && cached.length) { render(cached); setTimeout(prefetch, 800); }
  let fresh = null;
  try { const r = await (window.__svc || fetch(LIST)); if (r && r.ok) fresh = ((await r.json()).documents || []).map(parse).filter(v => v.title); } catch (e) {}
  if (fresh === null) {            // REST blocked or offline: fall back to the Firebase SDK
    try {
      const { db } = await import("/firebase-lite.js"), { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
      fresh = (await getDocs(query(collection(db, "services"), orderBy("order")))).docs.map(d => ({ id: d.id, t: "", image: d.data().image || "", ...d.data() })).filter(v => v.title); fromSdk = true;
    } catch (e) {}
  }
  if (fresh === null) { if (!shown) empty(); return; }
  if (!fresh.length) { try { localStorage.removeItem(LS); } catch (e) {} if (shown) location.reload(); else empty(); return; }
  if (JSON.stringify(fresh) !== JSON.stringify(cached)) { if (!fromSdk) try { localStorage.setItem(LS, JSON.stringify(fresh)); } catch (e) {} render(fresh); }
  setTimeout(prefetch, 800);
}
