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
  });
}
