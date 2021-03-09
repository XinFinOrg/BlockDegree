const mongoose = require("mongoose");

const mongooseSchema = mongoose.Schema(
    {
        email: { type: String },
        courseId: { type: String },
        video: { type: String }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("videoRecording", mongooseSchema);
