// Floating WhatsApp button on every public page + Meta Pixel "Contact" event on any WhatsApp click.
// To change the number, change WA below (country code, no + or spaces). packages-render.js has the same number.
(function () {
  var WA = "923053871991";
  if (document.getElementById("wa-float")) return;
  var msg = "Hi, I want a CCTV quote. My place is a ___ (home/shop/office).";
  var a = document.createElement("a");
  a.id = "wa-float"; a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", "Get a quote on WhatsApp");
  a.innerHTML = '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path fill="#fff" d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.2 1.6 6.03L4 29l8.14-1.56a12 12 0 0 0 3.9.65h.01C22.68 28.1 28 22.7 28 16.07 28 9.4 22.7 3 16.04 3zm0 22.1h-.01a10 10 0 0 1-5.1-1.4l-.37-.22-3.78.73.77-3.68-.24-.38a9.9 9.9 0 0 1-1.52-5.3c0-5.5 4.5-9.95 10.02-9.95 5.5 0 9.96 4.5 9.96 10 0 5.5-4.5 10.2-9.73 10.2zm5.5-7.4c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.68-1.65-.93-2.25-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.52.08-.8.37-.27.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.13 4.53.72.3 1.28.5 1.72.64.72.23 1.37.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.12-.28-.2-.58-.35z"/></svg>';
  var st = document.createElement("style");
  st.textContent = "#wa-float{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));width:58px;height:58px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.35);z-index:99999;transition:transform .15s}#wa-float:hover{transform:scale(1.08)}";
  document.head.appendChild(st); document.body.appendChild(a);
  // Count every WhatsApp click as a Contact event once the Meta Pixel is installed (does nothing until then)
  document.addEventListener("click", function (e) {
    var l = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (l && window.fbq) try { fbq("track", "Contact"); } catch (x) {}
  });
})();