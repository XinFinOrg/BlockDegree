(function() {
  let content = document.getElementById('course__info');

  ajax_get('../data/courses.json', function(data){
    // console.log('this ' + data['courses'][0]['title'])
    let source = document.getElementById('course-single-template').innerHTML;
    let template = Handlebars.compile(source);

    content.innerHTML = template(data);
  });
})();
