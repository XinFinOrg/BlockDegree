const mongoose = require("mongoose");

const userSessions = mongoose.Schema(
  {
    sessionId: String,
    email: String,
    startTime: String,
    endTime: String,
    ip: String,
    platform:String
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSession", userSessions);
