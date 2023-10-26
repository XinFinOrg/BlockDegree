const uuid = require("uuid/v4");
const _ = require("lodash");
const fs = require("fs");
const paypal = require("paypal-rest-sdk");
const BitlyClient = require("bitly").BitlyClient;
const ProfanityCheck = require("bad-words");
const CoursePrice = require("../models/coursePrice");
const UserFundReq = require("../models/userFundRequest");
const User = require("../models/user");
const RazorpayLog = require("../models/razorpay_payment");
const BulkPayment = require("../models/bulkCourseFunding");
const userCurrencyHelper = require("../helpers/userCurrency");
const emailer = require("../emailer/impl");
const donationEm = require("../listeners/donationListener").em;
const xdc3 = require("../helpers/blockchainConnectors.js").xdcInst;
const cmcHelper = require("../helpers/cmcHelper");
const burnEmitter = require("../listeners/burnToken").em;
const equateAddress = require("../helpers/common").equateAddress;
const WsServer = require("../listeners/websocketServer").em;
const renderFunderCerti = require("../helpers/renderFunderCerti");
const razorHelper = require("../helpers/razorHelper");
const bitly = new BitlyClient(process.env.BITLY_ACCESS_TOKEN, {});
const profanityChecker = new ProfanityCheck();
const razorKeyId = require("../config/razorPayKeys").keyId;
const {
  PostSocialTwitter,
  PostSocialLinkedin,
} = require("../helpers/postSocial");
const minDescChar = 10,
  maxDescChar = 250;

exports.requestNewFund = async (req, res) => {
  try {
    const email = req.user.email;
    const description = req.body.desc;
    const courseId = JSON.parse(req.body.courseId);
    const facebookProfile = req.body.facebookProfile;
    const linkedinProfile = req.body.linkedinProfile;
    const twitterProfile = req.body.twitterProfile;
    let templateNumber = req.body.templateNumber;
    let socialPostPlatform = req.body.socialPostPlatform;
    let msg = req.body.message;

    let requiresApproval = false;
    let totalAmount = 0;

    const user = await User.findOne({ email: email });

    if (user === null) {
      return res.json({ status: false, error: "user not found" });
    }

    if (
      _.isEmpty(description.trim()) ||
      courseId.length === 0 ||
      !templateNumber
    ) {
      return res.json({ status: false, error: "missing paramter(s)" });
    }

    if (
      _.isEmpty(user.auth.twitter.id) &&
      _.isEmpty(user.auth.linkedin.id)
    ) {
      return res.json({
        status: false,
        error: "please link any  one social account",
      });
    }
    const courseInsts = [];

    for (let i = 0; i < courseId.length; i++) {
      const currCourse = await CoursePrice.findOne({ courseId: courseId[i] });
      if (currCourse === null) {
        return res.json({ status: false, error: "course not found" });
      }
      if (user.examData.payment[currCourse.courseId] == true) {
        return res.json({ status: false, error: "course already bought" });
      }
      totalAmount += parseFloat(currCourse.priceUsd);
      courseInsts.push(currCourse);
    }

    // if (course === null) {
    //   return res.json({ status: false, error: "course not found" });
    // }

    // if (user.examData.payment[courseId] == true) {
    //   return res.json({ status: false, error: "course already bought" });
    // }

    if (description.length < minDescChar) {
      return res.json({ status: false, error: "description is too short" });
    } else if (description.length > maxDescChar) {
      return res.json({ status: false, error: "description is too long" });
    }

    const hasProfanity = profanityChecker.isProfane(description);

    if (hasProfanity === true) {
      requiresApproval = true;
    }

    const pendingRequest = await UserFundReq.findOne({
      $and: [
        {
          email: email,
        },
        // { valid: true },
        { $or: [{ status: "uninitiated" }, { status: "pending" }] },
      ],
    });

    if (pendingRequest !== null) {
      return res.json({
        status: false,
        error: "cannot create more than one request at a time",
      });
    }

    const newAddr = userCurrencyHelper.createNewAddress();
    if (newAddr === null) {
      return res.json({ status: false, error: "internal error" });
    }

    const newFund = generateNewFund(
      email,
      description,
      parseFloat(totalAmount),
      newAddr.address,
      newAddr.privateKey,
      courseId,
      requiresApproval
    );

    const requestPath = `https://www.blockdegree.org/fund-my-degree?fundId=${newFund.fundId}`;
    const shortUrl = await bitly.shorten(requestPath);
    newFund["requestUrlLong"] = requestPath;
    newFund["requestUrlShort"] = shortUrl.url;
    newFund["userName"] = user.name;

    if (!_.isEmpty(facebookProfile)) {
      newFund["socialProfile"]["facebook"] = facebookProfile;
    }
    if (!_.isEmpty(twitterProfile)) {
      newFund["socialProfile"]["twitter"] = twitterProfile;
    }
    if (!_.isEmpty(linkedinProfile)) {
      newFund["socialProfile"]["linkedin"] = linkedinProfile;
    }
    let shareId;
    if (socialPostPlatform === "twitter") {
      let b64content = fs
        .readFileSync(`server/fmd-templates/${templateNumber}.jpg`)
        .toString("base64");
        shareId = await PostSocialTwitter(
        req.user.email,
        msg+`Link:${shortUrl.url}`,
        b64content,
        `funding-request:${newFund.fundId}`
      );
    } else {
      let path = `server/fmd-templates/${templateNumber}.jpg`;
      shareId = await PostSocialLinkedin(
        req.user.email,
        msg+`Link:${shortUrl.url}`,
        path,
        `funding-request:${newFund.fundId}`
      );
    }

    newFund["shared"]=true;
    newFund["shareId"]=shareId;

    await newFund.save();
    if (hasProfanity === true) {
      return res.json({
        status: true,
        requestPending: true,
        // message: "new fund request submitted",
        // data: { shortUrl: shortUrl.url, longUrl: shortUrl.long_url },
      });
    }
    res.json({
      status: true,
      message: "new fund request submitted",
      data: {
        shortUrl: shortUrl.url,
        longUrl: shortUrl.long_url,
        userName: user.name,
        addr: newAddr.address,
        fundId: newFund.fundId,
        description: description,
        amountGoal: parseFloat(totalAmount),
      },
    });
    donationEm.emit("syncRecipients");
    WsServer.emit("fmd-trigger");
    if (requiresApproval === true) {
      await emailer.sendMailInternal(
        "blockdegree-bot@blockdegree.org",
        process.env.SUPP_EMAIL_ID,
        "Admin Approval Requested",
        `Hello, we have found some profanity / vulgur in the description of the FMD with id ${newFund.fundId} by the user with email $${newFund.email} `
      );
    }
  } catch (e) {
    console.log(`exception at ${__filename}.requestNewFund: `, e);
    return res.json({ status: false, error: "internal error" });
  }
};

/**
 * will initiate a listener for a valid TX
 */
exports.initiateDonation = async (req, res) => {
  try {
    const reqTx = req.body.tx;
    const donerEmail = req.user.email;
    const fundId = req.body.fundId;

    if (_.isEmpty(reqTx) || _.isEmpty(donerEmail) || _.isEmpty(fundId)) {
      return null;
    }

    const fund = await UserFundReq.findOne({ fundId: fundId });

    if (fund.valid !== true) {
      return res.json({ status: false, error: "invalid funding" });
    }

    if (fund.status !== "uninitiated") {
      return res.json({ status: false, error: "funding already in progress" });
    }

    if (fund.email === req.user.email) {
      return res.json({ status: false, error: "invalid funding" });
    }

    const doner = await User.findOne({ email: donerEmail });
    const priceUsd = parseFloat(fund.amountGoal);
    const existingTx = await UserFundReq.findOne({ fundTx: reqTx });

    if (existingTx !== null) {
      return res.json({ status: false, error: "invalid tx" });
    }

    const tx = await xdc3.eth.getTransaction(reqTx);
    if (tx !== null) {
      const valUsd = await cmcHelper.xdcToUsd(xdc3.utils.fromWei(tx.value));
      const min = priceUsd - (priceUsd * 10) / 100;
      const max = priceUsd + (priceUsd * 10) / 100;
      console.log(`min ${min} max ${max} valUsd ${valUsd}`);
      console.log(`|${tx.to}|${fund.receiveAddr}|`, tx);
      console.log("min: ", min <= parseFloat(valUsd));
      console.log("max: ", parseFloat(valUsd) <= max);
      console.log("equal address: ", tx.to == fund.receiveAddr);
      if (
        equateAddress(tx.to, fund.receiveAddr) &&
        min <= parseFloat(valUsd) &&
        parseFloat(valUsd) <= max
      ) {
        console.log("valid fund");

        // valid
        fund.fundTx = reqTx;
        fund.status = "pending";
        fund.donerEmail = donerEmail;
        fund.donerName = doner.name;
        await fund.save();
        donationEm.emit("processDonationTx", fundId, reqTx, doner.name);
        return res.json({ status: true, data: "listsner initiated" });
      } else {
        return res.json({ status: false, error: "invalid amount" });
      }
    } else {
      return res.json({ status: false, error: "invalid tx" });
    }
  } catch (e) {
    console.log(`exception at ${__filename}.initiateDonation: `, e);
    res.json({ status: false, error: "internal error" });
  }
};

/**
 * Form Submission URL
 */
exports.startFundPaypal = async (req, res) => {
  try {
    const fundId = req.body.fundId;
    const donerEmail = req.user.email;
    const doner = await User.findOne({ email: donerEmail });
    const currFundReq = await UserFundReq.findOne({ fundId: fundId });
    if (currFundReq === null) {
      return res.render("displayError", {
        error: "No such fund request exists",
      });
    }
    if (currFundReq.status !== "uninitiated") {
      return res.render("displayError", {
        error: "Fund request has already been funded",
      });
    }
    if (currFundReq.email == donerEmail) {
      return res.render("displayError", {
        error: "Cannot fund own request",
      });
    }
    const recipientUser = await User.findOne({ email: currFundReq.email });
    for (let i = 0; i < currFundReq.courseId.length; i++) {
      if (recipientUser.examData.payment[currFundReq.courseId[i]] === true) {
        return res.render("displayError", {
          error: "Courses in this fund request have now been paid for.",
        });
      }
    }
    let courseNames = "";
    for (let i = 0; i < currFundReq.courseId.length; i++) {
      courseNames += getCourseName(currFundReq.courseId[i]);
      if (i < currFundReq.courseId.length - 1) {
        courseNames += ", ";
      }
    }
    const invoice_number =
      "TXID" + Date.now() + (Math.floor(Math.random() * 1000) + 9999);
    const customStr = JSON.stringify({
      fundId: fundId,
      donerEmail: donerEmail,
    });
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.HOST}/fmd-pay-paypal-suc`,
        cancel_url: `${process.env.HOST}/fmd-pay-paypal-err`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: courseNames,
                sku: "001",
                price: currFundReq.amountGoal,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: currFundReq.amountGoal,
          },
          description: `Funding for enrolling in the course by funder ${doner.name} to the receipient ${recipientUser.name}`,
          invoice_number: invoice_number,
          custom: customStr,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async function (error, payment) {
      if (error) {
        // throw error;
        console.error("Some error occured while creating the payment: ", error);
        return res.render("displayError", { error: "Internal error." });
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            console.log(`got the approval url, redirecting user to paypal`);
            return res.redirect(payment.links[i].href);
          }
        }
      }
    });
  } catch (e) {
    console.log(`exception at ${__filename}.completeFundPaypal: `, e);
    return res.render("displayError", {
      error:
        "something went wrong, please try again or contact us at info@blockdegree.org",
    });
  }
};

exports.successFundPaypal = async (req, res) => {
  try {
    let paymentId = req.query.paymentId;

    const execute_payment_json = {
      payer_id: req.query.PayerID,
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (
      error,
      payment
    ) {
      if (error) {
        console.log(error.response);
        res.status(500).render("displayError", {
          error:
            "Some error occured while executing the payment, please contact info@blockdegree.org",
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
        console.log(JSON.stringify(payment));
        console.log(payment.transactions[0]);
        // res.send("Success");
        let courseNames = payment.transactions[0].item_list.items[0].name;
        let invoice_number = payment.transactions[0].invoice_number;
        console.log(payment.transactions[0].custom);

        let custom = JSON.parse(payment.transactions[0].custom.trim());
        const fundId = custom.fundId;
        const donerEmail = custom.donerEmail;
        const doner = await User.findOne({ email: donerEmail });
        const currFundReq = await UserFundReq.findOne({ fundId: fundId });
        if (doner === null || currFundReq === null) {
          res.status(500).render("displayError", {
            error:
              "Your payment is complete but some error occured while fetching / updating your logs, please contact info@blockdegree.org",
          });
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            "Payment-error: error while executing the sale",
            `While processing order for the user ${
              req.user.email
            } some error occured while executing the sale: ${error.response.toString()}. Please consider for re-imbursement.`
          );
        }
        const recipientUser = await User.findOne({ email: currFundReq.email });
        currFundReq.courseId.forEach((courseId) => {
          recipientUser.examData.payment[courseId] = true;
          recipientUser.examData.payment[
            courseId + "_payment"
          ] = `donation:${currFundReq.fundId}`;
          recipientUser.examData.payment[courseId + "_doner"] = doner.name;
        });
        currFundReq.status = "completed";
        currFundReq.paypalId = invoice_number;
        currFundReq.donerEmail = doner.email;
        currFundReq.donerName = doner.name;
        currFundReq.burnStatus = "pending";
        currFundReq["completionDate"] = Date.now() + "";
        await currFundReq.save();
        await recipientUser.save();
        req.session.message =
          "You can get more details about the funding from your <a href='/profile#fmd-funded'>Profile</a>";
        res.redirect("/payment-success");
        req.session.message =
          "You can get more details about the funding from your <a href='/profile#fmd-funded'>Profile</a>";
        res.redirect("/payment-success-video");
        burnEmitter.emit("donationTokenBurn", fundId);
        emailer.sendFMDCompleteUser(
          currFundReq.email,
          currFundReq.userName,
          courseNames
        );
        emailer.sendFMDCompleteFunder(
          currFundReq.donerEmail,
          currFundReq.userName,
          currFundReq.donerName,
          courseNames,
          currFundReq.requestUrlShort
        );
        renderFunderCerti.renderFunderCerti(
          currFundReq.donerName,
          currFundReq.fundId
        );
      }
    });
  } catch (e) {
    console.log(`exception at ${__filename}.successFundPaypal: `, e);
    res.render("displayError", {
      error:
        "Your payment is complete but some error occured while fetching / updating your logs, please contact info@blockdegree.org",
    });
  }
};

exports.initiateRazorpay = async (req, res) => {
  try {
    const email = req.user.email;
    const amount = req.body.amount;
    const fundId = req.body.fundId;
    if (_.isEmpty(amount) || _.isEmpty(fundId)) {
      return res.json({ status: false, error: "missing parameters" });
    }
    const amntFloat = parseFloat(amount);
    const fund = await UserFundReq.findOne({ fundId: fundId });
    const user = await User.findOne({ email: email });
    if (fund.email == email) {
      return res.json({ status: false, error: "Cannot fund own request" });
    }
    if (fund === null || user === null) {
      return res.json({ status: false, error: "fund/user not found" });
    }
    const newOrder = await razorHelper.createNewOrder(fundId, amntFloat);
    const razorpayLog = new RazorpayLog({
      status: "initiated",
      email: email,
      paymentId: "",
      orderId: newOrder.id,
      amount: `${newOrder.amount}`,
      receipt: fundId,
      signature: "",
    });
    await razorpayLog.save();
    res.json({
      status: true,
      data: {
        key: razorKeyId,
        orderId: newOrder.id,
        amnt: newOrder.amount,
        email: user.email,
        userName: user.name,
      },
    });
  } catch (e) {
    console.log(`exception at ${__filename}.initiateRazorpay: `, e);
    return res.json({ status: false, error: "internal error" });
  }
};

exports.completeRazorpay = async (req, res) => {
  try {
    const donerEmail = req.user.email;
    const paymentId = req.body.paymentId;
    const orderId = req.body.orderId;
    const signature = req.body.signature;

    const razorpayLog = await RazorpayLog.findOne({
      $and: [{ orderId: orderId }, { status: "initiated" }],
    });
    if (razorpayLog === null) {
      return res.json({ status: false, error: "fund not found" });
    }
    // do double validation
    razorpayLog.status = "completed";
    razorpayLog.paymentId = paymentId;
    razorpayLog.orderId = orderId;
    await razorpayLog.save();

    const fundId = razorpayLog.receipt;
    const currFundReq = await UserFundReq.findOne({ fundId: fundId });
    const doner = await User.findOne({ email: donerEmail });

    if (currFundReq === null || doner === null) {
      res.json({ status: false, error: "Fund not found" });
      emailer.sendMailInternal(
        "blockdegree-bot@blockdegree.org",
        process.env.SUPP_EMAIL_ID,
        "FMD: ERROR in Razorpay",
        `Some error occured while processing payment for user ${req.user.email} FundID: ${fundId} Fund not found. please consider re-embursement`
      );
      return;
    }
    const recipientUser = await User.findOne({ email: currFundReq.email });
    if (recipientUser === null) {
      res.json({ status: false, error: "Fund not found" });
      emailer.sendMailInternal(
        "blockdegree-bot@blockdegree.org",
        process.env.SUPP_EMAIL_ID,
        "FMD: ERROR in Razorpay",
        `Some error occured while processing payment for user ${req.user.email} FundID: ${fundId} Recipient User not found. please consider re-embursement`
      );
      return;
    }

    let courseNames = "";
    for (let i = 0; i < currFundReq.courseId.length; i++) {
      let courseId = currFundReq.courseId[i];
      recipientUser.examData.payment[courseId] = true;
      recipientUser.examData.payment[
        courseId + "_payment"
      ] = `donation:${currFundReq.fundId}`;
      recipientUser.examData.payment[courseId + "_doner"] = doner.name;
      if (i < currFundReq.courseId.length - 1) {
        courseNames += courseNames + `${getCourseName(courseId)}, `;
      } else {
        courseNames += courseNames + `${getCourseName(courseId)}`;
      }
    }

    currFundReq.status = "completed";
    currFundReq.razorpayId = razorpayLog.orderId;
    currFundReq.donerEmail = doner.email;
    currFundReq.donerName = doner.name;
    currFundReq.burnStatus = "pending";
    currFundReq.completionDate = `${Date.now()}`
    await currFundReq.save();
    await recipientUser.save();

    res.json({
      status: true,
    });

    burnEmitter.emit("donationTokenBurn", fundId);
    emailer.sendFMDCompleteUser(
      currFundReq.email,
      currFundReq.userName,
      courseNames
    );
    emailer.sendFMDCompleteFunder(
      currFundReq.donerEmail,
      currFundReq.userName,
      currFundReq.donerName,
      courseNames,
      currFundReq.requestUrlShort
    );
    renderFunderCerti.renderFunderCerti(
      currFundReq.donerName,
      currFundReq.fundId
    );
  } catch (e) {
    console.log(`exception at ${__filename}.completeRazorpay: `, e);
    res.json({ status: false, error: "internal error" });
    emailer.sendMailInternal(
      "blockdegree-bot@blockdegree.org",
      process.env.SUPP_EMAIL_ID,
      "ERROR in Razorpay",
      `Some error occured while processing payment for user ${
        req.user.email
      } error: ${String(e)}. please consider re-embursement`
    );
  }
};

/**
 * will return uninitiated funds, yet to get a fund
 */
exports.getUninitiatedFunds = async (req, res) => {
  try {
    const uninitiatedFunds = await UserFundReq.find({
      status: "uninitiated",
    })
      .select({ receiveAddrPrivKey: 0 })
      .lean();
    res.json({ status: true, data: uninitiatedFunds });
  } catch (e) {
    console.log(`exception at ${__filename}.getUninitiatedFunds`);
    res.json({ status: false, error: "internal error" });
  }
};

/**
 * will return all funds
 */
exports.getAllFunds = async (req, res) => {
  try {
    const uninitiatedFunds = await UserFundReq.find({
      $and: [
        {
          valid: true,
        },
        { status: { $not: /^pending$/ } },
      ],
    })
      .select({ receiveAddrPrivKey: 0 })
      .lean();
    res.json({
      status: true,
      data: uninitiatedFunds,
      country: req.session.country,
      userEmail: req.user.email,
    });
  } catch (e) {
    console.log(`exception at ${__filename}.getAllFunds`, e);
    res.json({ status: false, error: "internal error" });
  }
};

/**
 *
 */
exports.getUserFundReq = async (req, res) => {
  try {
    const email = req.user.email;
    const userFmd = await UserFundReq.find({
      email: email,
    })
      .select({ receiveAddrPrivKey: 0 })
      .lean();
    res.json({ status: true, data: userFmd });
  } catch (e) {
    console.log(`exception at ${__filename}.getUserFundReq`);
    res.json({ status: false, error: "internal error" });
  }
};

exports.getUserFMDFunded = async (req, res) => {
  try {
    const email = req.user.email;
    const userFmd = await UserFundReq.find({
      donerEmail: email,
    })
      .select({ receiveAddrPrivKey: 0 })
      .lean();
    res.json({ status: true, data: userFmd });
  } catch (e) {
    console.log(`exception at ${__filename}.getUserFMDFunded`);
    res.json({ status: false, error: "internal error" });
  }
};

/**
 * will return the cmc data
 */
exports.getCmcData = async (req, res) => {
  try {
  } catch (e) {
    console.log(`exception at ${__filename}.getCmcData: `, e);
    return res.json({ status: false, error: "internal error" });
  }
};

exports.claimFund = async (req, res) => {
  try {
    console.log("got the req: ", req.body);

    const fundId = req.body.fundId;
    const hash = req.body.hash;
    if (_.isEmpty(fundId) || _.isEmpty(hash)) {
      return res.json({ status: false });
    }
    const fund = await UserFundReq.findOne({ fundId: fundId });
    const user = await User.findOne({ email: req.user.email });

    if (fund === null || user === null) {
      return res.json({ status: false });
    }
    const recipient = await User.findOne({ email: fund.email });
    if (fund.status !== "completed" || recipient === null) {
      return res.json({ status: false });
    }
    console.log("got users");

    if (fund.email == req.user.email) {
      return res.json({ status: false });
    }

    const fundDoner = fund.donerEmail;
    let courseNames = "";
    if (fundDoner === undefined || fundDoner === "" || fundDoner === null) {
      if (fund.fundTx === hash) {
        fund.donerEmail = user.email;
        fund.donerName = user.name;
        for (let i = 0; i < fund.courseId.length; i++) {
          recipient.examData.payment[`${fund.courseId[i]}_doner`] = user.name;
          courseNames += getCourseName(fund.courseId[i]);
          if (i < fund.courseId.length - 1) {
            courseNames += ", ";
          }
        }
        await fund.save();
        await recipient.save();
        res.json({ status: true });
        WsServer.emit("fmd-trigger");
        await renderFunderCerti.renderFunderCerti(user.name, fundId);
        emailer.sendFMDCompleteFunder(
          user.email,
          fund.userName,
          user.userName,
          courseNames,
          fund.requestUrlShort
        );
      } else {
        res.json({ status: false });
      }
    } else {
      res.json({ status: false });
    }
  } catch (e) {
    console.log(`exception at ${__filename}.claimFund: `, e);
    res.json({ status: false });
  }
};

exports.startCorporateCoursePaymentXdc = async (req, res) => {
  try {
    const { companyEmail, companyName, courses, amountGoal } = req.body;
    console.log(companyEmail, companyName, courses);
    const newAddr = userCurrencyHelper.createNewAddress();
    const companyLogo = req.files.companyLogo;
    const priceXdc = await cmcHelper.getXdcPrice();
    const newCourse = new BulkPayment({
      bulkId: uuid(),
      type: "corporate",
      paymentMode: "xdc",
      courses: courses,
      amountGoal: amountGoal,
      receiveAddr: newAddr.address,
      receiveAddrPrivKey: newAddr.privateKey,
      status: "uninitiated",
      companyName: companyName,
      companyEmail: companyEmail,
      companyLogo: Buffer.from(companyLogo.data).toString("base64"),
    });
    await newCourse.save();
    res.json({
      status: true,
      data: {
        address: newAddr.address,
        xdcAmnt:
          Math.round(
            (parseFloat(amountGoal) * 1000000) / parseFloat(priceXdc)
          ) / 1000000,
      },
    });
    donationEm.emit("syncPendingBulkCoursePayments");
  } catch (e) {
    console.log(
      `exception at ${__filename}.startCorporateCoursePaymentXdc: `,
      e
    );
    res.json({ status: false, error: "inernal error" });
  }
};

exports.startCorporateCoursePaymentPaypal = async (req, res) => {
  try {
    const { companyEmail, companyName, courses, amountGoal } = req.body;
    const companyLogo = req.files.companyLogo;

    const newCourse = new BulkPayment({
      bulkId: uuid(),
      type: "corporate",
      paymentMode: "paypal",
      courses: courses,
      amountGoal: amountGoal,
      status: "uninitiated",
      companyName: companyName,
      companyEmail: companyEmail,
      companyLogo: Buffer.from(companyLogo.data).toString("base64"),
    });
    await newCourse.save();

    const invoice_number =
      "TXID" + Date.now() + (Math.floor(Math.random() * 1000) + 9999);
    const customStr = JSON.stringify({
      bulkId: newCourse.bulkId,
    });
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.HOST}/fmd-corporate-paypal-suc`,
        cancel_url: `${process.env.HOST}/fmd-corporate-paypal-err`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: courses[0],
                sku: "001",
                price: newCourse.amountGoal,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: newCourse.amountGoal,
          },
          description: `Course Funding`,
          invoice_number: invoice_number,
          custom: customStr,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async function (error, payment) {
      if (error) {
        // throw error;
        console.error("Some error occured while creating the payment: ", error);
        return res.json({ status: false, error: "internal error" });
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            console.log(`got the approval url, redirecting user to paypal`);
            return res.json({ status: true, data: payment.links[i].href });
          }
        }
      }
    });
  } catch (e) {
    console.log(
      `exception at ${__filename}.startCorporateCoursePaymentPaypal: `,
      e
    );
    res.json({ status: false, error: "internal error" });
  }
};

exports.fmdCorporatePaypalSuc = async (req, res) => {
  try {
    let paymentId = req.query.paymentId;

    const execute_payment_json = {
      payer_id: req.query.PayerID,
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (
      error,
      payment
    ) {
      if (error) {
        console.log(error.response);
        res.status(500).render("displayError", {
          error:
            "Some error occured while executing the payment, please contact info@blockdegree.org",
        });

        await emailer.sendMail(
          process.env.SUPP_EMAIL_ID,
          "Payment-error: error while executing the sale for COURSE PAYMENT",
          `While processing order for some user some error occured while executing the sale: ${error.response.toString()}. Please consider for re-imbursement.`
        );
        return;
      } else {
        console.log(JSON.stringify(payment));
        console.log(payment.transactions[0]);

        let invoice_number = payment.transactions[0].invoice_number;

        let custom = JSON.parse(payment.transactions[0].custom.trim());
        const bulkId = custom.bulkId;
        const bulkPayment = await BulkPayment.findOne({
          bulkId: bulkId,
          status: "uninitiated",
        });
        if (bulkPayment === null) {
          return res.render("displayError", { error: "Payment not found." });
        }
        bulkPayment.status = "completed";
        bulkPayment.completionDate = Date.now() + "";
        bulkPayment.paypalId = invoice_number;
        await bulkPayment.save();
        emailer.sendMailInternal(
          "blockdegree-bot@blockdegree.org",
          process.env.SUPP_EMAIL_ID,
          "Got Entire Course Payment",
          `Got a complete course payment from Company ${bulkPayment.companyName}, contact email is ${bulkPayment.companyEmail}. Bulk Payment id: ${bulkId}`
        );
        req.session.message =
          "Payment successful. Please contact <b>info@blockdegree.org</b> to proceed with the next steps.";
        res.redirect("/payment-success");
        req.session.message =
          "Payment successful. Please contact <b>info@blockdegree.org</b> to proceed with the next steps.";
        res.redirect("/payment-success-video");
      }
    });
  } catch (e) {
    console.log(`exception at ${__filename}.fmdCorporatePaypalSuc: `, e);
    res.json({ status: false, error: "internal error" });
  }
};

exports.fmdCorporatePaypalErr = async (req, res) => {
  try {
    res.render("displayError", {
      error:
        "Some error occured while processing your payment, please try again or contact at <b>info@blockdegree.org</b>",
    });
  } catch (e) {}
};

/**
 * will generate a model stub
 * @param {string} email
 * @param {Number} amountGoal
 * @param {string} recvAdd  r
 * @param {boolean=} approvalRequired
 */
function generateNewFund(
  email,
  description,
  amountGoal,
  recvAddr,
  recvAddrPrivKey,
  courseId,
  approvalRequired
) {
  return new UserFundReq({
    email: email,
    description: description,
    fundId: uuid(),
    courseId: courseId,
    amountGoal: amountGoal,
    amountReached: 0,
    approvalRequired: approvalRequired,
    valid: approvalRequired === false,
    receiveAddr: recvAddr,
    receiveAddrPrivKey: recvAddrPrivKey,
    fundTx: "",
    createdAt: Date.now() + "",
    updatedAt: Date.now() + "",
    burnAmnt: "",
    burnTx: "",
    burnStatus: "uninitiated",
  });
}

function getCourseName(id) {
  switch (id) {
    case "course_1":
      return "Blockchain Basic";
    case "course_2":
      return "Blockchain Advanced";
    case "course_3":
      return "Blockchain Professional";
    case "course_4":
      return "Cloud Computing";
    case "course_5":
      return "Blockchain Wallet";
    case "course_6":
      return "Blockchain Basic 2";
    default:
      return "";
  }
}
