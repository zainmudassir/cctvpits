// Share link: https://cctvpits.store/p/<productId>
// Gives WhatsApp / Facebook / etc. a preview (photo, name, price), then sends real visitors to the store page for that item.
const BASE = "https://firestore.googleapis.com/v1/projects/cctv-pits/databases/(default)/documents/products/", KEY = "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sv = f => (f && f.stringValue) || "", nv = f => f ? Number(f.integerValue ?? f.doubleValue ?? 0) : 0;
export async function onRequest({ params, request }) {
  const origin = new URL(request.url).origin, id = String(params.id || "").replace(/[^A-Za-z0-9_-]/g, "");
  let name = "CCTV PITS", desc = "CCTV cameras, DVRs, NVRs, accessories and packages. Pay by bank transfer.", img = origin + "/assets/images/og-image.jpg";
  try {
    const r = await fetch(BASE + id + "?key=" + KEY);
    if (r.ok) {
      const f = (await r.json()).fields || {};
      if (sv(f.name)) {
        name = sv(f.name) + " | CCTV PITS";
        const price = nv(f.price), items = ((f.items || {}).arrayValue || {}).values ? " (package)" : "";
        desc = (price > 0 ? "Rs. " + price.toLocaleString("en-US") + items + ". " : "") + (sv(f.description) || "Buy online from CCTV PITS. Call or WhatsApp +92 305 3871991.");
        if (sv(f.image)) img = origin + "/img/" + id;
        else if (sv(f.type) === "package") img = origin + "/assets/images/package-og.jpg";
      }
    }
  } catch (e) {}
  const url = origin + "/p/" + id, go = "/?product=" + encodeURIComponent(id);
  return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(name) + '</title>' +
    '<meta name="description" content="' + esc(desc) + '"><meta property="og:type" content="product"><meta property="og:site_name" content="CCTV PITS"><meta property="og:title" content="' + esc(name) + '">' +
    '<meta property="og:description" content="' + esc(desc) + '"><meta property="og:url" content="' + esc(url) + '"><meta property="og:image" content="' + esc(img) + '"><meta name="twitter:card" content="summary_large_image">' +
    '<meta http-equiv="refresh" content="0;url=' + esc(go) + '"><script>location.replace(' + JSON.stringify(go) + ')</script></head><body><a href="' + esc(go) + '">Open in store</a></body></html>',
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
}
