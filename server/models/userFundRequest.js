const crypto = require("crypto");
const mongoose = require("mongoose");
const key = require("../config/cipherKey").mongooseKey;

function encrypt(text) {
  let cipher = crypto.createCipher("aes-256-cbc", key);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function decrypt(text) {
  if (text === null || typeof text === "undefined") {
    return text;
  }
  let decipher = crypto.createDecipher("aes-256-cbc", key);
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

const userFundRequest = mongoose.Schema({
  email: { type: String, required: true },
  userName: { type: String },
  fundId: { type: String, required: true, unique: true },
  courseId: [{ type: String }],
  requestUrlLong: { type: String },
  requestUrlShort: { type: String },
  socialProfile: {
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
  },
  amountGoal: { type: String, required: true },
  amountReached: { type: Number, required: true },
  description: { type: String, required: true },
  valid: { type: Boolean, required: true },
  approvalRequired: { type: Boolean, default: false },
  receiveAddr: { type: String, required: true, unique: true },
  receiveAddrPrivKey: {
    type: String,
    required: true,
    unique: true,
    set: encrypt,
    get: decrypt,
  },
  fundTx: { type: String },
  status: {
    type: String,
    default: "uninitiated",
    enum: ["uninitiated", "pending", "completed"],
  },
  paypalId: { type: String },
  razorpayId: { type: String },
  confirmation: { type: Number, default: 0 },
  donerEmail: { type: String },
  donerName: { type: String },
  burnStatus: {
    type: String,
    enum: ["uninitiated", "pending", "completed"],
    default: "uninitiated",
  },
  burnTx: { type: String },
  burnAmnt: { type: String },
  createdAt: String,
  updatedAt: String,
  completionDate: String,
  bulkId: { type: String },
  type: { type: String, enum: ["direct", "bulk"] },
  shared: { type: Boolean, default: false },
  shareId: { type: String },
});

module.exports = mongoose.model("UserFundRequest", userFundRequest);
