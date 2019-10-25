const mongoose = require("mongoose");

// schema for maintaning the records of the payments done via XDC

const burnLogSchema = mongoose.Schema({
  principal_payment_id: { type: String, unique: true },
  principal_userEmail: String,
  principal_txn_hash: { type: String, unique: true },
  course: String,
  tokenName: String,
  tokenAmt: String,
  principal_from:String,
  from:String,
  to:String,
  creationDate: String
});

module.exports = mongoose.model("Burn_Log", burnLogSchema);
