// app/models/user.js
// load the things we need
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// define the schema for our user model
var userSchema = mongoose.Schema({
  local: {
    name: String,
    email: String,
    password: String,
    isVerified: { type: Boolean, default: false },
    payment: {
      course_1: Boolean,
      course_2: Boolean,
      course_3: Boolean
    },
    examBasic: {
      attempts: Number,
      marks: Number
    },
    examAdvanced: {
      attempts: Number,
      marks: Number
    },
    examProfessional: {
      attempts: Number,
      marks: Number
    },
    certificateHash: { type: String }
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    email: String
  },
  twitter: {
    id: String,
    token: String,
    name: String,
    email: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model("User", userSchema);
