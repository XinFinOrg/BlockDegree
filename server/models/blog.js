const mongoose = require("mongoose");

let blogSchema = mongoose.Schema({
  blog_id: { type: String, unique: true, require: true },
  author: { type: String, email: String, unique: true },
  content: { type: String },
  likes: Number,
  topics: [],
  keywords: [],
  other_data: [],
  status:String
});

module.exports = mongoose.model("Blog", blogSchema);
