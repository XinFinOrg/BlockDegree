const key = require("../config/cipherKey").mongooseKey;

const mongoose = require("mongoose");

const userWalletLogs = mongoose.Schema({
  from: String,
  to: String,
  value: String,
  status: { type: String, enum: ["pending", "completed"] },
  createdAt: String,
  createdAt: String,
});

module.exports = mongoose.model("UserWalletLogs", userWalletLogs);
