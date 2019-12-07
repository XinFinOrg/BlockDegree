const mongoose = require("mongoose");

const referralSchema = mongoose.Schema({
    referralCode:{type : String, unique : true, required : true},
    purpose:String,
    status:Boolean,
    count:Number,
    users:[],
    created:String,
    lastUsed:String,
    referrerEmail:String  
});

module.exports = mongoose.model("ReferralCode",referralSchema);