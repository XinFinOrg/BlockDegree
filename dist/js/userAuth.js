if (typeof jQuery != "undefined") {
  $(document).ready(function() {
    let loginForm = $("#form-login"),
      registerForm = $("#form-register"),
      fpForm = $("#form-fp"),
      formMessages = $(".form-messages");

    if (fpForm) {
      let fp = document.getElementById("fp-email");
      fpForm.fp = fp;
      fpForm.errMsg =
        "This Email Id Already Register. Please check your input.";
      fpForm.accessMsg = "Reset Password Link Sent Please check your mail ";

      fpForm.on("submit", e => {
        e.preventDefault();
        new submitForm(fpForm);
      });
    }

    if (loginForm) {
      loginForm.errMsg = "Oops! Wrong password.";
      loginForm.errAcc = "Account doesn't exit";
      loginForm.accessMsg = "You are login";

      let preMsg = "Please login to access the course";

      if (getUrlVars()["from"]) {
        $(".form-messages").addClass("alert-info");
        $(".form-messages").removeClass("d-none alert-danger");
        $(".form-messages").html(preMsg);
      }

      loginForm.on("submit", e => {
        e.preventDefault();
        new submitForm(loginForm);
      });
    }

    if (registerForm) {
      let pw = document.getElementById("password"),
        firstName = document.getElementById("firstName"),
        lastName = document.getElementById("lastName"),
        pwdInfo = document.getElementById("invalidPwd"),
        fnInfo = document.getElementById("invalidFN"),
        lnInfo = document.getElementById("invalidLN"),
        cfmPw = document.getElementById("cfm-password");
      registerForm.email = document.getElementById("email");
      let validPWD = false,
        validFN = false,
        validLN = false;
      registerForm.password = pw;
      registerForm.cfmPw = cfmPw;
      registerForm.lastName = lastName;
      registerForm.firstName = firstName;

      registerForm.errMsg =
        "This Email Id Already Register. Please check your input.";
      registerForm.accessMsg =
        'Please check your mail and Verify your mail address   <a href="/login">Login</a>to get access to the free content';

      function validatePw() {
        if (pw.value != cfmPw.value) {
          cfmPw.setCustomValidity("Passwords don't match");
        } else {
          cfmPw.setCustomValidity("");
        }
      }

      cfmPw.addEventListener("input", e => {
        validatePw();
      });

      // PWD validation
      pw.onkeyup = () => {
        let upperCaseLetters = /[A-Z]/g;
        let numbers = /[0-9]/g;
        pwdInfo.innerHTML = "";
        if (!pwdInput.value.match(numbers)) {
          pwdInfo.innerHTML = "Atleast One Number";
        }
        if (!pwdInput.value.match(numbers)) {
          pwdInfo.innerHTML = "Atlest One Uppercase";
        }
        if (pwdInput.value.length < 8) {
          pwdInfo.innerHTML = "Atlest 8 characters";
        }
        if (
          pwdInput.value.match(numbers) &&
          pwdInput.value.match(numbers) &&
          pwdInput.value.length < 8
        ) {
          validPWD = true;
        }
      };

      // FirstName validation
      firstName.onkeyup = () => {
        fnInfo.innerHTML = "";
        let onlyWhiteSpace = "^\\s+$";
        let anyWhitespace = ".*s.*";
        if (
          firstName.value.match(onlyWhiteSpace) ||
          firstName.value.match(anyWhitespace)
        ) {
          // Has a whitespace
          fnInfo.innerHTML = "no space allowed in first-name";
        } else {
          validFN = true;
        }
      };

      // LastName validation
      lastName.onkeyup = () => {
        lnInfo.innerHTML = "";
        let onlyWhiteSpace = "^\\s+$";
        let anyWhitespace = ".*s.*";
        if (
          firstName.value.match(onlyWhiteSpace) ||
          firstName.value.match(anyWhitespace)
        ) {
          // Has a whitespace
          lnInfo.innerHTML = "no space allowed in last-name";
        } else {
          validLN = true;
        }
      };

      pw.addEventListener("input", e => {
        validatePw();
      });

      registerForm.on("submit", e => {
        e.preventDefault();
        if (validFN && validLN && validPWD) {
          new submitForm(registerForm);
        }
      });
    }
  });
}
