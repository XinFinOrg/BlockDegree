if(typeof jQuery != 'undefined') {
  $(document).ready(function(){
    let loginForm = $('#form-login'),
        registerForm = $('#form-register'),
        formMessages = $('.form-messages');

    if(loginForm) {
      loginForm.errMsg = "Cannot login. Please try again";
      loginForm.accessMsg = "You are login";
      let preMsg = "Please login to access the course";

      if(getUrlVars()['from']) {
        $('.form-messages').addClass('alert-info');
        $('.form-messages').removeClass('d-none alert-danger');
        $('.form-messages').html(preMsg);
      }

      loginForm.on('submit', (e) => {
        e.preventDefault();
        new submitForm(loginForm);
      })
    }

    if(registerForm) {
      let pw = document.getElementById("password"),
          cfmPw = document.getElementById("cfm-password");

      registerForm.errMsg = 'Failed to register. Please check your input.'
      registerForm.accessMsg ='Your account has been created. <a href="/login">Login</a> to access our courses.'

      function validatePw() {
        if(pw.value != cfmPw.value) {
          cfmPw.setCustomValidity("Passwords don't match");
        } else {
          cfmPw.setCustomValidity("");
        }
      }

      cfmPw.addEventListener('input', (e) => {
        validatePw()
      })
      
      pw.addEventListener('input', (e) => {
        validatePw()
      })

      registerForm.on('submit', (e) => {
        e.preventDefault();
        new submitForm(registerForm);
      })
    }

  });
}
