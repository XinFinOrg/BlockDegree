const nodemailer = require("nodemailer");
const axios = require("axios");
const _ = require("lodash");
const { secret } = require("../config/captchaKey");

require("dotenv").config();
const transporter = nodemailer.createTransport({
  host: "mail001.dakghar.in",
  port: 25,
  auth: {
    user: process.env.NODEMAILER_USER_ID,
    pass: process.env.NODEMAILER_USER_PASS
  }
});

exports.contactUs = async (req, res) => {
  if (!_.isEmpty(req.body.reCaptcha)) {
    const captchaVerification = await axios({
      method: "POST",
      url: "https://www.google.com/recaptcha/api/siteverify",
      params: { secret: secret, response: req.body.reCaptcha }
    });

    if (captchaVerification.data.success == true) {
      res.json({ message: "ok" });
      let info = await transporter.sendMail({
        from: req.body.email,
        to: process.env.SUPP_EMAIL_ID, // support email id for blockdegree
        subject: `Supp. Req. from ${req.body.email}`,
        html: `<div>Name: ${req.body.name} <br> Email-ID: ${req.body.email} <br> Subject: ${req.body.subject} <br> Message: ${req.body.message}</div>`
      });
      console.log("Message sent: %s", info.messageId);
    }
  }
};
