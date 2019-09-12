if (typeof jQuery != "undefined") {
  $(document).ready(() => {
    $.ajax({
      method: "get",
      url: "/api/current_user",
      success: result => {
        if (!result.status) {
          alert("You are not logged in, please visit after logging in");
          window.location.replace("https://www.blockdegree.org/login");
        } else {
          // is logged in, set the parameter
          let userProfile = result.user;
          // getting elements in the view-profile page
          let viewProfile = document.getElementById("view-profile-btn");
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
              ? "<span>linked</span>"
              : '<button class="btn btn-primary social-g+" onclick="handleAuthGoogle()"><i class="fa fa fa-link"></i> Link Google</button>';
          facebookLink.innerHTML =
            userProfile.auth.facebook.id != ""
              ? "<span>linked</span>"
              : '<button class="btn btn-primary social-fb" onclick="handleAuthFacebook()"><i class="fa fa fa-link"></i> Link Facebook</button>';
          twitterLink.innerHTML =
            userProfile.auth.twitter.id != ""
              ? "<span>linked</span>"
              : '<button class="btn btn-primary social-tw" onclick="handleAuthTwitter()"><i class="fa fa fa-link"></i> Link Twitter</button>';
          linkedinLink.innerHTML =
            userProfile.auth.linkedin.id != ""
              ? "<span>linked</span>"
              : '<button class="btn btn-primary social-li" onclick="handleAuthLinkedin()"><i class="fa fa fa-link"></i> Link Linkedin</button>';
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

          // getting elements in the edit-page
          let edit_name = document.getElementById("edit_name"),
            edit_email = document.getElementById("edit_email"),
            edit_googleLink = document.getElementById("edit_googleLink"),
            edit_facebookLink = document.getElementById("edit_facebookLink"),
            edit_twitterLink = document.getElementById("edit_twitterLink"),
            edit_linkedinLink = document.getElementById("edit_linkedinLink");
          edit_email.value = userProfile.email;
          edit_name.value = userProfile.name;
          edit_googleLink.innerHTML =
            userProfile.auth.google.id != ""
              ? "linked"
              : '<button onclick="handleAuthGoogle()">Link Google</button>';
          edit_facebookLink.innerHTML =
            userProfile.auth.facebook.id != ""
              ? "linked"
              : '<button onclick="handleAuthFacebook()">Link Facebook</button>';
          edit_twitterLink.innerHTML =
            userProfile.auth.twitter.id != ""
              ? "linked"
              : '<button onclick="handleAuthTwitter()">Link Twitter</button>';
          edit_linkedinLink.innerHTML =
            userProfile.auth.linkedin.id != ""
              ? "linked"
              : '<button onclick="handleAuthLinkedin()">Link Linkdedin</button>';
        }
      }
    });
  });

  function handleUpdateName() {
    let newName = document.getElementById("edit_name").value;
    let newNameTrim = newName.trim();
    if (newNameTrim.length < 2) {
      return alert("Invalid Name");
    }
    $.ajax({
      method: "get",
      url: "/api/current_user",
      success: result => {
        if (result.status) {
          // is logged in
          let currentUser = result.user;
          if (currentUser.name == newNameTrim) {
            alert("Same Name");
          } else {
            $.ajax({
              method: "post",
              url: "/api/setName",
              data: { fullName: newNameTrim },
              success: result => {
                alert("New name set");
                window.location.reload();
              },
              error: err => {
                alert("Error while updating the name");
              }
            });
          }
        } else {
          alert("You're not logged in");
          window.location.replace("https://www.blockdegree.org/login");
        }
      },
      error: err => {
        alert("Error while getting the current user");
        window.location.replace("https://www.blockdegree.org/login");
      }
    });
    let trimName = newName.trim();
    console.log("Current Name ", currentName);
    console.log("Trim name ", trimName);
    if (trimName.length < 2) {
      alert("Invalid name");
      return;
    }
    if (currentName == trimName) {
      // they are same duh!
      alert("New name same as old name");
    } else {
      $.ajax({
        method: "post",
        url: "/api/setName",
        data: { fullName: trimName },
        success: result => {
          console.log(result);
          alert("New name set!");
          window.location.reload();
        },
        error: err => {
          alert("Some Error Occured!");
          console.log(err);
        }
      });
    }
  }

  function handleUpdateLink(social) {
    console.log("inside update link");
    if (
      confirm(
        `Warning: You are going to remove a social account linkeded to this account, you will no longer be able to login using this social account from ${social} after removing`
      )
    ) {
      $.ajax({
        method: "get",
        url: "/api/current_user",
        success: result => {
          if (result.status) {
            // user is logged in
            let user = result.user;
            if (
              user.auth[social].id == undefined ||
              user.auth[social].id == ""
            ) {
              alert(`Error: ${social} is not linked to this account`);
            } else {
              $.ajax({
                method: "post",
                url: "/api/removeSocial",
                data: { social },
                success: result => {
                  if (result.status) {
                    alert(
                      "Successfully removed the social link, now pease login with new social"
                    );
                    switch (social) {
                      case "google": {
                        handleAuthGoogle();
                        break;
                      }
                      case "twitter": {
                        handleAuthTwitter();
                        break;
                      }
                      case "facebook": {
                        handleAuthFacebook();
                        break;
                      }
                      case "linkedin": {
                        handleAuthLinkedin();
                        break;
                      }
                    }
                  } else {
                    alert(`Cannot not remove: ${result.error}`);
                  }
                },
                error: err => {
                  alert(
                    "Error while making the call to the server, pls try again"
                  );
                  window.location.reload("https://www.blockdegree.org");
                }
              });
            }
          } else {
            alert("Please log in to continue");
            window.location.reload("https://www.blockdegree.org/login");
          }
        },
        error: err => {
          alert("Error while getting current user");
          window.location.reload("https://www.blockdegree.org/login");
        }
      });
    }
  }

  function handleRemoveLink(social) {
    console.log("inside remove link");
    $.ajax({
      method: "get",
      url: "/api/current_user",
      success: result => {
        if (result.status) {
          // user is logged in
          let user = result.user;
          if (user.auth[social].id == undefined || user.auth[social].id == "") {
            alert(`Error: ${social} is not linked to this account`);
          } else {
            if (
              confirm(
                `Warning: This social account from ${social} will be forever detached from your profile & you wont be able to login using this social.`
              )
            ) {
              $.ajax({
                method: "post",
                url: "/api/removeSocial",
                data: { social },
                success: result => {
                  if (result.status) {
                    alert("Successfully removed the social link");
                    checkAuth();
                  } else {
                    alert(`Cannot not remove: ${result.error}`);
                  }
                },
                error: err => {
                  alert(
                    "Error while making the call to the server, pls try again"
                  );
                  window.location.reload("https://www.blockdegree.org");
                }
              });
            }
          }
        } else {
          alert("Please log in to continue");
          window.location.reload("https://www.blockdegree.org/login");
        }
      },
      error: err => {
        alert("Error while getting current user");
        window.location.reload("https://www.blockdegree.org/login");
      }
    });
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
        // get & update view-profile links
        let googleLink = document.getElementById("googleLink"),
          facebookLink = document.getElementById("facebookLink"),
          twitterLink = document.getElementById("twitterLink"),
          linkedinLink = document.getElementById("linkedinLink");
        let edit_googleLink = document.getElementById("edit_googleLink"),
          edit_facebookLink = document.getElementById("edit_facebookLink"),
          edit_twitterLink = document.getElementById("edit_twitterLink"),
          edit_linkedinLink = document.getElementById("edit_linkedinLink");
        // get & update edit-profile links
        if (auths.googleAuth) {
          googleLink.innerHTML = "linked";
          edit_googleLink.innerHTML = "linked";
        } else {
          googleLink.innerHTML = `<button onclick="handleAuthGoogle()">Link Google</button>`;
          edit_googleLink.innerHTML = `<button onclick="handleAuthGoogle()">Link Google</button>`;
        }
        if (auths.facebookAuth) {
          facebookLink.innerHTML = "linked";
          edit_facebookLink.innerHTML = "linked";
        } else {
          facebookLink.innerHTML = `<button onclick="handleAuthFacebook()">Link Facebook</button>`;
          edit_facebookLink.innerHTML = `<button onclick="handleAuthFacebook()">Link Facebook</button>`;
        }
        if (auths.twitterAuth) {
          twitterLink.innerHTML = "linked";
          edit_twitterLink.innerHTML = "linked";
        } else {
          twitterLink.innerHTML = `<button onclick="handleAuthTwitter()">Link Twitter</button>`;
          edit_twitterLink.innerHTML = `<button onclick="handleAuthTwitter()">Link Twitter</button>`;
        }
        if (auths.linkedinAuth) {
          linkedinLink.innerHTML = "linked";
          edit_linkedinLink.innerHTML = "linked";
        } else {
          linkedinLink.innerHTML = `<button onclick="handleAuthLinkedin()">Link Linkedin</button>`;
          edit_linkedinLink.innerHTML = `<button onclick="handleAuthLinkedin()">Link Linkedin</button>`;
        }
      }
    });
  }
}
