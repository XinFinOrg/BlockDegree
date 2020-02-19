const mongoose = require("mongoose");

const mongooseSchema = mongoose.Schema({
  shortTermToken: String,
  lastUpdate: String,
  longTermToken: String
});

module.exports = mongoose.model("FacebookConfig", mongooseSchema);
