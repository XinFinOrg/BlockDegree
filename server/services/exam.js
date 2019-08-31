const path = require("path");
var User = require("../models/user");
const questions = require("../models/question");
const utils = require("../utils.js");
const renderCertificate = require("../helpers/renderCertificate");
// const blockchainHelper = require("../helpers/blockchainHelpers");

const examTypes = {
  basic: {
    courseName: "examBasic",
    questionName: "questionsBasic",
    coursePayment_id: "course_1"
  },
  advanced: {
    courseName: "examAdvanced",
    questionName: "questionsAdvanced",
    coursePayment_id: "course_2"
  },
  professional: {
    courseName: "examProfessional",
    questionName: "questionsProfessional",
    coursePayment_id: "course_3"
  }
};

let { readJSONFile } = utils;

exports.submitExam = async (req, res, next) => {
  var marks = 0;
  const backUrl = req.header("Referer");
  const examName = backUrl.split("/")[3].split("-")[1];
  console.log(req.user);
  console.log(req.user.examData.examBasic.attempts);
  const request = JSON.parse(JSON.stringify(req.body, null, 2));
  console.log("requestffff", examName);
  let attempts = req.user.examData.examBasic.attempts;
  let attemptsAdvanced = req.user.examData.examAdvanced.attempts;
  let attemptsProfessional = req.user.examData.examProfessional.attempts;
  var query = {};
  query = { email: req.user.email };
  let currUser = await User.findOne({ email: req.user.email }).catch(e => {
    console.log("Error ", e);
  });
  if (currUser != null) {
    if (
      currUser.examData.payment[examTypes[examName].coursePayment_id] == true
    ) {
      if (examName === "basic") {
        if (attempts != null && attempts < 3) {
          questions.findOne({ exam: "firstExam" }).then((result, error) => {
            for (let index = 0; index < result.questionsBasic.length; index++) {
              if (
                parseInt(request[index]) + 1 ==
                result.questionsBasic[index].answer
              ) {
                marks++;
              }
            }
            attempts += 1;
            User.findOneAndUpdate(
              query,
              {
                $set: {
                  "examData.examBasic.attempts": attempts,
                  "examData.examBasic.marks": marks,
                  "examData.payment.course_1": attempts <= 2
                }
              },
              { upsert: false },
              (err, doc) => {
                if (err) {
                  console.log("Something went wrong when updating data!");
                  res.send({ status: "false", message: info });
                }
                res.redirect("/exam-result");
              }
            );
          });
        } else if (attempts >= 3) {
          attempts = 0;
          User.findOneAndUpdate(
            query,
            {
              $set: {
                "examData.examBasic.attempts": attempts,
                "examData.examBasic.marks": marks,
                "examData.payment.course_1": false
              }
            },
            { upsert: false },
            (err, doc) => {
              if (err) {
                console.log("Something went wrong when updating data!");
                res.send({ status: "false", message: info });
              }
              res.redirect("/exam-result");
            }
          );
        }
      } else if (examName === "advanced") {
        console.log("inside advanced");
        // console.log(attemptsAdvanced);
        if (attemptsAdvanced != null && attemptsAdvanced < 3) {
          // console.log("valid attempt");
          questions.findOne({ exam: "firstExam" }).then((result, error) => {
            // console.log("advanced result", result);
            // console.log("advanced result:::", result.questionsAdvanced);
            for (
              let index = 0;
              index < result.questionsAdvanced.length;
              index++
            ) {
              if (
                parseInt(req.body[index]) + 1 ==
                result.questionsAdvanced[index].answer
              ) {
                marks++;
              }
            }
            attemptsAdvanced += 1;
            console.log("Marks", marks);
            User.findOneAndUpdate(
              query,
              {
                $set: {
                  "examData.examAdvanced.attempts": attemptsAdvanced,
                  "examData.examAdvanced.marks": marks,
                  "examData.payment.course_2": attemptsAdvanced <= 2
                }
              },
              { upsert: false },
              (err, doc) => {
                if (err) {
                  console.log("Something wrong when updating data!");
                }
                console.log(doc);
                res.redirect("/exam-result");
              }
            );
          });
        } else if (attemptsAdvanced >= 3) {
          attemptsAdvanced = 0;
          User.findOneAndUpdate(
            query,
            {
              $set: {
                "examData.examAdvanced.attempts": attemptsAdvanced,
                "examData.examAdvanced.marks": marks,
                "examData.payment.course_2": false
              }
            },
            { upsert: false },
            (err, doc) => {
              if (err) {
                console.log("Something went wrong when updating data!");
                res.send({ status: "false", message: info });
              }
              res.redirect("/exam-result");
            }
          );
        }
      } else if (examName === "professional") {
        if (attemptsProfessional != null && attemptsProfessional < 3) {
          questions.findOne({ exam: "firstExam" }).then((result, error) => {
            for (
              let index = 0;
              index < result.questionsProfessional.length;
              index++
            ) {
              if (
                parseInt(request[index]) + 1 ==
                result.questionsProfessional[index].answer
              ) {
                marks++;
              }
            }
            attemptsProfessional += 1;
            console.log("Marks", marks);
            User.findOneAndUpdate(
              query,
              {
                $set: {
                  "examData.examProfessional.attempts": attemptsProfessional,
                  "examData.examProfessional.marks": marks,
                  "examData.payment.course_3": attemptsProfessional <= 2
                }
              },
              { upsert: false },
              (err, doc) => {
                console.log("err?", err);
                if (err) {
                  console.log("Something wrong when updating data!");
                }
                res.redirect("/exam-result");
              }
            );
          });
        } else if (attemptsProfessional >= 3) {
          attemptsProfessional = 0;
          User.findOneAndUpdate(
            query,
            {
              $set: {
                "examData.examProfessional.attempts": attemptsProfessional,
                "examData.examProfessional.marks": marks,
                "examData.payment.course_3": false
              }
            },
            { upsert: false },
            (err, doc) => {
              console.log("err2?", err);
              if (err) {
                console.log("Something went wrong when updating data!");
                res.send({ status: "false", message: info });
              }
              res.redirect("/exam-result");
            }
          );
        }
      }
    }
  }
};

exports.getBasicExam = (req, res) => {
  readJSONFile(
    path.join(process.cwd(), "/server/protected/blockchain-basic.json"),
    (err, json) => {
      if (err) {
        throw err;
      }
      // json = scrambleQuestions(json);
      // console.log("test quetions basic:", json);
      res.render("blockchainBasic", json);
    }
  );
};

exports.getAdvancedExam = (req, res) => {
  readJSONFile(
    path.join(process.cwd(), "/server/protected/blockchain-advanced.json"),
    (err, json) => {
      if (err) {
        throw err;
      }
      // json = scrambleQuestions(json);
      // console.log("test quetions advanced:", json);
      res.render("blockchainAdvanced", json);
    }
  );
};

exports.getProfessionalExam = (req, res) => {
  // console.log("inside block prof");
  readJSONFile(
    path.join(process.cwd(), "/server/protected/blockchain-Professional.json"),
    (err, json) => {
      // console.log("block pro 2", err, json);
      if (err) {
        throw err;
      }
      // json = scrambleQuestions(json);
      // console.log("test quetions professional:", json);
      res.render("blockchainProfessional", json);
    }
  );
};

exports.getExamResult = async (req, res) => {
  console.log(
    `called the exam-result endpoint by ${req.user.email} at ${Date.now()}`
  );
  const backUrl = req.header("Referer");
  let name = "";
  if (req.user.name == "" || req.user.name == undefined) {
    // old email id.
    name = req.user.email;
  } else {
    name = req.user.name;
  }
  var query = {};
  query = { email: req.user.email };
  const examName = backUrl.split("/")[3].split("-")[1];

  const user = await User.findOne(query).catch(err => {
    if (err) {
      res.status(500).json({
        error: err,
        status: 500,
        info: `error while looking up the DB`
      });
    }
  });

  const ques = await questions.findOne({ exam: "firstExam" }).catch(err =>
    res.status(500).json({
      error: err,
      status: 500,
      info: "error looking up questions db"
    })
  );
  const totalQuestions = ques[examTypes[examName].questionName].length;
  const marksObtained = user.examData[examTypes[examName].courseName].marks;
  const percentObtained = (marksObtained * 100) / totalQuestions;
  let examStatus;
  let jsonData = {
    exam: {
      examBasic: examName == "basic",
      examAdvanced: examName == "advanced",
      examProfessional: examName == "professional"
    },
    data: user,
    obtainedMarks: marksObtained,
    percent: percentObtained,
    total: totalQuestions
  };
  if (percentObtained >= 60) {
    // Yeah!
    examStatus = true;
    let d = new Date();
    console.log(`Last Attemp timestamp : ${findLastAttempt(user, examName)}`);
    // This is prevents dual addition of the same object based on the timestamp of the previous addition
    if (
      findLastAttempt(user, examName) == null ||
      Date.now() - findLastAttempt(user, examName) > 10000 // 10 second freeze time between giving exams
    ) {
      if (user.examData.payment[examTypes[examName].coursePayment_id] != true) {
        return res.redirect("/exams");
      }
      let date = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      // Post the 2 certificates
      renderCertificate.renderForIPFSHash(
        name,
        percentObtained,
        examName,
        date,
        bothRender => {
          if (!bothRender.uploaded) {
            res
              .status(500)
              .json({ error: bothRender.error, info: bothRender.info });
          } else {
            jsonData.certificateHash = bothRender.hash[1];
            jsonData.examStatus = examStatus;
            user.examData[examTypes[examName].courseName].attempts = 0;
            user.examData.payment[examTypes[examName].coursePayment_id] = false;
            var obj = {};
            obj["timestamp"] = Date.now();
            obj["marks"] = marksObtained;
            obj["total"] = totalQuestions;
            obj["headlessHash"] = bothRender.hash[0];
            obj["clientHash"] = bothRender.hash[1];
            obj["examType"] = examName;
            user.examData.certificateHash.push(obj);
            user.save();
            res.render("examResult", jsonData);
            // blockchainHelper.addToSC({
            //   courseName:examName,
            //   userName:user.name,
            //   timestamp:""+obj["timestamp"],
            //   marksObtained:marksObtained,
            //   totalQuestions:totalQuestions,
            //   headlessHash:bothRender.hash[0],
            //   clientHash:bothRender.hash[1]
            // },user.email)
          }
        }
      );
    } else {
      jsonData.certificateHash =
        user.examData.certificateHash[
          user.examData.certificateHash.length - 1
        ].clientHash;
      jsonData.examStatus = examStatus;
      res.render("examResult", jsonData);
    }
  } else {
    // No!
    jsonData.examStatus = false;
    res.render("examResult", jsonData);
  }
};

exports.getExamStatus = (req, res) => {
  console.log("local exam: ");
  var query = {};
  query = { email: req.user.email };
  User.findOne(query, function(err, user) {
    if (err != null) {
      res.status(500).json({
        error: err,
        info: "error in fetching the user from DB",
        status: 500
      });
    }
    readJSONFile(
      path.join(process.cwd(), "/dist/data/courses.json"),
      (err, json) => {
        if (err != null) {
          res.status(500).json({
            error: err,
            info: "error in fetching the course content",
            status: 500
          });
        }
        const examListData = {
          data: {
            course_1: user.examData.payment.course_1,
            course_2: user.examData.payment.course_2,
            course_3: user.examData.payment.course_3
          },
          json: json
        };
        // console.log("examlist data:::", examListData);
        res.render("examList", examListData);
      }
    );
  });
};

function findLastAttempt(user, examName) {
  let certiCount = user.examData.certificateHash.length;
  for (let i = certiCount - 1; i >= 0; i--) {
    if (user.examData.certificateHash[i].examType == examName) {
      return user.examData.certificateHash[i].timestamp;
    }
  }
  return null;
}

function scrambleQuestions(jsonData) {
  let scrambledData = jsonData;
  const len = jsonData.exam.length;
  for (let i = 0; i < len - 1; i++) {
    const x = Math.floor(Math.random() * (len - 1));
    const y = Math.floor(Math.random() * (len - 1));
    let tmp = scrambledData.exam[x];
    scrambledData.exam[x] = scrambledData.exam[y];
    scrambledData.exam[y] = tmp;
  }
  return scrambledData;
}
