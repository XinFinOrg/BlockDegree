function runHandlebars(id, dataSrc, src) {
  if (document.getElementById(id) != null) {
    let content = document.getElementById(id);
    ajax_get(dataSrc, function(data) {
      let source = document.getElementById(src).innerHTML,
        template = Handlebars.compile(source);

      content.innerHTML = template(data);
    });
  }
}

Handlebars.registerHelper("url", function(options) {
  let removeSpecial = options.replace(/[^\w\s]/gi, "");

  return removeSpecial.replace(/ +/g, "-").toLowerCase();
});

Handlebars.registerHelper("trimmed", info => {
  let length = 15,
    splitString = info.split(" ");

  let trimmedString =
    splitString.length > length
      ? splitString.slice(0, length).join(" ") + " ..."
      : info;

  return trimmedString;
});

Handlebars.registerHelper("trimString", (info, title, idx) => {
  let length = 10,
    splitString = info.split(" ");

  let trimmedString =
    splitString.length > length
      ? splitString.slice(0, length).join(" ") +
        '<a href class="dialog-btn" data-btn-idx="' +
        idx +
        '"> ...Read more </a>' +
        '<div class="dialog" data-dialog-idx="' +
        idx +
        '" title="' +
        title +
        '">' +
        info +
        "</div>"
      : info;

  return trimmedString;
});

Handlebars.registerHelper("inc", function(value, options) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper("json", function(context) {
  return JSON.stringify(context);
});

// Special case for login button
// (function() {
//   if (document.getElementById("login-btn") != null) {
//     let content = document.getElementById("login-btn");

//     $.ajax({
//       type: "POST",
//       url: "/api/getAuthStatus",
//       success: function(result) {
//         if (
//           result.googleAuth ||
//           result.twitterAuth ||
//           result.facebookAuth ||
//           result.linkedinAuth ||
//           result.localAuth
//         ) {
//           let source = document.getElementById("nav-login").innerHTML,
//             template = Handlebars.compile(source);
//           content.innerHTML = template(true);
//         } else {
//           let source = document.getElementById("nav-login").innerHTML,
//             template = Handlebars.compile(source);
//           content.innerHTML = template(false);
//         }
//       },
//       error: function(err) {
//         console.log(err);
//         // window.location = "/";
//       }
//     });
//   }
// })();

// runHandlebars(id, dataSrc, src)
runHandlebars("nav-sub-1", "/data/courses.json", "nav-submenu-template");

runHandlebars(
  "contributors",
  "/data/contributors.json",
  "contributors-template"
);

runHandlebars("events", "/data/events.json", "event-template");

runHandlebars("courses", "/data/courses.json", "course-template");

runHandlebars("mod__details", "/data/courses.json", "module-template");

runHandlebars("partners", "/data/partners.json", "partners-details-template");
