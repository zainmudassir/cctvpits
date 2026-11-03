(function ($) {
  "use strict";
  // sticky menu
  var header = $(".menu-sticky");
  var win = $(window);
  var headerinnerHeight = $(".header-inner").innerHeight();
  win.on("scroll", function () {
    var scroll = win.scrollTop();
    if (scroll < headerinnerHeight) {
      header.removeClass("sticky");
      $(".menu-area").removeClass("sticky-menu");
    } else {
      header.addClass("sticky");
      $(".menu-area").addClass("sticky-menu");
    }
  });

  $(".widget_nav_menu li a")
    .filter(function () {
      return $.trim($(this).html()) == "";
    })
    .hide();

  // collapse hidden
  $(function () {
    var navMain = $(".navbar-collapse"); // avoid dependency on #id
    // when you have dropdown inside navbar
    navMain.on("click", "a:not([data-toggle])", null, function () {
      navMain.collapse("hide");
    });
  });

  $(document).ready(function () {
    function resizeNav() {
      $(".menu-ofcn").css({ height: window.innerHeight });
      var radius = Math.sqrt(
        Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2)
      );
      var diameter = radius * 2;
      $(".off-nav-layer").width(diameter);
      $(".off-nav-layer").height(diameter);
      $(".off-nav-layer").css({
        "margin-top": -radius,
        "margin-left": -radius,
      });
    }
    $(".menu-button, .close-button").on("click", function () {
      $(
        ".nav-toggle, .off-nav-layer, .menu-ofcn, .close-button, body"
      ).toggleClass("off-open");
    });

    $("#mobile_menu li a").on("click", function () {
      $(
        ".nav-toggle, .off-nav-layer, .menu-ofcn, .close-button, body"
      ).toggleClass("off-open");
    });

    $(window).resize(resizeNav);
    resizeNav();

    $("#mobile_menu").menumaker({
      format: "multitoggle",
    });
  });

  $(".nav-link-container").on("click", function (e) {
    $("body.on-offcanvas").removeClass("on-offcanvas");
    setTimeout(function () {
      $("body").addClass("on-offcanvas");
    }, 500);
  });

  //search
  $(".sticky_search").on("click", function (event) {
    $(".sticky_form").animate({ opacity: "toggle" }, 500);
    $(".sticky_form input").focus();
  });

  $(".sticky_search").on("click", function () {
    $("body").removeClass("search-active").removeClass("search-close");
    if ($(this).hasClass("close-full")) {
      $("body").addClass("search-close");
      $(".sticky_form").fadeOut("show");
    } else {
      $("body").addClass("search-active");
    }
    return false;
  });
  // Canvas Menu Js
  $(".nav-link-container > a")
    .off("click")
    .on("click", function (event) {
      event.preventDefault();
      $(".nav-link-container").toggleClass("nav-inactive-menu-link-container");
      $(".mobile-menus").toggleClass("nav-active-menu-container");
    });

  $(".nav-close-menu-li > a").on("click", function (event) {
    $(".mobile-menus").toggleClass("nav-active-menu-container");
    $(".content").toggleClass("inactive-body");
  });

  $(function () {
    $("ul.children").addClass("sub-menu");
  });
  //Videos popup jQuery activation code
  $(".popup-videos").magnificPopup({
    disableOn: 10,
    type: "iframe",
    mainClass: "mfp-fade",
    removalDelay: 160,
    preloader: false,
    fixedContentPos: false,
  });
  // collapse hidden
  $(function () {
    var navMain = $(".navbar-collapse"); // avoid dependency on #id
    // "a:not([data-toggle])" - to avoid issues caused
    // when you have dropdown inside navbar
    navMain.on("click", "a:not([data-toggle])", null, function () {
      navMain.collapse("hide");
    });
  });
  //preloader
  $(window).on("load", function () {
    $("#de-loader").delay(400).fadeOut(200);

    if ($(window).width() < 992) {
      $(".reactheme-menu").css("height", "0");
      $(".reactheme-menu").css("opacity", "0");
      $(".reactheme-menu").css("z-index", "-1");
      $(".reactheme-menu-toggle").on("click", function () {
        $(".reactheme-menu").css("opacity", "1");
        $(".reactheme-menu").css("z-index", "1");
      });
    }
  });

  // skrollr init
  if ($(".skrollr-image").length) {
    $(window).on("load", function () {
      var s = skrollr.init();
      if (s.isMobile()) {
        s.destroy();
        return; // Exit early if on mobile
      }
      $(window).on("resize", function () {
        s.refresh();
      });
    });
  }

  //wow initial
  new WOW().init();
  // Counter Up
  $(".rs-counter").counterUp({
    delay: 20,
    time: 1500,
  });

  // scrollTop init
  var win = $(window);
  var totop = $("#top-to-bottom");
  win.on("scroll", function () {
    if (win.scrollTop() > 150) {
      totop.fadeIn();
      $(".rts_header__switch").addClass("btt__enable");
      $("#top-to-bottom").addClass("scroll_visible");
    } else {
      totop.slideDown(400);
      $(".rts_header__switch").removeClass("btt__enable");
      $("#top-to-bottom").removeClass("scroll_visible");
    }
  });
  totop.on("click", function () {
    $("html,body").animate(
      {
        scrollTop: 0,
      },
      500
    );
  });

  $(function () {
    $("ul.children").addClass("sub-menu");
  });

  $(".comment-body, .comment-respond").wrap("<div class='comment-full'></div>");
  //mobile menu
  $.fn.menumaker = function (options) {
    var mobile_menu = $(this),
      settings = $.extend(
        {
          format: "dropdown",
          sticky: false,
        },
        options
      );
    return this.each(function () {
      mobile_menu.find("li ul.sub-menu").parent().addClass("has-sub");
      var multiTg = function () {
        mobile_menu
          .find(".has-sub")
          .prepend('<span class="submenu-button"></span>');
        mobile_menu
          .find(".back-mega--current-active")
          .prepend('<span class="submenu-button"></span>');
        mobile_menu.find(".hash").parent().addClass("hash-has-sub");

        mobile_menu.find(".submenu-button").on("click", function () {
          $(this).toggleClass("submenu-opened");

          const submenu = $(this).siblings("ul");
          if (submenu.hasClass("open-sub")) {
            submenu.removeClass("open-sub").hide("fadeToggle"); // Remove 'open-sub' and hide submenu
          } else {
            submenu.addClass("open-sub").hide("fadeToggle"); // Add 'open-sub' and show submenu
            submenu.slideToggle().show("fadeToggle");
          }
          // Mega Menu SubMenu On
          const megaSubmenu = $(this).siblings(".back-mega--current");
          if (megaSubmenu.hasClass("open-sub")) {
            megaSubmenu.removeClass("open-sub").hide("fadeToggle");
          } else {
            megaSubmenu.addClass("open-sub").hide("fadeToggle");
            megaSubmenu.slideToggle().show("fadeToggle");
          }
        });
      };
      if (settings.format === "multitoggle") multiTg();
      else mobile_menu.addClass("dropdown");
      if (settings.sticky === true) mobile_menu.css("position", "fixed");
      var resizeFix = function () {
        if ($(window).width() > 991) {
          mobile_menu.find("ul").show("fadeToggle");
          mobile_menu.find("ul.sub-menu").hide("fadeToggle");
        }
      };
      resizeFix();
      return $(window).on("resize", resizeFix);
    });
  };

  // JS for Filter
  $(window).load(function () {
    // image loaded portfolio init
    $(".grid-item").imagesLoaded(function () {
      $(".portfolio-filter").on("click", "button", function () {
        var filterValue = $(this).attr("data-filter");
        $grid.isotope({
          filter: filterValue,
        });
      });
      var $grid = $(".grid-item").isotope({
        animationOptions: {
          duration: 750,
          easing: "linear",
          queue: false,
        },

        itemSelector: ".grid-item",
        percentPosition: true,
        masonry: {
          columnWidth: ".grid-item",
        },
      });
    });

    $(".portfolio-filter button").on("click", function (event) {
      $(this).siblings(".active").removeClass("active");
      $(this).addClass("active");
      event.preventDefault();
    });

    document.addEventListener("DOMContentLoaded", function () {
      // Remove motion effects inline styles
      document.querySelectorAll("[data-settings]").forEach(function (element) {
        let settings = element.getAttribute("data-settings");
        if (settings.includes("motion_effects")) {
          element.removeAttribute("data-settings");
        }
      });

      // Remove any animation-related stylesheets
      document.querySelectorAll("link").forEach(function (link) {
        if (link.href.includes("animations") || link.href.includes("motion")) {
          link.parentNode.removeChild(link);
        }
      });
    });

    document.addEventListener("DOMContentLoaded", function () {
      var links = document.getElementsByTagName("link");
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (
          link.href &&
          link.href.includes(
            "elementor/assets/lib/animations/animations.min.css"
          )
        ) {
          // Remove Elementor's animations.min.css
          link.parentNode.removeChild(link);
          break; // Exit the loop after removing the stylesheet
        }
      }
    });
  });
})(jQuery);
