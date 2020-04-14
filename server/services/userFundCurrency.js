const userCurrenyHelper = require("../helpers/userCurrency");

exports.createFundCurrency = (req, res) => {
  try {
    const email = req.user.email;
    const description = req.body.description;

    
  } catch (e) {
    console.log(`exception at ${__filename}.createFundCurrency: `, e);
    res.json({ status: false, error: "internal error" });
  }
};
