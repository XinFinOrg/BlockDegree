const mongoose = require("mongoose");

const nftSchema = mongoose.Schema(
  {
    uniqueId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["completed", "initiated", "failed"] },
    certificateHash: { type: String, required: true },
    email: { type: String, required: true },
    transactionHash: { type: String },
    receipt: { type: Object },
    tokenData: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CertificateNFT", nftSchema);
