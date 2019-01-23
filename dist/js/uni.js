(function() {
  let content = document.getElementById('partners');

  ajax_get('../data/partners.json', function(data){
    // console.log('this ' + data['courses'][0]['title'])
    let source = document.getElementById('partners-details-template').innerHTML;
    let template = Handlebars.compile(source);

    content.innerHTML = template(data);
  });

  Handlebars.registerHelper('trimString', (info, title, idx) => {
    let length = 10,
        splitString = info.split(' ');

    let trimmedString = splitString.length > length ?
                        splitString.slice(0, length).join(' ') +
                        '<a href class="dialog-btn" data-btn-idx="'+ idx +'"> ...Read more </a>' +
                        '<div class="dialog" data-dialog-idx="'+ idx +'" title="'+ title +'">' + info + '</div>' :
                        info;

    return trimmedString;
  });
})();
