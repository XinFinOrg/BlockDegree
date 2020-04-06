const mongoose = require("mongoose");

const userCurrencySchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  address: [
    {
      xdcAddress: { type: String, required: true },
      privKey: { type: String, required: true },
      fundId: { type: String, required: true }
    }
  ],
  tag: { type: String, required: true, unique: true },
  createdAt: String,
  updatedAt: String
});

module.exports = mongoose.model("UserCurrencies", userCurrencySchema);
