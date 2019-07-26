const path = require("path");
var paypal = require("paypal-rest-sdk");
var cors = require("cors");
var User = require("../models/user");
var Token = require("../models/tokenVerification");
var PaymentLogs = require("../models/payment_logs");
const emailer = require("../emailer/impl");
var crypto = require("crypto");

const IPFS = require("ipfs-http-client");

var ejs = require("ejs");

function getQuery(user) {
     var email = "";
    var emailKey = "";
    var query = {};
    if (user.local.email != "") {
      email = user.local.email;
      emailKey="local.email";
    } else if (user.google.email != "") {
      email = user.google.email;
      emailKey="google.email";
    } else if (user.twitter.email != "") {
      email = user.twitter.email;
      emailKey="twitter.email";
    } else if (user.facebook.email != "") {
      email = user.facebook.email;
      emailKey="facebook.email";
    }
    query[emailKey]=email;
    return query
}

module.exports = async function(req, res, next) {
  if (req.isAuthenticated()) {
    const backUrl = req.url;
    const examName = backUrl.split("/")[1].split("-")[1];
    query = getQuery(req.user);

    let payment_status;
    console.log("ispaymentsuccess", examName);
    if (examName === "basic") {
      await User.findOne(query, function(err, user) {
        payment_status = user.examData.payment.course_1;
        if (payment_status != true) {
          res.redirect("/exams");
        } else {
          next();
        }
      });
    } else if (examName === "advanced") {
      await User.findOne(query, function(err, user) {
        payment_status = user.examData.payment.course_2;
        if (payment_status != true) {
          res.redirect("/exams");
        } else {
          next();
        }
      });
    } else if (examName === "professional") {
      await User.findOne(query, function(err, user) {
        payment_status = user.examData.payment.course_3;
        if (payment_status != true) {
          res.redirect("/exams");
        } else {
          next();
        }
      });
    }
  } else {
    if (req.params.courseName) {
      res.redirect("/login?from=" + req.params.courseName);
    } else {
      res.redirect("/login");
    }
  }
};
