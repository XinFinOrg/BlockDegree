const mongoose = require('mongoose');
const User = require("./user");

const forumQuestionSchema = mongoose.Schema(
  {
    urlSlug: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    description: { type: String },
    askedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [{
      answersTheQuestion : { type : Boolean , "default" : false },
      text: { type: String, required: true },
      answeredBy: { type: String, required: true },
      answeredOn: Date,
      comments: [{
        text: { type: String, required: true },
        commentedBy: { type: String, required: true },
        commentedOn: Date,
      }]
    }],
    published: { type: Boolean, "default" : true },
  },
  {
    timestamps: true,
  }
);

// create the model for users and expose it to our app
module.exports = mongoose.model('ForumQuestion', forumQuestionSchema);