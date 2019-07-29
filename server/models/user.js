var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var userSchema = mongoose.Schema({
  email:{type : String,unique : true, required: true},
  name: String,
  examData: {
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
    certificateHash: [{
      timestamp : String,
      marks : Number,
      total:Number,
      examType : String,
      hash : String
    }]
  },
  auth : {
    facebook: {
      id: String,
      accessToken: String,
      refreshToken: String
    },
    twitter: {
      id: String,
      token: String,
      tokenSecret: String
    },
    google: {
      id: String,
      accessToken: String,
      refreshToken: String
    },
    local: {
      password: String,
      isVerified: { type: Boolean, default: false }
    },
    linkedin : {
      accessToken:String,
      id : String
    }
  }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.auth.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model("User", userSchema);
