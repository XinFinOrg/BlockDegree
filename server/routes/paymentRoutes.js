var paypal = require("paypal-rest-sdk");
var cors = require("cors");

require("dotenv").config();
const requireLogin = require("../middleware/requireLogin");
const paymentService = require("../services/payment");
let paymentConfig = {};
if (process.env.PAYMENT == "live") {
  paymentConfig = {
    mode: "live", //sandbox or live
    client_id: process.env.PAYPAL_CLIENT_ID_LIVE,
    client_secret: process.env.PAYPAL_CLIENT_SECRET_LIVE,
  };
} else if (process.env.PAYMENT == "sandbox") {
  paymentConfig = {
    mode: "sandbox", //sandbox or live
    client_id: process.env.PAYPAL_CLIENT_ID_SANDBOX,
    client_secret: process.env.PAYPAL_CLIENT_SECRET_SANDBOX,
  };
}
paypal.configure(paymentConfig);

module.exports = function (app) {
  // What is this endpoint for ?
  app.post("/answers", (req, res, next) => {
    console.log(req.body);
    res.send("got the answers");
  });

  app.post("/pay", requireLogin, cors(), paymentService.payPaypal);
  app.get("/suc", paymentService.payPaypalSuccess);
  app.get("/payment-success", function (req, res) {
    console.log(req.session.message);
    
    res.render("paymentSuccess", { message: req.session.message });
  });
  app.post("/api/payViaXdc", requireLogin, paymentService.payViaXdc);
  app.post("/api/payViaXdce", requireLogin, paymentService.payViaXdce);
  app.get(
    "/api/wrapCoinMarketCap",    
    paymentService.wrapCoinMarketCap
  );
  app.get(
    "/api/getUserNotis",
    requireLogin,
    paymentService.getPaymentsToNotify
  );
  app.post("/api/getTokenRecipient", paymentService.getTokenRecipient);
};
