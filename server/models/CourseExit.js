const mongoose = require("mongoose");

const mongooseSchema = mongoose.Schema(
  {
    isAnsSubmitted: { type: Boolean },
    email: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    courseId: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CourseExit", mongooseSchema); //course
