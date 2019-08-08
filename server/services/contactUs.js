const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
service: 'gmail',
  auth: {
    user: process.env.EMAILID,
    pass: process.env.PASSWORD
  }
});

exports.contactUs = async (req, res) => {
  console.log("in contactUs");
  console.log(req.body);
  res.redirect("/contact");
  let info = await transporter.sendMail({
    from: process.env.EMAILID, // sender address
    to: "rudresh@xinfin.org", // list of receivers
    subject: `Supp. Req. from ${req.body.email}`, // Subject line
    html: `<div>Subject: ${req.body.subject} <br> Message: ${req.body.message}</div>` // html body
  });
  console.log("Message sent: %s", info.messageId);
};
