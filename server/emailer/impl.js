require("dotenv").config();
var User = require("../models/user");
const ejs = require("ejs");
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  host: "mail001.dakghar.in",
  port: 25,
  auth: {
    user: process.env.NODEMAILER_USER_ID,
    pass: process.env.NODEMAILER_USER_PASS,
  },
});

module.exports = {
  // only for internal use
  sendMail: (mail, subject, msg) => {
    return new Promise(function (resolve, reject) {
      var mailOptions = {
        from: "Blockchain@XinFin.Org",
        to: mail,
        subject: subject,
        html: `<div>${msg}</div>`,
      };
      transporter.sendMail(mailOptions, function (error, info) {
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

  sendMailInternal: (from, mail, subject, msg) => {
    return new Promise(function (resolve, reject) {
      var mailOptions = {
        from: from,
        to: mail,
        subject: subject,
        html: `<div>${msg}</div>`,
      };
      transporter.sendMail(mailOptions, function (error, info) {
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
        html: `<div>Click on the link to confirm email address : <a href="${link}">Link</a></div>`,
      };
    } else if (
      type === "course_1" ||
      type === "course_2" ||
      type === "course_3" ||
      type === "course_4" || 
      type === "course_5" ||
      type === "course_6"
    ) {
      var courseName;
      if (type === "course_1") {
        courseName = "blockchain-basic-course-for-engineer-exam";
      } else if (type === "course_2") {
        courseName = "blockchain-advanced-exam";
      } else if (type === "course_3") {
        courseName = "blockchain-professional-exam";
      } else if (type === "course_4") {
        courseName = "cloud-computing-exam";
      } else if (type === "course_5") {
        courseName = "blockchain-wallet-exam";
      } else if (type === "course_6") {
        courseName = "blockchain-basic-2";
      }
      mailOptions = {
        from: "info@blockdegree.org",
        to: mail,
        subject: "Payment Successful",
        //text:'Hello,\n\n' + 'Your payment is completed for ' + courseName + ' : \nhttp:\/\/' + req.headers.host + '/' + courseName + '.\n'
        text:
          "Hello,\n\n" +
          "Your payment is completed for " +
          courseName +
          ` : \nhttps://www.blockdegree.org/` +
          courseName +
          ".\n",
      };
    } else if (type === "video-subscription") {
      mailOptions = {
        from: "info@blockdegree.org",
        to: mail,
        subject: "Blockdegee: Video Subscription",
        html: `<div>Thank you forr subscribing to Blockdegree videos.</div>`,
      };
    }

    //html:"<h3>Ankit Patel</h3>"+Date.now(),

    return new Promise(function (resolve, reject) {
      transporter.sendMail(mailOptions, function (error, info) {
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
  forgotPasswordMailer: function (mail, token, res) {
    console.log("mail", mail);
    return new Promise(function (resolve, reject) {
      var link = `https://www.blockdegree.org/resetpassword?&email=` + token;
      var mailOptions = {
        from: "info@blockdegree.org",
        to: mail,
        subject: "Forgot Password",
        html: `<div>Click on the link to reset password : <a href="${link}">Link</a></div>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log("Email sent: " + info.response);
          res.send({ status: "true" });
        }
      });
    });
  },

  sendFMDCompleteUser: (mail, userName, courseName) => {
    ejs.renderFile(
      __dirname + "/fundCompleteUser.ejs",
      { userName: userName, courseName: courseName },
      (err, data) => {
        if (err) {
          console.log(`exception at ${__filename}.sendFMDCompleteUser: `, err);
          return;
        } else {
          const html = data.toString();
          const mailOptions = {
            from: "info@blockdegree.org",
            to: mail,
            subject: "Fund Accepted",
            html: html,
          };
          // console.log("mail options: ", mailOptions);
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log(" sendFMDCompleteUser Email sent: " + info.response);
              res.send({ status: "true" });
            }
          });
        }
      }
    );
  },

  sendFMDCompleteFunder: (
    mail,
    studentName,
    funderName,
    courseNames,
    requestUrlShort
  ) => {
    ejs.renderFile(
      __dirname + "/fundCompleteFunder.ejs",
      {
        studentName: studentName,
        funderName: funderName,
        courseNames: courseNames,
        requestUrlShort: requestUrlShort,
      },
      (err, data) => {
        if (err) {
          console.log(
            `exception at ${__filename}.sendFMDCompleteFunder: `,
            err
          );
          return;
        } else {
          const html = data.toString();
          const mailOptions = {
            from: "info@blockdegree.org",
            to: mail,
            subject: "Funding Completed",
            html: html,
          };
          // console.log("mail options: ", mailOptions);
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log(
                " sendFMDCompleteFunder Email sent: " + info.response
              );
              res.send({ status: "true" });
            }
          });
        }
      }
    );
  },
};
