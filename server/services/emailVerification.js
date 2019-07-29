const path = require("path");
var paypal = require("paypal-rest-sdk");
var cors = require("cors");
var User = require("../models/user");
var Token = require("../models/tokenVerification");
var PaymentLogs = require("../models/payment_logs");
const emailer = require("../emailer/impl");
var crypto = require("crypto");

exports.confirmEmail = function(req, res) {
  console.log("In confirmation", req.query.token);
  Token.findOne({ token: req.query.token }, function(err, token) {
    if (!token)
      return res.status(400).send({
        type: "not-verified",
        msg: "We were unable to find a valid token. Your token my have expired."
      });
    console.log("token mapped email:", token.email);
    // If we found a token, find a matching user
    User.findOne({email:token.email}, function(err, user) {
      if (!user)
        return res
          .status(400)
          .send({ msg: "We were unable to find a user for this token." });
      if (user.examData.isVerified)
        return res.status(400).send({
          type: "already-verified",
          msg: "This user has already been verified."
        });

      // Verify and save the user
      user.auth.local.isVerified = true;
      user.save(function(err) {
        if (err) {
          console.log("ajdgakc", err.message);
          return res.status(500).send({ msg: err.message });
        }
        console.log("Success");
        // res.status(200).send("The account has been verified. Please log in.");
        res.redirect(200, "/login");
      });
    });
  });
};

exports.resendEmail = function(req, res, next) {
  console.log("resend>>>>>>>>>>");
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user)
      return res
        .status(400)
        .send({ msg: "We were unable to find a user with that email." });
    if (user.isVerified)
      return res.status(400).send({
        msg: "This account has already been verified. Please log in."
      });

    // Create a verification token, save it, and send email
    var token = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex")
    });

    // Save the token
    token.save(function(err) {
      if (err) {
        return res.status(500).send({ msg: err.message });
      }

      // Send the email
      emailer.sendTokenMail(req.body.email, token, req, "resend");
    });
  });
};
