const mongoose = require("mongoose");

const promoLogSchema = mongoose.Schema({
  codeName: { type: String, required: true },
  discAmt: { type: String, required: true },
  user_email: { type: String, required: true },
  course_id: { type: String, required: true },
  course_price: { type: String, required: true },
  used_date: String
});

module.exports = mongoose.model("PromoCode_log", promoLogSchema);
