// Serves a product photo (stored inside Firestore) as a normal image URL so link previews can show it.
const BASE = "https://firestore.googleapis.com/v1/projects/cctv-pits/databases/(default)/documents/products/", KEY = "AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w";
export async function onRequest({ params, request }) {
  const origin = new URL(request.url).origin, id = String(params.id || "").replace(/[^A-Za-z0-9_-]/g, ""), fallback = Response.redirect(origin + "/assets/images/og-image.jpg", 302);
  try {
    const r = await fetch(BASE + id + "?mask.fieldPaths=image&key=" + KEY);
    if (!r.ok) return fallback;
    const s = (((await r.json()).fields || {}).image || {}).stringValue || "";
    const m = s.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/i);
    if (m) {
      const bin = atob(m[2]), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      return new Response(buf, { headers: { "content-type": m[1], "cache-control": "public, max-age=3600" } });
    }
    if (s && !/^https?:/i.test(s)) return Response.redirect(origin + "/" + s.replace(/^\/+/, ""), 302);
    if (/^https:/i.test(s)) return Response.redirect(s, 302);
  } catch (e) {}
  return fallback;
}
