const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  email: String,
  eventName: String,
  eventId: String,
  type: String,
  title: String,
  message: String,
  displayed: Boolean
});

module.exports = mongoose.model("Notification", notificationSchema);
