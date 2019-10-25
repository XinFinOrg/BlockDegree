const mongoose = require("mongoose");

// schema for maintaning the records of the payments done via XDC

const tokenLogSchema = mongoose.Schema({
  payment_id: { type: String, unique: true },
  email: String,
  creationDate: String,
  txn_hash: { type: String, unique: true },
  course: String,
  tokenName: String,
  tokenAmt: String,
  price: String,
  status: String,
  confirmations: String,
  autoBurn:Boolean,
  burn_txn_hash: String,
  burn_token_amnt: String,
});

module.exports = mongoose.model("Payment_Token", tokenLogSchema);
