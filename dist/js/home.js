// Homepage slick carousel = inline code
$(".video_slider").slick({
  infinite: true,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  responsive: [
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 850,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
});

$(".contributors_slider").slick({
  infinite: true,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  responsive: [
    {
      breakpoint: 991,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 850,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
});
// Homepage slick carousel = inline code

// slick carousel
if (typeof jQuery != "undefined") {
  let imageLoaded = false,
    nivoLoaded = false;

  let imgSlider1 = new Image(),
    imgSlider2 = new Image(),
    imgSlider3 = new Image();
  imgSlider1.onload = function () {
    imageLoaded = true;
    if (nivoLoaded === true) {
      document.getElementById("preloaded-banner").style = "display:none";
      document.getElementById("final-banner").style = "display:block";
    }
  };
  imgSlider1.src = "/img/slider/slider-1.jpg";
  imgSlider2.src = "/img/slider/slider-2.jpg";
  imgSlider3.src = "/img/slider/slider-3.jpg";

  $(document).ready(function () {
    $(".contributors__carousel").slick({
      infinite: true,
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      responsive: [
        {
          breakpoint: 850,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });

    $.ajax({
      method: "post",
      url: "/api/getAuthStatus",
      data: {},
      success: (auths) => {
        if (
          auths.localAuth ||
          auths.twitterAuth ||
          auths.facebookAuth ||
          auths.googleAuth ||
          auths.linkedinAuth
        ) {
          //logged in
          $.ajax({
            method: "get",
            url: "/api/isNameRegistered",
            success: (result) => {
              console.log(result);
              if (!result.isSet) {
                alert("Name is not set, please set your name!");
                document.location.href = `/verify-certification`;
              }
            },
          });
        } else {
          return;
        }
      },
    });

    getAllSiteStats();

    $("#slider").nivoSlider({
      pauseTime: 10000,
      afterLoad: () => {
        nivoLoaded=true;
        if (imageLoaded === true) {
          document.getElementById("preloaded-banner").style = "display:none";
          document.getElementById("final-banner").style = "display:block";
        }
      },
    });

    // setInterval(() => {
    //   getAllSiteStats();
    // }, 60000);
  });
}

function getAllSiteStats() {
  $.ajax({
    method: "get",
    url: "/api/getSiteStats",
    success: (res) => {
      if (!res.status) {
        $.notify(res.error, { type: "danger" });
        return;
      }
      console.log(res);
      let currVal = document.getElementById("userCnt_stat_content").innerHTML;
      animateNumberIncrease(currVal, res.userCnt, "userCnt_stat_content");
      animateNumberIncrease(currVal, res.visitCnt, "visitCnt_stat_content");
      animateNumberIncrease(currVal, res.caCnt, "ca_stat_content");
      animateNumberIncrease(currVal, res.totCertis, "certCnt_stat_content");

      return;
    },
    error: (xhr) => {
      return;
    },
  });
}

function animateNumberIncrease(currVal, desiredVal, elemId) {
  const interval = setInterval(() => {
    let exisVal = parseInt(document.getElementById(elemId).innerHTML);
    if (exisVal != NaN)
      if (exisVal >= desiredVal) {
        document.getElementById(elemId).innerHTML = desiredVal;
        clearInterval(interval);
        return;
      }
    let incr = Math.floor((30 * (desiredVal - currVal)) / 1000)
      ? Math.floor((30 * (desiredVal - currVal)) / 1000)
      : Math.ceil((30 * (desiredVal - currVal)) / 1000);
    document.getElementById(elemId).innerHTML = exisVal + incr;
  }, 30);
}

function init() {  
  let imgDefer = document.getElementsByTagName("img");
  for (let i = 0; i < imgDefer.length; i++) {
    if (imgDefer[i].getAttribute("data-src")) {
      imgDefer[i].setAttribute("src", imgDefer[i].getAttribute("data-src"));
    }
  }
}
window.onload = init;
