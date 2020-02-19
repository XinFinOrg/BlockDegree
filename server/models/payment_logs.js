// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var paymentlogsSchema = mongoose.Schema({
    email : String,
    payment_id : String,
    course_id : String,
    payment_date : String,
    payment_amount : String,
    payment_status : Boolean,
    promoCode: String,
    referralCode: String,
    burnStatus: String, // pending, completed
    burnTx: String, // hash of the auto-burn transaction
    burnAmnt: String,
    burnTokenName:String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Payment_Logs', paymentlogsSchema);