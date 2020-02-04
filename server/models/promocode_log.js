const mongoose = require("mongoose");

const promoLogSchema = mongoose.Schema({
  codeName: String,
  discAmt: String,
  user_email: String,
  course_id: String,
  course_price: String,
  used_date: String
});

module.exports = mongoose.model("PromoCode_log", promoLogSchema);
