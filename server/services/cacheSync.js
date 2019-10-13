const User = require("../models/user");
const ipfsClient = require("ipfs-http-client");
const fs = require("fs");
const puppeteer = require("puppeteer");

const xinfinIPFSClient = new ipfsClient({
  host: "ipfs.xinfin.network",
  port: 443,
  protocol: "https"
});

exports.syncCertificateCache = async (req, res) => {
  console.log(`Started Cache Sync at ${new Date(Date.now())}`);
  let hashMap = {};
  let allUsers;
  try {
    allUsers = await User.find({});
  } catch (e) {
    console.error(
      "Error while fetching all the users atyv cacheSync.syncCertificateCache: ",
      e
    );
    return res.json({
      status: false,
      error: "error while fecthing users at cacheSync.syncCertificateCache"
    });
  }

  for (let i = 0; i < allUsers.length; i++) {
    let currUser = allUsers[i];
    let currUserCertificates = currUser.examData.certificateHash;
    for (let j = 1; j < currUserCertificates.length; j++) {
      let currentHash = currUserCertificates[j].clientHash;
      if (checkCached(currentHash)) {
        // already cached, continue
        continue;
      } else {
        done = await cacheCertificate(currentHash, currUser.email);
        console.log(done);
        hashMap[currentHash] = done;
      }
    }
  }
  console.log(hashMap);
  res.json({ hashMap: hashMap });
};

function checkCached(hash) {
  return fs.existsSync(`server/cached/${hash}.png`);
}

async function cacheCertificate(hash, email) {
  console.log(`Caching certificate ${hash} of user ${email}`);
  let files;
  let retStatus = false;
  try {
    files = await xinfinIPFSClient.get(hash);
  } catch (er) {
    console.error("Exception while getting files from IPFS: ", er);
    retStatus = false;
  }
  for (let k = 0; k < files.length; k++) {
    let file = files[k];
    let localPath = "server/cached/" + file.path + ".png";
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
      retStatus = false;
    }
    browser.close();
    retStatus = true;
    return retStatus;
  }
}
