const paypal = require("paypal-rest-sdk");
const User = require("../models/user");
const PaymentLogs = require("../models/payment_logs");
const emailer = require("../emailer/impl");
const promoCodeService = require("../services/promoCodes");
const PaymentXDC = require("../models/payment_xdc");
const XDC3 = require("xdc3");
const Web3 = require("web3");

const xdc3 = new XDC3("https://rpc.xinfin.network/"); // setting up the instance for xinfin's mainnet provider
const web3 = new Web3("https://rpc.xinfin.network/"); // this wont work with XinFin's network
const txReceiptUrl = "https://explorer.xinfin.network/transactionRelay"; // make a POST with {isTransfer:false,tx:'abc'}
// Need to understand the complete flow and handle erros, unexpected shutdowns, inaccessible 3rd party.

exports.payPaypalSuccess = (req, res) => {
  let paymentId = req.query.paymentId;
  let payerId = { payer_id: req.query.PayerID };
  let order;

  paypal.payment.execute(paymentId, payerId, function(error, payment) {
    if (error) {
      // Error in executing a payment.
      console.error("Error in payment execution: ", JSON.stringify(error));
      res.status(500).render("displayError", {
        error:
          "Some error occured while processing your payment, please try again later or contact-us at info@blockdegree.org"
      });
      return;
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
        let email = payment.transactions[0].description;
        let course_id = payment.transactions[0].item_list.items[0].name;
        let invoice_number = payment.transactions[0].invoice_number;
        let capture_details = {
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
            res.status(500).render("displayError", {
              error:
                "Some error occured while processing your payment, please try again later or contact-us at info@blockdegree.org"
            });
            return;
          } else {
            paypal.order.capture(order, capture_details, function(
              error,
              capture
            ) {
              if (error) {
                console.error(error);
                res.status(500).render("displayError", {
                  error:
                    "Some error occured while processing your payment, please try again later or contact-us at info@blockdegree.org"
                });
                emailer.sendMail(
                  process.env.SUPP_EMAIL_ID,
                  "Payment-error: error while capturing the order",
                  `While processing order for the user ${
                    req.user.email
                  } some error occured while capturing the order: ${error.toString()}`
                );
                return;
              } else {
                console.log("ORDER CAPTURE SUCCESS");
                User.findOne({ email: req.user.email }, async function(
                  err,
                  user
                ) {
                  if (err != null) {
                    // CRITICAL: payment lost
                    console.error(`Error: user not found || ${err}`);
                    res.status(500).render("displayError", {
                      error:
                        "Some error occurred while processing your payment, your service ticket has been generated, please contact info@blockdegree.org"
                    });
                    emailer.sendMail(
                      process.env.SUPP_EMAIL_ID,
                      "Re-embursement: payment lost",
                      `The payment for the user ${req.user.email} was processed but some error occured and user's state was not updated. Please consider for re-embursement`
                    );
                    return;
                  }
                  if (course_id == "course_1")
                    user.examData.payment.course_1 = true;
                  else if (course_id == "course_2")
                    user.examData.payment.course_2 = true;
                  else if (course_id == "course_3")
                    user.examData.payment.course_3 = true;
                  try {
                    await user.save();
                  } catch (err) {
                    // CRITICAL: payment lost
                    console.error(
                      `Exception while saving the user ${req.user.email} details: `,
                      err
                    );
                    res.status(500).render("displayError", {
                      error:
                        "Some error occured while fetching / updating your profile, please contact info@blockdegree.org"
                    });
                    emailer.sendMail(
                      process.env.SUPP_EMAIL_ID,
                      "Re-embursement: payment lost",
                      `The payment for the user ${req.user.email} was processed & saved but some error occured & payment log was not generated.`
                    );
                    return;
                  }

                  let payment_log;
                  try {
                    payment_log = await PaymentLogs.findOne({
                      payment_id: invoice_number,
                      email: email
                    });
                  } catch (e) {
                    // Not Critical: just the log is lost
                    console.error(
                      `Exception while saving the user payment ${req.user.email} details: `,
                      e
                    );
                    res.status(500).render("displayError", {
                      error:
                        "Your payment is complete but some error occured while fetching / updating your logs, please contact info@blockdegree.org"
                    });
                    emailer.sendMail(
                      process.env.SUPP_EMAIL_ID,
                      "Data-loss: payment-log lost",
                      `The payment for the user ${req.user.email} was processed & saved but some error occured and user's payment log is not generated. Please consider for re-embursement`
                    );
                    return;
                  }

                  payment_log.payment_status = true;
                  try {
                    await payment_log.save();
                  } catch (e) {
                    // Not critical: just the log is lost.
                    console.error(
                      `Exception while saving the user payment ${req.user.email} details: `,
                      e
                    );
                    res.status(500).render("displayError", {
                      error:
                        "Your payment is complete but some error occured while fetching / updating your logs, please contact info@blockdegree.org"
                    });
                    emailer.sendMail(
                      process.env.SUPP_EMAIL_ID,
                      "Data-loss: payment-log lost",
                      `The payment for the user ${req.user.email} was processed & saved but some error occured and user's payment log is not generated. Please consider for re-embursement`
                    );
                    return;
                  }
                  console.log("course_id", course_id, email);
                  emailer.sendTokenMail(email, "", req, course_id);
                  res.redirect("/payment-success");
                }).catch(e => {
                  // CRITICAL: payment lost
                  console.error(
                    `Exception while updating the user profile ${req.user.email}: `,
                    e
                  );
                  res.status(500).render("displayError", {
                    error:
                      "Some error occured while fetching / updating your profile, please contact info@blockdegree.org"
                  });
                  emailer.sendMail(
                    process.env.SUPP_EMAIL_ID,
                    "Re-embursement: payment lost",
                    `The payment for the user ${req.user.email} was processed but some error occured and user's state was not updated. Please consider for re-embursement`
                  );
                  return;
                });
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
  let price = req.body.price;
  let email = req.user.email;
  let course_id = req.body.course_id;
  let payment_status;
  const discObj = await promoCodeService.usePromoCode(req);
  console.log(discObj);
  console.log(typeof price);
  console.log(`Price Before : ${price}`);
  console.log(`Discount Price : ${discObj.discAmt}`);
  if (price !== "9.99") {
    return res.send({
      status: "400",
      message: "Bad request"
    });
  }
  if (discObj.error == null) {
    // all good, can avail promo-code discount
    price = price - discObj.discAmt;
  } else {
    console.error(
      `Error while using promocode ${req.body.codeName}: `,
      discObj.error
    );

    if (discObj.error != "bad request") {
      res.send({
        status: "500",
        message: discObj.error
      });
      return;
    }
  }
  console.log(`Price After : ${price}`);
  price = Math.round(parseFloat(price) * 100) / 100;
  console.log(`Price : ${price}`);
  const user = await User.findOne({ email: email }, function(err) {
    if (err != null) {
      console.error(`Can't find user | access db; Err : ${err}`);
      res.send({
        status: "500",
        message: `Its not you, its us. Please try again after sometime or contact-us at info@blockdegree.org`
      });
      return;
    }
  });
  if (course_id == "course_1") {
    payment_status = user.examData.payment.course_1;
  } else if (course_id == "course_2") {
    payment_status = user.examData.payment.course_2;
  } else if (course_id == "course_3") {
    payment_status = user.examData.payment.course_3;
  }
  if (price <= 0) {
    // free course !!
    if (!payment_status) {
      // if already not paid
      user.examData.payment[course_id] = true;
      try {
        user.save();
      } catch (err) {
        console.error(
          `Some error occured while updating the profile for user ${res.user.email}: `,
          err
        );
        res.send({
          status: "500",
          message: `Its not you, its us. Please try again after sometime or contact-us at info@blockdegree.org`
        });
      }
      return res.send({
        status: 201,
        message: "Course has been availed for free!"
      });
    }
  }

  if (payment_status != true) {
    invoice_number =
      "TXID" + Date.now() + (Math.floor(Math.random() * 1000) + 9999);
    var payReq = JSON.stringify({
      intent: "order",
      payer: {
        payment_method: "paypal"
      },
      redirect_urls: {
        return_url: `${process.env.HOST}/suc`,
        cancel_url: `${process.env.HOST}/err`
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
        return res.send({
          status: "500",
          message: "Some error occured while creating the Txn."
        });
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
          return res.send({
            status: "400",
            message: "no redirect URI present"
          });
        }
      }
    });
  } else {
    return res.send({ status: "400", message: "Payment already completed." });
  }
};

exports.payViaXdc = async (req, res) => {
  /*

  1. Register the receipt in-app

  2. Make a call to the burning service

  3. Return the hash from the burning service to the user

  4. Handle errors at in-built registration, error in making call to burning service, error in the burning service.

  */
  // if (
  //   req.body.txn_hash == undefined ||
  //   req.body.course == undefined ||
  //   req.body.price == undefined
  // ) {
  //   console.log(`Bad request from the user ${req.user.email}: `, req.body);
  //   res.json({ status: false, error: "Bad request" });
  // }
  // const txn_hash = req.body.txn_hash;
  // let price = req.body.price;
  // const course = req.body.course;
  // 0xb17fb11d4b6ca97dcd9811254c1d2598568a902389669c9290deb333426fba07
  // console.log(req.body);
  // res.json({ status: true, error: null });
  const retObj = await xdc3.eth.getTransaction(req.body.hash);
  const toAddr = retObj.to;
  const fromAddr = retObj.from;
  const value = retObj.value;
  console.log(retObj);
  $.ajax({
    method: "post",
    url: txReceiptUrl,
    data: { isTransfer: false, tx: req.body.hash },
    success: response => {
      isComplete = response.blockNumber != null;
    },
    error: xhr => {}
  });

  // const user = await User.findOne({ email: req.user.email }, function(err) {
  //   if (err != null) {
  //     console.error(`Can't find user | access db; Err : ${err}`);
  //     res.json({
  //       status: false,
  //       error: `Its not you, its us. Please try again after sometime or contact-us at info@blockdegree.org`
  //     });
  //     return;
  //   }
  // });
  // let newPaymentXDC = new PaymentXDC({
  //   email: req.user.email,
  //   course: course,
  //   price: price
  // });
};
