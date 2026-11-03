// Shared backend data for the public pages (home page sections and the footer).
// Same approach as services-render.js / brands-render.js: Firestore REST (no Firebase SDK download), the list is cached in the
// browser and shown instantly, then refreshed; if REST is blocked it falls back to the Firebase SDK. One request per list per page.
const BASE = "https://firestore.googleapis.com/v1/projects/cctv-pits/databases/(default)/documents/", KEY = "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w";
const sv = f => f && (f.stringValue !== undefined ? f.stringValue : f.integerValue !== undefined ? Number(f.integerValue) : f.doubleValue);
const num = f => f && (f.integerValue !== undefined ? Number(f.integerValue) : f.doubleValue !== undefined ? Number(f.doubleValue) : null);
const id = d => d.name.split("/").pop();

// The shapes below match services-render.js and brands-render.js, so all pages share the same browser cache.
export const SVC = {
  col: "services", order: "order", fields: ["title", "heading", "description", "points", "order"], ls: "svc:list", pre: "__svcH",
  parse: d => { const f = d.fields || {}; return { id: id(d), t: d.updateTime || "", title: sv(f.title) || "", heading: sv(f.heading) || "", description: sv(f.description) || "",
    order: Number(sv(f.order)) || 0, points: ((f.points || {}).arrayValue || {}).values ? f.points.arrayValue.values.map(x => x.stringValue).filter(Boolean) : [] }; },
  fromSdk: d => ({ id: d.id, t: "", ...d.data() }), keep: v => v.title
};
export const CO = {
  col: "companies", order: "name", fields: ["name", "padY", "padX"], ls: "brands:list", pre: "__coH",
  parse: d => { const f = d.fields || {}; return { id: id(d), t: d.updateTime || "", name: String(sv(f.name) || "").trim(), padY: num(f.padY), padX: num(f.padX) }; },
  fromSdk: d => ({ id: d.id, t: "", image: d.data().image || "", name: String(d.data().name || "").trim(), padY: d.data().padY ?? null, padX: d.data().padX ?? null }), keep: v => v.name
};
export const url = c => BASE + c.col + "?pageSize=100&orderBy=" + c.order + "&" + c.fields.map(k => "mask.fieldPaths=" + k).join("&") + "&key=" + KEY;

const jobs = {};
const fresh = c => jobs[c.col] || (jobs[c.col] = (async () => {
  let list = null, sdk = false;
  try { const r = await (window[c.pre] || fetch(url(c))); if (r && r.ok) list = ((await r.json()).documents || []).map(c.parse).filter(c.keep); } catch (e) {}
  if (list === null) {
    try {
      const { db } = await import("/firebase-lite.js"), { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js");
      list = (await getDocs(query(collection(db, c.col), orderBy(c.order)))).docs.map(c.fromSdk).filter(c.keep); sdk = true;
    } catch (e) {}
  }
  return { list, sdk };
})());

// cb(list) runs with the cached list first (if any), then again only if the backend list is different.
// Returns "ok", "empty" (no items in the backend) or "fail" (could not reach it); callers keep their original markup on empty/fail.
export async function watch(c, cb) {
  let cached = null; try { cached = JSON.parse(localStorage.getItem(c.ls)); } catch (e) {}
  const had = !!(cached && cached.length);
  if (had) cb(cached);
  const { list, sdk } = await fresh(c);
  if (list === null) return "fail";
  if (!list.length) { try { localStorage.removeItem(c.ls); } catch (e) {} if (had) location.reload(); return "empty"; }
  if (JSON.stringify(list) !== JSON.stringify(cached)) { if (!sdk) try { localStorage.setItem(c.ls, JSON.stringify(list)); } catch (e) {} cb(list); }
  return "ok";
}

// Same link names as the Services page tabs (services-render.js), so /services/#name opens the right tab.
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const slugs = list => { const used = new Set(); return list.map((v, i) => { let s = slug(v.title) || "service-" + (i + 1); while (used.has(s)) s += "-" + (i + 1); used.add(s); return s; }); };

// Logo of one company (a separate request because logos are large); cached per company and update time, like services-render.js.
const imgs = new Map();
export function getImage(v) {
  if (v.image !== undefined) return Promise.resolve(v.image);
  if (!imgs.has(v.id)) imgs.set(v.id, (async () => {
    const ck = "brandimg:" + v.id + ":" + v.t;
    try { const c = localStorage.getItem(ck); if (c !== null) return c; } catch (e) {}
    const r = await fetch(BASE + "companies/" + v.id + "?mask.fieldPaths=image&key=" + KEY);
    if (!r.ok) return "";
    const s = String((((await r.json()).fields || {}).image || {}).stringValue || "");
    try { Object.keys(localStorage).filter(k => k.startsWith("brandimg:" + v.id + ":")).forEach(k => localStorage.removeItem(k)); localStorage.setItem(ck, s); } catch (e) {}
    return s;
  })().catch(() => ""));
  return imgs.get(v.id);
}