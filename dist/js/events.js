$(document).ready(function() {
  $('.events__carousel').slick({
    dots: true,
    arrows: false,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    responsive: [
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
    url:'img/gallery/',
    success: (data) => {console.log(data)},
    error: (XMLHttpRequest, textStatus, errorThrown) => {
      console.log("Error pulling photos: " + textStatus + ". Error: " + errorThrown);
    }
  });
});
