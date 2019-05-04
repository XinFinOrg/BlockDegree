var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const tokenSchema = new mongoose.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 432000 },

    google:{  
        id: String,
        token: String,
        email: String,
        name: String,
    
    }
});


module.exports = mongoose.model('tokenVerification', tokenSchema);