if (typeof jQuery != "undefined") {
  $(document).ready(() => {
    $.ajax({
      method: "get",
      url: "/api/current_user",
      success: (result) => {
        if (!result.status) {
          alert("You are not logged in, please visit after logging in");
          window.location.replace("https://uat.blockdegree.org/login");
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
            edit_email = document.getElementById("edit_email");
          edit_email.value = userProfile.email;
          edit_name.value = userProfile.name;

          let currentUrl = window.location.href;
          let paramsString = currentUrl.split("?")[1];
          if (paramsString) {
            console.log(`ParamsString: ${paramsString}`);
            let params = paramsString.split("&");
            console.log(params);
            for (let i = 0; i < params.length; i++) {
              let key = params[i].split("=")[0],
                value = params[i].split("=")[1];
              console.log(`Key: ${key} & Value: ${value}`);
              if (key == "confirmName" && value.startsWith("true")) {
                // new registration, need to confirm the name.
                document.getElementById("btn-confirmName").click();
                return;
              } else if (key === "inFocus" && value === "cryptoPayment") {
                $("html, body").animate(
                  {
                    scrollTop:
                      $("#payment-via-tokens").offset().top -
                      document.getElementById("header").scrollHeight -
                      20,
                  },
                  2000
                );
                console.log("called in focus");
                return;
              } else if (key === "inFocus" && value === "paypalPayment") {
                $("html, body").animate(
                  {
                    scrollTop:
                      $("#payment-via-paypal").offset().top -
                      document.getElementById("header").scrollHeight -
                      20,
                  },
                  2000
                );
                console.log("called in focus");
                return;
              } else if (key === "inFocus" && value === "fmd-requests") {
                $("html, body").animate(
                  {
                    scrollTop:
                      $("#fmd-requests").offset().top
                  },
                  2000
                );
                console.log("called in focus");
                return;
              } else if (key === "inFocus" && value === "fmd-funded") {
                $("html, body").animate(
                  {
                    scrollTop:
                      $("#fmd-funded").offset().top 
                  },
                  2000
                );
                console.log("called in focus");
                return;
              }
            }
          }
        }
      },
    });
  });

  function handleUpdateName() {
    let newName = document.getElementById("edit_name").value;
    let newNameTrim = formatName(newName);
    if (newNameTrim.length < 2) {
      $.notify("The length of name has to be atleast 2", {
        type: "danger",
      });
      return;
    }
    if (containsNumber(newName)) {
      $.notify("Name cannot have number", {
        type: "danger",
      });
      return;
    }
    $.ajax({
      method: "get",
      url: "/api/current_user",
      success: (result) => {
        if (result.status) {
          // is logged in
          let currentUser = result.user;
          if (currentUser.name == newNameTrim) {
            $.notify("Same Name", { type: "danger" });
            return;
          } else {
            $.ajax({
              method: "post",
              url: "/api/setName",
              data: { fullName: newNameTrim },
              success: (result) => {
                console.log(result);
                if (result.updated) {
                  alert("New Name successfully set");
                  window.location.replace("/profile");
                  return;
                } else {
                  $.notify(result.error, { type: "danger" });
                  return;
                }
              },
              error: (err) => {
                $.notify("Error while updating the name", { type: "danger" });
              },
            });
          }
        } else {
          alert("You're not logged in");
          window.location.replace("https://uat.blockdegree.org/login");
        }
      },
      error: (err) => {
        alert("Error while getting the current user");
        window.location.replace("https://uat.blockdegree.org/login");
      },
    });
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
        success: (result) => {
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
                success: (result) => {
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
                error: (err) => {
                  alert(
                    "Error while making the call to the server, pls try again"
                  );
                  window.location.reload("https://uat.blockdegree.org");
                },
              });
            }
          } else {
            alert("Please log in to continue");
            window.location.reload("https://uat.blockdegree.org/login");
          }
        },
        error: (err) => {
          alert("Error while getting current user");
          window.location.reload("https://uat.blockdegree.org/login");
        },
      });
    }
  }

  function handleRemoveLink(social) {
    console.log("inside remove link");
    $.ajax({
      method: "get",
      url: "/api/current_user",
      success: (result) => {
        if (result.status) {
          // user is logged in
          let user = result.user;
          if (user.auth[social].id == undefined || user.auth[social].id == "") {
            $.notify(`Error: ${social} is not linked to this account`, {
              type: "danger",
            });
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
                success: (result) => {
                  if (result.status) {
                    $.notify("Successfully removed the social link", {
                      type: "success",
                    });
                    checkAuth();
                  } else {
                    alert(`Cannot not remove: ${result.error}`);
                  }
                },
                error: (err) => {
                  alert(
                    "Error while making the call to the server, pls try again"
                  );
                  window.location.reload("https://uat.blockdegree.org");
                },
              });
            }
          }
        } else {
          alert("Please log in to continue");
          window.location.reload("https://uat.blockdegree.org/login");
        }
      },
      error: (err) => {
        alert("Error while getting current user");
        window.location.reload("https://uat.blockdegree.org/login");
      },
    });
  }

  window.addEventListener(
    "message",
    function (event) {
      console.log("Originating event: ", event.origin);
      console.log(event.origin);
      if (event.origin == "https://uat.blockdegree.org" && event.data == "ok") {
        $.notify("Social linked!", { type: "success" });
        checkAuth();
      }
    },
    false
  );

  function checkAuth() {
    console.log("called check auth");
    $.ajax({
      method: "post",
      url: "/api/getAuthStatus",
      data: {},
      success: (auths) => {
        // get & update view-profile links
        let googleLink = document.getElementById("googleLink"),
          facebookLink = document.getElementById("facebookLink"),
          twitterLink = document.getElementById("twitterLink"),
          linkedinLink = document.getElementById("linkedinLink");

        // get & update edit-profile links
        if (auths.googleAuth) {
          googleLink.innerHTML = "<span>linked</span>";
        } else {
          googleLink.innerHTML = `<button class="btn btn-primary social-g+" onclick="handleAuthGoogle()">Link Google</button>`;
        }
        if (auths.facebookAuth) {
          facebookLink.innerHTML = "<span>linked</span>";
        } else {
          facebookLink.innerHTML = `<button class="btn btn-primary social-fb" onclick="handleAuthFacebook()">Link Facebook</button>`;
        }
        if (auths.twitterAuth) {
          twitterLink.innerHTML = "<span>linked</span>";
        } else {
          twitterLink.innerHTML = `<button class="class="btn btn-primary social-tw" onclick="handleAuthTwitter()">Link Twitter</button>`;
        }
        if (auths.linkedinAuth) {
          linkedinLink.innerHTML = "<span>linked</span>";
        } else {
          linkedinLink.innerHTML = `<button class="class="btn btn-primary social-li" onclick="handleAuthLinkedin()">Link Linkedin</button>`;
        }
      },
    });
  }
}

function formatName(fullName) {
  const lowerFN = fullName.toLowerCase();
  const splitFN = lowerFN.split(" ");
  let formattedName = "";
  for (name of splitFN) {
    formattedName += name.charAt(0).toUpperCase() + name.slice(1) + " ";
  }
  const finalFN = formattedName.trim();
  return finalFN;
}

function containsNumber(fullName) {
  return /\d/.test(fullName);
}
