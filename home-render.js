// Home page: (1) the brand slider shows every company from Admin > Companies, (2) the Our Services section shows the first 4 services
// from Admin > Services (lowest Position first). If the backend is empty or unreachable the original markup stays as it was.
import { watch, SVC, CO, slugs, getImage } from "/site-data.js";
const reveal = () => { const h = document.getElementById("home-hide"); if (h) h.remove(); };

// ---------- services cards ----------
const grid = document.querySelector(".elementor-element-8e91687"), card0 = grid && grid.querySelector(".elementor-widget-service");
if (card0) {
  const tpl = card0.cloneNode(true), ICONS = ["cctv.svg", "networking-1.svg", "setting.svg", "phone.svg"].map(f => "wp-content/uploads/2024/12/" + f);
  const short = t => t.length > 120 ? t.slice(0, 117).replace(/\s+\S*$/, "") + "…" : t;
  watch(SVC, list => {
    const names = slugs(list), top = list.slice(0, 4);
    grid.replaceChildren(...top.map((v, i) => {
      const w = tpl.cloneNode(true), a = w.querySelector("a"), img = w.querySelector("img");
      w.removeAttribute("data-id"); a.setAttribute("href", "/services/#" + names[i]);
      img.src = ICONS[i % ICONS.length]; img.alt = v.title;
      w.querySelector(".rts__service__title").textContent = v.title;
      w.querySelector(".rts__service__description").textContent = short(v.description || v.heading || "");
      return w;
    }));
  });
}

// ---------- brand slider ----------
const mq = document.querySelector(".rt-marquee .Marquee-content");
if (mq) {
  const st = document.createElement("style");
  st.textContent = ".rt-marquee .Marquee-tag img{display:block;width:auto;height:auto;max-width:100%;max-height:80px;object-fit:contain}.rt-marquee .Marquee-tag .brand-name{font-size:26px;line-height:1.2;text-align:center;padding:0 12px}";
  document.head.appendChild(st);
  const build = v => {
    const tag = document.createElement("div"), h = document.createElement("h3"), box = document.createElement("div"), a = document.createElement("a");
    tag.className = "Marquee-tag"; h.className = "mb-0"; h.appendChild(document.createElement("span")); box.className = "marquee-image"; a.setAttribute("href", "brands/");
    box.appendChild(a); tag.append(h, box);
    getImage(v).then(src => {
      const text = () => { const s = h.firstChild; s.className = "brand-name"; s.textContent = v.name; };
      if (!src) return text();
      const img = new Image(); img.alt = v.name; img.decoding = "async"; img.onerror = () => { img.remove(); text(); }; a.appendChild(img); img.src = src;
    });
    return tag;
  };
  watch(CO, list => {
    // the loop scrolls by half of the track, so the list is repeated until one half is wider than any screen, then doubled
    const per = list.length * Math.ceil(7 / list.length), half = Array.from({ length: per }, (_, i) => list[i % list.length]);
    mq.replaceChildren(...half.concat(half).map(build));
    mq.style.animationDuration = Math.round(per * 300 / 67) + "s";   // about the same speed as the original (67px per second)
    reveal();
  }).then(reveal);
} else reveal();