const mongoose = require("mongoose");

const walletSchema = mongoose.Schema({
  recipientWallets: [],
  burnWallets: [], // corresponding private key needs to be present in the server/config/config.js file
  recipientActive: [],
  burnActive: []
});

module.exports = mongoose.model("Wallet", walletSchema);
