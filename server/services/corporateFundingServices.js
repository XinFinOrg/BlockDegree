const uuid = require("uuid/v4");
const _ = require("lodash");

const BulkCourseFunding = require("../models/bulkCourseFunding");
const UserFundRequest = require("../models/userFundRequest");
const CorporateUser = require("../models/corporateUser");

const donationEm = require("../listeners/donationListener").em;

const userCurrencyHelper = require("../helpers/userCurrency");
const { usdToXdc } = require("../helpers/cmcHelper");

exports.generateBulkAddress = async (req, res) => {
  try {
    const { fundIds, type } = req.body;
    const email = req.user ? req.user.email : "asd@gmail.com";
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
          error: "fund(s) not foun or in progress/completed",
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

function validBulkType(type) {
  return type === "bulk" || "corporate";
}
