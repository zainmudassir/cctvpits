// Builds the service tabs on service-page from Firestore (collection "services").
// If Firestore has no services yet, the built-in tabs stay as they are.
import { db } from "/firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const menuUl = document.querySelector(".service__menu ul.menu"), tpl = document.querySelector(".service-tab-panel");

async function build() {
  let list = [];
  try { list = (await getDocs(query(collection(db, "services"), orderBy("order")))).docs.map(d => d.data()).filter(v => v.title); } catch (e) {}
  if (!list.length) return;
  const liT = menuUl.querySelector("li").cloneNode(true), pT = tpl.cloneNode(true), inner = tpl.parentNode;
  const anchor = [...inner.children].filter(c => !c.classList.contains("service-tab-panel")).pop();
  inner.querySelectorAll(".service-tab-panel").forEach(p => p.remove()); menuUl.innerHTML = "";
  const used = new Set();
  list.forEach((v, i) => {
    let s = slug(v.title) || "service-" + (i + 1); while (used.has(s)) s += "-" + (i + 1); used.add(s);
    const li = liT.cloneNode(true), a = li.querySelector("a");
    li.removeAttribute("id"); a.dataset.tab = s; a.setAttribute("href", "#" + s); a.querySelector("span").textContent = v.title; menuUl.appendChild(li);
    const p = pT.cloneNode(true), img = p.querySelector("img"), pts = (v.points || []).filter(Boolean).slice(0, 5);
    p.id = "tab-" + s; p.hidden = true;
    img.src = v.image || "../wp-content/uploads/2024/12/camera-1.webp"; img.removeAttribute("srcset"); img.removeAttribute("sizes"); img.alt = v.heading || v.title;
    p.querySelector("h2").textContent = v.heading || v.title;
    p.querySelector(".elementor-widget-text-editor p").textContent = v.description || "";
    const h6 = p.querySelector("h6"), ul = p.querySelector("ul.elementor-icon-list-items"), li0 = ul.querySelector("li").cloneNode(true);
    h6.textContent = "Our " + v.title + " Services Include:"; ul.innerHTML = "";
    pts.forEach(t => { const x = li0.cloneNode(true); x.querySelector(".elementor-icon-list-text").textContent = t; ul.appendChild(x); });
    if (!pts.length) { h6.closest(".elementor-widget").hidden = true; ul.closest(".elementor-widget").hidden = true; }
    inner.insertBefore(p, anchor);
  });
}
function tabs() {
  const links = [...document.querySelectorAll(".service__menu a[data-tab]")], panels = [...document.querySelectorAll(".service-tab-panel")];
  const show = (s, upd) => {
    if (!panels.some(p => p.id === "tab-" + s)) s = links[0] && links[0].dataset.tab;
    panels.forEach(p => p.hidden = p.id !== "tab-" + s);
    links.forEach(a => { const on = a.dataset.tab === s, li = a.closest("li"); li.classList.toggle("current-menu-item", on); li.classList.toggle("current_page_item", on); if (on) document.title = a.textContent.trim() + " | CCTV PITS"; });
    if (upd) history.replaceState(null, "", "#" + s);
  };
  links.forEach(a => a.addEventListener("click", e => { e.preventDefault(); show(a.dataset.tab, true); }));
  addEventListener("hashchange", () => show(location.hash.slice(1)));
  show(location.hash.slice(1));
}
(async () => { if (menuUl && tpl) { await build(); tabs(); } })();
