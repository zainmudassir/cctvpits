// Floating Login / Register (or My account / Admin) box, bottom-right, left of the back-to-top button.
// Drawn instantly; Firebase loads later when the browser is idle so it never slows the page.
const css = document.createElement("style");
css.textContent = `#acct-links{position:fixed;right:88px;bottom:28px;z-index:99999;display:flex;gap:6px;align-items:center;background:#1a2331;padding:5px;border-radius:4px;box-shadow:0 6px 18px rgba(0,0,0,.35)}
#acct-links a{font:700 12px/1 Orbitron,'Public Sans',sans-serif;letter-spacing:.5px;text-transform:uppercase;text-decoration:none;color:#fff;border:2px solid #fff;border-radius:3px;padding:11px 14px;white-space:nowrap}
#acct-links a:hover{background:#fff;color:#1a2331}
#acct-links a.fill{background:#ed1d24;border-color:#ed1d24}
#acct-links a.fill:hover{background:#c8141a;border-color:#c8141a;color:#fff}
@media(max-width:480px){#acct-links{right:80px;bottom:16px}#acct-links a{padding:10px 11px;font-size:11px}}`;
document.head.appendChild(css);
const box = document.createElement("div"); box.id = "acct-links"; document.body.appendChild(box);
const draw = k => { box.innerHTML = k === "guest" ? '<a href="/login.html">Login</a><a class="fill" href="/register.html">Register</a>'
  : `<a class="fill" href="${k === "admin" ? "/admin.html" : "/dashboard.html"}">${k === "admin" ? "Admin" : "My account"}</a>`; };
let hint = "guest"; try { hint = localStorage.getItem("acct-hint") || "guest"; } catch (e) {}
draw(hint);
const go = async () => {
  const [{ auth, db }, { onAuthStateChanged }, { doc, getDoc }] = await Promise.all([import("/firebase-lite.js"),
    import("https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js"), import("https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js")]);
  onAuthStateChanged(auth, async u => {
    let k = "guest";
    if (u) { k = "user"; try { if ((await getDoc(doc(db, "admins", u.uid))).exists()) k = "admin"; } catch (e) {} }
    try { localStorage.setItem("acct-hint", k); } catch (e) {}
    draw(k);
  });
};
(window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 3000 }) : f => setTimeout(f, 1200))(go);
