/* global rtnbConfig */
(function () {
  "use strict";

  var config = window.rtnbConfig || {};

  /**
   * Storage can throw in private mode or when cookies are blocked.
   *
   * @param {number} days How long a dismissal is remembered for.
   * @return {Storage|null} The store to remember it in.
   */
  function store(days) {
    try {
      return days > 0 ? window.localStorage : window.sessionStorage;
    } catch (e) {
      return null;
    }
  }

  /**
   * @param {string} name Storage key of this notice.
   * @param {Object} opts Notice config: `key` and `rememberDays`.
   * @return {boolean} Whether this notice was already dismissed.
   */
  function isDismissed(name, opts) {
    var box = store(opts.rememberDays);

    if (!box) {
      return false;
    }

    try {
      var raw = box.getItem(name);

      if (!raw) {
        return false;
      }

      var data = JSON.parse(raw);

      if (data.key !== opts.key) {
        return false;
      }

      return !data.until || data.until > Date.now();
    } catch (e) {
      return false;
    }
  }

  /**
   * Wire a notice's close control: remember the dismissal, fade the notice
   * out, then take it off the page.
   *
   * The control is a span rather than a button, because themes style bare
   * `button` too heavily to keep it looking like ours — so the keys a real
   * button would answer to are wired up here.
   *
   * @param {HTMLElement} el   The notice.
   * @param {string}      name Storage key of this notice.
   * @param {Object}      opts Notice config: `key` and `rememberDays`.
   */
  function onClose(el, name, opts) {
    var close = el.querySelector(".rtnb-close");

    if (!close) {
      return;
    }

    var dismiss = function () {
      var days = Number(opts.rememberDays) || 0;
      var box = store(days);

      try {
        if (box) {
          box.setItem(
            name,
            JSON.stringify({
              key: opts.key,
              until: days > 0 ? Date.now() + days * 86400000 : 0,
            })
          );
        }
      } catch (e) {
        /* Nothing to do: the notice simply comes back next time. */
      }

      el.classList.add("rtnb-closing");

      // Only the bar ever pushed the page down.
      if ("rtnb-bar" === el.id) {
        document.body.style.paddingTop = "";
      }

      window.setTimeout(function () {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }, 250);
    };

    close.addEventListener("click", dismiss);

    close.addEventListener("keydown", function (event) {
      if (
        "Enter" === event.key ||
        " " === event.key ||
        "Spacebar" === event.key
      ) {
        event.preventDefault();
        dismiss();
      }
    });
  }

  /**
   * Put the bar at the top of the site header, so it sits in the same flow as
   * the header and travels with it once the theme makes it sticky. PHP prints
   * the bar at `wp_body_open`, which runs before the header exists, so the
   * move happens here. Falls back to the top of `<body>` when no header
   * matches the configured selector.
   *
   * @param {HTMLElement} bar The notice bar.
   */
  function mount(bar) {
    var target = null;

    // Tried one at a time, because a single grouped selector would return
    // whichever header comes first in the document rather than the one
    // named first here — and a site can carry more than one.
    (config.mount || "").split(",").some(function (selector) {
      try {
        target = document.querySelector(selector.trim());
      } catch (e) {
        target = null;
      }

      return !!target;
    });

    // A target that already holds the bar would be moved into itself.
    if (!target || target === bar || bar.contains(target)) {
      target = document.body;
    }

    if (target.firstElementChild !== bar) {
      target.insertBefore(bar, target.firstChild);
    }
  }

  /**
   * Whether the page is being framed by ThemeForest — the full screen preview
   * that puts the Envato Market bar above the site and loads the site itself
   * in an iframe below it.
   *
   * The framing page is on another origin, so its URL cannot simply be read.
   * `ancestorOrigins` reports it where the browser supports it; elsewhere the
   * referrer of a framed document is the page doing the framing.
   *
   * @return {boolean} True only when a ThemeForest page is framing us.
   */
  function inPreviewFrame() {
    var hosts = /(^|\.)(themeforest\.net|envato\.com)$/i;

    /**
     * @param {string} url Absolute URL.
     * @return {boolean} Whether it points at ThemeForest.
     */
    var matches = function (url) {
      try {
        return hosts.test(new URL(url).hostname);
      } catch (e) {
        return false;
      }
    };

    try {
      if (window.self === window.top) {
        return false;
      }
    } catch (e) {
      // Reading `top` across origins can throw, which is itself proof of
      // being framed — fall through and check who is doing it.
    }

    var origins = window.location.ancestorOrigins;

    if (origins && origins.length) {
      for (var i = 0; i < origins.length; i++) {
        if (matches(origins[i])) {
          return true;
        }
      }

      // Authoritative where it exists: no ThemeForest ancestor, no popup.
      return false;
    }

    return !!document.referrer && matches(document.referrer);
  }

  function initBar() {
    var opts = config.bar;
    var bar = document.getElementById("rtnb-bar");

    if (!bar || !opts) {
      return;
    }

    mount(bar);

    if (isDismissed("rtnb-dismissed", opts)) {
      bar.parentNode.removeChild(bar);
      return;
    }

    bar.hidden = false;
    onClose(bar, "rtnb-dismissed", opts);

    if ("fixed" !== opts.position) {
      return;
    }

    // A bar pinned to the viewport covers the top of the page unless the
    // content is pushed down by its height.
    var offsetBody = function () {
      document.body.style.paddingTop = bar.offsetHeight + "px";
    };

    offsetBody();
    window.addEventListener("resize", offsetBody);
  }

  function initPopup() {
    var opts = config.popup;
    var popup = document.getElementById("rtnb-popup");

    if (!popup || !opts) {
      return;
    }

    if (
      (opts.previewOnly && !inPreviewFrame()) ||
      isDismissed("rtnb-popup-dismissed", opts)
    ) {
      popup.parentNode.removeChild(popup);
      return;
    }

    onClose(popup, "rtnb-popup-dismissed", opts);

    window.setTimeout(function () {
      popup.hidden = false;

      // One frame later, so the browser has a state to animate from.
      window.requestAnimationFrame(function () {
        popup.classList.add("rtnb-popup--in");
      });
    }, (Number(opts.delay) || 0) * 1000);
  }

  function init() {
    initBar();
    initPopup();
  }

  if ("loading" === document.readyState) {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
