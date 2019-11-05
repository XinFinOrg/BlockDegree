const paypal = require("paypal-rest-sdk");
const User = require("../models/user");
const PaymentLogs = require("../models/payment_logs");
const emailer = require("../emailer/impl");
const promoCodeService = require("../services/promoCodes");
const PaymentToken = require("../models/payment_token");
const CoursePrice = require("../models/coursePrice");
const Notification = require("../models/notifications");
const AllWallet = require("../models/wallet");
const Web3 = require("web3");
const XDC3 = require("xdc3");
const axios = require("axios");
const uuidv4 = require("uuid/v4");
const contractConfig = require("../config/smartContractConfig");
const eventEmitter = require("../listeners/txnConfirmation").em;
const abiDecoder = require("abi-decoder");

const coinMarketCapAPI =
  "https://api.coinmarketcap.com/v1/ticker/xinfin-network/";

// const xdcePrice = 10;
const xdcPrice = 10;

// const xdc3 = new XDC3("https://rpc.xinfin.network/"); // setting up the instance for xinfin's mainnet provider

const txReceiptUrl = "https://explorer.xinfin.network/transactionRelay"; // make a POST with {isTransfer:false,tx:'abc'}
const txReceiptUrlApothem = "https://explorer.xinfin.network/transactionRelay"; // make a POST with {isTransfer:false,tx:'abc'}

const xinfinApothemRPC = "http://rpc.apothem.network";
const xinfinMainnetRPC = "http://rpc.xinfin.network";

// Need to understand the complete flow and handle erros, unexpected shutdowns, inaccessible 3rd party.

const contractAddrRinkeby = contractConfig.address.rinkeby;
const contractABI = contractConfig.ABI;
const xdceAddrMainnet = contractConfig.address.xdceMainnet;
const xdceABI = contractConfig.XdceABI;
const transferFunctionStr = "transfer(address,uint)";
const XDCE = "xdce";
const XDC = "xdc";
const xdceOwnerPubAddr = "0x4F85F740aCDCf01DF73Be4EB9558247E573097ff";
const xdcOwnerPubAddr = "xdc289da729d69ce09de5b543bc40be01e2cd9c1227";

const divisor = 1; // for testing purposes 1 million'th of actual value will be used

// const xdceTolerance = 5; // tolerance set to 5 percent of principal value.

abiDecoder.addABI(xdceABI);

exports.payPaypalSuccess = (req, res) => {
  let paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: req.query.PayerID
  };

  paypal.payment.execute(paymentId, execute_payment_json, async function(
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      res.status(500).render("displayError", {
        error:
          "Some error occured while executing the payment, please contact info@blockdegree.org"
      });

      await emailer.sendMail(
        process.env.SUPP_EMAIL_ID,
        "Payment-error: error while executing the sale",
        `While processing order for the user ${
          req.user.email
        } some error occured while executing the sale: ${error.response.toString()}. Please consider for re-imbursement.`
      );
      return;
    } else {
      // console.log(JSON.stringify(payment));
      // res.send("Success");
      let course_id = payment.transactions[0].item_list.items[0].name;
      let invoice_number = payment.transactions[0].invoice_number;
      let custom = payment.transactions[0].custom;
      const email = custom.split(";")[0].split(":")[1];
      const codeName = custom.split(";")[1].split(":")[1];
      console.log(custom.split(";"));
      console.log("Payment received from user ", email);

      User.findOne({ email: email }, async function(err, user) {
        if (err != null) {
          // CRITICAL: payment lost
          console.error(`Error: user not found || ${err}`);
          res.status(500).render("displayError", {
            error:
              "Some error occurred while processing your payment, your service ticket has been generated, please contact info@blockdegree.org"
          });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            "Re-embursement: payment lost",
            `The payment for the user ${email} was processed but some error occured and user's state was not updated. Please consider for re-embursement`
          );
          return;
        }
        if (course_id == "course_1") {
          user.examData.payment.course_1 = true;
          user.examData.payment.course_1_payment = `paypal:${invoice_number};promocode:${codeName}`;
        } else if (course_id == "course_2") {
          user.examData.payment.course_2 = true;
          user.examData.payment.course_2_payment = `paypal:${invoice_number};promocode:${codeName}`;
        } else if (course_id == "course_3") {
          user.examData.payment.course_3 = true;
          user.examData.payment.course_3_payment = `paypal:${invoice_number};promocode:${codeName}`;
        }
        try {
          await user.save();
        } catch (err) {
          // CRITICAL: payment lost
          console.error(
            `Exception while saving the user ${email} details: `,
            err
          );
          res.status(500).render("displayError", {
            error:
              "Some error occured while fetching / updating your profile, please contact info@blockdegree.org"
          });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            "Re-embursement: payment lost",
            `The payment for the user ${email} was processed & saved but some error occured & payment log was not generated.`
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
            `Exception while saving the user payment ${email} details: `,
            e
          );
          res.status(500).render("displayError", {
            error:
              "Your payment is complete but some error occured while fetching / updating your logs, please contact info@blockdegree.org"
          });
          await emailer.sendMail(
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
            `Exception while saving the user payment ${email} details: `,
            e
          );
          res.status(500).render("displayError", {
            error:
              "Your payment is complete but some error occured while fetching / updating your logs, please contact info@blockdegree.org"
          });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            "Data-loss: payment-log lost",
            `The payment for the user ${email} was processed & saved but some error occured and user's payment log is not generated. Please consider for re-embursement`
          );
          return;
        }
        console.log("course_id", course_id, email);
        await emailer.sendTokenMail(email, "", req, course_id);
        res.redirect("/payment-success");
      });
    }
  });
};

exports.payPaypal = async (req, res) => {
  try {
    let price = req.body.price;
    let email = req.user.email;
    let course_id = req.body.course_id;
    let payment_status;
    const discObj = await promoCodeService.usePromoCode(req);
    const course = await CoursePrice.findOne({ courseId: course_id });
    if (course === null) {
      // invalid course ID
      return res.render("displayError", {
        error: "Payment for a non-existing course."
      });
    }
    console.log(req.body);
    console.log(discObj);
    console.log(typeof price);
    console.log(`Price Before : ${price}`);
    console.log(`Discount Price : ${discObj.discAmt}`);
    if (price != course.priceUsd) {
      return res.render("displayError", {
        error: "Invalid Course Price"
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
        res.render("displayError", {
          error: discObj.error
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
        user.examData.payment[
          course_id + "_payment"
        ] = `promocode:${req.body.codeName}`;
        try {
          user.save();
        } catch (err) {
          console.error(
            `Some error occured while updating the profile for user ${res.user.email}: `,
            err
          );
          res.render("displayError", {
            error: `Its not you, its us. Please try again after sometime or contact-us at info@blockdegree.org`
          });
        }
        return res.redirect(process.env.HOST + "/exams?courseFree=true");
      }
    }

    console.log("Called payment 'payPapal'");

    if (payment_status != true) {
      invoice_number =
        "TXID" + Date.now() + (Math.floor(Math.random() * 1000) + 9999);

      console.log("Price  = ", price, " TypeOf Price: ", typeof price);

      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal"
        },
        redirect_urls: {
          return_url: `${process.env.HOST}/suc`,
          cancel_url: `${process.env.HOST}/err`
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: course_id.toString(),
                  sku: "001",
                  price: price.toString(),
                  currency: "USD",
                  quantity: 1
                }
              ]
            },
            amount: {
              currency: "USD",
              total: price.toString()
            },
            description: `Payment for enrolling in the course by user ${req.user.email}`,
            invoice_number: invoice_number,
            custom: `email:${req.user.email.toString()};codeName:${
              req.body.codeName
            }`
          }
        ]
      };

      paypal.payment.create(create_payment_json, async function(
        error,
        payment
      ) {
        if (error) {
          // throw error;
          console.error(
            "Some error occured while creating the payment: ",
            error
          );
          return res.render("displayError", { error: "Internal error." });
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              var payment_logs = new PaymentLogs();
              payment_logs.email = email;
              payment_logs.course_id = course_id;
              payment_logs.payment_id = invoice_number;
              payment_logs.payment_status = false;
              payment_logs.amount = price;
              await payment_logs.save();

              return res.redirect(payment.links[i].href);
            }
          }
        }
      });
    } else {
      return res.render("displayError", {
        error: "Payment already completed."
      });
    }
  } catch (outerErr) {
    console.error(
      "Something went wrong while processing the payment: ",
      outerErr
    );
    return res.render("displayError", { error: "internal error" });
  }
};

exports.payViaXdc = async (req, res) => {
  /*

  1. Register the receipt in-app

  2. Make a call to the burning service

  3. Return the hash from the burning service to the user

  4. Handle errors at in-built registration, error in making call to burning service, error in the burning service.

  */

  try {
    const txn_hash = req.body.txn_hash;
    const course = req.body.course;
    let price = req.body.price;
    console.log("Called the function PayViaXdc");
    console.log("Hash: ", txn_hash);
    const coursePrice = await CoursePrice.findOne({ courseId: course });
    let fullPrice = coursePrice.priceUsd;
    const discObj = await promoCodeService.usePromoCode(req);

    // check if the price is 9.99 if not then check if a propoer codeName has been supplied else makr invalid transfer.
    if (price != fullPrice) {
      // not equal check for promoCode
      if (discObj.error == null) {
        // all good, can avail promo-code discount
        console.log(fullPrice, discObj.discAmt);
        fullPrice =
          Math.round((parseFloat(fullPrice) - discObj.discAmt) * 100) / 100;
      } else {
        console.error(
          `Error while using promocode ${req.body.codeName}: `,
          discObj.error
        );

        if (discObj.error != "bad request") {
          res.json({
            status: false,
            error: discObj.error
          });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${req.user.email}`,
            `Some error occured while applying promo-code. Payment mode was via XDC. Payment transaction hash: ${txn_hash}`
          );
          return;
        }
      }
      if (price != fullPrice) {
        //invalid price
        console.log(`Invalid amount, expected ${fullPrice} actual ${price}`);
        await emailer.sendMail(
          process.env.SUPP_EMAIL_ID,
          `Re-embursement for user ${req.user.email}`,
          `User sent an invalid amount of course price. Payment mode was via XDC. Payment transaction hash: ${txn_hash}`
        );
        return res.json({ status: false, error: "Invalid amount" });
      }
    }

    if (price <= 0) {
      // free course; directly make the  status true.
      let user = await User.findOne({ email: req.user.email });
      if (user != null) {
        if (!user.examData.payment[course]) {
          user.examData.payment[course] = true;
          user.examData.payment[
            course + "_payment"
          ] = `promocode:${req.body.codeName}`;
          await user.save();
          return res.json({ status: true, error: null });
        } else {
          // already paid
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${req.user.email}`,
            `User tried to pay for an already paid course. Payment mode was via XDC. Payment transaction hash: ${txn_hash}`
          );
          return res.json({
            status: false,
            error: "Course is already paid for."
          });
        }
      } else {
        return res.json({ status: false, error: "user not found" });
      }
    }

    if (txn_hash == undefined || txn_hash == null || txn_hash == "") {
      return res.json({ status: false, error: "bad request, tx hash missing" });
    }

    let toAutoBurn = false;
    for (let g = 0; g < coursePrice.burnToken.length; g++) {
      if (coursePrice.burnToken[g].tokenName === XDC) {
        toAutoBurn = coursePrice.burnToken[g].autoBurn;
      }
    }

    const duplicateTx = await PaymentToken.findOne({
      txn_hash: txn_hash
    });
    if (duplicateTx != null) {
      // this transaction is already recorded
      console.log(
        `User ${req.user.email} tried to double spend hash: ${txn_hash}`
      );
      res.json({ error: "duplicate transation", status: false });
      return;
    }

    let newPaymentXdc = newPaymentToken();
    newPaymentXdc.payment_id = uuidv4();
    newPaymentXdc.email = req.user.email;
    newPaymentXdc.creationDate = Date.now();
    newPaymentXdc.txn_hash = txn_hash;
    newPaymentXdc.course = course;
    newPaymentXdc.tokenName = XDC;
    newPaymentXdc.price = coursePrice.priceUsd;
    newPaymentXdc.status = "not yet mined";
    newPaymentXdc.autoBurn = toAutoBurn; // capture the status of autoburn at the moment, this will be forwarded.
    newPaymentXdc.payment_network = "50"; // 50 - mainnet; 51 apothem
    await newPaymentXdc.save();
    console.log("saved");

    const xdcPrice = await getXinEquivalent(price);
    if (xdcPrice == -1) {
      await emailer.sendMail(
        process.env.SUPP_EMAIL_ID,
        `Re-embursement for user ${req.user.email}`,
        `Some error occured while fetching prices from coinmarketcap. Payment mode was via XDCe. Payment transaction hash: ${txn_hash}`
      );
    }
    const xdcTolerance = coursePrice.xdcTolerance;
    const web3 = new Web3(
      new Web3.providers.HttpProvider("http://rpc.xinfin.network")
    );
    const xdc3 = new XDC3(
      new XDC3.providers.HttpProvider("http://rpc.xinfin.network")
    );

    // for demo: 0x19d544825bd0436efc2dcb99d415d34840fe14d8171ec1047a91323ee3c3eaed, 0x55ede32eae710eed3d21456db6fb01c5e16fcfb04292e72bc0e451fc6693ff8a

    // No contract interaaction required, simple value check :)

    // const contractInst = new web3.eth.Contract(xdceABI, xdceAddrMainnet);

    // console.log("---------------------------------x-----------------------------------------")
    // const xdc3TxReceipt =xdc3.eth.getTransactionReceipt(
    //   "0x52916e20111c0a113cc7da6a9d39540e6b98238bc3e192f43b6089db108e781e"
    // );
    // console.log("---------------------------------x-----------------------------------------")

    let txReceipt = "";
    let txMinedLimit = 55 * 1000; // will listen for mining of the trn_hash for about 1 minute.
    let startTime = Date.now();
    let xdcOwnerPubAddr = await getXDCRecipient("50");
    if (xdcOwnerPubAddr == null) {
      console.error(
        "Some error occured at payment.payViaXdc while fetching the XDC recipient: "
      );
      res.json({
        error: "internal error",
        status: false
      });
      await emailer.sendMail(
        process.env.SUPP_EMAIL_ID,
        `Potential re-imbursement for the user ${req.user.email}`,
        `Some error occured while fetching the xdceOwnerPubAddr at payments.payViaXdce. TxHash: ${txn_hash}`
      );
      return;
    }
    let TxMinedListener = setInterval(async () => {
      console.log(`Interval for Tx mining`);
      if (Date.now() - startTime > txMinedLimit) {
        TxMinedListener = clearInterval(TxMinedListener);
        res.json({
          status: false,
          error:
            "Looks like its taking more time than usual to for the transaction to be mined on the XinFin network. We'll update you when its done in your <strong><a href='/profile?inFocus=cryptoPayment'>Profile</a></strong>"
        });
        eventEmitter.emit(
          "listenTxMined",
          txn_hash,
          50,
          req.user.email,
          coursePrice.priceUsd,
          course,
          req
        );
        return;
      }

      let txResponseReceipt = await axios({
        method: "post",
        url: txReceiptUrlApothem,
        data: {
          tx: txn_hash,
          isTransfer: false
        }
      });
      txReceipt = txResponseReceipt.data;
      if (
        txReceipt.blockNumber != undefined &&
        txReceipt.blockNumber != null &&
        typeof txReceipt.blockNumber == "number"
      ) {
        // txnMined.
        console.log(
          `Got the tx receipt for the tx: ${txn_hash} on XinFin Network`
        );
        let xdcTokenAmnt = parseFloat(txReceipt.value) * Math.pow(10, 18);
        let tknRecipient = txReceipt.to;
        if (tknRecipient !== xdcOwnerPubAddr) {
          return res.json({ error: "invalid receipient", status: false });
        }

        console.log("Expected Price: ", xdcPrice);
        console.log("Actual Price: ", xdcTokenAmnt);

        console.log(
          "Minimum Value: ",
          parseFloat(xdcPrice) - parseFloat(xdcPrice * xdcTolerance) / 100
        );
        console.log(
          "Maximum Value: ",
          parseFloat(xdcPrice) + parseFloat(xdcPrice * xdcTolerance) / 100
        );
        console.log("Actual Value: ", parseFloat(xdcTokenAmnt));

        let valAcceptable =
          parseFloat(xdcPrice) - parseFloat(xdcPrice * xdcTolerance) / 100 <=
            parseFloat(xdcTokenAmnt) &&
          parseFloat(xdcTokenAmnt) <=
            parseFloat(xdcPrice) + parseFloat(xdcPrice * xdcTolerance) / 100;
        if (!valAcceptable) {
          TxMinedListener = clearInterval(TxMinedListener);
          console.log(
            `Invalid value in tx ${txn_hash} by the user ${req.user.email} at network XinFin`
          );
          res.json({ error: "Invalid transaction", status: false });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${req.user.email}`,
            `User sent an invalid amount of token. Payment mode was via XDC. Payment transaction hash: ${txn_hash}`
          );
          return;
        }
        console.log(txReceipt.blockNumber);

        /* 
      1. check if the to is our address - done
      2. check if the value is within the tolerance of our system - done
      3. check if the blockdate is not older than 12 hrs - done
      4. check if the transaction is already recorded - done
    */

        let comPaymentToken = await PaymentToken.findOne({
          txn_hash: txReceipt.hash
        });
        if (comPaymentToken == null) {
          TxMinedListener = clearInterval(TxMinedListener);
          res.json({ error: "Internal error", status: false });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Fatal error for user ${req.user.email}`,
            `Fatal error occured while finding the tokne for transaction hash: ${txReceipt.hash} for user ${req.user.email}`
          );
          return;
        }

        let newNoti = newDefNoti();
        let newNotiId = uuidv4();
        newNoti.type = "info";
        newNoti.email = req.user.email;
        newNoti.eventName = "payment in pending";
        newNoti.eventId = newNotiId;
        newNoti.title = "Payment Mined";
        newNoti.message = `Your payment for course ${coursePrice.courseName} has been mined!, checkout your <a href="/profile?inFocus=cryptoPayment">Profile</a>`;
        newNoti.displayed = false;

        comPaymentToken.status = "pending";
        comPaymentToken.tokenAmt = xdcTokenAmnt;
        await comPaymentToken.save();
        await newNoti.save();

        res.json({ status: true, error: null });
        TxMinedListener = clearInterval(TxMinedListener);
        eventEmitter.emit(
          "listenTxConfirm",
          txn_hash,
          50,
          req.user.email,
          course,
          newNotiId,
          req.body.codeName
        );
        return;
      }
    }, 3000);
  } catch (e) {
    console.error("Some error occured at payment.payViaXdce: ", e);
    await emailer.sendMail(
      process.env.SUPP_EMAIL_ID,
      `Re-embursement for user ${req.user.email}`,
      `Some error occured at payment.payViaXdce. Payment mode was via XDC. Payment transaction hash: ${req.body.txn_hash}`
    );
    res.json({ status: false, error: "Internal error" });
  }
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
    let price = req.body.price;
    console.log("Called the function PayViaXdce");
    console.log("Hash: ", txn_hash);
    const coursePrice = await CoursePrice.findOne({ courseId: course });
    let fullPrice = coursePrice.priceUsd;
    const discObj = await promoCodeService.usePromoCode(req);

    const xdceOwnerPubAddr = await getXDCeRecipient("1");
    if (xdceOwnerPubAddr === null) {
      // some error occured while fetching the XdceOwnerPubAddr
      res.json({ error: "internal error", status: false });
      await emailer.sendMail(
        process.env.SUPP_EMAIL_ID,
        `Potential re-imbursement for the user ${req.user.email}`,
        `Some error occured while fetching the xdceOwnerPubAddr at payments.payViaXdce. TxHash: ${txn_hash}`
      );
      return;
    }
    // check if the price is 9.99 if not then check if a propoer codeName has been supplied else makr invalid transfer.
    if (price != fullPrice) {
      // not equal check for promoCode
      if (discObj.error == null) {
        // all good, can avail promo-code discount
        console.log(fullPrice, discObj.discAmt);
        fullPrice =
          Math.round((parseFloat(fullPrice) - discObj.discAmt) * 100) / 100;
      } else {
        console.error(
          `Error while using promocode ${req.body.codeName}: `,
          discObj.error
        );

        if (discObj.error != "bad request") {
          res.json({
            status: false,
            error: discObj.error
          });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${req.user.email}`,
            `Some error occured while applying promo-code. Payment mode was via XDCe. Payment transaction hash: ${txn_hash}`
          );
          return;
        }
      }
      if (price != fullPrice) {
        //invalid price
        console.log(`Invalid amount, expected ${fullPrice} actual ${price}`);
        await emailer.sendMail(
          process.env.SUPP_EMAIL_ID,
          `Re-embursement for user ${req.user.email}`,
          `User sent an invalid amount of course price. Payment mode was via XDCe. Payment transaction hash: ${txn_hash}`
        );
        return res.json({ status: false, error: "Invalid amount" });
      }
    }

    if (price <= 0) {
      // free course; directly make the  status true.
      let user = await User.findOne({ email: req.user.email });
      if (user != null) {
        if (!user.examData.payment[course]) {
          user.examData.payment[course] = true;
          user.examData.payment[
            course + "_payment"
          ] = `promocode:${req.body.codeName}`;
          await user.save();
          return res.json({ status: true, error: null });
        } else {
          // already paid
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${req.user.email}`,
            `User tried to pay for an already paid course. Payment mode was via XDCe. Payment transaction hash: ${txn_hash}`
          );
          return res.json({
            status: false,
            error: "Course is already paid for."
          });
        }
      } else {
        return res.json({ status: false, error: "user not found" });
      }
    }

    if (txn_hash == undefined || txn_hash == null || txn_hash == "") {
      return res.json({ status: false, error: "bad request, tx hash missing" });
    }

    let toAutoBurn = false;
    for (let g = 0; g < coursePrice.burnToken.length; g++) {
      if (coursePrice.burnToken[g].tokenName === XDCE) {
        toAutoBurn = coursePrice.burnToken[g].autoBurn;
      }
    }

    const duplicateTx = await PaymentToken.findOne({
      txn_hash: txn_hash
    });
    if (duplicateTx != null) {
      // this transaction is already recorded
      console.log(
        `User ${req.user.email} tried to double spend hash: ${txn_hash}`
      );
      res.json({ error: "duplicate transation", status: false });
      return;
    }

    let newPaymentXdce = newPaymentToken();
    newPaymentXdce.payment_id = uuidv4();
    newPaymentXdce.email = req.user.email;
    newPaymentXdce.creationDate = Date.now();
    newPaymentXdce.txn_hash = txn_hash;
    newPaymentXdce.course = course;
    newPaymentXdce.tokenName = XDCE;
    newPaymentXdce.price = coursePrice.priceUsd;
    newPaymentXdce.status = "not yet mined";
    newPaymentXdce.autoBurn = toAutoBurn; // capture trhe status of autoburn at the moment, this will be forwarded.
    newPaymentXdce.payment_network = "1";
    await newPaymentXdce.save();
    console.log("saved");

    const xdcePrice = await getXinEquivalent(price);
    if (xdcePrice == -1) {
      await emailer.sendMail(
        process.env.SUPP_EMAIL_ID,
        `Re-embursement for user ${req.user.email}`,
        `Some error occured while fetching prices from coinmarketcap. Payment mode was via XDCe. Payment transaction hash: ${txn_hash}`
      );
    }
    const xdceTolerance = coursePrice.xdceTolerance;
    const web3 = new Web3(
      new Web3.providers.WebsocketProvider(
        "wss://mainnet.infura.io/ws/v3/9670d19506ee4d738e7f128634a37a49"
      )
    );

    // for demo: 0x19d544825bd0436efc2dcb99d415d34840fe14d8171ec1047a91323ee3c3eaed, 0x55ede32eae710eed3d21456db6fb01c5e16fcfb04292e72bc0e451fc6693ff8a

    const contractInst = new web3.eth.Contract(xdceABI, xdceAddrMainnet);
    let txReceipt = "";
    let txMinedLimit = 55 * 1000; // will listen for mining of the trn_hash for about 1 minute.
    let startTime = Date.now();
    let TxMinedListener = setInterval(async () => {
      console.log(`Interval for Tx mining`);
      if (Date.now() - startTime > txMinedLimit) {
        TxMinedListener = clearInterval(TxMinedListener);
        res.json({
          status: false,
          error:
            "Looks like its taking more time than usual to for the transaction to be mined on the ethereum network. We'll update you when its done in your <strong><a href='/profile?inFocus=cryptoPayment'>Profile</a></strong>"
        });
        eventEmitter.emit(
          "listenTxMined",
          txn_hash,
          1,
          req.user.email,
          price,
          course,
          req
        );
        return;
      }
      txReceipt = await web3.eth.getTransactionReceipt(txn_hash);
      if (txReceipt != null) {
        // txnMined.
        console.log(`Got the tx receipt for the tx: ${txn_hash}`);

        // const duplicateTx = await PaymentToken.findOne({
        //   txn_hash: txReceipt.transactionHash
        // });
        // if (duplicateTx != null) {
        //   // this transaction is already recorded
        //   console.log(
        //     `User ${req.user.email} tried to double spend hash: ${txReceipt.transactionHash}`
        //   );
        //   TxMinedListener = clearInterval(TxMinedListener);
        //   res.json({ error: "duplicate transation", status: false });
        //   return;
        // }
        let getTx = await web3.eth.getTransaction(txn_hash);
        let txInputData = getTx.input;

        let decodedMethod = abiDecoder.decodeMethod(txInputData);
        console.log(decodedMethod);
        console.log("Expected Price: ", xdcePrice);
        console.log("Actual Price: ", decodedMethod.params[1].value);

        console.log(
          "Minimum Value: ",
          parseFloat(xdcePrice) - parseFloat(xdcePrice * xdceTolerance) / 100
        );
        console.log(
          "Maximum Value: ",
          parseFloat(xdcePrice) + parseFloat(xdcePrice * xdceTolerance) / 100
        );
        console.log(
          "Actual Value: ",
          parseFloat(decodedMethod.params[1].value)
        );

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
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${req.user.email}`,
            `User sent an invalid amount of token. Payment mode was via XDCe. Payment transaction hash: ${txn_hash}`
          );
          return;
        }
        console.log(
          decodedMethod.params[1].value,
          typeof decodedMethod.params[1].value
        );
        let expectedData = contractInst.methods
          .transfer(xdceOwnerPubAddr, decodedMethod.params[1].value)
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
          res.json({ error: "Invalid transaction", status: false });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${req.user.email}`,
            `User sent a transaction with invalid. Payment mode was via XDCe. Payment transaction hash: ${txn_hash}`
          );
          return;
        }
        const blockData = await web3.eth.getBlock(txReceipt.blockNumber);
        if (blockData != null) {
          const txTimestamp = blockData.timestamp;
          if (!(Date.now() - txTimestamp > 24 * 60 * 60 * 1000)) {
            // tx timedout
            TxMinedListener = clearInterval(TxMinedListener);
            res.json({ error: "tx timed out", status: false });
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement ( potential ) for user ${req.user.email}`,
              `Transaction timed out. Payment mode was via XDCe. Payment transaction hash: ${txn_hash}`
            );
            return;
          }
        }
        /* 
        1. check if the to is our address - done
        2. check if the value is within the tolerance of our system - done
        3. check if the blockdate is not older than 12 hrs - done
        4. check if the transaction is already recorded - done
      */

        let comPaymentToken = await PaymentToken.findOne({
          txn_hash: txReceipt.transactionHash
        });
        if (comPaymentToken == null) {
          res.json({ error: "Internal error", status: false });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Fatal error for user ${req.user.email}`,
            `Fatal error occured while finding the tokne for transaction hash: ${txReceipt.transactionHash} for user ${req.user.email}`
          );
          return;
        }

        let newNoti = newDefNoti();
        let newNotiId = uuidv4();
        newNoti.type = "info";
        newNoti.email = req.user.email;
        newNoti.eventName = "payment in pending";
        newNoti.eventId = newNotiId;
        newNoti.title = "Payment Mined";
        newNoti.message = `Your payment for course ${coursePrice.courseName} has been mined!, checkout your <a href="/profile?inFocus=cryptoPayment">Profile</a>`;
        newNoti.displayed = false;

        comPaymentToken.status = "pending";
        comPaymentToken.tokenAmt = decodedMethod.params[1].value.toString();
        await comPaymentToken.save();
        await newNoti.save();
        // let newPaymentXdce = newPaymentToken();
        // newPaymentXdce.payment_id = uuidv4();
        // newPaymentXdce.email = req.user.email;
        // newPaymentXdce.creationDate = Date.now();
        // newPaymentXdce.txn_hash = txn_hash;
        // newPaymentXdce.course = course;
        // newPaymentXdce.tokenName = XDCE;
        // newPaymentXdce.price = coursePrice.priceUsd;
        // newPaymentXdce.tokenAmt = xdcePrice + "";
        // newPaymentXdce.status = "pending";
        // newPaymentXdce.autoBurn = toAutoBurn; // capture trhe status of autoburn at the moment, this will be forwarded.
        // try {
        //   await newPaymentXdce.save();
        // } catch (e) {
        //   console.error(`Some error occured while saving the payment log: `, e);
        //   TxMinedListener = clearInterval(TxMinedListener);
        //   res.json({
        //     status: false,
        //     error: "error while saving the new payment log"
        //   });
        //   return;
        // }
        TxMinedListener = clearInterval(TxMinedListener);
        res.json({ status: true, error: null });
        eventEmitter.emit(
          "listenTxConfirm",
          txn_hash,
          1,
          req.user.email,
          course,
          newNotiId,
          req.body.codeName
        );
        return;
      }
    }, 3000);
  } catch (e) {
    console.error("Some error occured at payment.payViaXdce: ", e);
    await emailer.sendMail(
      process.env.SUPP_EMAIL_ID,
      `Re-embursement for user ${req.user.email}`,
      `Some error occured at payment.payViaXdce. Payment mode was via XDCe. Payment transaction hash: ${req.body.txn_hash}`
    );
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

exports.wrapCoinMarketCap = async (req, res) => {
  try {
    const currXinPrice = await axios.get(coinMarketCapAPI);
    return res.json({ data: currXinPrice.data, status: true, error: null });
  } catch (e) {
    console.error("Some error occured while getting currentXinPrice: ", e);
    return res.json({ data: null, status: false, error: "Internal errro" });
  }
};

exports.getUserPendingTx = async (req, res) => {
  try {
    const getAllPending = await PaymentToken.find({
      email: req.user.email,
      status: { $ne: "completed" }
    });
    return res.json({ error: null, status: true, data: getAllPending });
  } catch (e) {
    console.error(
      "Some error occured while fetching the pending payments of user."
    );
    return res.json({ error: "internal error", status: false, data: null });
  }
};

exports.getPaymentsToNotify = async (req, res) => {
  console.log("called getPaymentsToNotify");
  try {
    let pendingNotification = await Notification.find({
      email: req.user.email,
      displayed: false
    });
    for (let i = 0; i < pendingNotification.length; i++) {
      pendingNotification[i].displayed = true;
      pendingNotification[i].save();
    }
    return res.json({ notis: pendingNotification, status: true, error: false });
  } catch (e) {
    console.error(
      "Some exception has occured while fethcing pending notifications at payment.getpaymentsToNotify: ",
      e
    );
    return res.json({ status: false, error: "internal error", notis: false });
  }
};

// TO address for the frontend.
exports.getTokenRecipient = async (req, res) => {
  const network = req.body.wallet_network;
  const token_name = req.body.wallet_token_name;

  if (network === undefined || network === null || network === "") {
    return res.json({ error: "invalid network", status: false });
  }

  try {
    const retWallet = await AllWallet.findOne({
      recipientActive: {
        $elemMatch: {
          wallet_network: network,
          wallet_token_name: token_name
        }
      }
    });
    if (retWallet === null) {
      return res.json({ error: "not found", status: false, data: null });
    }
    for (let c = 0; c < retWallet.recipientActive.length; c++) {
      if (
        retWallet.recipientActive[c].wallet_network === network &&
        retWallet.recipientActive[c].wallet_token_name === token_name
      ) {
        return res.json({
          error: null,
          status: true,
          data: retWallet.recipientActive[c]
        });
      }
    }
  } catch (e) {
    console.error(
      "Some error occured while fetching the walletConfig at payment.ggetXDCePaymentRecipient: ",
      e
    );
    return res.json({ error: "internal error", status: false, data: null });
  }
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
    status: "", // pending, complete or rejected
    confirmations: "0",
    autoBurn: false,
    burn_txn_hash: "",
    burn_token_amnt: "",
    payment_network: ""
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

function newDefNoti() {
  return new Notification({
    email: "",
    eventName: "",
    eventId: "",
    type: "",
    title: "",
    message: "",
    displayed: false
  });
}

async function getXDCeRecipient(network) {
  const configWallet = await AllWallet.findOne();
  if (configWallet == null) {
    console.log("Wallet not configured");
    return null;
  }
  for (let i = 0; i < configWallet.recipientWallets.length; i++) {
    if (
      configWallet.recipientActive[i].wallet_token_name === "xdce" &&
      configWallet.recipientActive[i].wallet_network === network
    ) {
      return configWallet.recipientActive[i].wallet_address;
    }
  }
  return null;
}

async function getXDCRecipient(network) {
  const configWallet = await AllWallet.findOne();
  if (configWallet == null) {
    console.log("Wallet not configured");
    return null;
  }
  for (let i = 0; i < configWallet.recipientWallets.length; i++) {
    if (
      configWallet.recipientActive[i].wallet_token_name === "xdc" &&
      configWallet.recipientActive[i].wallet_network === network
    ) {
      return configWallet.recipientActive[i].wallet_address;
    }
  }
}
