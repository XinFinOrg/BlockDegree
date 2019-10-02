const mongoose = require("mongoose");

let contributorSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  created: String,
  lastActive: String,
  status: Boolean,
  blogs:[] // blog_id, created, lastUpdate
});

module.exports = mongoose.model("Contributor", contributorSchema);
