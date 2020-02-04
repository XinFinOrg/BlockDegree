const mongoose = require("mongoose");

const visitedSchema = mongoose.Schema({
  email: String,
  ip: String,
  course: String,
  count: Number,
  firstVisit: String,
  lastVisit: String,
  region: String,
  city: String,
  country: String,
  coordinates: [String]
});

module.exports = mongoose.model("Visited", visitedSchema);
