const mongoose = require("mongoose");

const socialPostConfigSchema = mongoose.Schema({
  platforms: {
    facebook: {
      postCount: Number,
      autoPost: Boolean,
      lastPost: String,
      firstPost: String
    },
    twitter: {
      postCount: Number,
      autoPost: Boolean,
      lastPost: String,
      firstPost: String
    },
    linkedin: {
      postCount: Number,
      autoPost: Boolean,
      lastPost: String,
      firstPost: String
    },
    telegram: {
      postCount: Number,
      autoPost: Boolean,
      lastPost: String,
      firstPost: String
    }
  },
  autoPost:Boolean
});

module.exports = mongoose.model("Social_Post_Config", socialPostConfigSchema);
