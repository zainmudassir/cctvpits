// Adds Login / Register (or My account / Admin) to every public page header.
import { auth, db } from "/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const box = document.createElement("div");
box.id = "acct-links";
const css = document.createElement("style");
css.textContent = `#acct-links{display:flex;gap:8px;align-items:center}
#acct-links a{font:700 12px/1 Orbitron,'Public Sans',sans-serif;letter-spacing:.5px;text-transform:uppercase;text-decoration:none;color:#fff;border:2px solid #fff;border-radius:3px;padding:11px 14px;white-space:nowrap}
#acct-links a:hover{background:#fff;color:#1a2331}
#acct-links a.fill{background:#ed1d24;border-color:#ed1d24}
#acct-links.float{position:fixed;right:14px;bottom:14px;z-index:99999;background:#1a2331;padding:8px;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.35)}`;
document.head.appendChild(css);

function place() {
  const btn = document.querySelector("#reactheme-header a.rts__main__btn");
  const host = btn && btn.offsetParent !== null ? btn.closest(".elementor-widget") : null;
  if (host) { host.parentNode.insertBefore(box, host); box.style.marginRight = "12px"; }
  else { box.classList.add("float"); document.body.appendChild(box); }
}
function draw(guest, admin) {
  box.innerHTML = guest
    ? '<a href="/login.html">Login</a><a class="fill" href="/register.html">Register</a>'
    : `<a class="fill" href="${admin ? "/admin.html" : "/dashboard.html"}">${admin ? "Admin" : "My account"}</a>`;
}
place(); draw(true, false);
onAuthStateChanged(auth, async u => {
  if (!u) return draw(true, false);
  let admin = false;
  try { admin = (await getDoc(doc(db, "admins", u.uid))).exists(); } catch (e) {}
  draw(false, admin);
});
