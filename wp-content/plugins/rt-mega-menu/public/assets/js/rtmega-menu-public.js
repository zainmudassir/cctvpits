function openRTMEGAmobile() {
  document
    .querySelector(".enabled-mobile-menu .mobile-menu-area")
    .classList.add("opened");
  event.preventDefault();
}

function closeRTMEGAmobile() {
  document
    .querySelector(".enabled-mobile-menu .mobile-menu-area")
    .classList.remove("opened");
  event.preventDefault();
}

(function ($) {
  RTmegaMenu = {
    init: function () {
      this.enableAccordion();
      this.enableHeaderScript();
      $(document).on(
        "click.RTmegaMenu",
        ".rtmega-menu-vertical-expand-button-wrapper a",
        this.expandVerticalMenu
      );
    },
    expandVerticalMenu: function (e) {
      e.preventDefault();
      let widgetID = $(this).attr("widget_id");
      console.log(widgetID);
      $(
        ".enabled-vertical-menu .vertical-expaned-menu-area" +
          "." +
          widgetID +
          " .rtmega-menu-vertical-expanded"
      ).toggleClass("opened");
    },
    enableAccordion: function () {
      //$(".rtmega-menu-area .mobile-menu-area .rtmega-megamenu .menu-item-has-children > .menu-link").removeAttr('href', '#');
      if (
        $(
          ".rtmega-menu-area .mobile-menu-area .rtmega-menu-mobile-sidebar .rtmega-megamenu"
        ).length
      ) {
        $(
          ".rtmega-menu-area .mobile-menu-area .rtmega-menu-mobile-sidebar .rtmega-megamenu"
        ).mgaccordion({
          theme: "tree",
        });
      }
      if (
        $(
          ".rtmega-menu-area .rtmega-megamenu.vertical.vertical-submenu-expand-mode-click"
        ).length
      ) {
        $(
          ".rtmega-menu-area .rtmega-megamenu.vertical.vertical-submenu-expand-mode-click"
        ).mgaccordion({
          theme: "tree",
        });
      }
    },
    enableHeaderScript: function () {
      let headerInnerWidth = $(".header-inner .e-con > .e-con-inner").width();
      $(".sub-menu.rtmegamenu-contents.full-width-mega-menu").css(
        "width",
        headerInnerWidth + "px"
      );
      $(".sub-menu.rtmegamenu-contents.full-width-mega-menu").css(
        "max-width",
        headerInnerWidth + "px"
      );
      $(".elementor-widget.elementor-widget-rt-mega-navigation-menu").css(
        "position",
        "static"
      );
      $(".elementor-widget.elementor-widget-rt-mega-navigation-menu")
        .parent()
        .css("position", "static");

      $(window).resize(function () {
        let headerInnerWidth = $(".header-inner .e-con > .e-con-inner").width();
        $(".sub-menu.rtmegamenu-contents.full-width-mega-menu").css(
          "width",
          headerInnerWidth + "px"
        );
        $(".sub-menu.rtmegamenu-contents.full-width-mega-menu").css(
          "max-width",
          headerInnerWidth + "px"
        );
      });
    },
  };

  RTmegaMenu.init();

  if ($(".rtmega-menu-vertical-expanded.expand-position-top").length) {
    function closeRTMEGAmobile_top() {
      $(".rtmega-menu-vertical-expanded.expand-position-top").removeClass(
        "opened"
      );
    }
    $(".rtmega-menu-top-cls").click(closeRTMEGAmobile_top);
  }

  if ($(".expand-position-top").length) {
    function closeRTMEGAmobile_top_cls() {
      $(".rtmega-menu-top-cls").removeClass("top-opened");
    }
    $(document).on(
      "click",
      ".rtmega-menu-top-style-cls",
      closeRTMEGAmobile_top_cls
    );
  }

  if ($(".expand-position-top").length) {
    $(
      ".expand-position-top ul.rtmega-megamenu .menu-item .menu-text span:not(.submenu-parent-icon), .rtmega-menu-top-cls"
    ).on("click", function () {
      $(".rtmega-menu-top-cls").hide();
    });
    $(".vertical-menu-button-top .rtmega-menu-mobile-button").on(
      "click",
      function () {
        $(".rtmega-menu-top-cls").show();
      }
    );
  }

  if ($(".expand-position-top").length) {
    function closeRTMEGAmobile_top_clopen() {
      $(".vertical-menu-button-top .rtmega-menu-top-style-cls").addClass(
        "top-opened"
      );
    }
    $(document).on(
      "click",
      ".enabled-vertical-menu",
      closeRTMEGAmobile_top_clopen
    );
  }

  if ($(".mobile-menu-area, .expand-position-top").length) {
    function closeRTMEGAmobile_mobile_close() {
      $(".mobile-menu-area, .expand-position-top").removeClass("opened");
    }
    $(
      "ul.rtmega-megamenu .menu-item:not(.menu-item-has-children) .menu-text span:not(.submenu-parent-icon), .expand-position-top ul.rtmega-megamenu .menu-item:not(.menu-item-has-children) .menu-text span:not(.submenu-parent-icon)"
    ).click(closeRTMEGAmobile_mobile_close);
  }

  // vertical-submenu-expand-mode-hover mobile device click to sub menu open
  const $menu = $(
    ".rtmega-menu-area .rtmega-megamenu.vertical.vertical-submenu-expand-mode-hover"
  );
  if ($menu.length) {
    const RTMEGhoverExpandClassAdd = () => {
      $menu.toggleClass(
        "rtmega-expand-hover-submenu-open-click",
        window.innerWidth <= 1024
      );
      if ($menu.hasClass("rtmega-expand-hover-submenu-open-click")) {
        $menu.mgaccordion({ theme: "tree" });
      }
    };
    $(window).on("load resize", RTMEGhoverExpandClassAdd);
  }
})(jQuery);
