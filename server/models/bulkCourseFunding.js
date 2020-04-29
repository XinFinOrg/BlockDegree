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

const bulkSchema = mongoose.Schema(
  {
    bulkId: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ["bulk", "corporate"] },
    paymentMode: { type: String },
    courses: [String],
    amountGoal: { type: String, required: true },
    receiveAddr: { type: String },
    receiveAddrPrivKey: {
      type: String,
      set: encrypt,
      get: decrypt,
    },
    txHash: { type: String },
    burnTx: { type: String },
    status: { type: String, enum: ["uninitiated", "pending", "completed"] },
    burnStatus: { type: String, enum: ["uninitiated", "pending", "completed"] },
    paypalId: { type: String },
    razorPayId: { type: String },
    email: String,
    donerName: String,
    companyEmail: String,
    companyName: String,
    companyLogo: String,
    completionDate: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("BulkCourseFunding", bulkSchema);
