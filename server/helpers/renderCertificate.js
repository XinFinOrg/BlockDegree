const ejs = require("ejs");
const crypto = require("crypto");
const ipfsClient = require("ipfs-http-client");
const qrcode = require("qrcode");
const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

var clientIPFS = "";

if (process.env.IPFS_NETWORK == "local") {
  clientIPFS = new ipfsClient("/ip4/127.0.0.1/tcp/5001");
} else {
  clientIPFS = new ipfsClient({
    host: "ipfs.xinfin.network",
    port: 443,
    protocol: "https",
  });
}

const ViewPort = (type) => {
  switch (type) {
    case "course-exit": {
    }
    case "video-stream": {
      return {
        width: 900,
        height: 615,
      };
    }
    default: {
      return {
        width: 800,
        height: 600,
      };
    }
  }
};

exports.renderForIPFSHash = (
  name,
  percent,
  examType,
  d,
  donerName,
  type = null,
  callback
) => {
  let certiPath = "/certificate.ejs";

  if (type === "video-stream") certiPath = "/ikiguide.ejs";

  if (donerName == undefined || donerName == null) {
    donerName = "";
  }
  console.log("Called RENDER IPFS");
  let date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  let ts = d.getTime();
  if (name == "" || percent == null || examType == "") {
    return callback({ uploaded: false, error: "bad parameters", hash: "" });
  }
  ejs.renderFile(
    __dirname + certiPath,
    {
      rndDgt: crypto.randomBytes(32).toString("hex"),
      name: name,
      course: getDegreeContentDetails(examType).course,
      score: percent,
      date: date,
      ts: ts,
      examType: examType,
    },
    (err, data) => {
      if (err != null) {
        return callback({
          uploaded: false,
          info: "error in EJS rendering",
          hash: "",
          error: err,
        });
      }
      let buffer = Buffer.from(data, "utf-8");
      clientIPFS.add(buffer, async (err, ipfsHash) => {
        if (err != null) {
          return callback({
            uploaded: false,
            info: "error in adding certi to IPFS",
            hash: "",
            error: err,
          });
        }
        console.log("Uploaded");
        renderWithQR(
          name,
          percent,
          examType,
          d,
          ipfsHash[0].hash,
          donerName,
          type,
          (obj) => {
            callback({
              uploaded: obj.uploaded,
              info: obj.info,
              hash: obj.hash,
              error: obj.error,
            });
          }
        );
      });
    }
  );
};

var renderWithQR = async (
  name,
  percent,
  examType,
  d,
  hash,
  donerName,
  type = null,
  callback
) => {
  let certiPath = "/certificateWithQR.ejs";

  if (type === "video-stream") certiPath = "/ikiguideQR.ejs";

  let date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  let ts = d.getTime();
  if (name == "" || percent == null || examType == "") {
    return callback({ uploaded: false, error: "bad parameters", hash: "" });
  }
  if (hash == "") {
    return callback({ uploaded: false, error: "bad parameters", hash: "" });
  }
  const dataURL = await qrcode.toDataURL(
    `https://ipfs-gateway.xinfin.network/${hash}`
  ); // or the domain of where its hosted
  const degreeDetails = getDegreeContentDetails(examType);
  ejs.renderFile(
    __dirname + certiPath,
    {
      rndDgt: crypto.randomBytes(32).toString("hex"),
      name: name,
      course: degreeDetails.course,
      courseSub: degreeDetails.courseSub,
      topic: degreeDetails.topic,
      subTopic: degreeDetails.subTopic,
      score: Math.round(parseFloat(percent)) + "",
      date: date,
      dataURL: dataURL,
      ts: ts,
      examType: examType,
      donerName: donerName,
    },
    (err, data) => {
      if (err != null) {
        return callback({
          uploaded: false,
          info: "error in EJS rendering",
          hash: "",
          error: err,
        });
      }
      let buffer = Buffer.from(data, "utf-8");
      clientIPFS.add(buffer, async (err, ipfsHash) => {
        if (err != null) {
          return callback({
            uploaded: false,
            info: "error in adding certi to IPFS",
            hash: "",
            error: err,
          });
        }
        // save the buffer to cache

        clientIPFS.get(ipfsHash[0].hash, (err, files) => {
          if (err) {
            return callback({
              uploaded: false,
              info: "error in adding certi to IPFS",
              hash: "",
              error: err,
            });
          } else {
            files.forEach(async (file) => {
              var localPath = "server/cached/" + file.path + ".png";
              imgHTML = file.content.toString("utf-8");
              // Asynchronous Starts
              let browser;
              try {
                browser = await puppeteer.launch({
                  args: ["--no-sandbox", "--disable-setuid-sandbox"],
                });
                const page = await browser.newPage();
                await page.setViewport({
                  ...ViewPort(examType),
                  deviceScaleFactor: 1,
                });
                await page.setContent(imgHTML);
                await page.screenshot({ path: localPath });
              } catch (browserException) {
                console.error(
                  `Exeception occurred in between opening the headless-browser & taking screenshot: `,
                  browserException
                );
                return callback({
                  uploaded: false,
                  info: "error while screenshot in puppeteer",
                  hash: "",
                  error: browserException,
                });
              }

              browser.close().then(() => {
                // asynchronous
                b64content = fs.readFileSync(localPath, {
                  encoding: "base64",
                });
              });
            });
          }
        });

        return callback({
          uploaded: true,
          info: "",
          hash: [hash, ipfsHash[0].hash],
          error: null,
        });
      });
    }
  );
};

function getDegreeContentDetails(examType) {
  console.log("examType: ", examType);

  switch (examType) {
    case "basic": {
    }
    case "advanced": {
    }
    case "professional": {
      return {
        topic: "Blockchain",
        subTopic: "Basic Course For Engineers",
        course: `Certified Blockchain ${
          examType.charAt(0).toUpperCase() + examType.slice(1)
        } Expert`,
        courseSub: `Blockchain Certificate`,
      };
    }
    case "computing": {
      return {
        topic: "Cloud Computing",
        subTopic: "Basic Cloud Computing Course",
        course: `Cloud Computing Specialist`,
        courseSub: `Cloud Computing`,
      };
    }
    case "course-exit":
      return {
        topic: "Study Blockchain in 60 Minutes",
        subTopic: "Study Blockchain in 60 Minutes",
        course: `Study Blockchain in 60 Minutes`,
        courseSub: `Study Blockchain in 60 Minutes`,
      };

    case "wallet":{
      return {
        topic:"Blockchain Wallet",
        subTopic:"Basic Blockchain Wallet Course",
        course:`Blockchain Wallet Specialist`,
        courseSub:`Blockchain Wallet`
      }
    }
  }
}
