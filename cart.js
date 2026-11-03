// Shared cart helpers (cart is saved in the visitor's browser)
const KEY = "cctvpits_cart";
export const getCart = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
const save = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} window.dispatchEvent(new Event("cartchange")); };
export function addToCart(p) {
  const c = getCart(), i = c.find(x => x.id === p.id);
  i ? i.qty++ : c.push({ id: p.id, name: p.name, price: Number(p.price), qty: 1 });
  save(c);
}
export function setQty(id, q) {
  const c = getCart();
  save(q <= 0 ? c.filter(x => x.id !== id) : c.map(x => x.id === id ? { ...x, qty: q } : x));
}
export const clearCart = () => save([]);
export const cartCount = () => getCart().reduce((n, x) => n + x.qty, 0);
export const cartTotal = () => getCart().reduce((n, x) => n + x.qty * x.price, 0);
export const rs = n => "Rs. " + Number(n).toLocaleString();
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
// Shrinks an image in the browser so it fits inside a Firestore document
export function shrink(file, max = 900, q = 0.7) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", q));
    };
    img.onerror = rej; img.src = url;
  });
}
