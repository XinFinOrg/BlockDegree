// Homepage slick carousel = inline code
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
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 850,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
});
// Homepage slick carousel = inline code

// slick carousel
if (typeof jQuery != "undefined") {
  $(document).ready(function() {
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
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });

    $.ajax({
      method: "post",
      url: "/api/getAuthStatus",
      data: {},
      success: auths => {
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
            success: result => {
              console.log(result);
              if (!result.isSet) {
                alert("Name is not set, please set your name!");
                document.location.href = `/verify-certification`;
              }
            }
          });
        } else {
          return;
        }
      }
    });

    getAllSiteStats();

    setInterval(() => {
      getAllSiteStats();
    }, 10000);
  });
}

function getAllSiteStats() {
  $.ajax({
    method: "get",
    url: "/api/userCount",
    success: res => {
      if (!res.status) {
        $.notify(res.error, { type: "danger" });
        return;
      }
      let currVal = document.getElementById("userCnt_stat_content")
        .innerHTML;
      animateNumberIncrease(currVal, res.count, "userCnt_stat_content");
      return;
    },
    error: xhr => {
      $.notify("Something went wrong while getting site stats", {
        type: "danger"
      });
      return;
    }
  });

  $.ajax({
    method: "get",
    url: "/api/certCount",
    success: res => {
      console.log(res);
      if (!res.status) {
        $.notify(res.error, { type: "danger" });
        return;
      }
      let currVal = parseInt(
        document.getElementById("certCnt_stat_content").innerHTML
      );
      animateNumberIncrease(currVal, res.count, "certCnt_stat_content");
      return;
    },
    error: xhr => {
      $.notify("Something went wrong while getting site stats", {
        type: "danger"
      });
      return;
    }
  });

  $.ajax({
    method: "get",
    url: "/api/visitCount",
    success: res => {
      if (!res.status) {
        $.notify(res.error, { type: "danger" });
        return;
      }
      let currVal = document.getElementById("visitCnt_stat_content")
        .innerHTML;
      animateNumberIncrease(currVal, res.count, "visitCnt_stat_content");
      return;
    },
    error: xhr => {
      $.notify("Something went wrong while getting site stats", {
        type: "danger"
      });
      return;
    }
  });

  $.ajax({
    method: "get",
    url: "/api/caCount",
    success: res => {
      if (!res.status) {
        $.notify(res.error, { type: "danger" });
        return;
      }
      let currVal = document.getElementById("ca_stat_content").innerHTML;
      animateNumberIncrease(currVal, res.count, "ca_stat_content");
      return;
    },
    error: xhr => {
      $.notify("Something went wrong while getting site stats", {
        type: "danger"
      });
      return;
    }
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
