(function() {
  let content = document.getElementById('mod-1');

  ajax_get('../data/courses.json', (data) => {
    let src = document.getElementById('module-template').innerHTML;
    let template = Handlebars.compile(src);

    content.innerHTML = template(data);
  })
})();
