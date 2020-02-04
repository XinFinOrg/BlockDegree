const mongoose = require("mongoose");

let blogContentSchema = mongoose.Schema({
  blog_id: { type: String, unique: true, require: true },
  content: { type: String }
});

module.exports = mongoose.model("Blog_Content", blogContentSchema);
