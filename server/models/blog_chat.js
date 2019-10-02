const mongoose = require("mongoose");

let blogChatSchema = mongoose.Schema({
  blog_id: { type: String, required: true, unique: true }, // chat for that particular blog.
  participants: [], // contributors, editors who have chatted atleast once.
  messages:[] // list of all messages, and their recipients ( seen )
});

module.exports = mongoose.model("BlogChat", blogChatSchema);
