const mongoose = require("mongoose");

// schema for maintaning the records of the payments done via XDC

const xdcLogSchema = mongoose.Schema({
  email: String,
  creationDate: String,
  txn_hash: String,
  course: String,
  price: String
});

module.exports = mongoose.model("Payment_XDC", xdcLogSchema);
