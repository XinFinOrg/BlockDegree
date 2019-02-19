const fs = require("fs");
const path = require("path");
var paypal = require("paypal-rest-sdk");
var cors = require("cors");
var User = require("../config/models/user");
var PaymentLogs = require("../config/models/payment_logs");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AR8oYc8pYp90H_9qN6JcjvSgS5nbCq_hFvc5ue4Twzdh-ZefahoeLmVKEem2OxbLNlK2nM-Zv74F3iPI",
  client_secret:
    "ELBjQfb3aGNze4S-wbaHHndGmv4DQzqfOoeu1NAphrOwdwxHSjaHLR_zP-u4hBLGJPAyCXdTPAFD8BKk"
});

const utils = require("../utils.js");
let { readJSONFile, isLoggedIn } = utils;

module.exports = function(app, passport) {
  app.post("/login", (req, res, next) => {
    passport.authenticate(
      "local-login",
      {
        session: true
      },
      async (err, user, info) => {
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }
          res.send({ status: user, message: info });
          console.log("user logged in", user, info);
        });
      }
    )(req, res, next);
  });

  app.post("/signup", (req, res, next) => {
    passport.authenticate(
      "local-signup",
      {
        session: true
      },
      async (err, user, info) => {
        res.send({ status: user, message: info });
      }
    )(req, res, next);
  });

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.get("/courses/:courseName", isLoggedIn, function(req, res) {
    switch (req.params.courseName) {
      case "blockchain-basic":
        res.redirect("/courses/blockchain-basic/history-of-blockchain");
        break;
      case "blockchain-advanced":
        res.redirect(
          "/courses/blockchain-advanced/what-is-blockchain-and-bitcoin"
        );
        break;
      case "blockchain-professional":
        res.redirect(
          "/courses/blockchain-professional/what-is-ethereum-blockchain"
        );
    }
  });

  app.get("/courses/:courseName/:content", isLoggedIn, function(req, res) {
    res.sendFile(
      path.join(
        process.cwd(),
        "/server/protected/courses/" +
          req.params.courseName +
          "/" +
          req.params.content +
          ".html"
      )
    );
  });

  app.get("/exams", function(req, res) {
    // Populate with the course exam data
    /***
      Recommended exam data structure: [{
        title: string,
        price: int,
        writeup/copy: string
      }]
      ***/
    readJSONFile(
      path.join(process.cwd(), "/dist/data/courses.json"),
      (err, json) => {
        if (err) {
          throw err;
        }
        res.render("examList", json);
      }
    );
  });

  // Need logic on on click, redirection with course id

  app.get("/exam", function(req, res) {
    let examQns;

    readJSONFile(
      path.join(process.cwd(), "/server/protected/exams.json"),
      (err, json) => {
        if (err) {
          throw err;
        }
        console.log("test quetions:", json);
        res.render("examList", json);
      }
    );
  });

  app.post("/answers", (req, res, next) => {
    // check the verification of user answers
    console.log(req.body); // Answers are send as {'0': 'q0-c0', '1': 'q1-c2'}
    // return the score
    res.send("got the answers");
  });

  app.post("/signup", (req, res, next) => {
    passport.authenticate(
      "local-signup",
      {
        session: true
      },
      async (err, user, info) => {
        res.send({ status: user, message: info });
      }
    )(req, res, next);
  });

  app.post("/pay", cors(), async (req, res) => {
    var price = req.body.price;
    var email = req.body.email;
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
      invoice_number = "TXID" + Date.now() + (Math.floor(Math.random() * 1000) + 9999);
      var payReq = JSON.stringify({
        intent: "order",
        payer: {
          payment_method: "paypal"
        },
        redirect_urls: {
          return_url: "http://localhost:3000/suc",
          cancel_url: "http://localhost:3000/err"
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
          // Capture HATEOAS links
          payment.links.forEach(function(linkObj) {
            links[linkObj.rel] = {
              href: linkObj.href,
              method: linkObj.method
            };
          });

          // If redirect url present, redirect user
          if (links.hasOwnProperty("approval_url")) {
            // REDIRECT USER TO links['approval_url'].href;

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
  });

  app.get("/suc", function(req, res, next) {
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
          // Capture order id
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
          //take payment
          paypal.order.authorize(order, capture_details, function(error,authorization) {
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
                  res.send({ capture: capture });
                  // res.render("payment_successful",{message: course_id+" payment successfull."});
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
  });
};
