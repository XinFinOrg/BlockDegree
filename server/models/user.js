var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var userSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: String,
  created: String,
  lastActive: String,
  userSession: String,
  examData: {
    payment: {
      course_1: Boolean,
      course_2: Boolean,
      course_3: Boolean,
      course_4: Boolean,
      course_5: Boolean,
      course_6: Boolean,
      course_1_payment: String,
      course_2_payment: String,
      course_3_payment: String,
      course_4_payment: String,
      course_5_payment: String,
      course_6_payment: String,
      course_1_doner: String,
      course_2_doner: String,
      course_3_doner: String,
      course_4_doner: String,
      course_5_doner: String,
      course_6_doner: String,
    },
    examBasic: {
      attempts: Number,
      marks: Number,
    },
    examAdvanced: {
      attempts: Number,
      marks: Number,
    },
    examProfessional: {
      attempts: Number,
      marks: Number,
    },
    examComputing: {
      attempts: Number,
      marks: Number,
    },
    examWallet: {
      attempts: Number,
      marks: Number,
    },
    certificateHash: [
      {
        timestamp: String,
        marks: Number,
        total: Number,
        examType: String,
        headlessHash: String,
        clientHash: String,
        paymentMode: String,
        expiryDate: String,
        minted: Boolean,
        mintTx:String,
      },
    ],
  },
  videoSubscription: {
    type: Boolean, default: false
  },
  auth: {
    facebook: {
      id: String,
      accessToken: String,
      refreshToken: String,
    },
    twitter: {
      id: String,
      token: String,
      tokenSecret: String,
    },
    google: {
      id: String,
      accessToken: String,
      refreshToken: String,
    },
    local: {
      password: String,
      isVerified: { type: Boolean, default: false },
    },
    linkedin: {
      accessToken: String,
      id: String,
    },
  },
});

// generating a hash
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.auth.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model("User", userSchema);
