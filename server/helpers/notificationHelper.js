const Notification = require("../models/notifications");

exports.createNotification = async(email, eventName, message);

function newDefNoti() {
  return new Notification({
    email: "",
    eventName: "",
    eventId: "",
    type: "",
    title: "",
    message: "",
    displayed: false,
  });
}
