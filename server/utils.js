const fs = require('fs');
const path = require('path');

function readJSONFile(filename, callback) {
  fs.readFile(filename, function (err, data) {
    if(err) {
      callback(err);
      return;
    }
    try {
      callback(null, JSON.parse(data));
    } catch(exception) {
      callback(exception);
    }
  });
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    if(req.params.courseName) {
      res.redirect('/login?from=' + req.params.courseName)
    } else {
      res.redirect('/login');
    }
  }
}

module.exports = {readJSONFile, isLoggedIn}
