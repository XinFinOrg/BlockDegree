const mongoose = require("mongoose");

let blogSchema = mongoose.Schema({
  blog_id: { type: String, unique: true, require: true },
  title: { type: String, requrie: true },
  author: { type: String, require: true },
  desc: String,
  favs: [],
  topics: [],
  keywords: [],
  other_data: [],
  status: String,
  views:[],
});

module.exports = mongoose.model("Blog", blogSchema);
