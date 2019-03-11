function ajax_get(url, callback) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
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


function submitForm(form) {
  let errMsg = form.errMsg,
      accessMsg = form.accessMsg;

  let formData = {
      'email': $('input[name=email]').val(),
      'password': $('input[name=password]').val()
    },
    query = null;

  if (getUrlVars()['from']) {
    query = getUrlVars()['from'];
  }

  $.ajax({
    type: 'POST',
    url: $(form).attr('action'),
    data: formData,
    dataType: 'json',
  })
  .done((res) => {
    if(res.status == false) {
      $('.form-messages').removeClass('d-none alert-success');
      $('.form-messages').addClass('alert-danger');
      $('.form-messages').html(errMsg);
    } else if (query) {
      localStorage.setItem('hasUser', true);
      window.location = '/courses/' + query;
    } else {
      $('.form-messages').addClass('alert-success');
      $('.form-messages').removeClass('d-none alert-danger');
      $('.form-messages').html(accessMsg);
      if(accessMsg.includes('login')){
        if($(form).attr('action') == '/signup') {
          form.email.value = "";
          form.password.value = "";
          form.cfmPw.value = "";
        } else {
          localStorage.setItem('hasUser', true);
          localStorage.setItem('email',$('input[name=email]').val());
          window.location = '/';
        }
      };
    }
  })
};

$(document).ready(function () {
  if(window.location.href.indexOf("login") > -1) {
    if(localStorage.getItem('hasUser') === "true") {
      window.location = '/';
    } else {
    }
  }
});