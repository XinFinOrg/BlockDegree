(function() {
  let content = document.getElementById('events');

  ajax_get('../data/events.json', function(data){
    // console.log('this ' + data['courses'][0]['title'])
    let source = document.getElementById('event-template').innerHTML;
    let template = Handlebars.compile(source);

    content.innerHTML = template(data);
  });
})();

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
})();
