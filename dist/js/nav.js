(function() {
  let content = document.getElementById('nav-sub-1');

  ajax_get('../data/courses.json', function(data){
    // console.log('this ' + data['courses'][0]['title'])
    let source = document.getElementById('nav-submenu-template').innerHTML;
    let template = Handlebars.compile(source);

    content.innerHTML = template(data);
  });
})();
