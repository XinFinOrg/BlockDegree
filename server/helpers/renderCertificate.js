const ejs = require("ejs");
const crypto = require("crypto");
const ipfsClient = require("ipfs-http-client");
const qrcode = require("qrcode");
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

exports.renderForIPFSHash = (name, percent, examType, date, callback) => {
  console.log("Called RENDER IPFS");
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
      date: date
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
        renderWithQR(name,percent,examType,date,ipfsHash[0].hash,obj => {
          callback({
            uploaded: obj.uploaded,
            info: obj.info,
            hash: obj.hash,
            error: obj.error
          });
        })
      });
    }
  );
};

  var renderWithQR = async (
  name,
  percent,
  examType,
  date,
  hash,
  callback
) => {
  if (name == "" || percent == null || examType == "") {
    return callback({ uploaded: false, error: "bad parameters", hash: "" });
  }
  if (hash == "") {
    return callback({ uploaded: false, error: "bad parameters", hash: "" });
  }
  const dataURL = await qrcode.toDataURL(`https://ipfs-gateway.xinfin.network/${hash}`);// or the domain of where its hosted
  ejs.renderFile(
    __dirname + "/certificateWithQR.ejs",
    {
      rndDgt: crypto.randomBytes(32).toString("hex"),
      name: name,
      course: `Certified Blockchain ${examType} Expert`,
      score: percent,
      date: date,
      dataURL: dataURL
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
        return callback({
          uploaded: true,
          info: "",
          hash: [hash,ipfsHash[0].hash],
          error: null
        });
      });
    }
  );
};
