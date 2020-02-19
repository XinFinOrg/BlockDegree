const mongoose = require("mongoose");

const postLogSchema = mongoose.Schema({
  eventId: { type: String, required: true },
  platform: { type: String },
  postId: { type: String },
  timestamp: { type: String }
});

module.exports = mongoose.model("SocialPostLog", postLogSchema);
