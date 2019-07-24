const path = require("path");
var User = require('../config/models/user');
var questions = require("../config/models/question");
var ejs=require('ejs');
const utils = require("../utils.js");

const ipfsClient = require('ipfs-http-client')

const xinfinClient = new ipfsClient({
  host: 'ipfs.xinfin.network',
  port: 443,
  protocol: 'https'
})

const localClient = new ipfsClient('/ip4/127.0.0.1/tcp/5001')

let { readJSONFile } = utils;


exports.submitExam =  (req, res, next) => {
    var marks = 0;
    const backUrl = req.header('Referer');
    const examName = backUrl.split('/')[3].split('-')[1];
    console.log(req.user);
    console.log(req.user.local.examBasic.attempts);
    const request = JSON.parse(JSON.stringify(req.body, null, 2));
    console.log('requestffff', examName);
    let attempts = req.user.local.examBasic.attempts;
    let attemptsAdvanced = req.user.local.examAdvanced.attempts;
    let attemptsProfessional = req.user.local.examProfessional.attempts;
    if (examName === "basic") {
      if (attempts != null && attempts < 3 ) {
        questions.findOne({ exam: "firstExam" }).then((result, error) => {
          for (let index = 0; index < result.questionsBasic.length; index++) {
            if (parseInt(request[index]) + 1 == result.questionsBasic[index].answer) {
              // marks++;
            }
            marks++;
          }
          attempts += 1;
          User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examBasic.attempts":attempts,"local.examBasic.marks":marks}}, {upsert: false},(err, doc) => {
            if (err) {
              console.log("Something went wrong when updating data!");
              res.send({ status: 'false', message: info });
            }
            res.redirect('/exam-result');
          });
        });
      } else if(attempts >= 3) {
        attempts = 0;
        User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examBasic.attempts":attempts,"local.examBasic.marks":marks,"local.payment.course_1": false}}, {upsert: false},(err, doc) => {
          if (err) {
            console.log("Something went wrong when updating data!");
            res.send({ status: 'false', message: info });
          }
          res.redirect('/exam-result');
        });
      }
    } else if (examName === "advanced") {
      if (attemptsAdvanced != null && attemptsAdvanced < 3 ) {
        questions.findOne({ exam: "firstExam" }).then((result, error) => {
          console.log('advanced result', result);
          console.log('advanced result:::', result.questionsAdvanced)
          for (let index = 0; index < result.questionsAdvanced.length; index++) {
            if (parseInt(req.body[index]) + 1 == result.questionsAdvanced[index].answer) {
              marks++;
            }
          }
          attemptsAdvanced += 1;
          console.log("Marks", marks);
          User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examAdvanced.attempts":attemptsAdvanced,"local.examAdvanced.marks":marks}}, {upsert: false},(err, doc) => {
            if (err) {
              console.log("Something wrong when updating data!");
            }
            console.log(doc);
            res.redirect('/exam-result');
          });
        });
      } else if (attemptsAdvanced >= 3) {
        attemptsAdvanced = 0;
        User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examAdvanced.attempts":attemptsAdvanced,"local.examAdvanced.marks":marks,"local.payment.course_2": false}}, {upsert: false},(err, doc) => {
          if (err) {
            console.log("Something went wrong when updating data!");
            res.send({ status: 'false', message: info });
          }
          res.redirect('/exam-result');
        });
      }
    } else if (examName === "professional") {
      if (attemptsProfessional != null && attemptsProfessional < 3 ) {
        questions.findOne({ exam: "firstExam" }).then((result, error) => {
          for (let index = 0; index < result.questionsProfessional.length; index++) {
            if (parseInt(request[index]) + 1 == result.questionsProfessional[index].answer) {
              marks++;
            }
          }
          attemptsProfessional += 1;
          console.log("Marks", marks);
          User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examProfessional.attempts":attemptsProfessional, "local.examProfessional.marks":marks}}, {upsert: false},(err, doc) => {
            console.log('err?', err)
            if (err) {
              console.log("Something wrong when updating data!");
            }
            res.redirect('/exam-result');
          });
        });
      } else if (attemptsProfessional >= 3) {
        attemptsProfessional = 0;
        User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examProfessional.attempts":attemptsProfessional,"local.examProfessional.marks":marks,"local.payment.course_3": false}}, {upsert: false},(err, doc) => {
          console.log('err2?', err)
          if (err) {
            console.log("Something went wrong when updating data!");
            res.send({ status: 'false', message: info });
          }
          res.redirect('/exam-result');
        });
      }
    }
  }

  exports.getBasicExam = (req, res) => {
    readJSONFile(path.join(process.cwd(), '/server/protected/blockchain-basic.json'), (err, json) => {
      if (err) { throw err; }
      console.log('test quetions basic:', json);
      res.render('blockchainBasic', json)
    })
  }

  exports.getAdvancedExam = (req, res) => {
    readJSONFile(path.join(process.cwd(), '/server/protected/blockchain-advanced.json'), (err, json) => {
      if (err) { throw err; }
      console.log('test quetions advanced:', json);
      res.render('blockchainAdvanced', json)
    })
  }

  exports.getProfessionalExam = (req, res) => {
    console.log('inside block prof')
    readJSONFile(path.join(process.cwd(), '/server/protected/blockchain-professional.json'), (err, json) => {
      console.log('block pro 2', err, json)
      if (err) { throw err; }
      console.log('test quetions professional:', json);
      res.render('blockchainProfessional', json)
    })
  }

  exports.getExamResult = (req, res) => {
    const backUrl = req.header('Referer');
    const examName = backUrl.split('/')[3].split('-')[1];
    if (examName === "basic") {
      User.findOne({ 'local.email': req.user.local.email}).then((result, error) => {
        console.log('result basic:', result, error);
        const examTotal = 50;
        let obtainedMarks = result.local.examBasic.marks;
        
        let percent = (obtainedMarks * 100) / examTotal;
        let examStatus;
        let jsonData = {
          "exam": {
            "examBasic": true,
            "examAdvanced": false,
            "examProfessional": false
          },
          "data": result,
          "obtainedMarks": obtainedMarks,
          "percent": percent,
        };
        if(percent >= 60) {
          User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examBasic.attempts":0,"local.payment.course_1": false}}, {upsert: false},(err, doc) => {
            if (err) {
              console.log("Something went wrong when updating data!");
              res.send({ status: 'false', message: info });
            }
          });
          examStatus = true;
          let d = new Date();
          let date = d.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
          ejs.renderFile(__dirname+'/certificate.ejs', {
            name:  req.user.local.email,
            course: "Certified Blockchain Basic Expert",
            score: percent,
            date: date
          }, (err, data) => {
            let buffer = Buffer.from(data, 'utf-8');
            localClient.add(buffer, (err, ipfsHash) => {
              console.log(ipfsHash);
              result.certificateHash=ipfsHash[0].hash;
              jsonData.certificateHash=ipfsHash[0].hash;
              jsonData.examStatus= examStatus;
              result.save();
              res.render('examResult', jsonData);
            });
          })

        } else if (percent < 60) {
          examStatus = false;
          jsonData.examStatus= examStatus;
          res.render('examResult', jsonData);
        }

        console.log('examResult json:', jsonData)

      });
    } else if (examName === "advanced") {
      User.findOne({ 'local.email': req.user.local.email}).then((result, error) => {
        console.log('result advanced:', result, error);
        const examTotal = 50;
        let obtainedMarks = result.local.examAdvanced.marks;
        let percent = (obtainedMarks * 100) / examTotal;
        let examStatus;
        let jsonData = {
          "exam": {
            "examBasic": false,
            "examAdvanced": true,
            "examProfessional": false
          },
          "data": result,
          "obtainedMarks": obtainedMarks,
          "percent": percent,
        };

        if(percent >= 60) {
          User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examAdvanced.attempts":0,"local.payment.course_2": false}}, {upsert: false},(err, doc) => {
            if (err) {
              console.log("Something went wrong when updating data!");
              res.send({ status: 'false', message: info });
            }
            // res.redirect('/exam-result');
          });
          examStatus = true;
          let d = new Date();
          let date = d.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
          ejs.renderFile(__dirname+'/certificate.ejs', {
            name:  req.user.local.email,
            course: "Certified Bitcoin Blockchain Expert",
            score: percent,
            date: date
          }, (err, data) => {
            let buffer = Buffer.from(data, 'utf-8');
            localClient.add(buffer, (err, ipfsHash) => {
              console.log(ipfsHash);
              result.certificateHash=ipfsHash[0].hash;
              jsonData.certificateHash=ipfsHash[0].hash;
              jsonData.examStatus= examStatus;
              result.save();
              res.render('examResult', jsonData);
            });
          })

        } else if (percent < 60) {
          examStatus = false;
          jsonData.examStatus= examStatus;
          res.render('examResult', jsonData);
        }

        console.log('examResult json:', jsonData)

      });
    } else if (examName === "professional") {
      User.findOne({ 'local.email': req.user.local.email}).then((result, error) => {
        console.log('result professional:', result, error);
        const examTotal = 50;
        let obtainedMarks = result.local.examProfessional.marks;
        console.log('obtainedMarks>>>>>>>', obtainedMarks)
        let percent = (obtainedMarks * 100) / examTotal;
        let examStatus;
        let jsonData = {
          "exam": {
            "examBasic": false,
            "examAdvanced": false,
            "examProfessional": true
          },
          "data": result,
          "obtainedMarks": obtainedMarks,
          "percent": percent,
        };
        if(percent >= 60) {
          User.findOneAndUpdate({ 'local.email': req.user.local.email},{$set:{"local.examProfessional.attempts":0,"local.payment.course_3": false}}, {upsert: false},(err, doc) => {
            if (err) {
              console.log("Something went wrong when updating data!");
              res.send({ status: 'false', message: info });
            }
            // res.redirect('/exam-result');
          });
          examStatus = true;
          let d = new Date();
          let date = d.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
          ejs.renderFile(__dirname+'/certificate.ejs', {
            name:  req.user.local.email,
            course: "examProfessional",
            score: percent,
            date: date
          }, (err, data) => {
            let buffer = Buffer.from(data, 'utf-8');
            localClient.add(buffer, (err, ipfsHash) => {
              console.log(ipfsHash);
              result.certificateHash=ipfsHash[0].hash;
              jsonData.certificateHash=ipfsHash[0].hash;
              jsonData.examStatus= examStatus;
              result.save();
              res.render('examResult', jsonData);
            });
          })

        } else if (percent < 60) {
          examStatus = false;
          jsonData.examStatus= examStatus;
          res.render('examResult', jsonData);
        }

        console.log('examResult json:', jsonData)

      });
    }
  }

exports.getExamStatus = (req, res) => {
    console.log('local exam ');

   User.findOne({ "local.email": req.user.local.email }, function (err, user) {
     if(err) { throw err };
     readJSONFile(
       path.join(process.cwd(), "/dist/data/courses.json"),
       (err, json) => {
         if (err) {
           throw err;
         }

         const examListData = {
           'data': {
             "course_1": user.local.payment.course_1,
             "course_2": user.local.payment.course_2,
             "course_3": user.local.payment.course_3,
           },
           'json': json
         }
         console.log('examlist data:::', examListData)
         res.render("examList", examListData);
       }
     );
   });
 };