$(document).ready(function() {
  "use strict";

  var window_width = $(window).width(),
    window_height = window.innerHeight,
    header_height = $(".default-header").height(),
    header_height_static = $(".site-header.static").outerHeight(),
    fitscreen = window_height - header_height;

  $(".fullscreen").css("height", window_height);
  $(".fitscreen").css("height", fitscreen);

  //------- Niceselect  js --------//

  if (document.getElementById("default-select")) {
    $("select").niceSelect();
  }
  if (document.getElementById("default-select2")) {
    $("select").niceSelect();
  }
  if (document.getElementById("service-select")) {
    $("select").niceSelect();
  }

  //------- Superfist nav menu  js --------//

  $(".nav-menu").superfish({
    animation: {
      opacity: "show"
    },
    speed: 400
  });

  //------- Tabs Js --------//
  if (document.getElementById("horizontalTab")) {
    $("#horizontalTab").jqTabs({
      direction: "horizontal",
      duration: 200
    });
  }

  //------- Mobile Nav  js --------//

  if ($("#nav-menu-container").length) {
    var $mobile_nav = $("#nav-menu-container")
      .clone()
      .prop({
        id: "mobile-nav"
      });
    $mobile_nav.find("> ul").attr({
      class: "",
      id: ""
    });
    $("body").append($mobile_nav);
    $("body").prepend(
      '<button type="button" id="mobile-nav-toggle"><i class="lnr lnr-menu"></i></button>'
    );
    $("body").append('<div id="mobile-body-overly"></div>');
    $("#mobile-nav")
      .find(".menu-has-children")
      .prepend('<i class="lnr lnr-chevron-down"></i>');

    $(document).on("click", ".menu-has-children i", function(e) {
      $(this)
        .next()
        .toggleClass("menu-item-active");
      $(this)
        .nextAll("ul")
        .eq(0)
        .slideToggle();
      $(this).toggleClass("lnr-chevron-up lnr-chevron-down");
    });

    $(document).on("click", "#mobile-nav-toggle", function(e) {
      $("body").toggleClass("mobile-nav-active");
      $("#mobile-nav-toggle i").toggleClass("lnr-cross lnr-menu");
      $("#mobile-body-overly").toggle();
    });

    $(document).on("click", function(e) {
      var container = $("#mobile-nav, #mobile-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ($("body").hasClass("mobile-nav-active")) {
          $("body").removeClass("mobile-nav-active");
          $("#mobile-nav-toggle i").toggleClass("lnr-cross lnr-menu");
          $("#mobile-body-overly").fadeOut();
        }
      }
    });
  } else if ($("#mobile-nav, #mobile-nav-toggle").length) {
    $("#mobile-nav, #mobile-nav-toggle").hide();
  }

  //------- Smooth Scroll  js --------//

  $(".nav-menu a, #mobile-nav a, .scrollto").on("click", function() {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      if (target.length) {
        var top_space = 0;

        if ($("#header").length) {
          top_space = $("#header").outerHeight();

          if (!$("#header").hasClass("header-fixed")) {
            top_space = top_space;
          }
        }

        $("html, body").animate(
          {
            scrollTop: target.offset().top - top_space
          },
          1500,
          "easeInOutExpo"
        );

        if ($(this).parents(".nav-menu").length) {
          $(".nav-menu .menu-active").removeClass("menu-active");
          $(this)
            .closest("li")
            .addClass("menu-active");
        }

        if ($("body").hasClass("mobile-nav-active")) {
          $("body").removeClass("mobile-nav-active");
          $("#mobile-nav-toggle i").toggleClass("lnr-times lnr-bars");
          $("#mobile-body-overly").fadeOut();
        }
        return false;
      }
    }
  });

  $(document).ready(function() {
    $("html, body").hide();

    if (window.location.hash) {
      setTimeout(function() {
        $("html, body")
          .scrollTop(0)
          .show();

        $("html, body").animate(
          {
            scrollTop: $(window.location.hash).offset().top - 108
          },
          1000
        );
      }, 0);
    } else {
      $("html, body").show();
    }
  });

    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('#header').addClass('header-scrolled');
        } else {
            $('#header').removeClass('header-scrolled');
        }
    });
  //------- Header Scroll Class  js --------//

  //------- Mailchimp js --------//
  $("#mc_embed_signup")
    .find("form")
    .ajaxChimp();

  // Popup
  if ($(".dialog").length) {
    $(".dialog").dialog({
      autoOpen: false,
      minWidth: 450
    });

    $("#partners .dialog-btn").on("click", e => {
      e.preventDefault();
      $(".dialog[data-dialog-idx=" + e.target.dataset.btnIdx + "]").dialog(
        "open"
      );
    });

    $("#form-dialog").on("click", e => {
      e.preventDefault();
      $("#partner-form").dialog("open");
    });
  }

  // Course curriculum
  if ($(".course-module").length) {
    let fullPath = window.location.pathname,
      currentPathIndex = fullPath.lastIndexOf("/"),
      currentPath = fullPath.slice(currentPathIndex + 1),
      activeItem = $(".mod__sidebar #" + currentPath);
    console.log(currentPath);

    activeItem.find(".arrow").text("▲");
    activeItem.attr("aria-expanded", "true");
    activeItem.siblings(".side-nav__child").removeClass("collapse");
    activeItem.siblings(".side-nav__child").addClass("show");
    $('[href="' + currentPath + '"] > :header').addClass("active");

    $(".side-nav__child a").on("click", function(e) {
      let section = $(this).attr("id"),
        contentToScrollTo = "#" + section,
        pos = $(".module-content " + contentToScrollTo).offset().top;

      $("html,body").animate({ scrollTop: pos - 100 }, 400);
    });
  }

  if ($(".course-module").length) {
    $(".arrow").on("click", function(e) {
      return (e.target.innerText = e.target.innerText == "▲" ? "▼" : "▲");
    });
  }

  if ($("#userAuth-btn").attr("href") == "/logout") {
    $("#userAuth-btn").on("click", e => {
      $.get(e.target.pathname).done(() => {
        localStorage.setItem("hasUser", false);
        localStorage.setItem("email", "");
      });
    });

    $("#mobile-nav #userAuth-btn").on("click", e => {
      $.get(e.target.pathname).done(() => {
        localStorage.setItem("hasUser", false);
        localStorage.setItem("email", "");
      });
    });
  }

  $("#getCertiFromHash").click(function(e) {
    e.preventDefault();
    const hash = $("#txHash").val();
    window.location = `https://ipfs-gateway.xinfin.network/` + hash + ``;
  });

  //Login form toggle
  $(".login-with-mail").on("click", function() {
    $(".login-form-block")
      .stop()
      .slideToggle();
  });

//   //Course price code toggle
//   $(".promoCode-btn").on("click", function() {
//     $(".promoCode-block")
//       .stop()
//       .slideToggle();
//   });

  $("#course_1PromoCodeBtn").on("click", function() {
    $("#course_1PromoCodeBlock")
      .stop()
      .slideToggle();
  });

  $("#course_2PromoCodeBtn").on("click", function() {
    $("#course_2PromoCodeBlock")
      .stop()
      .slideToggle();
  });

  $("#course_3PromoCodeBtn").on("click", function() {
    $("#course_3PromoCodeBlock")
      .stop()
      .slideToggle();
  });
});
