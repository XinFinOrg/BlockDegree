const fs = require("fs");
const User = require("../models/user");

function newDefaultUser() {
  return new User({
    email: "",
    name: "",
    created: "",
    lastActive: "",
    examData: {
      payment: {
        course_1: false,
        course_2: false,
        course_3: false
      },
      examBasic: {
        attempts: 0,
        marks: 0
      },
      examAdvanced: {
        attempts: 0,
        marks: 0
      },
      examProfessional: {
        attempts: 0,
        marks: 0
      },
      certificateHash: [{}]
    },
    auth: {
      facebook: {
        id: "",
        accessToken: "",
        refreshToken: ""
      },
      twitter: {
        id: "",
        token: "",
        tokenSecret: ""
      },
      google: {
        id: "",
        accessToken: "",
        refreshToken: ""
      },
      local: {
        password: "",
        isVerified: false
      },
      linkedin: {
        accessToken: "",
        id: ""
      }
    }
  });
}

exports.migrateFrom = (req, res) => {
  // let dataPath = req.body.dataPath;
  const dataArr = fs
    .readFileSync("data.json")
    .toString()
    .split("\n");
  dataArr.forEach(async obj => {
    const objJSON = await JSON.parse(obj);
    const newUser = newDefaultUser();
    newUser._id = objJSON._id.$oid;

    try {
      newUser.email = objJSON.local.email;
      newUser.auth.local.password = objJSON.local.password;
      newUser.auth.local.isVerified = objJSON.local.isVerified;
      newUser.examData.payment.course_1 = objJSON.local.payment.course_1;
      newUser.examData.payment.course_2 = objJSON.local.payment.course_2;
      newUser.examData.payment.course_3 = objJSON.local.payment.course_3;

      newUser.examData.examBasic.marks = Number(
        objJSON.local.examBasic.marks.$numberInt
      );
      newUser.examData.examBasic.attempts = Number(
        objJSON.local.examBasic.attempts.$numberInt
      );

      newUser.examData.examAdvanced.marks = Number(
        objJSON.local.examAdvanced.marks.$numberInt
      );
      newUser.examData.examAdvanced.attempts = Number(
        objJSON.local.examAdvanced.attempts.$numberInt
      );

      newUser.examData.examProfessional.marks = Number(
        objJSON.local.examProfessional.marks.$numberInt
      );
      newUser.examData.examProfessional.attempts = Number(
        objJSON.local.examProfessional.attempts.$numberInt
      );

      newUser.save();
    } catch (e) {
      console.log(`Caught error ${e} for ${objJSON.local.email}`);
    }
  });
  res.status(200).json({ ok: true });
};
