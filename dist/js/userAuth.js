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

      let preMsg = "Please login to access the course",
        emInfo = document.getElementById("invalidEm"),
        email = document.getElementById("email");

      let validEm = false;

      if (getUrlVars()["from"]) {
        $.notify({ message: preMsg });
      }

      email.onkeyup = () => {
        validEm = false;
        if (validateEmail(email.value)) {
          validEm = true;
          emInfo.innerHTML = "";
        } else {
          emInfo.innerHTML = "enter a valid email";
        }
      };

      loginForm.on("submit", e => {
        e.preventDefault();
        if (validEm) {
          new submitForm(loginForm);
        }
      });
    }

    if (registerForm) {
      let pw = document.getElementById("password"),
        firstName = document.getElementById("firstName"),
        lastName = document.getElementById("lastName"),
        pwdInfo = document.getElementById("invalidPwd"),
        fnInfo = document.getElementById("invalidFN"),
        lnInfo = document.getElementById("invalidLN"),
        emInfo = document.getElementById("invalidEmail"),
        cfmPw = document.getElementById("cfm-password");
      registerForm.email = document.getElementById("email");
      let validPWD = false,
        validFN = false,
        validEm = false,
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
        validPWD = false;
        pwdInfo.innerHTML = "";
        if (!pw.value.match(numbers)) {
          pwdInfo.innerHTML = "Atleast One Number";
        }
        if (!pw.value.match(upperCaseLetters)) {
          pwdInfo.innerHTML = "Atlest One Uppercase";
        }
        if (pw.value.length < 8) {
          pwdInfo.innerHTML = "Atlest 8 characters";
        }
        if (
          pw.value.match(numbers) &&
          pw.value.match(numbers) &&
          pw.value.length >= 8
        ) {
          validPWD = true;
        }
      };

      registerForm.email.onkeyup = () => {
        emInfo.innerHTML = "";
        validEm = false;
        if (validateEmail(registerForm.email.value)) {
          validEm = true;
          return (emInfo.innerHTML = "");
        } else {
          return (emInfo.innerHTML = "invalid email");
        }
      };

      // FirstName validation
      firstName.onkeyup = () => {
        fnInfo.innerHTML = "";
        validFN = false;
        let onlyWhiteSpace = "^\\s+$";
        let anyWhitespace = ".*\\s.*";
        let onlyLetter = "^[a-zA-Z]+$";
        if (!firstName.value.match(onlyLetter)) {
          return (fnInfo.innerHTML = "name should consist of only letters");
        }
        if (
          firstName.value.match(onlyWhiteSpace) ||
          firstName.value.match(anyWhitespace)
        ) {
          // Has a whitespace
          return (fnInfo.innerHTML = "no space allowed in first-name");
        }
        if (firstName.value.length < 2) {
          return (fnInfo.innerHTML = "name too short");
        }
        if (firstName.value.length > 20) {
          return (fnInfo.innerHTML = "name too long");
        }
        validFN = true;
      };

      // LastName validation
      lastName.onkeyup = () => {
        lnInfo.innerHTML = "";
        validLN = false;
        let onlyWhiteSpace = "^\\s+$";
        let anyWhitespace = ".*\\s.*";
        let onlyLetter = "^[a-zA-Z]+$";
        if (!lastName.value.match(onlyLetter)) {
          return (lnInfo.innerHTML = "name should consist of only letters");
        }
        if (
          lastName.value.match(onlyWhiteSpace) ||
          lastName.value.match(anyWhitespace)
        ) {
          // Has a whitespace
          return (lnInfo.innerHTML = "no space allowed in last-name");
        }
        if (lastName.value.length < 2) {
          return (lnInfo.innerHTML = "name too short");
        }
        if (lastName.value.length > 20) {
          return (lnInfo.innerHTML = "name too long");
        }
        validLN = true;
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
  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
}
