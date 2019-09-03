if (typeof jQuery != "undefined") {
  $(document).ready(() => {
    $.ajax({
      method: "get",
      url: "/api/current_user",
      success: result => {
        if (!result.status) {
          alert("You are not logged in, please visit after logging in");
          window.location.replace("http://localhost:3000/login");
        } else {
          // is logged in, set the parameter
          let userProfile = result.user;
          let viewProfile = document.getElementById("view-profile-btn");
          let editProfile = document.getElementById("edit-profile-btn");
          let emailID = document.getElementById("emailId"),
            name = document.getElementById("name"),
            googleLink = document.getElementById("googleLink"),
            facebookLink = document.getElementById("facebookLink"),
            twitterLink = document.getElementById("twitterLink"),
            linkedinLink = document.getElementById("linkedinLink"),
            basicStatus = document.getElementById("basicStatus"),
            advancedStatus = document.getElementById("advancedStatus"),
            professionalStatus = document.getElementById("professionalStatus"),
            basicAttempts = document.getElementById("basicAttempt"),
            advancedAttempts = document.getElementById("advancedAttempt"),
            professionalAttempts = document.getElementById(
              "professionalAttempt"
            );
          emailID.innerHTML = userProfile.email;
          name.innerHTML = userProfile.name;
          googleLink.innerHTML =
            userProfile.auth.google.id != ""
              ? "linked"
              : '<button onclick="handleAuthGoogle()">Link Google</button>';
          facebookLink.innerHTML =
            userProfile.auth.facebook.id != ""
              ? "linked"
              : '<button onclick="handleAuthFacebook()">Link Facebook</button>';
          twitterLink.innerHTML =
            userProfile.auth.twitter.id != ""
              ? "linked"
              : '<button onclick="handleAuthTwitter()">Link Twitter</button>';
          linkedinLink.innerHTML =
            userProfile.auth.linkedin.id != ""
              ? "linked"
              : '<button onclick="handleAuthLinkedin()">Link Linkedin</button>';
          basicStatus.innerHTML = userProfile.examData.payment.course_1
            ? "Enrolled"
            : "Not Paid";
          advancedStatus.innerHTML = userProfile.examData.payment.course_2
            ? "Enrolled"
            : "Not Paid";
          professionalStatus.innerHTML = userProfile.examData.payment.course_3
            ? "Enrolled"
            : "Not Paid";
          basicAttempts.innerHTML = userProfile.examData.examBasic.attempts;
          advancedAttempts.innerHTML =
            userProfile.examData.examAdvanced.attempts;
          professionalAttempts.innerHTML =
            userProfile.examData.examProfessional.attempts;
          viewProfile.click();
        }
      }
    });
  });

  function handleAuthGoogle() {
    let popup = window.open(
      "https://www.blockdegree.org/auth/google?close=true",
      "newwin",
      "height=600px,width=600px"
    );
  }
  function handleAuthFacebook() {
    let popup = window.open(
      "https://www.blockdegree.org/auth/facebook?close=true",
      "newwin",
      "height=600px,width=600px"
    );
  }
  function handleAuthTwitter() {
    let popup = window.open(
      "https://www.blockdegree.org/auth/twitter?close=true",
      "newwin",
      "height=600px,width=600px"
    );
  }
  function handleAuthLinkedin() {
    let popup = window.open(
      "https://www.blockdegree.org/auth/linkedin?close=true",
      "newwin",
      "height=600px,width=600px"
    );
  }

  window.addEventListener(
    "message",
    function(event) {
      // if (event.origin == "https://www.blockdegree.org") {
      checkAuth();
      // }
    },
    false
  );

  function checkAuth() {
    console.log("called check auth");
    $.ajax({
      method: "post",
      url: "/api/getAuthStatus",
      data: {},
      success: auths => {
        let googleLink = document.getElementById("googleLink"),
          facebookLink = document.getElementById("facebookLink"),
          twitterLink = document.getElementById("twitterLink"),
          linkedinLink = document.getElementById("linkedinLink");
        if (auths.googleAuth) {
          googleLink.innerHTML = "yes";
        } else {
          googleLink.innerHTML = `<button onclick="handleAuthGoogle()">Link Google</button>`;
        }
        if (auths.facebookAuth) {
          facebookLink.innerHTML = "yes";
        } else {
          facebookLink.innerHTML = `<button onclick="handleAuthFacebook()">Link Facebook</button>`;
        }
        if (auths.twitterAuth) {
          twitterLink.innerHTML = "yes";
        } else {
          twitterLink.innerHTML = `<button onclick="handleAuthTwitter()">Link Twitter</button>`;
        }
        if (auths.linkedinAuth) {
          linkedinLink.innerHTML = "yes";
        } else {
          linkedinLink.innerHTML = `<button onclick="handleAuthLinkedin()">Link Linkedin</button>`;
        }
      }
    });
  }
}
