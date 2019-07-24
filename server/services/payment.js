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
const utils = require("../utils.js");
let { isLoggedIn } = utils;


// paypal.configure({
//  mode: "sandbox", //sandbox or live
//   client_id:    "AR8oYc8pYp90H_9qN6JcjvSgS5nbCq_hFvc5ue4Twzdh-ZefahoeLmVKEem2OxbLNlK2nM-Zv74F3iPI",
//   client_secret: "ELBjQfb3aGNze4S-wbaHHndGmv4DQzqfOoeu1NAphrOwdwxHSjaHLR_zP-u4hBLGJPAyCXdTPAFD8BKk"
// });

paypal.configure({
  mode: "live", //sandbox or live
  client_id:
    "ActAo_owzENeRQct8dgkXOZ4c1U_adE_i0JOph3QjJWLHWbSrj8bY0bYjn98F06moUhTAJYuJ6i8sKKX",
  client_secret:
    "EGqCuRXqjli8HXdL83rvOro4xZMGjQ2B7kIy6Mh0JWfX3iXqNnPekQ_WNNhtI7_Z5ZphG4r16Oy188Ya"
});


exports.payPaypalSuccess = (req, res, next) => {
  var paymentId = req.query.paymentId;
  var payerId = { payer_id: req.query.PayerID };
  var order;

  paypal.payment.execute(paymentId, payerId, function(error, payment) {
    if (error) {
      console.error(JSON.stringify(error));
    } else {
      if (
        payment.state === "approved" &&
        payment.transactions &&
        payment.transactions[0].related_resources &&
        payment.transactions[0].related_resources[0].order
      ) {
        console.log("order authorization completed successfully");
        order = payment.transactions[0].related_resources[0].order.id;
        console.log(payment.transactions[0].description);
        var email = payment.transactions[0].description;
        var course_id = payment.transactions[0].item_list.items[0].name;
        var invoice_number = payment.transactions[0].invoice_number;
        var capture_details = {
          amount: {
            currency: payment.transactions[0].amount.currency,
            total: payment.transactions[0].amount.total
          }
        };
        paypal.order.authorize(order, capture_details, function(
          error,
          authorization
        ) {
          if (error) {
            console.error(JSON.stringify(error));
          } else {
            paypal.order.capture(order, capture_details, function(
              error,
              capture
            ) {
              if (error) {
                console.error(error);
              } else {
                console.log("ORDER CAPTURE SUCCESS");
                User.findOne({ "local.email": email }, function(err, user) {
                  if (course_id == "course_1")
                    user.local.payment.course_1 = true;
                  else if (course_id == "course_2")
                    user.local.payment.course_2 = true;
                  else if (course_id == "course_3")
                    user.local.payment.course_3 = true;
                  user.save();
                  PaymentLogs.findOne(
                    { payment_id: invoice_number, email: email },
                    function(err, payment_log) {
                      payment_log.payment_status = true;
                      payment_log.save();
                    }
                  );
                });
                console.log("course_id", course_id, email);
                emailer.sendTokenMail(email, "", req, course_id);
                res.redirect("/payment-success");
              }
            });
          }
        });
      } else {
        console.log("payment not successful");
        res.send({ error: error });
      }
    }
  });
};

exports.payPaypal = async (req, res) => {
  var price = req.body.price;
  var email = req.user.local.email;
  var course_id = req.body.course_id;
  var payment_status;

  await User.findOne({ "local.email": email }, function(err, user) {
    if (course_id == "course_1") {
      payment_status = user.local.payment.course_1;
    } else if (course_id == "course_2") {
      payment_status = user.local.payment.course_2;
    } else if (course_id == "course_3") {
      payment_status = user.local.payment.course_3;
    }
  });

  if (payment_status != true) {
    invoice_number =
      "TXID" + Date.now() + (Math.floor(Math.random() * 1000) + 9999);
    var payReq = JSON.stringify({
      intent: "order",
      payer: {
        payment_method: "paypal"
      },
      redirect_urls: {
        return_url: "http://localhost:3000/suc",
        cancel_url: "http://localhost:3000/err"
        // return_url: "http://www.blockdegree.org/suc",
        // cancel_url: "http://www.blockdegree.org/err"
      },
      transactions: [
        {
          amount: {
            total: price,
            currency: "USD",
            details: {
              subtotal: price,
              tax: "0.0"
            }
          },
          description: email,
          invoice_number: invoice_number,
          payment_options: {
            allowed_payment_method: "INSTANT_FUNDING_SOURCE"
          },
          item_list: {
            items: [
              {
                name: course_id,
                quantity: "1",
                price: price,
                tax: "0.0",
                sku: "123123",
                currency: "USD"
              }
            ]
          }
        }
      ]
    });

    paypal.payment.create(payReq, function(error, payment) {
      var links = {};

      if (error) {
        console.error(JSON.stringify(error));
      } else {
        payment.links.forEach(function(linkObj) {
          links[linkObj.rel] = {
            href: linkObj.href,
            method: linkObj.method
          };
        });
        if (links.hasOwnProperty("approval_url")) {
          var payment_logs = new PaymentLogs();
          payment_logs.email = email;
          payment_logs.course_id = course_id;
          payment_logs.payment_id = invoice_number;
          payment_logs.payment_status = false;
          payment_logs.amount = price;
          payment_logs.save();

          return res.send({
            status: "200",
            link: links["approval_url"].href
          });
        } else {
          console.error("no redirect URI present");
        }
      }
    });
  } else {
    return res.send({ status: "400", message: "Payment already completed." });
  }
};
