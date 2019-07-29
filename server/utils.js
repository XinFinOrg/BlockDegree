const fs = require("fs");
const path = require("path");

function readJSONFile(filename, callback) {
  fs.readFile(filename, function(err, data) {
    if (err) {
      callback(err);
      return;
    }
    try {
      callback(null, JSON.parse(data.toString().trim()));
    } catch (exception) {
      callback(exception);
    }
  });
}

// Replicated
function isLoggedIn(req, res, next) {
  console.log("req.isAuthenticated():", req.isAuthenticated(), req.params);
  if (req.isAuthenticated()) {
    next();
  } else {
    if (req.params.courseName) {
      res.redirect("/login?from=" + req.params.courseName);
    } else {
      res.redirect("/login");
    }
  }
}

module.exports = { readJSONFile, isLoggedIn };
