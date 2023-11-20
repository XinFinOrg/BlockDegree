// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var questionSchema = mongoose.Schema({
    exam : String,
    questions : Array,
    questionsBasic: Array,
    questionsAdvanced: Array,
    questionsProfessional: Array,
    questionsComputing: Array,
    questionsWallet: Array,
    questionsXDCNetwork: Array
});

// create the model for users and expose it to our app
module.exports = mongoose.model('questions', questionSchema);