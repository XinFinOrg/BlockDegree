const key = require("../config/cipherKey").mongooseKey;

const mongoose = require("mongoose");

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

const userWallet = mongoose.Schema({
  email: { type: String, unique: true },
  walletAddress: { type: String, unique: true, required: true },
  walletPrivateKey: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt,
  },
  createdAt:String
});

module.exports = mongoose.model("UserWallet", userWallet);
