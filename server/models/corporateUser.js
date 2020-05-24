const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const corporateFunding = mongoose.Schema(
  {
    uniqueId: { type: String, required: true, unique: true },
    companyEmail: { type: String, required: true, unique: true },
    password: { type: String },
    lastActive: { type: String },
    fundedCount: { type: Number },
    certifiedCount: { type: Number },
    companyLogo: { type: String, required: true },
    companyLogoName: { type: String, required: true },
    companyName: { type: String, required: true },
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
  },
  {
    timestamps: true,
  }
);

// generating a hash
corporateFunding.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
corporateFunding.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.auth.local.password);
};

module.exports = mongoose.model("CorporateUser", corporateFunding);
