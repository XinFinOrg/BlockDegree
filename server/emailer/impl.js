const nodemailerAuth = require("../config/auth").nodemailerAuth;
var User = require("../config/models/user");
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  host: "mail001.dakghar.in",
  port: 25,
  auth: nodemailerAuth
});

module.exports = {
  sendMail: mail => {
    return new Promise(function(resolve, reject) {
      var mailOptions = {
        from: "Blockchain@XinFin.Org",
        to: mail,
        subject: "Login",
        html: "<h3>Ankit Patel</h3>" + Date.now()
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

    if (type === "signup" || type === "resend") {
      mailOptions = {
        from: "blockdegree@xinfin.org",
        to: mail,
        subject: "Login",
        text:
          "Hello,\n\n" +
          "Please verify your account by clicking the link: \nhttp://" +
          req.headers.host +
          "/confirmation/?token=" +
          token.token +
          ".\n"
        // text:'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttps://www.blockdegree.org/confirmation\/?token=' + token.token + '.\n' + 'Free Blockchain Course with Online Certification.. This exam comprises of theory and practical Question, to be completed within 45 minutes. The minimum passing score of the exam is above 60%. Upon passing of the exam, you will be entitled to receive a certification of competence, which will be added to the Xinfin blockchain. With the certificate… ' + '.\n'
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
          " : \nhttp://www.blockdegree.org/" +
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
      var link = "http://www.blockdegree.org/resetPassword?&email=" + token;

      var mailOptions = {
        from: "info@blockdegree.org",
        to: mail,
        subject: "Forgot Password",
        //text:'Hello,\n\n' + 'Your payment is completed for ' + courseName + ' : \nhttp:\/\/' + req.headers.host + '/' + courseName + '.\n'
        text: link
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Email sent: " + info.response);
          // resolve(info);
          res.send({ status: "true" });
        }
      });
    });
  }
};
