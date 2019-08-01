const path = require("path");
var User = require("../models/user");
var questions = require("../models/question");
var ejs = require("ejs");
const utils = require("../utils.js");
var crypto = require("crypto");

const ipfsClient = require("ipfs-http-client");

const xinfinClient = new ipfsClient({
  host: "ipfs.xinfin.network",
  port: 443,
  protocol: "https"
});

const localClient = new ipfsClient("/ip4/127.0.0.1/tcp/5001");

let { readJSONFile } = utils;

exports.submitExam = (req, res, next) => {
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
  query = {email:req.user.email};

  if (examName === "basic") {
    if (attempts != null && attempts < 3) {
      questions.findOne({ exam: "firstExam" }).then((result, error) => {
        for (let index = 0; index < result.questionsBasic.length; index++) {
          if (
            parseInt(request[index]) + 1 ==
            result.questionsBasic[index].answer
          ) {
            // marks++;
          }
          // Cheatcode activated
          marks++;
        }
        attempts += 1;
        User.findOneAndUpdate(
          query,
          {
            $set: {
              "examData.examBasic.attempts": attempts,
              "examData.examBasic.marks": marks
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

    if (attemptsAdvanced != null && attemptsAdvanced < 3) {
      console.log("valid attempt");

      questions.findOne({ exam: "firstExam" }).then((result, error) => {
        console.log("advanced result", result);
        console.log("advanced result:::", result.questionsAdvanced);
        for (let index = 0; index < result.questionsAdvanced.length; index++) {
          if (
            parseInt(req.body[index]) + 1 ==
            result.questionsAdvanced[index].answer
          ) {
            // marks++;
          }
          //Cheatcode activated
          marks++;
        }
        attemptsAdvanced += 1;
        console.log("Marks", marks);
        User.findOneAndUpdate(
          query,
          {
            $set: {
              "examData.examAdvanced.attempts": attemptsAdvanced,
              "examData.examAdvanced.marks": marks
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
            // marks++;
          }
          // Cheatcode activated
          marks++;
        }
        attemptsProfessional += 1;
        console.log("Marks", marks);
        User.findOneAndUpdate(
          query,
          {
            $set: {
              "examData.examProfessional.attempts": attemptsProfessional,
              "examData.examProfessional.marks": marks
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
};

exports.getBasicExam = (req, res) => {
  readJSONFile(
    path.join(process.cwd(), "/server/protected/blockchain-basic.json"),
    (err, json) => {
      if (err) {
        throw err;
      }
      console.log("test quetions basic:", json);
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
      console.log("test quetions advanced:", json);
      res.render("blockchainAdvanced", json);
    }
  );
};

exports.getProfessionalExam = (req, res) => {
  console.log("inside block prof");
  readJSONFile(
    path.join(process.cwd(), "/server/protected/blockchain-Professional.json"),
    (err, json) => {
      console.log("block pro 2", err, json);
      if (err) {
        throw err;
      }
      console.log("test quetions professional:", json);
      res.render("blockchainProfessional", json);
    }
  );
};

exports.getExamResult = (req, res) => {
  const backUrl = req.header("Referer");

  var name = req.user.name;

  // if (req.user.local.email != "") {
  //   name = req.user.local.name;
  // } else if (req.user.google.email != "") {
  //   name = req.user.google.name;
  // } else if (req.user.twitter.email != "") {
  //   name = req.user.twitter.name;
  // } else if (req.user.facebook.email != "") {
  //   name = req.user.facebook.name;
  // }

  var query = {};
  query = {email:req.user.email};

  const examName = backUrl.split("/")[3].split("-")[1];
  if (examName === "basic") {
    User.findOne(query).then((result, error) => {
      const examTotal = 50;
      let obtainedMarks = result.examData.examBasic.marks;
      let percent = (obtainedMarks * 100) / examTotal;
      let examStatus;
      let jsonData = {
        exam: {
          examBasic: true,
          examAdvanced: false,
          examProfessional: false
        },
        data: result,
        obtainedMarks: obtainedMarks,
        percent: percent,
        total:examTotal
      };
      if (percent >= 60) {
        examStatus = true;
        let d = new Date();

        if (
          result.examData.certificateHash[
            result.examData.certificateHash.length - 1
          ].timestamp == undefined ||
          Date.now() -
            result.examData.certificateHash[
              result.examData.certificateHash.length - 1
            ].timestamp >
            5000
        ) {
          let date = d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
          });
          ejs.renderFile(
            __dirname + "/certificate.ejs",
            {
              rndDgt: crypto.randomBytes(32).toString("hex"),
              name: name,
              course: "Certified Blockchain Basic Expert",
              score: percent,
              date: date
            },
            (err, data) => {
              let buffer = Buffer.from(data, "utf-8");
              localClient.add(buffer, async (err, ipfsHash) => {
                if (err != null) {
                  // handle IPFS error
                }
                jsonData.certificateHash = ipfsHash[0].hash;
                jsonData.examStatus = examStatus;
                result.examData.examBasic.attempts = 0;
                result.examData.payment.course_1 = false;
                var obj = {};
                obj["timestamp"] = Date.now();
                obj["marks"] = obtainedMarks;
                obj["total"] = examTotal;
                obj["hash"] = ipfsHash[0].hash;
                obj["examType"] = "basic";
                result.examData.certificateHash.push(obj);
                result.save();
                res.render("examResult", jsonData);
              });
            }
          );
        } else {
          jsonData.certificateHash =
            result.examData.certificateHash[
              result.examData.certificateHash.length - 1
            ].hash;
          jsonData.examStatus = examStatus;
          res.render("examResult", jsonData);
        }
      } else if (percent < 60) {
        examStatus = false;
        jsonData.examStatus = examStatus;
        res.render("examResult", jsonData);
      }
    });
  } else if (examName === "advanced") {
    User.findOne(query).then((result, error) => {
      console.log("result advanced:", result, error);
      const examTotal = 50;
      let obtainedMarks = result.examData.examAdvanced.marks;
      console.log("obtained marks",obtainedMarks)
      let percent = (obtainedMarks * 100) / examTotal;
      let examStatus;
      let jsonData = {
        exam: {
          examBasic: false,
          examAdvanced: true,
          examProfessional: false
        },
        data: result,
        obtainedMarks: obtainedMarks,
        total:examTotal,
        percent: percent
      };

      if (percent >= 60) {
        if (
          result.examData.certificateHash[
            result.examData.certificateHash.length - 1
          ].timestamp == undefined ||
          Date.now() -
            result.examData.certificateHash[
              result.examData.certificateHash.length - 1
            ].timestamp >
            5000
        ) {
          examStatus = true;
          let d = new Date();
          let date = d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
          });
          ejs.renderFile(
            __dirname + "/certificate.ejs",
            {
              rndDgt: crypto.randomBytes(32).toString("hex"),
              name: name,
              course: "Certified Bitcoin Blockchain Expert",
              score: percent,
              date: date
            },
            (err, data) => {
              let buffer = Buffer.from(data, "utf-8");
              localClient.add(buffer, (err, ipfsHash) => {
                jsonData.examStatus = examStatus;
                jsonData.certificateHash = ipfsHash[0].hash;
                result.examData.examAdvanced.attempts = 0;
                result.examData.payment.course_2 = false;
                var obj = {};
                obj["timestamp"] = Date.now();
                obj["marks"] = obtainedMarks;
                obj["total"] = examTotal;
                obj["hash"] = ipfsHash[0].hash;
                obj["examType"] = "advanced";
                result.examData.certificateHash.push(obj);
                result.save();
                res.render("examResult", jsonData);
              });
            }
          );
        } else {
          jsonData.certificateHash =
            result.examData.certificateHash[
              result.examData.certificateHash.length - 1
            ].hash;
          jsonData.examStatus = true;
          console.log("JSON in second return: ",jsonData)
          res.render("examResult", jsonData);
        }
      } else if (percent < 60) {
        examStatus = false;
        jsonData.examStatus = examStatus;
        res.render("examResult", jsonData);
      }
    });
  } else if (examName === "professional") {
    User.findOne(query).then((result, error) => {
      console.log("result professional:", result, error);
      const examTotal = 50;
      let obtainedMarks = result.examData.examProfessional.marks;
      console.log("obtainedMarks>>>>>>>", obtainedMarks);
      let percent = (obtainedMarks * 100) / examTotal;
      let examStatus;
      let jsonData = {
        exam: {
          examBasic: false,
          examAdvanced: false,
          examProfessional: true
        },
        data: result,
        obtainedMarks: obtainedMarks,
        percent: percent,
        total:examTotal
      };
      if (percent >= 60) {
        if (
          result.examData.certificateHash[
            result.examData.certificateHash.length - 1
          ].timestamp == undefined ||
          Date.now() -
            result.examData.certificateHash[
              result.examData.certificateHash.length - 1
            ].timestamp >
            5000
        ) {
          examStatus = true;
          let d = new Date();
          let date = d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
          });
          ejs.renderFile(
            __dirname + "/certificate.ejs",
            {
              rndDgt: crypto.randomBytes(32).toString("hex"),
              name: name,
              course: "examProfessional",
              score: percent,
              date: date
            },
            (err, data) => {
              let buffer = Buffer.from(data, "utf-8");
              localClient.add(buffer, (err, ipfsHash) => {
                console.log(ipfsHash);
                jsonData.data=result;
                jsonData.marks=obtainedMarks;
                jsonData.percent=percent;
                result.examData.examProfessional.attempts = 0;
                result.examData.payment.course_3 = false;
                jsonData.examStatus = true;
                jsonData.certificateHash = ipfsHash[0].hash;
                var obj = {};
                obj["timestamp"] = Date.now();
                obj["marks"] = obtainedMarks;
                obj["total"] = examTotal;
                obj["hash"] = ipfsHash[0].hash;
                obj["examType"] = "professional";
                result.examData.certificateHash.push(obj);
                result.save();
                res.render("examResult", jsonData); // makes re-load the screen, should be partial rendering.
              });
            }
          );
        } else {
          jsonData.certificateHash =
            result.examData.certificateHash[
              result.examData.certificateHash.length - 1
            ].hash;
          jsonData.examStatus = true;
          res.render("examResult", jsonData);
        }
      } else if (percent < 60) {
        examStatus = false;
        jsonData.examStatus = examStatus;
        res.render("examResult", jsonData);
      }
    });
  }
};

exports.getExamStatus = (req, res) => {
  console.log("local exam: ");
  var query = {};
  query = {email:req.user.email};
  User.findOne(query, function(err, user) {
    if (err) {
      throw err;
    }
    readJSONFile(
      path.join(process.cwd(), "/dist/data/courses.json"),
      (err, json) => {
        if (err) {
          throw err;
        }

        const examListData = {
          data: {
            course_1: user.examData.payment.course_1,
            course_2: user.examData.payment.course_2,
            course_3: user.examData.payment.course_3
          },
          json: json
        };
        console.log("examlist data:::", examListData);
        res.render("examList", examListData);
      }
    );
  });
};
