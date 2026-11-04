// Packages page: the cards come from the database (admin > Packages) through the Firestore REST API.
// The cards already in the HTML stay as a fallback if the database is empty or cannot be reached.
const API = "https://firestore.googleapis.com/v1/projects/cctv-pits/databases/(default)/documents/packages?pageSize=100&orderBy=order&key=AIzaSyBI8ye784CeFUEhpnZ-azZGGYn6xO0QH5w";
const grid = document.querySelector(".pkg-grid");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const val = f => { if (!f) return undefined; if ("stringValue" in f) return f.stringValue; if ("integerValue" in f) return Number(f.integerValue); if ("doubleValue" in f) return f.doubleValue; if ("booleanValue" in f) return f.booleanValue;
  if (f.arrayValue) return (f.arrayValue.values || []).map(val); if (f.mapValue) return Object.fromEntries(Object.entries(f.mapValue.fields || {}).map(([k, v]) => [k, val(v)])); return undefined; };
const money = n => "Rs. " + Number(n).toLocaleString("en-US");

function card(id, v) {
  const lines = (v.items || []).filter(i => i && i.name).map(i => ({ t: (Number(i.quantity) > 1 ? i.quantity + " x " : "") + i.name, tip: i.desc || "" })).concat((v.extras || []).map(t => ({ t, tip: "" })));
  return '<div class="pkg-card"><div class="pkg-num">' + esc(v.cameras) + '</div><h3 class="pkg-title">' + esc(v.name) + '</h3>' + (v.who ? '<span class="pkg-who">' + esc(v.who) + '</span>' : "") +
    (v.description ? '<p class="pkg-desc">' + esc(v.description) + '</p>' : "") + '<div class="pkg-price">' + (Number(v.price) > 0 ? money(v.price) : "Call for price") + '</div>' +
    '<ul class="pkg-list">' + lines.map(l => '<li' + (l.tip ? ' class="pkg-tip" tabindex="0" data-tip="' + esc(l.tip) + '"' : "") + '><i class="fas fa-check" aria-hidden="true"></i><span>' + esc(l.t) + '</span></li>').join("") + '</ul>' +
    '<a class="rts__main__btn rts__btn__slideup" href="../checkout.html?pkg=' + encodeURIComponent(id) + '" data-hover="Get this package"><span>Get this package</span></a></div>';
}

const st = document.createElement("style");
st.textContent = ".pkg-list li.pkg-tip{position:relative;cursor:help;outline:0}.pkg-list li.pkg-tip>span{border-bottom:1px dotted rgba(255,255,255,.55)}" +
  ".pkg-list li.pkg-tip::after{content:attr(data-tip);position:absolute;left:0;bottom:calc(100% + 6px);width:max-content;max-width:240px;background:#fff;color:#0b1a30;font-size:13px;line-height:1.4;padding:8px 10px;border-radius:3px;box-shadow:0 6px 18px rgba(0,0,0,.35);opacity:0;visibility:hidden;transform:translateY(4px);transition:.15s;z-index:5;pointer-events:none}" +
  ".pkg-list li.pkg-tip:hover::after,.pkg-list li.pkg-tip:focus::after{opacity:1;visibility:visible;transform:none}";
document.head.appendChild(st);
if (grid) fetch(API).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(j => {
  const list = (j.documents || []).map(d => ({ id: d.name.split("/").pop(), v: val({ mapValue: { fields: d.fields || {} } }) })).filter(p => p.v.active !== false && p.v.name);
  if (list.length) grid.innerHTML = list.map(p => card(p.id, p.v)).join("");
}).catch(e => console.warn("Packages not loaded from database", e));