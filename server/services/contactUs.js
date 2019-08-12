const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
service: 'gmail',
  auth: {
<<<<<<< HEAD
    user: process.env.EMAILID,
    pass: process.env.PASSWORD
=======
    user: process.env.SUPP_EMAILER_ID,
    pass: process.env.SUPP_EMAILER_PSD
>>>>>>> local
  }
});

exports.contactUs = async (req, res) => {
  console.log("in contactUs");
  console.log(req.body);
  res.redirect("/contact");
  let info = await transporter.sendMail({
<<<<<<< HEAD
    from: process.env.EMAILID, // sender address
    to: "rudresh@xinfin.org", // list of receivers
    subject: `Supp. Req. from ${req.body.email}`, // Subject line
    html: `<div>Subject: ${req.body.subject} <br> Message: ${req.body.message}</div>` // html body
=======
    from: process.env.SUPP_EMAILER_ID, 
    to: process.env.SUPP_EMAIL_ID, // support email id for blockdegree
    subject: `Supp. Req. from ${req.body.email}`, 
    html: `<div>Subject: ${req.body.subject} <br> Message: ${req.body.message}</div>` 
>>>>>>> local
  });
  console.log("Message sent: %s", info.messageId);
};
