const mongoose = require('mongoose');
const User = require("./user");
const ExamSchedule = require("./examSchedule");

const examAttemptSchema = mongoose.Schema(
  {
    user : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    examSchedule : { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSchedule' },
    totalMarks: { type: String, required: true },
    attemptNo: { type: Number, required: true },
    attempt: [{
        givenQuestion: { type: String, required: true },
        givenAnswer: { type: String },
        usersAnswer: { type: String },
        marks: { type: String, required: true },
        remark: { type: String },
    }],
    userRecordingFileName: { type: String },
    screenRecordingFileName: { type: String },
  },
  {
    timestamps: true,
  }
);

// create the model for users and expose it to our app
module.exports = mongoose.model('examAttempt', examAttemptSchema);