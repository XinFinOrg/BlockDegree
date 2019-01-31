function ajax_get(url, callback) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // console.log(xmlhttp.responseText);
            try {
                var data = JSON.parse(xmlhttp.responseText);
            } catch(err) {
                console.log(err.message +' Getting: ' + url);
                return;
            }
            callback(data);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function showLoginPage(query) {
  if(query) {
    window.location = '/login.html?from=' + query
  } else {
    window.location = '/login.html'
  }
  // add after path name redirect to course page
}

function accessCourseMod(el) {
  window.location =  el + '.html'
}

function submitForm(form) {
  let errMsg = form.errMsg,
      accessMsg = form.accessMsg;

  let formData = {
    'email': $('input[name=email]').val(),
    'password': $('input[name=password]').val()
  },
  query = null;
  if (getUrlVars().length) {
    query = getUrlVars()['from'];
  }

  $.ajax({
    type: 'POST',
    url: $(form).attr('action'),
    data: formData,
    dataType: 'json'
  })
  .done((res) => {
    console.log(JSON.stringify(res))
    if(res.status == false) {
      $('.form-messages').removeClass('d-none alert-success');
      $('.form-messages').addClass('alert-danger');
      $('.form-messages').html(errMsg);
    } else if (query) {
      window.location = query;
    } else {
      $('.form-messages').addClass('alert-success');
      $('.form-messages').removeClass('d-none alert-danger');
      $('.form-messages').html(accessMsg);
    }
  })
};

function runHandlebars(id, dataSrc, src) {
  if(document.getElementById(id) != null) {
    let content = document.getElementById(id);
    ajax_get(dataSrc, function(data){

      let source = document.getElementById(src).innerHTML,
          template = Handlebars.compile(source);

      content.innerHTML = template(data);
    });
  }
}

Handlebars.registerHelper('url', function(options) {
  let removeSpecial = options.replace(/[^\w\s]/gi, '');

  return removeSpecial.replace(/ +/g, '-').toLowerCase();
});

Handlebars.registerHelper('trimmed', (info) => {
  let length = 15,
      splitString = info.split(' ');

  let trimmedString = splitString.length > length ?
                      splitString.slice(0, length).join(' ') + ' ...':
                      info;

  return trimmedString;
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

Handlebars.registerHelper('user', () => {
  console.log('login')
});
