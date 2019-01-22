(function() {
  let content = document.getElementById('contributors');

  ajax_get('../data/contributors.json', (data) => {
    let src = document.getElementById('contributors-template').innerHTML;
    let template = Handlebars.compile(src);

    content.innerHTML = template(data);
  })
})();
