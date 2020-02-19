const mongoose = require("mongoose");

const SocialPostTemplateSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  templatePath: { type: String, required: true },
  templateStatus: { type: String },
  isActive: Boolean,
  createdAt: String,
  lastUsed: String,
  createdBy: String
});

module.exports = mongoose.model("SocialPostTemplate", SocialPostTemplateSchema);
