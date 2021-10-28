const mongoose = require('mongoose');
const User = require("./user");

const examScheduleSchema = mongoose.Schema(
  {
    course: {
      title: { type: String, required: true },
      type: { type: String, required: true },
    },
    user : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timeSlot: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    startedDate: { type: Date },
    urlSlug: { type: String, required: true, unique: true },
    state: { type: String, default: "initiated" },
    duration: { type: String, default: "1:00:00" },
    attemptsTaken: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// create the model for users and expose it to our app
module.exports = mongoose.model('examSchedule', examScheduleSchema);