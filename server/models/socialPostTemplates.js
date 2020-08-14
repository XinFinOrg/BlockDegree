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
  imageHeight: {
    standard: Number,
    twitter: Number,
  },
  imageWidth: {
    standard: Number,
    twitter: Number,
  },
});

module.exports = mongoose.model("Social_Post_Template", socialPostTemplate);
