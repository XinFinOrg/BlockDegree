const mongoose = require("mongoose");

const visitedSchema = mongoose.Schema({
  email: String,
  ip: String,
  course: String,
  count: Number,
  firstVisit: String,
  lastVisit: String
});

module.exports = mongoose.model("Visited", visitedSchema);
