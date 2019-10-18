const paypal = require("paypal-rest-sdk");
const User = require("../models/user");
const PaymentLogs = require("../models/payment_logs");
const emailer = require("../emailer/impl");
const promoCodeService = require("../services/promoCodes");
const PaymentToken = require("../models/payment_token");
const CoursePrice = require("../models/coursePrice");
const XDC3 = require("xdc3");
const Web3 = require("web3");
const axios = require("axios");
const uuidv4 = require("uuid/v4");
const contractConfig = require("../config/smartContractConfig");
const keyConfig = require("../config/keyConfig");
const eventEmitter = require("../listeners/txnConfirmation").em;
const abiDecoder = require("abi-decoder");

const coinMarketCapAPI =
  "https://api.coinmarketcap.com/v1/ticker/xinfin-network/";

// const xdcePrice = 10;
const xdcPrice = 10;

// const xdc3 = new XDC3("https://rpc.xinfin.network/"); // setting up the instance for xinfin's mainnet provider

const txReceiptUrl = "https://explorer.xinfin.network/transactionRelay"; // make a POST with {isTransfer:false,tx:'abc'}

// Need to understand the complete flow and handle erros, unexpected shutdowns, inaccessible 3rd party.

const contractAddrRinkeby = contractConfig.address.rinkeby;
const contractABI = contractConfig.ABI;
const xdceAddrMainnet = contractConfig.address.xdceMainnet;
const xdceABI = contractConfig.XdceABI;
const transferFunctionStr = "transfer(address,uint)";
const XDCE = "xdce";
const XDC = "xdc";
const xdceOwnerPubAddr = "0x4f72d2cd0f4152f4185b2013fb45Cc3A9B89d99E";

const divisor = 1000000; // for testing purposes 1 million'th of actual value will be used

// const xdceTolerance = 5; // tolerance set to 5 percent of principal value.

abiDecoder.addABI(xdceABI);

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

  const web3 = new Web3(
    new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws")
  );
  const contractInst = new web3.eth.Contract(contractABI, contractAddrRinkeby);

  if (req.body.txn_hash == undefined || req.body.course == undefined) {
    console.log(`Bad request from the user ${req.user.email}: `, req.body);
    res.json({ status: false, error: "Bad request" });
    return;
  }
  const txn_hash = req.body.txn_hash;
  const course = req.body.course;
  // let txnObj;

  // txnObj = await axios.post(txReceiptUrl, {
  //   isTransfer: false,
  //   tx: txn_hash
  // });
  // Verify the amt, to & time
  // console.log(txnObj.data);
  // let priceInUsd,
  //   priceObj,
  //   tolerance = 5;
  // const constPrice = 9.99;
  // priceObj = await axios.get(
  //   "https://api.coinmarketcap.com/v1/ticker/xinfin-network/"
  // );
  // priceInUsd = priceObj.data[0].price_usd;
  // console.log(priceObj.data[0], priceInUsd);
  // // $.ajax({
  // //   method: "get",
  // //   url: "https://api.coinmarketcap.com/v1/ticker/xinfin-network/",
  // //   success: response => {
  // //     priceInUsd = response.price_usd;
  // //   },
  // //   error: xhr => {}
  // // });

  // let expectedXdc = constPrice / (10000 * priceInUsd); // 10000 multiplier for testing purpose
  // console.log(expectedXdc);

  // console.log(
  //   `Difference: ${Math.abs(parseFloat(txnObj.data.value) - expectedXdc)}`
  // );
  // console.log(`Tolerance: ${(tolerance / 100) * 100}`);

  // if (
  //   Math.abs(parseFloat(txnObj.data.value) - expectedXdc) / expectedXdc <=
  //   (tolerance / 100) * expectedXdc
  // ) {
  // tolerance of 10 %
  // valid amount
  let user;
  try {
    user = await User.findOne({ email: req.user.email });
  } catch (e) {
    console.log(
      `Exception occured while fetching user for payment.PayViaXdc :`,
      e
    );
    res.json({ status: false, error: "Internal error" });
    return;
  }
  let newPaymentXDC = new PaymentXDC({
    payment_id: uuidv4(),
    email: user.email,
    course: course,
    price: req.body.price, // only for testing.
    creationDate: Date.now(),
    txn_hash: txn_hash
  });
  user.examData.payment[course] = true;

  // let encodedTx = contractInst.methods.transfer("0x4f72d2cd0f4152f4185b2013fb45Cc3A9B89d99E",);
  //   .burnToken("app_id", "name", txn_hash)
  //   .encodeABI();
  let gp = await web3.eth.getGasPrice();
  let tx = {
    to: "0x0000000000000000000000000000000000000000",
    // data: encodedTx,
    value: web3.utils.toHex(100),
    gas: web3.utils.toHex(3000000),
    gasPrice: web3.utils.toHex(100 * gp)
  };

  web3.eth.sendTransaction(tx, (err, result) => {
    if (err) {
      $.notify(
        "Some error occured while processing your transaction, please try again after sometime",
        { type: "danger" }
      );
      return;
    } else {
      $.notify(
        `Transaction successfully placed, your tx is :${result.transactionHash}, please wait it might take sometime to confirm your payment `,
        { type: "info" }
      );
      return;
    }
  });

  // let privateKey = keyConfig.privateKey;

  // web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
  //   web3.eth
  //     .sendSignedTransaction(signed.rawTransaction)
  //     .on("receipt", console.log);
  // });

  try {
    newPaymentXDC.save();
    user.save();
  } catch (e) {
    console.log(
      `Some error has occurred while saving the data at payment.payViaXdc`,
      e
    );
    res.json({ status: false, error: "Internal Error" });
    return;
  }
  res.json({ status: true, error: null, txnHash: txn_hash });
  // } else {
  //   res.json({ status: false, error: "Invalid amount" });
  //   return;
  // }
};

exports.payViaXdce = async (req, res) => {
  /*

  1. Register the receipt in-app

  2. Make a call to the burning service

  3. Return the hash from the burning service to the user

  4. Handle errors at in-built registration, error in making call to burning service, error in the burning service.

  */
  try {
    const txn_hash = req.body.txn_hash;
    const course = req.body.course;
    const price = req.body.price;
    console.log("Called the function PayViaXdce");
    console.log("Hash: ", txn_hash, "typeof: ", typeof txn_hash);

    console.log(course);
    const coursePrice = await CoursePrice.findOne({ courseId: course });
    console.log(coursePrice);
    const xdcePrice = await getXinEquivalent(coursePrice.priceUsd);
    const xdceTolerance = coursePrice.xdceTolerance;
    const web3 = new Web3(
      new Web3.providers.WebsocketProvider(
        "wss://mainnet.infura.io/ws/v3/9670d19506ee4d738e7f128634a37a49"
      )
    );
    // for demo: 0x19d544825bd0436efc2dcb99d415d34840fe14d8171ec1047a91323ee3c3eaed, 0x55ede32eae710eed3d21456db6fb01c5e16fcfb04292e72bc0e451fc6693ff8a
    if (txn_hash == "") {
      console.error("Bad request: txn_hash is missing from the request");
      return res.json({ error: "bad request", status: false });
    }
    const contractInst = new web3.eth.Contract(xdceABI, xdceAddrMainnet);
    let txReceipt = "";
    let txMinedLimit = 10 * 60 * 1000; // will listen for mining of the trn_hash for 5 minutes.
    let startTime = Date.now();
    let TxMinedListener = setInterval(async () => {
      console.log(`Interval for Tx mining`);
      if (Date.now() - startTime > txMinedLimit) {
        TxMinedListener = clearInterval(TxMinedListener);
        res.json({
          status: false,
          error:
            "Looks like its taking more time than usual to for the transaction to be mined. We'll update you when its done."
        });
        eventEmitter.emit(
          "listenTxMined",
          txn_hash,
          1,
          req.user.email,
          price,
          course
        );
        return;
      }
      txReceipt = await web3.eth.getTransactionReceipt(txn_hash);
      if (txReceipt != null) {
        // txnMined.
        console.log(`Got the tx receipt for the tx: ${txn_hash}`);

        const duplicateTx = await PaymentToken.findOne({
          txn_hash: txReceipt.transactionHash
        });
        if (duplicateTx != null) {
          // this transaction is already recorded
          console.log(
            `User ${req.user.email} tried to double spend hash: ${txReceipt.transactionHash}`
          );
          TxMinedListener = clearInterval(TxMinedListener);
          res.json({ error: "duplicate transation", status: false });
          return;
        }
        let getTx = await web3.eth.getTransaction(txn_hash);
        let txInputData = getTx.input;

        let decodedMethod = abiDecoder.decodeMethod(txInputData);
        console.log(decodedMethod);
        console.log("Expected Price: ", xdcePrice);
        console.log("Actual Price: ", decodedMethod.params[1].value);
        let valAcceptable =
          parseFloat(xdcePrice) - parseFloat(xdcePrice * xdceTolerance) / 100 <=
            parseFloat(decodedMethod.params[1].value) &&
          parseFloat(decodedMethod.params[1].value) <=
            parseFloat(xdcePrice) + parseFloat(xdcePrice * xdceTolerance) / 100;
        if (!valAcceptable) {
          TxMinedListener = clearInterval(TxMinedListener);
          console.log(
            `Invalid value in tx ${txn_hash} by the user ${
              req.user.email
            } at network ${1}`
          );
          res.json({ error: "Invalid transaction", status: false });
          return;
        }
        let expectedData = contractInst.methods
          .transfer(xdceOwnerPubAddr, parseInt(decodedMethod.params[1].value))
          .encodeABI();
        let validFuncSig = expectedData === txInputData && valAcceptable;
        // console.log(validFuncSig);
        console.log(abiDecoder.decodeMethod(txInputData));

        // console.log(expectedData === txInputData);
        // let validFuncSig = expectedData === txInputData;
        // console.log(validFuncSig);
        if (!validFuncSig) {
          // invalid transaction;
          TxMinedListener = clearInterval(TxMinedListener);
          res.json({ error: "Invalud transaction", status: false });
          return;
        }
        const blockData = await web3.eth.getBlock(txReceipt.blockNumber);
        if (blockData != null) {
          const txTimestamp = blockData.timestamp;
          if (!(Date.now() - txTimestamp > 24 * 60 * 60 * 1000)) {
            // tx timedout
            TxMinedListener = clearInterval(TxMinedListener);
            res.json({ error: "tx timed out", status: false });
            return;
          }
        }
        /* 
        1. check if the to is our address - done
        2. check if the value is within the tolerance of our system - done
        3. check if the blockdate is not older than 12 hrs - done
        4. check if the transaction is already recorded - done
      */
        let newPaymentXdce = newPaymentToken();
        newPaymentXdce.payment_id = uuidv4();
        newPaymentXdce.email = req.user.email;
        newPaymentXdce.creationDate = Date.now();
        newPaymentXdce.txn_hash = txn_hash;
        newPaymentXdce.course = course;
        newPaymentXdce.tokenName = XDCE;
        newPaymentXdce.price = coursePrice.priceUsd;
        newPaymentXdce.tokenAmt = xdcePrice + "";
        newPaymentXdce.status = "pending";
        try {
          await newPaymentXdce.save();
        } catch (e) {
          console.error(`Some error occured while saving the payment log: `, e);
          TxMinedListener = clearInterval(TxMinedListener);
          res.json({
            status: false,
            error: "errorwhile saving the new payment log"
          });
          return;
        }
        TxMinedListener = clearInterval(TxMinedListener);
        res.json({ status: true, error: null });
        eventEmitter.emit("listenTxConfirm", txn_hash, 1, req.user.email);
        return;
      }
    }, 3000);
  } catch (e) {
    console.error("Some error occured at payment.payViaXdce: ", e);
    res.json({ status: false, error: "Internal error" });
  }
  // let TxConfirmed = setInterval(async () => {
  //   if (txReceipt != "") {
  //     // got a receipt
  //     const currentBlock = await web3.eth.getBlockNumber();
  //     const confirmations = currentBlock - txReceipt.blockNumber;
  //     if (confirmations > 3) {
  //       // required confirmations met.
  //       let user;
  //       try {
  //         user = await User.findOne({ email: req.user.email });
  //       } catch (e) {
  //         console.log(
  //           `Exception occured while fetching user for payment.PayViaXdc :`,
  //           e
  //         );
  //         res.json({ status: false, error: "Internal error" });
  //         clearInterval(TxConfirmed);
  //         return;
  //       }
  //       let newPaymentXdce = newPaymentToken();
  //       newPaymentXdce.payment_id = uuidv4();
  //       newPaymentXdce.email = req.user.email;
  //       newPaymentXdce.creationDate = Date.now();
  //       newPaymentXdce.txn_hash = txn_hash;
  //       newPaymentXdce.course = course;
  //       newPaymentXdce.tokenName = XDCE;
  //       newPaymentXdce.price = req.body.price;
  //       newPaymentXdce.status = "complete";
  //       user.examData.payment[course] = true;
  //       try {
  //         await newPaymentXDC.save();
  //         await user.save();
  //       } catch (e) {
  //         console.log(
  //           `Some error has occurred while saving the data at payment.payViaXdc`,
  //           e
  //         );
  //         res.json({ status: false, error: "Internal Error" });
  //         clearInterval(TxConfirmed);
  //         return;
  //       }
  //       res.json({ status: true, error: null, txnHash: txn_hash });
  //       clearInterval(TxConfirmed);
  //       return;
  //     }
  //   }
  // }, 1000);
};

function newPaymentToken() {
  return new PaymentToken({
    payment_id: "",
    email: "",
    creationDate: "",
    txn_hash: "",
    course: "",
    tokenName: "",
    tokenAmt: "",
    price: "",
    status: "" // pending, complete or rejected
  });
}

async function getXinEquivalent(amnt) {
  try {
    const currXinPrice = await axios.get(coinMarketCapAPI);
    if (
      currXinPrice.data[0] != undefined ||
      currXinPrice.data[0] != undefined
    ) {
      const retPrice =
        (parseFloat(amnt) /
          (parseFloat(currXinPrice.data[0].price_usd) * divisor)) *
        Math.pow(10, 18);
      return retPrice;
    }
  } catch (e) {
    console.error(
      "Some error occurred while making or processing call from CoinMarketCap"
    );
    return -1;
  }
}
