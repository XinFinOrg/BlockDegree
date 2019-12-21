require("dotenv").config();
var User = require("../models/user");
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  host: "mail001.dakghar.in",
  port: 25,
  auth: {
    user: process.env.NODEMAILER_USER_ID,
    pass: process.env.NODEMAILER_USER_PASS
  }
});

module.exports = {
  // only for internal use
  sendMail: (mail, subject, msg) => {
    return new Promise(function(resolve, reject) {
      var mailOptions = {
        from: "Blockchain@XinFin.Org",
        to: mail,
        subject: subject,
        html: `<div>${msg}</div>`
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Email sent: " + info.response);
          resolve(info);
        }
      });
    });
  },


  sendMailInternal: (from,mail, subject, msg) => {
    return new Promise(function(resolve, reject) {
      var mailOptions = {
        from: from,
        to: mail,
        subject: subject,
        html: `<div>${msg}</div>`
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Email sent: " + info.response);
          resolve(info);
        }
      });
    });
  },
  // sendMail2:()=>{}

  sendTokenMail: (mail, token, req, type) => {
    console.log("sendTokenMail:", type, mail);

    var mailOptions;
    let link = "https://www.blockdegree.org/confirmation/?token=" + token.token;
    if (type === "signup" || type === "resend") {
      mailOptions = {
        from: "info@blockdegree.org",
        to: mail,
        subject: "Login",
        html: `<div>Click on the link to confirm email address : <a href="${link}">Link</a></div>`
      };
    } else if (
      type === "course_1" ||
      type === "course_2" ||
      type === "course_3"
    ) {
      var courseName;
      if (type === "course_1") {
        courseName = "blockchain-basic-exam";
      } else if (type === "course_2") {
        courseName = "blockchain-advanced-exam";
      } else if (type === "course_3") {
        courseName = "blockchain-professional-exam";
      }
      mailOptions = {
        from: "info@blockdegree.org",
        to: mail,
        subject: "Payment Successfull",
        //text:'Hello,\n\n' + 'Your payment is completed for ' + courseName + ' : \nhttp:\/\/' + req.headers.host + '/' + courseName + '.\n'
        text:
          "Hello,\n\n" +
          "Your payment is completed for " +
          courseName +
          ` : \nhttps://www.blockdegree.org/` +
          courseName +
          ".\n"
      };
    }

    //html:"<h3>Ankit Patel</h3>"+Date.now(),

    return new Promise(function(resolve, reject) {
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Email sent: " + info.response);
          resolve(info);
        }
      });
    });
  },
  forgotPasswordMailer: function(mail, token, res) {
    console.log("mail", mail);
    return new Promise(function(resolve, reject) {
      var link = `https://www.blockdegree.org/resetpassword?&email=` + token;
      var mailOptions = {
        from: "info@blockdegree.org",
        to: mail,
        subject: "Forgot Password",
        html: `<div>Click on the link to reset password : <a href="${link}">Link</a></div>`
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Email sent: " + info.response);
          res.send({ status: "true" });
        }
      });
    });
  }
};
