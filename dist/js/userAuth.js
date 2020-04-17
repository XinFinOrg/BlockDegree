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
        console.log("getUrlVars");
        setTimeout(() => {
          $.notify({ message: preMsg });
        }, 1000);
      }

      email.onkeyup = delay(() => {
        validEm = false;
        if (validateEmail(email.value)) {
          validEm = true;
          emInfo.innerHTML = "";
        } else {
          emInfo.innerHTML = "enter a valid email";
        }
      }, 500);

      loginForm.on("submit", e => {
        e.preventDefault();
        email.value = email.value.toLowerCase();
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
        pwdMatchInfo = document.getElementById("pwdMatchInfo"),
        cfmPw = document.getElementById("cfm-password"),
        refId = document.getElementById("refId"),
        invalidRefId = document.getElementById("invalidRefId")
      registerForm.email = document.getElementById("email");
      let validPWD = false,
        validFN = false,
        validEm = false,
        validLN = false,
        pwdMatch = false;
      registerForm.password = pw;
      registerForm.cfmPw = cfmPw;
      registerForm.lastName = lastName;
      registerForm.firstName = firstName;
      registerForm.refId = refId;
      $("#btn-register").attr("disabled", true);

      registerForm.errMsg =
        "This Email Id Already Register. Please check your input.";
      registerForm.accessMsg =
        'Please check your mail and Verify your mail address <a href="/login">Login</a> to get access to the free content';

      function validatePw() {
        if (pw.value.length > 0 && pw.value == cfmPw.value) {
          pwdMatchInfo.innerHTML = "";
          pwdMatch = true;
          if (
            checkRegisterForm(validEm, validFN, validLN, validPWD, pwdMatch)
          ) {
            $("#btn-register").attr("disabled", false);
          }
        } else {
          pwdMatchInfo.innerHTML = "Passwords dont match";
          pwdMatch = false;
        }
      }

      cfmPw.addEventListener("input", e => {
        validatePw();
      });

      cfmPw.onkeyup = delay(() => {
        pwdMatch = false;
        if (pw.value.length > 0 && pw.value == cfmPw.value) {
          pwdMatchInfo.innerHTML = "";
          pwdMatch = true;
          if (
            checkRegisterForm(validEm, validFN, validLN, validPWD, pwdMatch)
          ) {
            $("#btn-register").attr("disabled", false);
          }
        } else {
          pwdMatchInfo.innerHTML = "Passwords dont match";
          pwdMatch = false;
        }
      }, 500);
      // PWD validation
      pw.onkeyup = delay(() => {
        let upperCaseLetters = /[A-Z]/g;
        let numbers = /[0-9]/g;
        validPWD = false;
        pwdMatch = false;
        pwdInfo.innerHTML = "";
        if (!pw.value.match(numbers)) {
          pwdInfo.innerHTML = "Atleast One Number";
          $("#btn-register").attr("disabled", true);
        }
        if (!pw.value.match(upperCaseLetters)) {
          pwdInfo.innerHTML = "Atlest One Uppercase";
          $("#btn-register").attr("disabled", true);
        }
        if (pw.value.length < 8) {
          pwdInfo.innerHTML = "Atlest 8 characters";
          $("#btn-register").attr("disabled", true);
        }
        if (
          pw.value.match(numbers) &&
          pw.value.match(numbers) &&
          pw.value.length >= 8
        ) {
          validPWD = true;
          if (
            checkRegisterForm(validEm, validFN, validLN, validPWD, pwdMatch)
          ) {
            $("#btn-register").attr("disabled", false);
          }
        }
        if (pw.value.length > 0 && pw.value == cfmPw.value) {
          pwdMatchInfo.innerHTML = "";
          pwdMatch = true;
          if (
            checkRegisterForm(validEm, validFN, validLN, validPWD, pwdMatch)
          ) {
            $("#btn-register").attr("disabled", false);
          }
        } else {
          pwdMatchInfo.innerHTML = "Passwords dont match";
          pwdMatch = false;
        }
      }, 500);

      registerForm.email.onkeyup = delay(() => {
        emInfo.innerHTML = "";
        validEm = false;
        if (validateEmail(registerForm.email.value)) {
          validEm = true;
          if (
            checkRegisterForm(validEm, validFN, validLN, validPWD, pwdMatch)
          ) {
            $("#btn-register").attr("disabled", false);
          }
          return (emInfo.innerHTML = "");
        } else {
          $("#btn-register").attr("disabled", true);
          return (emInfo.innerHTML = "invalid email");
        }
      }, 500);

      // FirstName validation
      firstName.onkeyup = delay(() => {
        fnInfo.innerHTML = "";
        validFN = false;
        let onlyWhiteSpace = "^\\s+$";
        let anyWhitespace = ".*\\s.*";
        let onlyLetter = "^[a-zA-Z]+$";
        if (!firstName.value.match(onlyLetter)) {
          $("#btn-register").attr("disabled", true);
          return (fnInfo.innerHTML = "name should consist of only letters");
        }
        if (
          firstName.value.match(onlyWhiteSpace) ||
          firstName.value.match(anyWhitespace)
        ) {
          // Has a whitespace
          $("#btn-register").attr("disabled", true);
          return (fnInfo.innerHTML = "no space allowed in first-name");
        }
        if (firstName.value.length < 2) {
          $("#btn-register").attr("disabled", true);
          return (fnInfo.innerHTML = "name too short");
        }
        if (firstName.value.length > 20) {
          $("#btn-register").attr("disabled", true);
          return (fnInfo.innerHTML = "name too long");
        }
        if (checkRegisterForm(validEm, validFN, validLN, validPWD, pwdMatch)) {
          $("#btn-register").attr("disabled", false);
        }
        validFN = true;
      }, 500);

      // LastName validation
      lastName.onkeyup = delay(() => {
        lnInfo.innerHTML = "";
        validLN = false;
        let onlyWhiteSpace = "^\\s+$";
        let anyWhitespace = ".*\\s.*";
        let onlyLetter = "^[a-zA-Z]+$";
        if (!lastName.value.match(onlyLetter)) {
          $("#btn-register").attr("disabled", true);
          return (lnInfo.innerHTML = "name should consist of only letters");
        }
        if (
          lastName.value.match(onlyWhiteSpace) ||
          lastName.value.match(anyWhitespace)
        ) {
          // Has a whitespace
          $("#btn-register").attr("disabled", true);
          return (lnInfo.innerHTML = "no space allowed in last-name");
        }
        if (lastName.value.length < 2) {
          $("#btn-register").attr("disabled", true);
          return (lnInfo.innerHTML = "name too short");
        }
        if (lastName.value.length > 20) {
          $("#btn-register").attr("disabled", true);
          return (lnInfo.innerHTML = "name too long");
        }
        if (checkRegisterForm(validEm, validFN, validLN, validPWD, pwdMatch)) {
          $("#btn-register").attr("disabled", false);
        }
        validLN = true;
      }, 500);

      pw.addEventListener("input", e => {
        validatePw();
      });

      registerForm.on("submit", e => {
        e.preventDefault();
        if (refId.value!==""){
          $.ajax({url:"/api/refIdExists",method:"post" ,data:{refId:refId.value}, success:resp => {
            if (resp.status===true){
              if (resp.exists===true){
                if (validFN && validLN && validPWD && pwdMatch) {
                  registerForm.email.value = registerForm.email.value.toLowerCase();
                  new submitForm(registerForm);
                  refId.value="";
                }
              }else{
                invalidRefId.innerHTML = "Referral ID not found"
              }
            }else{
              $.notify("Some error occured", {type:"danger"})
            }
          }, error:err => {
            $.notify("Some error occured", {type:"danger"})
          }})
        }else{
          if (validFN && validLN && validPWD && pwdMatch) {
            registerForm.email.value = registerForm.email.value.toLowerCase();
            new submitForm(registerForm);
          }
        }
        
      });
    }
  });
  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function checkRegisterForm(email, fn, ln, match) {
    return email && fn && ln && match;
  }

  function delay(callback, ms) {
    var timer = 0;
    return function() {
      var context = this,
        args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        callback.apply(context, args);
      }, ms || 0);
    };
  }
}
