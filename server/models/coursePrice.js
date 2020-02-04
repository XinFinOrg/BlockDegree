const mongoose = require("mongoose");

const coursePriceSchema = mongoose.Schema({
  courseId: { type: String, unique: true, required: true },
  courseName: String,
  xdceTolerance: String,
  xdceConfirmation: String,
  xdcTolerance: String,
  xdcConfirmation: String,
  priceUsd: String,
  burnToken:[]
});

module.exports = mongoose.model("Course_Price", coursePriceSchema);
