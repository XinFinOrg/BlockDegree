const mongoose = require("mongoose");

const socialPostSchema = mongoose.Schema({
  socialMedia: String,
  id: String,
  timestamp: String,
  scheduled: Boolean,
  postedBy: String
});

module.exports = mongoose.model("Social_Post", socialPostSchema);
