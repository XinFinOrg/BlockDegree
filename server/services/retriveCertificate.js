const User = require("../models/user");
const ipfsClient = require("ipfs-http-client");
const puppeteer = require("puppeteer");
const fs = require("fs");
const renderCertificate = require("../helpers/renderCertificate");
const socialPostListener = require("../listeners/postSocial").em;

let clientIPFS = "";

const xinfinClient = new ipfsClient({
  host: "ipfs.xinfin.network",
  port: 443,
  protocol: "https"
});

const localClient = new ipfsClient("/ip4/127.0.0.1/tcp/5001");

if (process.env.IPFS_NETWORK == "local") {
  clientIPFS = localClient;
} else {
  clientIPFS = xinfinClient;
}

const examTypes = {
  basic: {
    courseName: "examBasic",
    questionName: "questionsBasic",
    coursePayment_id: "course_1",
  },
  advanced: {
    courseName: "examAdvanced",
    questionName: "questionsAdvanced",
    coursePayment_id: "course_2",
  },
  professional: {
    courseName: "examProfessional",
    questionName: "questionsProfessional",
    coursePayment_id: "course_3",
  },
  computing: {
    courseName: "examComputing",
    questionName: "questionsComputing",
    coursePayment_id: "course_4",
  },
  wallet: {
    courseName: "examWallet",
    questionName: "questionsWallet",
    coursePayment_id: "course_5",
  },
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

exports.getAllCertificates = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ email: req.user.email });
  } catch (err) {
    console.log("Error while fetching the user from mongodb: ", err);
    res.json({
      certificateHash: null,
      status: 500,
      msg:
        "looks like our database is under maintenance, please try again after some time"
    });
  }
  if (!user) {
    return res.redirect("/login");
  }
  if (user.examData.certificateHash.length < 1) {
    return res.status(412).json({
      certificateHash: null,
      status: 412,
      msg: "no certificates associated with this account"
    });
  }
  res.json({
    certificateHash: user.examData.certificateHash,
    status: 200,
    msg: "ok"
  });
};

exports.getCertificatesFromCourse = async (req, res) => {
  if (req.body.course == "" || req.body.course == undefined) {
    return res.status(400).json({
      error: "bad request: req.body.course id empty / undefined",
      status: 400
    });
  }
  const course = req.body.course;
  let user;
  try {
    user = await User.findOne({ email: req.user.email });
  } catch (e) {
    console.error("Exception while fetching user: ", e);
    return res.status(500).json({
      error: "DB is under maintainence pls try again after sometime",
      status: 500
    });
  }
  let certificateHash = [{}];
  for (obj of user.examData.certificateHash) {
    if (obj.examType == course) {
      certificateHash.push(obj);
    }
  }
  res
    .status(200)
    .json({ certificateHash: certificateHash, status: 200, error: null });
};

exports.generateCertificatesFromCourseByEmail = async (req, res) => {
  if (req.body.course == "" || req.body.course == undefined) {
    return res.status(400).json({
      error: "bad request: req.body.course id empty / undefined",
      status: 400
    });
  }
  const course = req.body.course;
  const marksObtained = req.body.marksObtained;
  const maximumMarks = req.body.maximumMarks;
  const email = req.body.email;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (e) {
    console.error("Exception while fetching user: ", e);
    return res.status(500).json({
      error: "DB is under maintainence pls try again after sometime",
      status: 500
    });
  }
  let name = "";
  if (user.name == "" || user.name == undefined) {
    // old email id.
    name = user.email;
  } else {
    name = user.name;
  }
  const percentObtained = (marksObtained * 100) / maximumMarks;
  const examName = Object.entries(examTypes).find(([_k,v])=>v.coursePayment_id === course)[0]
  let jsonData = {
    exam: {
      examBasic: examName == "basic",
      examAdvanced: examName == "advanced",
      examProfessional: examName == "professional",
      examComputing: examName == "computing",
      examWallet: examName == "wallet",
    },
    data: user,
    obtainedMarks: marksObtained,
    percent: percentObtained,
    total: maximumMarks,
  };

  examStatus = true;
  let d = new Date();
  console.log(`Last Attemp timestamp : ${findLastAttempt(user, examName)}`);
  if (user.examData.payment[course] != true) {
    return res.redirect("/exams");
  }
  let donerName =
    user.examData.payment[`${course}_doner`];
  // Post the 2 certificates
  renderCertificate.renderForIPFSHashWithoutQR(
    name,
    percentObtained,
    examName,
    d,
    donerName,
    null,
    (bothRender) => {
      if (!bothRender.uploaded) {
        console.log("error:", bothRender);
        return res.render("displayError", {
          error: "Its not you, its us. Please try again after some time.",
        });
      } else {
        jsonData.certificateHash = bothRender.hash[1];
        jsonData.examStatus = examStatus;
        user.examData[examTypes[examName].courseName].attempts = 0;
        user.examData.payment[examTypes[examName].coursePayment_id] = false;
        var obj = {};
        const expiryDate = d;
        expiryDate.setDate(expiryDate.getDate() - 1);
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
        expiryDate.setHours(23, 59, 59, 999);
        obj["timestamp"] = Date.now();
        obj["marks"] = marksObtained;
        obj["total"] = maximumMarks;
        obj["headlessHash"] = bothRender.hash[0];
        obj["clientHash"] = bothRender.hash[1];
        obj["examType"] = examName;
        obj["paymentMode"] =
          user.examData.payment[
            examTypes[examName].coursePayment_id + "_payment"
          ] === undefined
            ? ""
            : user.examData.payment[
            examTypes[examName].coursePayment_id + "_payment"
            ];
        obj["expiryDate"] = expiryDate.getTime();
        user.examData.certificateHash.push(obj);
        user.examData.payment[
          examTypes[examName].coursePayment_id + "_payment"
        ] = "";
        user.examData.payment[
          examTypes[examName].coursePayment_id + "_doner"
        ] = "";
        user.save();
        console.log(bothRender,'1################################')
      
        res
          .status(200)
          .json(jsonData);
        socialPostListener.emit("varTriggerUpdate", "certificates");
        return;
      }
    }
  );
};


// Very heavy process
// get_user -> validate_hash -> get_user -> fetch_hash_frpm_IPFS -> get_screenshot -> save_screenshot -> send_screenshot -> delete_screenshot
exports.downloadCertificate = async (req, res) => {
  if (req.body.hash == "" || req.body.hash == undefined) {
    return res.status(400).json({
      error: "please provide certificate hash",
      status: 400,
      uploaded: false
    });
  }
  const hash = req.body.hash;
  let imgHTML = "";
  let user;
  let pathToFile = "";
  if (checkCached(hash)) {
    console.log("serving from cache")
    pathToFile = `server/cached/${hash}.png`;
    return res.download(pathToFile, function(errDownload) {
      if (errDownload) {
        console.log(`Error sending download : ${pathToFile} : ${errDownload}`);
      }
    });
  } else {
    try {
      user = await User.findOne({ email: req.user.email });
    } catch (e) {
      console.log("Error while fetching the user from mongodb: ", e);
      return res.status(500).json({
        certificateHash: null,
        status: 500,
        uploaded: false,
        error:
          "looks like our database is under maintenance, please try again after some time"
      });
    }
    if (!user) {
      return res.status(400).json({ error: "not able to fetch user" });
    }
    for (obj of user.examData.certificateHash) {
      if (obj.clientHash != undefined && obj.clientHash == hash) {
        clientIPFS.get(hash, (err, files) => {
          if (err) {
            return res.status(500).json({ uploaded: false, error: err });
          }
          files.forEach(async file => {
            let localPath = "server/cached/" + file.path + ".png";
            imgHTML = file.content.toString("utf-8");
            let browser;
            try {
              browser = await puppeteer.launch({
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
              });
              const page = await browser.newPage();
              await page.setViewport({
                width: 800,
                height: 600,
                deviceScaleFactor: 1
              });
              await page.setContent(imgHTML);
              await page.screenshot({ path: localPath });
            } catch (e) {
              console.log("Error while taking screenshot from browser: ", e);
              return res.status(500).json({
                certificateHash: null,
                status: 500,
                uploaded: false,
                error:
                  "Looks like something went wrong, please try again after sometime or contact us via contact-us page"
              });
            }
            browser
              .close()
              .then(() => {
                pathToFile = localPath;
                return res.download(pathToFile, function(errDownload) {
                  if (errDownload) {
                    console.log(
                      `Error sending download : ${pathToFile} : ${errDownload}`
                    );
                  }
                });
                // return res.download(localPath, function(errDownload) {
                //   if (errDownload) {
                //     console.log(
                //       `Error sending download : ${localPath} : ${errDownload}`
                //     );
                //   }
                // });
              })
              .catch(e => {
                console.log(`exception at browser.close(): `, e);
                return res.status(500).json({
                  error:
                    "some error has occured please try again later or contact us via contact-us page"
                });
              });
          });
        });
      }
    }
  }
};

function checkCached(hash) {
  return fs.existsSync(`server/cached/${hash}.png`);
}
