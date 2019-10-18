const mongoose = require("mongoose");

const coursePriceSchema = mongoose.Schema({
  courseId: { type: String, unique: true, required: true },
  courseName: String,
  xdceTolerance: String,
  xdcTolerance: String,
  priceUsd: String
});

module.exports = mongoose.model("Course_Price", coursePriceSchema);
