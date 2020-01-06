const mongoose = require("mongoose");

const socialPostTemplate = mongoose.Schema({
  templateId: String,
  templateName: String,
  templatePurpose: String,
  templateStatus: String,
  templateFilePath: String
});

module.exports = mongoose.model("Social_Post_Template", socialPostTemplate);
