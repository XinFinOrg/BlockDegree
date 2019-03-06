const nodemailerAuth = require("../config/auth").nodemailerAuth;
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'mail001.dakghar.in',
    port: 25,
    auth: nodemailerAuth
  });

 module.exports = {

    sendMail:(mail)=>{
        return new Promise(function(resolve,reject){
            var mailOptions = {
                from: 'Blockchain@XinFin.Org',
                to: mail,
                subject: 'Login',
                html:"<h3>Ankit Patel</h3>"+Date.now(),
              };
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error)
                  reject(error);
                } else {
                  console.log("Email sent: " + info.response);
                 resolve(info);
                }
              });
        });
    },
    // sendMail2:()=>{}

    sendTokenMail:(mail, token, req, type)=>{
      console.log('sendTokenMail:', type, mail);
        
        var mailOptions;

        if(type === 'signup' || type === 'resend') {
          mailOptions = {
            from: 'blockchain@xinfin.org',
            to: mail,
            subject: 'Login',
            text:'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/?token=' + token.token + '.\n'
          };
        } else if (type === 'course_1' || type === 'course_2' || type === 'course_3') {
          var courseName;
          if(type === 'course_1') {
            courseName = 'blockchain-basic-exam';
          } else if(type === 'course_2') {
            courseName = 'blockchain-advanced-exam';
          } else if(type === 'course_3') {
            courseName = 'blockchain-professional-exam';
          }
          mailOptions = {
            from: 'blockdegree.org',
            to: mail,
            subject: 'Payment Successful',
            text:'Hello,\n\n' + 'Your payment is completed for ' + courseName + ' : \nhttp:\/\/' + req.headers.host + '/' + courseName + '.\n'
            // html:"<h3>Ankit Patel</h3>"+Date.now(),
          };
        }

        return new Promise(function(resolve,reject){
            
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error)
                  reject(error);
                } else {
                  console.log("Email sent: " + info.response);
                 resolve(info);
                }
              });
        });
    },

 }
