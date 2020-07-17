const mongoose = require("mongoose");

const socialPostTemplate = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  eventType: String,
  createdBy: String,
  isActive: Boolean,
  createdAt: String,
  lastUsed: String,
  templateName: { type: String, required: true, unique: true },
  templatePurpose: String,
  templateStatus: String,
  templateFilePath: String,
  templateVars: String,
});

module.exports = mongoose.model("Social_Post_Template", socialPostTemplate);
