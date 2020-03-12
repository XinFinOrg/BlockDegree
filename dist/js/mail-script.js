// -------   Mail Send ajax

$(document).ready(function() {
  var form = $("#myForm"); // contact form
  var submit = $(".submit-btn"); // submit button
  var alert = $(".alert-msg"); // alert div for show alert message

  let name = document.getElementById("name"),
    nameInfo = document.getElementById("nameInfo"),
    subject = document.getElementById("subject"),
    subInfo = document.getElementById("subInfo"),
    msg = document.getElementById("message"),
    msgInfo = document.getElementById("messageInfo"),
    email = document.getElementById("email"),
    emailInfo = document.getElementById("emailInfo");

  let isNameValid = false,
    isSubValid = false,
    isEmailValid = false,
    isMsgValid = false;

  name.onkeyup = () => {
    isNameValid = false;
    nameInfo.innerHTML = "&nbsp";
    if (!validateName(name.value)) {
      nameInfo.innerHTML = "Invalid name";
    } else {
      isNameValid = true;
    }
  };
  subject.onkeyup = () => {
    isSubValid = false;
    subInfo.innerHTML = "&nbsp";
    if (!noSpace(subject.value)) {
      subInfo.innerHTML = "Invalid Subject";
    } else {
      isSubValid = true;
    }
  };
  msg.onkeyup = () => {
    isMsgValid = false;
    msgInfo.innerHTML = "";
    if (!noSpace(msg.value)) {
      msgInfo.innerHTML = "Invalid Message";
    } else {
      isMsgValid = true;
    }
  };
  email.onkeyup = () => {
    isEmailValid = false;
    emailInfo.innerHTML = "&nbsp";
    if (!validateEmail(email.value)) {
      emailInfo.innerHTML = "Invalid Email";
    } else {
      isEmailValid = true;
    }
  };

  // form submit event
  form.on("submit", function(e) {
    e.preventDefault(); // prevent default form submit
    const response = grecaptcha.getResponse();
    if (isEmailValid && isMsgValid && isNameValid && isSubValid && response.length!==0) {
      // all valid, good to go
      $.ajax({
        method: "post",
        url: "/contactUs",
        data: {
          name: name.value.trim(),
          subject: subject.value.trim(),
          email: email.value.toLowerCase(),
          message: message.value.trim()
        },
        success: () => {
          name.value = "";
          subject.value = "";
          email.value = "";
          message.value = "";
          $.notify(
            "Message Sent! One of our employees will get back to you shortly.",
            { type: "success" }
          );
        }
      });
    }
  });
});

function validateEmail(email) {
  let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateName(name) {
  let trimString = name.trim();
  if (trimString.length == 0) {
    return false;
  }
  if (trimString.match(".*\\d.*")) {
    return false;
  }
  return true;
}

function noSpace(subject) {
  let trimString = subject.trim();
  if (trimString.length == 0) {
    return false;
  }
  return true;
}
