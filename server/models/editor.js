const mongoose = require("mongoose");

let editorSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  created: String,
  lastActive: String,
  status: Boolean,
  blogsEdited: [] // blog_id, lastView
});

module.exports = mongoose.model("Editor", editorSchema);
