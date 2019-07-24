var payment = require("../services/payment")
var requireLogin = require("../middleware/requireLogin")
var cors = require("cors")

module.exports = app => {
    app.get('/suc',payment.payPaypalSuccess)
    app.get('/pay',requireLogin,cors(),payment.payPaypal)
<<<<<<< HEAD
    app.get("/payment-success", requireLogin, function(req, res) {
        res.render("paymentSuccess");
      });
=======
>>>>>>> 37eb5510b3766db1f040ae1a97d04d7ec3eab4b0
}