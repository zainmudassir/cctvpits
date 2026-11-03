// Floating Login / Register (or My account / Admin) box, bottom-right, just left of the back-to-top button.
import { auth, db } from "/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const css = document.createElement("style");
css.textContent = `#acct-links{position:fixed;right:88px;bottom:28px;z-index:99999;display:flex;gap:6px;align-items:center;background:#1a2331;padding:5px;border-radius:4px;box-shadow:0 6px 18px rgba(0,0,0,.35)}
#acct-links a{font:700 12px/1 Orbitron,'Public Sans',sans-serif;letter-spacing:.5px;text-transform:uppercase;text-decoration:none;color:#fff;border:2px solid #fff;border-radius:3px;padding:11px 14px;white-space:nowrap}
#acct-links a:hover{background:#fff;color:#1a2331}
#acct-links a.fill{background:#ed1d24;border-color:#ed1d24}
#acct-links a.fill:hover{background:#c8141a;border-color:#c8141a;color:#fff}
@media(max-width:480px){#acct-links{right:80px;bottom:16px}#acct-links a{padding:10px 11px;font-size:11px}}`;
document.head.appendChild(css);

const box = document.createElement("div");
box.id = "acct-links";
document.body.appendChild(box);

function draw(guest, admin) {
  box.innerHTML = guest
    ? '<a href="/login.html">Login</a><a class="fill" href="/register.html">Register</a>'
    : `<a class="fill" href="${admin ? "/admin.html" : "/dashboard.html"}">${admin ? "Admin" : "My account"}</a>`;
}
draw(true, false);
onAuthStateChanged(auth, async u => {
  if (!u) return draw(true, false);
  let admin = false;
  try { admin = (await getDoc(doc(db, "admins", u.uid))).exists(); } catch (e) {}
  draw(false, admin);
});
