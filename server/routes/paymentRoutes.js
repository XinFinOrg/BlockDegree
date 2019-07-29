const path = require("path");
var paypal = require("paypal-rest-sdk");
var cors = require("cors");
var User = require("../models/user");
var Token = require("../models/tokenVerification");
var PaymentLogs = require("../models/payment_logs");
const emailer = require("../emailer/impl");
var crypto = require("crypto");

const requireLogin = require("../middleware/requireLogin");
const paymentService = require("../services/payment");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID_SANDBOX,
  client_secret: process.env.PAYPAL_CLIENT_SECRET_SANDBOX
});

// paypal.configure({
//   mode: "live", //sandbox or live
//   client_id: process.env.PAYPAL_CLIENT_ID_LIVE,
//   client_secret: process.env.PAYPAL_CLIENT_SECRET_LIVE
// });

module.exports = function(app) {
  // What is this endpoint for ?
  app.post("/answers", (req, res, next) => {
    console.log(req.body);
    res.send("got the answers");
  });

  app.post("/pay", requireLogin, cors(), paymentService.payPaypal);
  app.get("/suc", paymentService.payPaypalSuccess);
  app.get("/payment-success", requireLogin, function(req, res) {
    res.render("paymentSuccess");
  });
};
