if(typeof jQuery != 'undefined') {

  $(document).ready(function(){
    let form = $('#form-login'),
        formMessages = $('.form-messages');

    console.log('query: ' + getUrlVars()['from'])
    form.on('submit', (e) => {
      e.preventDefault();
      let formData = {
              'name': $('input[name=email]').val(),
              'password': $('input[name=password]').val()
            },
          query = getUrlVars()['from'];

      // $.ajax({
      //   type: 'POST',
      //   // url: $(form).attr('action'),
      //   data: formData,
      //   dataType: 'json'
      // })
      //   .done((res) => {
      //     alert('pass' + res)
      //   })
      //   .fail((res) => {
      //     alert('fail' + res)
      //   })
    })
  });
}
