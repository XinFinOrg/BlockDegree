const path = require("path");
var paypal = require("paypal-rest-sdk");
var cors = require("cors");
var User = require("../config/models/user");
var Token = require("../config/models/tokenVerification");
var PaymentLogs = require("../config/models/payment_logs");
const emailer = require("../emailer/impl");
var crypto = require("crypto");

const IPFS = require("ipfs-http-client");

var ejs = require("ejs");

module.exports = async function(req, res, next) {
  if (req.isAuthenticated()) {
    const backUrl = req.url;
    const examName = backUrl.split("/")[1].split("-")[1];
    const email = req.user.local.email;
    let payment_status;
    console.log("ispaymentsuccess", examName);
    if (examName === "basic") {
      await User.findOne({ "local.email": email }, function(err, user) {
        payment_status = user.local.payment.course_1;
        if (payment_status != true) {
          res.redirect("/exams");
        } else {
          next();
        }
      });
    } else if (examName === "advanced") {
      await User.findOne({ "local.email": email }, function(err, user) {
        payment_status = user.local.payment.course_2;
        if (payment_status != true) {
          res.redirect("/exams");
        } else {
          next();
        }
      });
    } else if (examName === "professional") {
      await User.findOne({ "local.email": email }, function(err, user) {
        payment_status = user.local.payment.course_3;
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
