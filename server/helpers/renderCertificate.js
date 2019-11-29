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
    protocol: "https"
  });
}

exports.renderForIPFSHash = (name, percent, examType, d, callback) => {
  console.log("Called RENDER IPFS");
  let date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  let ts = d.getTime();
  if (name == "" || percent == null || examType == "") {
    return callback({ uploaded: false, error: "bad parameters", hash: "" });
  }
  ejs.renderFile(
    __dirname + "/certificate.ejs",
    {
      rndDgt: crypto.randomBytes(32).toString("hex"),
      name: name,
      course: `Certified Blockchain ${examType} Expert`,
      score: percent,
      date: date,
      ts:ts,
      examType: examType
    },
    (err, data) => {
      if (err != null) {
        return callback({
          uploaded: false,
          info: "error in EJS rendering",
          hash: "",
          error: err
        });
      }
      let buffer = Buffer.from(data, "utf-8");
      clientIPFS.add(buffer, async (err, ipfsHash) => {
        if (err != null) {
          return callback({
            uploaded: false,
            info: "error in adding certi to IPFS",
            hash: "",
            error: err
          });
        }
        console.log("Uploaded");
        renderWithQR(name, percent, examType, d, ipfsHash[0].hash, obj => {
          callback({
            uploaded: obj.uploaded,
            info: obj.info,
            hash: obj.hash,
            error: obj.error
          });
        });
      });
    }
  );
};

var renderWithQR = async (name, percent, examType, d, hash, callback) => {
  let date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
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
  ejs.renderFile(
    __dirname + "/certificateWithQR.ejs",
    {
      rndDgt: crypto.randomBytes(32).toString("hex"),
      name: name,
      course: `Certified Blockchain ${examType.charAt(0).toUpperCase() +
        examType.slice(1)} Expert`,
      score: percent,
      date: date,
      dataURL: dataURL,
      ts:ts,
      examType: examType
    },
    (err, data) => {
      if (err != null) {
        return callback({
          uploaded: false,
          info: "error in EJS rendering",
          hash: "",
          error: err
        });
      }
      let buffer = Buffer.from(data, "utf-8");
      clientIPFS.add(buffer, async (err, ipfsHash) => {
        if (err != null) {
          return callback({
            uploaded: false,
            info: "error in adding certi to IPFS",
            hash: "",
            error: err
          });
        }
        // save the buffer to cache

        clientIPFS.get(ipfsHash[0].hash, (err, files) => {
          if (err) {
            return callback({
              uploaded: false,
              info: "error in adding certi to IPFS",
              hash: "",
              error: err
            });
          } else {
            files.forEach(async file => {
              var localPath = "server/cached/" + file.path + ".png";
              imgHTML = file.content.toString("utf-8");
              // Asynchronous Starts
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
              } catch (browserException) {
                console.error(
                  `Exeception occurred in between opening the headless-browser & taking screenshot: `,
                  browserException
                );
                return callback({
                  uploaded: false,
                  info: "error while screenshot in puppeteer",
                  hash: "",
                  error: browserException
                });
              }

              browser.close().then(() => {
                // asynchronous
                b64content = fs.readFileSync(localPath, {
                  encoding: "base64"
                });
              });
            });
          }
        });

        return callback({
          uploaded: true,
          info: "",
          hash: [hash, ipfsHash[0].hash],
          error: null
        });
      });
    }
  );
};
