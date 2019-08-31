if (typeof jQuery != "undefined") {
  $(document).ready(() => {
    let profileWrap = document.getElementById("profile_wrap");

    $.ajax({
      method: "post",
      url: "/api/getAuthStatus",
      data: {},
      success: auths => {
        if (
          auths.linkedinAuth ||
          auths.facebookAuth ||
          auths.twitterAuth ||
          auths.googleAuth ||
          auths.localAuth
        ) {
          $.ajax({
            method: "get",
            url: "/api/current_user",
            success: result => {
              if (result.status) {
                // we have a profile
                let userProfile = result.user;
                profileWrap.innerHTML =
                  "<style>" +
                  "table {" +
                  "  font-family: arial, sans-serif;" +
                  "  border-collapse: collapse;" +
                  "  width: 100%;" +
                  "}" +
                  "" +
                  "td, th {" +
                  "  border: 1px solid #dddddd;" +
                  "  text-align: left;" +
                  "  padding: 8px;" +
                  "}" +
                  "" +
                  "tr:nth-child(even) {" +
                  "  background-color: #dddddd;" +
                  "}" +
                  "</style>" +
                  "<h2>User Profile</h2>" +
                  "" +
                  "<h3>Basic Details</h3>" +
                  "<table>" +
                  "  <tr>" +
                  "    <th>Field</th>" +
                  "    <th>Value</th>" +
                  "   " +
                  "  </tr>" +
                  "  <tr>" +
                  "    <td>Email-ID</td>" +
                  `    <td id="emailId">${userProfile.email}</td>` +
                  "    " +
                  "  </tr>" +
                  "  <tr>" +
                  "    <td>Full Name</td>" +
                  `    <td id="name">${userProfile.name}</td>` +
                  "  </tr>" +
                  "</table>" +
                  "<table>" +
                  "<h3>Socials</h3>" +
                  "<table>" +
                  "<tr>" +
                  "<th>Social's Name</th>" +
                  "<th>Link Status</th>" +
                  "</tr>" +
                  "<tr>" +
                  "<td>Google</td>" +
                  `<td id="googleLink">${
                    auths.googleAuth
                      ? "yes"
                      : `<button onclick="handleAuthGoogle()">Link Google</button>`
                  }</td>` +
                  "</tr>" +
                  "<tr>" +
                  "<td>Facebook</td>" +
                  `<td id="facebookLink">${
                    auths.facebookAuth
                      ? "yes"
                      : `<button onclick="handleAuthFacebook()">Link Facebook</button>`
                  }</td>` +
                  "</tr>" +
                  "<tr>" +
                  "<td>Twitter</td>" +
                  `<td id="twitterLink">${
                    auths.twitterAuth
                      ? "yes"
                      : `<button onclick="handleAuthTwitter()">Link Twitter</button>`
                  }</td>` +
                  "</tr>" +
                  "<tr>" +
                  "<td>Linkedin</td>" +
                  `<td id="linkedinLink">${
                    auths.linkedinAuth
                      ? "yes"
                      : `<button onclick="handleAuthLinkedin()">Link Linkedin</button>`
                  }</td>` +
                  "</tr>" +
                  "</table>" +
                  "" +
                  "<h3>Payment Details</h3>" +
                  "<table>" +
                  "  <tr>" +
                  "    <th>Course Name</th>" +
                  "    <th>Payment Status</th>" +
                  "    <th>Attempts Made</th>" +
                  "  </tr>" +
                  "  <tr>" +
                  "  <td>Basic</td>" +
                  `  <td id="basicStatus">${userProfile.examData.payment.course_1}</td>` +
                  `  <td id="attemptLeftBasic">${userProfile.examData.examBasic.attempts}</td>` +
                  "  </tr>" +
                  "  <tr>" +
                  "  <td>Advanced</td>" +
                  `  <td id="advancedStatus">${userProfile.examData.payment.course_2}</td>` +
                  `  <td id="attemptLeftAdvanced">${userProfile.examData.examAdvanced.attempts}</td>` +
                  "  </tr>" +
                  "  <tr>" +
                  "  <td>Professional</td>" +
                  `  <td id="professionalStatus">${userProfile.examData.payment.course_3}</td>` +
                  `  <td id="attemptLeftProfessional">${userProfile.examData.examProfessional.attempts}</td>` +
                  "  </tr>" +
                  "</table>";
              }
            }
          });
        } else {
          // is not logged in
          profileWrap.innerHTML =
            '<div>Please <a href="/login">log in</a> to view / edit this page.</div>';
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
