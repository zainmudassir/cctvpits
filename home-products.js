// Home page: "Our Products" section with the newest products from Admin > Products. The section stays hidden until products load,
// so an empty or unreachable database never leaves a blank block on the home page.
import { loadProducts, injectStyles, cardHtml, hydrateImages } from "/products-data.js";
const sec = document.getElementById("home-products");
if (sec) (async () => {
  const list = await loadProducts(); if (!list || !list.length) return;
  injectStyles();
  const top = list.slice(0, 8), grid = sec.querySelector(".prd-grid"), byId = new Map(top.map(p => [p.id, p]));
  grid.innerHTML = top.map(cardHtml).join(""); sec.style.display = ""; hydrateImages(grid, byId);
})();
