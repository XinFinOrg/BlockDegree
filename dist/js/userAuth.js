if(typeof jQuery != 'undefined') {
  $(document).ready(function(){
    let loginForm = $('#form-login'),
        registerForm = $('#form-register'),
        fpForm = $('#form-fp'),
        formMessages = $('.form-messages');

        if(fpForm) {
          let fp = document.getElementById("fp-email")
          fpForm.fp = fp
          fpForm.errMsg = 'This Email Id Already Register. Please check your input.'
          fpForm.accessMsg = "Reset Password Link Sent Please check your mail ";
          
          fpForm.on('submit', (e) => {
            e.preventDefault();
            new submitForm(fpForm);
          })
        }

    if(loginForm) {
      loginForm.errMsg = "Oops! Wrong password.";
      loginForm.errAcc = "Account doesn't exit";
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
          firstName = document.getElementById("firstName"),
          lastName = document.getElementById("lastName")
          cfmPw = document.getElementById("cfm-password");
      registerForm.email = document.getElementById('email');
      registerForm.password = pw;
      registerForm.cfmPw = cfmPw;
      registerForm.lastName=lastName;
      registerForm.firstName=firstName;

      registerForm.errMsg = 'This Email Id Already Register. Please check your input.'
      registerForm.accessMsg ='Please check your mail and Verify your mail address   <a href="/login">Login</a>to get access to the free content'

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
