const mongoose = require("mongoose");

const promoSchema = mongoose.Schema({
    codeName:{type : String, unique : true, required : true},
    discAmt:{type : String, required : true},
    purpose:String,
    status:Boolean,
    count:Number, // overall count for which the code was used
    hasCap:Boolean,
    useLimit:Number,
    created:String,
    lastUsed:String,
    users : [{}], // all users that availed this promo code.,
    restricted : Boolean,
    allowedUsers : [{}]
});

module.exports = mongoose.model("PromoCode",promoSchema);