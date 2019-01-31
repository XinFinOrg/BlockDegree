if(typeof jQuery != 'undefined') {

  $(document).ready(function(){
    let loginForm = $('#form-login'),
        registerForm = $('#form-register'),
        formMessages = $('.form-messages');

    if(loginForm) {
      loginForm.errMsg = "Cannot login. Please try again";
      loginForm.accessMsg = "You are login";

      loginForm.on('submit', (e) => {
        e.preventDefault();
        new submitForm(loginForm);
      })
    }

    if(registerForm) {
      register.errMsg = 'Failed to register. Please check your input.'
      register.accessMsg ='Your account has been created. Login to access our courses.'

      registerForm.on('submit', (e) => {
        e.preventDefault();
        new submitForm(registerForm);
      })
    }
    
  });
}
