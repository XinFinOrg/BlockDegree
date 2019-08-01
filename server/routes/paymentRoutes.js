var cors = require("cors");

const requireLogin = require("../middleware/requireLogin");
const paymentService = require("../services/payment");

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
