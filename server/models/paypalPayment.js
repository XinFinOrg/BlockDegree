const mongoose = require("mongoose");

const paypalPaymentSchema = mongoose.Schema(
  {
    invoice_number: String,
    purpose: String,
    email: String,
    amount: String,
    status: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PaypalPayment", paypalPaymentSchema);
