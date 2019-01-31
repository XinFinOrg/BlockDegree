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

function runHandlebars(id, dataSrc, src) {
  if(document.getElementById(id) != null) {
    let content = document.getElementById(id);
    ajax_get(dataSrc, function(data){
<<<<<<< HEAD
      let source = document.getElementById(src).innerHTML,
=======
      let source = document.getElementById(src).innerHTML, 
>>>>>>> apis
          template = Handlebars.compile(source);

      content.innerHTML = template(data);
    });
  }
}

Handlebars.registerHelper('url', function(options) {
  let removeSpecial = options.replace(/[^\w\s]/gi, '');

  return removeSpecial.replace(/ +/g, '-').toLowerCase();
});

<<<<<<< HEAD
Handlebars.registerHelper('trimmed', (info) => {
  let length = 15,
      splitString = info.split(' ');

  let trimmedString = splitString.length > length ?
                      splitString.slice(0, length).join(' ') + ' ...':
                      info;

  return trimmedString;
});

=======
>>>>>>> apis
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
