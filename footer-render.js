// Footer "Our Services" column, filled from the services added in Admin > Services (first 6, in the admin's Position order).
// Loaded on every public page. If the backend is empty or unreachable the footer keeps its original links.
import { watch, SVC, slugs } from "/site-data.js";
const ul = document.getElementById("menu-footer-menu-2"), tpl = ul && ul.querySelector("li");
if (tpl) {
  const li0 = tpl.cloneNode(true), MAX = 6;
  watch(SVC, list => {
    const names = slugs(list);
    ul.replaceChildren(...list.slice(0, MAX).map((v, i) => {
      const li = li0.cloneNode(true), a = li.querySelector("a");
      li.removeAttribute("id"); a.setAttribute("href", "/services/#" + names[i]); a.querySelector("span").textContent = v.title;
      return li;
    }));
  });
}