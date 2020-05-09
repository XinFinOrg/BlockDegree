const mongoose = require("mongoose");

const razorpayLogSchema = mongoose.Schema(
  {
    status: { type: String, enum: ["completed", "initiated", "failed"] },
    email: { type: String },
    paymentId: { type: String },
    orderId: { type: String },
    receipt: { type: String },
    signature: { type: String },
    amount: {type:String},
    course_id: String,
    promoCode: String,
    referralCode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("RazorpayLog", razorpayLogSchema);
