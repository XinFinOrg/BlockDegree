const uuid = require("uuid/v4");
const _ = require("lodash");
const paypal = require("paypal-rest-sdk");

const BulkCourseFunding = require("../models/bulkCourseFunding");
const UserFundRequest = require("../models/userFundRequest");
const CorporateUser = require("../models/corporateUser");
const PaypalPayment = require("../models/paypalPayment");

const donationEm = require("../listeners/donationListener").em;

const userCurrencyHelper = require("../helpers/userCurrency");
const { usdToXdc } = require("../helpers/cmcHelper");
const {
  SaveCorporateLogo,
  RenderCorporateDummy,
} = require("../helpers/saveCorporateProfile");
exports.generateBulkAddress = async (req, res) => {
  try {
    const { fundIds, type } = req.body;

    const email = req.user ? req.user.companyEmail : "asd@gmail.com";
    if (
      _.isEmpty(email) ||
      !_.isArray(fundIds) ||
      fundIds.length === 0 ||
      !validBulkType(type)
    ) {
      return res.json({ status: false, error: "missing parameter(s)" });
    }
    const funds = [],
      fundsArr = [];
    let totalAmount = 0,
      totalAmountXdc = 0;
    for (let i = 0; i < fundIds.length; i++) {
      const fund = await UserFundRequest.findOne({ fundId: fundIds[i] });
      if (fund === null || fund.status !== "uninitiated") {
        return res.json({
          status: false,
          error: "fund(s) not found or in progress/completed",
        });
      }
      fundsArr.push({
        fundId: fund.fundId,
        amountGoal: fund.amountGoal,
        userEmail: fund.email,
      });
      funds.push(fund);
      totalAmount += fund.amountGoal;
      totalAmountXdc += await usdToXdc(fund.amountGoal);
    }
    const newAddr = userCurrencyHelper.createNewAddress();
    const stub = {
      bulkId: uuid(),
      type: type,
      amountGoal: totalAmount,
      receiveAddr: newAddr.address,
      receiveAddrPrivKey: newAddr.privateKey,
      status: "uninitiated",
      fundIds: fundsArr,
    };
    if (type === "bulk") {
      const user = await User.findOne({ email: email });
      if (user === null) {
        return res.json({ status: false, error: "user not found" });
      }
      stub["donerEmail"] = user.email;
      stub["donerName"] = user.name;
    } else {
      const corporateUser = await CorporateUser.findOne({
        companyEmail: email,
      });
      if (corporateUser === null) {
        return res.json({ status: false, error: "user not found" });
      }
      (stub["companyEmail"] = email),
        (stub["companyName"] = corporateUser.companyName);
    }
    const newBulkPayment = new BulkCourseFunding(stub);
    await newBulkPayment.save();
    res.json({
      status: true,
      data: {
        address: newAddr.address,
        amount: totalAmount,
        xdc: totalAmountXdc,
      },
    });
    donationEm.emit("bulkRecipients");
  } catch (e) {
    console.log(`exception at ${__filename}.generateBulkAddress: `, e);
    return res.json({ status: false, error: "internal error" });
  }
};

exports.updateCompanyLogo = async (req, res) => {
  try {
    if (_.isEmpty(req.files.companyLogo)) {
      return res.json({ status: false, error: "missing paramter(s)" });
    }
    const companyEmail = req.user.email;
    const companyLogo = Buffer.from(req.files.companyLogo.data).toString(
      "base64"
    );
    const user = await CorporateUser.findOne({ companyEmail });
    if (user === null) {
      return res.json({ status: false, error: "user not found" });
    }
    user.companyLogo = companyLogo;
    let logoSaved = await SaveCorporateLogo(user.uniqueId, companyLogo);
    if (logoSaved !== true) {
      return res.json({ status: false, error: "internal error" });
    }
    let dummyCertiSaved = await RenderCorporateDummy(
      user.companyName,
      user.uniqueId
    );
    if (dummyCertiSaved !== true) {
      return res.json({ status: false, error: "internal error" });
    }
    await user.save();
    res.json({ status: true });
  } catch (e) {
    res.json({ status: false, error: "internal error" });
  }
};

/**
 * can only update company name and company logo
 */
exports.updateProfile = async (req, res) => {
  try {
    const companyEmail = req.user.companyEmail;
    const { companyName, companyLogoName } = req.body;
    const companyLogo = Buffer.from(req.files.companyLogo.data).toString(
      "base64"
    );
    const corporateUser = await CorporateUser.findOne({ companyEmail });
    console.log(companyName, companyLogo, companyLogoName);

    if (
      _.isEmpty(companyName) ||
      companyLogo === null ||
      companyLogo === undefined ||
      _.isEmpty(companyLogo) ||
      _.isEmpty(companyLogoName)
    ) {
      return res.json({ status: false, error: "missing parameter(s)" });
    }
    if (corporateUser === null) {
      return res.json({ status: false, error: "user not found" });
    }
    corporateUser.companyName = companyName;
    corporateUser.companyLogo = companyLogo;
    corporateUser.companyLogoName = companyLogoName;

    let logoSaved = await SaveCorporateLogo(
      corporateUser.uniqueId,
      companyLogo
    );
    if (logoSaved !== true) {
      return res.json({ status: false, error: "internal error" });
    }
    let dummyCertiSaved = await RenderCorporateDummy(
      corporateUser.companyName,
      corporateUser.uniqueId
    );
    if (dummyCertiSaved !== true) {
      return res.json({ status: false, error: "internal error" });
    }

    await corporateUser.save();
    return res.json({ status: true });
  } catch (e) {
    return res.json({ status: false, error: "internal error" });
  }
};

exports.startPaymentPaypal = async (req, res) => {
  try {
    const { fundIds } = req.body;
    const type = "corporate";
    const email = req.user ? req.user.companyEmail : "asd@gmail.com";
    if (_.isEmpty(email) || !_.isArray(fundIds) || fundIds.length === 0) {
      return res.json({ status: false, error: "missing parameter(s)" });
    }
    const funds = [],
      fundsArr = [];
    let totalAmount = 0;
    for (let i = 0; i < fundIds.length; i++) {
      const fund = await UserFundRequest.findOne({ fundId: fundIds[i] });
      if (fund === null || fund.status !== "uninitiated") {
        return res.json({
          status: false,
          error: "fund(s) not found or in progress/completed",
        });
      }
      fundsArr.push({
        fundId: fund.fundId,
        amountGoal: fund.amountGoal,
        userEmail: fund.email,
      });
      funds.push(fund);
      totalAmount += fund.amountGoal;
    }
    // const newAddr = userCurrencyHelper.createNewAddress();
    const stub = {
      bulkId: uuid(),
      type: type,
      amountGoal: totalAmount,
      status: "uninitiated",
      fundIds: fundsArr,
    };

    const corporateUser = await CorporateUser.findOne({
      companyEmail: email,
    });
    if (corporateUser === null) {
      return res.json({ status: false, error: "user not found" });
    }
    (stub["companyEmail"] = email),
      (stub["companyName"] = corporateUser.companyName);

    const invoice_number =
      "TXID" + Date.now() + (Math.floor(Math.random() * 1000) + 9999);
    const customStr = JSON.stringify({
      bulkId: stub["bulkId"],
    });
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.HOST}/api/corp-pay-paypal-suc`,
        cancel_url: `${process.env.HOST}/api/corp-pay-paypal-err`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Student Course Funding",
                sku: "001",
                price: parseFloat(totalAmount),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: parseFloat(totalAmount),
          },
          description: `Funding for enrolling in the course by funder ${corporateUser.companyName} to fund ${fundIds.length} students`,
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
            stub["paypalId"] = invoice_number;
            const newPaypalPayment = new PaypalPayment({
              invoice_number: invoice_number,
              purpose: "corporate fund-my-degree",
              email: req.user.companyEmail,
              amount: totalAmount,
              status: false,
            });
            const newBulkPayment = new BulkCourseFunding(stub);
            await newPaypalPayment.save();
            await newBulkPayment.save();
            console.log(`got the approval url, redirecting user to paypal`);
            return res.json({ status: true, link: payment.links[i].href });
          }
        }
      }
    });
  } catch (e) {
    console.log(`exeception at ${__filename}: `, e);
    return res.json({ status: false, error: "internal error" });
  }
};

exports.paymentPaypalSuccess = async (req, res) => {
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
        res.redirect("/payment-error");

        await emailer.sendMail(
          process.env.SUPP_EMAIL_ID,
          "Payment-error: error while executing the sale for Corporate Funding",
          `While processing order for the user ${
            req.user.companyEmail
          } some error occured while executing the sale: ${error.response.toString()}. Please consider for re-imbursement.`
        );
        return;
      } else {
        let invoice_number = payment.transactions[0].invoice_number;
        let bulkId = JSON.parse(payment.transactions[0].custom.trim()).bulkId;

        const bulkPayment = await BulkCourseFunding.findOne({
          $and: [{ status: "uninitiated" }, { bulkId: bulkId }],
        });

        if (bulkPayment === null) {
          res.redirect("/payment-error");

          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            "Payment-error: error while executing the sale for Corporate Funding",
            `While processing order for the user ${req.user.companyEmail} some error occured while executing the sale for corp-fmd: cannot find bulk payment in mongodb. Please consider for re-imbursement.`
          );
          return;
        }

        const paypalLog = await PaypalPayment.findOne({ invoice_number });

        bulkPayment.status = "completed";
        bulkPayment.paypalId = invoice_number;
        bulkPayment.completionDate = Date.now() + "";

        paypalLog.status = true;

        await bulkPayment.save();
        await paypalLog.save();

        res.redirect("http://localhost:3001/payment-complete");
        donationEm.emit("processChildFMD", bulkId);
      }
    });
  } catch (e) {
    console.log(`exception at ${__filename}: `, e);
    res.redirect("/payment-error");
    await emailer.sendMail(
      process.env.SUPP_EMAIL_ID,
      "Payment-error: error while executing the sale for Corporate Funding",
      `While processing order for a corporate user some error occured while executing the sale for corp-fmd: cannot find bulk payment in mongodb. Please consider for re-imbursement.`
    );
  }
};

exports.paymentPaypalError = async (req, res) => {
  res.redirect("/payment-error");
  await emailer.sendMail(
    process.env.SUPP_EMAIL_ID,
    "Payment-error: error while executing the sale for Corporate Funding",
    `While processing order for the user ${req.user.companyEmail} some error occured while executing the sale for corp-fmd: cannot find bulk payment in mongodb. Please consider for re-imbursement.`
  );
  return;
};

exports.getCorpFunding = async (req, res) => {
  try {
    const companyEmail = await req.user.companyEmail;
    const corpFunds = await BulkCourseFunding.find({
      $and: [{ companyEmail }, { status: "completed" }, { type: "corporate" }],
    }).select({ receiveAddrPrivKey: 0 });
    res.json({ status: true, data: corpFunds });
  } catch (e) {
    console.log(`exception at ${__filename}.getCorpFunding: `, e);
    return res.json({ status: false, error: "internal error" });
  }
};

function validBulkType(type) {
  return type === "bulk" || "corporate";
}
