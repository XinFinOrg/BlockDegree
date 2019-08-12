const mongoose = require("mongoose");

const visitedSchema = mongoose.Schema({
  email: String,
  course: String,
  count: Number
});

module.exports = mongoose.model("Visited", visitedSchema);
