const mongoose = require("mongoose");

const mongooseSchema = mongoose.Schema(
    {
        isAnsSubmitted: { type: Boolean },
        email: { type: String },
        question: { type: String },
        answer: { type: String }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("qna", mongooseSchema);
