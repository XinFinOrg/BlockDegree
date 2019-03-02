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
                from: 'mrankit@mr.com',
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

    sendTokenMail:(mail,token,req)=>{
        return new Promise(function(resolve,reject){
            var mailOptions = {
                from: 'mrankit@mr.com',
                to: mail,
                subject: 'Login',
                text:'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/?token=' + token.token + '.\n'
                // html:"<h3>Ankit Patel</h3>"+Date.now(),
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

 }
