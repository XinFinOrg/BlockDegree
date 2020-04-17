const mongoose = require("mongoose");

const referralSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    referralCode: { type: String, required: true, unique: true },
    longUrl: { type: String, required: true, unique: true },
    shortUrl: { type: String },
    registrations: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("userReferral", referralSchema);
