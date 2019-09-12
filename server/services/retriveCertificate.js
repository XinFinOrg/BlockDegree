const User = require("../models/user");
const ipfsClient = require("ipfs-http-client");
const puppeteer = require("puppeteer");
const fs = require("fs");

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

exports.getAllCertificates = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).catch(err => {
    console.log("Error while fetching the user from mongodb: ", err);
    res.json({
      certificateHash: null,
      status: 500,
      msg:
        "looks like our database is under maintenance, please try again after some time"
    });
  });
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
    res.status(400).json({
      error: "bad request: req.body.course id empty / undefined",
      status: 400
    });
  }
  const course = req.body.course;
  const user = await User.findOne({ email: req.user.email }).catch(err => {
    res.status(500).json({
      error: "DB is under maintainence pls try again after sometime",
      status: 500
    });
  });
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

// Very heavy process
// get_user -> validate_hash -> get_user -> fetch_hash_frpm_IPFS -> get_screenshot -> save_screenshot -> send_screenshot -> delete_screenshot
exports.downloadCertificate = async (req, res) => {
  if (req.body.hash == "" || req.body.hash == undefined) {
    res.status(400).json({
      error: "please provide certificate hash",
      status: 400,
      uploaded: false
    });
  }
  const hash = req.body.hash;
  let imgHTML = "";
  const user = await User.findOne({ email: req.user.email }).catch(err => {
    console.log("Error while fetching the user from mongodb: ", err);
    return res.status(500).json({
      certificateHash: null,
      status: 500,
      uploaded: false,
      error:
        "looks like our database is under maintenance, please try again after some time"
    });
  });
  if (!user) {
    return res.redirect("/login");
  }
  for (obj of user.examData.certificateHash) {
    if (obj.clientHash != undefined && obj.clientHash == hash) {
      clientIPFS.get(hash, (err, files) => {
        if (err) {
          return res.status(500).json({ uploaded: false, error: err });
        }
        files.forEach(async file => {
          let localPath = "tmp/" + file.path + ".png";
          imgHTML = file.content.toString("utf-8");
          const browser = await puppeteer.launch({
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
          browser.close().then(() => {
            res.download(localPath, function(errDownload) {
              if (errDownload != null || errDownload != undefined) {
                console.log(
                  `Error sending download : ${localPath} : ${errDownload}`
                );
              }
              fs.unlink(localPath, errUnlink => {
                if (errUnlink != null || errUnlink != undefined) {
                  console.log(
                    `Error while deleting : ${localPath} : ${errUnlink}`
                  );
                }
              });
            });
          });
        });
      });
    }
  }
};
