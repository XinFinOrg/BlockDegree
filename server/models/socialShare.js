const mongoose = require("mongoose");

const socialShareSchema = mongoose.Schema(
  {
    uniqueId: { type: String, required: true, unique: true },
    platform: { type: String, required: true, enum: ["twitter", "linkedin"] },
    email: { type: String, required: true },
    purpose: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Social_Share", socialShareSchema);
