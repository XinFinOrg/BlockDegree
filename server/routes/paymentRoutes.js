var payment = require("../services/payment")
var requireLogin = require("../middleware/requireLogin")
var cors = require("cors")

module.exports = app => {
    app.get('/suc',payment.payPaypalSuccess)
    app.get('/pay',requireLogin,cors(),payment.payPaypal)
    app.get("/payment-success", requireLogin, function(req, res) {
        res.render("paymentSuccess");
      });
}