var twit = require("twit");
var ipfsClient = require("ipfs-http-client");
var puppeteer = require("puppeteer");
var fs = require("fs");
const User = require("../models/user");
const axios = require("axios");
const BitlyClient = require("bitly").BitlyClient;

require("dotenv").config();

// Rate  Limited 1000 calls per hour
const bitly = new BitlyClient(process.env.BITLY_ACCESS_TOKEN, {});

var clientIPFS = "";
const xinfinClient = new ipfsClient({
  host: "ipfs.xinfin.network",
  port: 443,
  protocol: "https"
});
const localClient = new ipfsClient("/ip4/127.0.0.1/tcp/5001");
if (process.env.IPFS_NETWORK == "local") {
  clientIPFS = localClient;
} else if (process.env.IPFS_NETWORK == "xinfin") {
  clientIPFS = xinfinClient;
}

exports.postTwitter = async (req, res) => {
  console.log("Called share on twitter");
  console.log(req.body);
  if (!req.user) {
    return res.redirect("/login");
  }
  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return res.redirect("/login");
  }
  if (
    user.auth.twitter.token == "" ||
    user.auth.twitter.token == undefined ||
    user.auth.twitter.tokenSecret == "" ||
    user.auth.twitter.tokenSecret == undefined
  ) {
    return res.redirect("/auth/twitter");
  }
  const hash =
    req.body.hash ||
    user.examData.certificateHash[user.examData.certificateHash.length - 1]
      .clientHash;
  let fullURL = "";
  let shortURL = "";
  if (process.env.IPFS_NETWORK == "local") {
    fullURL = `http://localhost:8081/ipfs/${hash}`;
  } else if (process.env.IPFS_NETWORK == "xinfin") {
    fullURL = `https://ipfs-gateway.xinfin.network/${hash}`;
  }

  try {
    let shortUrlObj = await bitly.shorten(fullURL);
    shortURL = shortUrlObj.url;
  } catch (e) {
    console.error(`Error while shortning the URL ${fullURL} Error: ${e}`);
    shortURL = fullURL;
  }

  let msg =
    req.body.msg ||
    `Hey, I just got certified in blockchain from Blockdegree.org. Check it out!!`;
  if (req.body.certiLink == "true") {
    msg += `\n Link : ${shortURL} `;
  }
  const currUser = await User.findOne({ email: req.user.email });
  var config = getTwitterConfig(
    process.env.TWITTER_CLIENT_ID,
    process.env.TWITTER_CLIENT_SECRET,
    currUser.auth.twitter.token,
    currUser.auth.twitter.tokenSecret
  );
  var T = new twit(config);
  var imgHTML = "";

  clientIPFS.get(hash, (err, files) => {
    if (err) {
      res.json({ uploaded: false, error: err });
    }
    files.forEach(async file => {
      var localPath = "tmp/" + file.path + ".png";
      imgHTML = file.content.toString("utf-8");
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({
        width: 960,
        height: 760,
        deviceScaleFactor: 1
      });
      await page.setContent(imgHTML);
      await page.screenshot({ path: localPath });
      browser.close().then(() => {
        var b64content = fs.readFileSync(localPath, { encoding: "base64" });
        // User should be able to set the status for post
        T.post("media/upload", { media_data: b64content }, function(
          err,
          data,
          response
        ) {
          if (err) {
            console.log("ERROR:");
            console.log(err);
            res.json({ uploaded: false, error: err });
          } else {
            T.post(
              "statuses/update",
              {
                status: msg,
                media_ids: new Array(data.media_id_string)
              },
              function(err, data, response) {
                if (err) {
                  console.log("ERROR: ", err);
                  res.json({ uploaded: false, error: err });
                } else {
                  console.log("Posted the status!");
                }
              }
            );
          }
        });
        fs.unlink(localPath, err => {
          if (err != null) {
            console.log("Error while deleting te temp-file at: ", localPath);
            res.json({ uploaded: true, error: null });
          }
        });
      });
    });
  });
  return res.json({ uploaded: true, error: null });
};

exports.postLinkedin = async (req, res) => {
  console.log(req.body);
  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return res.redirect("/login");
  }
  if (
    user.auth.linkedin.accessToken == "" ||
    user.auth.linkedin.accessToken == undefined ||
    user.auth.linkedin.id == "" ||
    user.auth.linkedin.id == undefined
  ) {
    // set linkedin credentials and post.
    return res.redirect("/auth/linkedin");
  }
  const hash =
    req.body.hash ||
    user.examData.certificateHash[user.examData.certificateHash.length - 1]
      .clientHash;
  let fullURL = "";
  let shortURL = "";
  if (process.env.IPFS_NETWORK == "local") {
    fullURL = `http://localhost:3000/ipfs/${hash}`;
  } else if (process.env.IPFS_NETWORK == "xinfin") {
    fullURL = `https://ipfs-gateway.xinfin.network/${hash}`;
  }
  try {
    let shortUrlObj = await bitly.shorten(fullURL);
    shortURL = shortUrlObj.url;
  } catch (e) {
    console.error(`Error while shortning the URL ${fullURL}; Error: ${e}`);
    shortURL = fullURL;
    console.log(`Using full URL for ${req.user.email} Link: ${shortURL}`);
  }
  let msg =
    req.body.msg ||
    `Hey, I just got certified in blockchain from Blockdegree.org. Check it out!!`;
  if (req.body.certiLink == "true") {
    msg += `\n Link : ${shortURL} `;
  }
  const response = await axios({
    method: "post",
    url: "https://api.linkedin.com/v2/ugcPosts",
    headers: {
      "X-Restli-Protocol-Version": "2.0.0",
      Authorization: `Bearer ${user.auth.linkedin.accessToken}`
    },
    data: {
      author: `urn:li:person:${user.auth.linkedin.id}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: msg
          },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              description: {
                text: "Blockdegree - XinFin's opensource blockchain training"
              },
              originalUrl: "https://blockdegree.org/",
              title: {
                text: "XinFin's Blockchain Training"
              }
            }
          ]
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    }
  }).catch(err => {
    res.json({ uploaded: false, error: err });
  });
  console.log(response.status);
  return res.json({ uploaded: true, error: null, status: response.status });
};

exports.postFacebook = async (req, res) => {};

// Not wokring
// Isuue in uploading the image to the uploadURL; tried cURL, httpie, axios
// Error: status code 400, bad request error
exports.uploadImageLinkedin = async (req, res) => {
  // set the credentials from req.user;
  const authToken = "";
  const personURN = "";
  var response = await axios({
    method: "post",
    url: "https://api.linkedin.com/v2/assets?action=registerUpload",
    headers: {
      "X-Restli-Protocol-Version": "2.0.0",
      Authorization: `Bearer ${authToken}`
    },
    data: {
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: `urn:li:person:${personURN}`,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent"
          }
        ]
      }
    }
  });

  // const uploadURL = response.data.value;
  const uploadMechnism =
    response.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ];
  const uploadURL = uploadMechnism.uploadUrl;
  const asset = response.data.value.asset;

  console.log("ASSET: ", asset);
  console.log("UploadURL : ", uploadURL);

  // This code below is th issue; ugcPosts is working fine.

  // exec(`curl -i --upload-file /home/rudresh/test.png --header "Authorization: Bearer ${authToken}" '${uploadURL}'`,(err,stdout,stderr) => {
  //   if (err!=null){
  //     throw err
  //   }
  // })

  // exec(`http POST ${uploadURL}  @/home/rudresh/test.png "Authorization:Bearer ${authToken}"`);

  const resp = await axios({
    method: "post",
    url: "https://api.linkedin.com/v2/ugcPosts",
    headers: {
      "X-Restli-Protocol-Version": "2.0.0",
      Authorization: `Bearer ${authToken}`
    },
    data: {
      author: `urn:li:person:${personURN}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text:
              "Feeling inspired after meeting so many talented individuals at this year's conference. #talentconnect"
          },
          shareMediaCategory: "NONE",
          media: [
            {
              status: "READY",
              description: {
                text: "Center stage!"
              },
              media: asset,
              title: {
                text: "LinkedIn Talent Connect 2018"
              }
            }
          ]
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    }
  }).catch(err => {
    throw err;
  });
  console.log(resp.status);
};

// urn:li:digitalmediaAsset:C5122AQGhQP0CaqFy0Q
// https://api.linkedin.com/mediaUpload/C5122AQGhQP0CaqFy0Q/feedshare-uploadedImage/0?ca=vector_feedshare&cn=uploads&m=AQI8zuih7FoSBwAAAWw99KEmX49-ic5bOYLgDL7s5U4Txdw4O0tGr9rihQ&app=8015375&sync=0&v=beta&ut=2AT8nijBFOSoQ1

// const resp =await axios({
//       method: "post",
//       url: "https://api.linkedin.com/v2/ugcPosts",
//       headers: {
//         "X-Restli-Protocol-Version": "2.0.0",
//         Authorization: `Bearer ${authToken}`
//       },
//       data: {
//         "author": "urn:li:person:${personURN}",
//         "lifecycleState": "PUBLISHED",
//         "specificContent": {
//             "com.linkedin.ugc.ShareContent": {
//                 "shareCommentary": {
//                     "text": "Feeling inspired after meeting so many talented individuals at this year's conference. #talentconnect"
//                 },
//                 "shareMediaCategory": "IMAGE",
//                 "media": [
//                     {
//                         "status": "READY",
//                         "description": {
//                             "text": "Center stage!"
//                         },
//                         "media": `${asset}`,
//                         "title": {
//                             "text": "LinkedIn Talent Connect 2018"
//                         }
//                     }
//                 ]
//             }
//         },
//         "visibility": {
//             "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
//         }
//     }
//     }).catch(err => {console.error(err)});
//  console.log(resp)

// res.json()
// };

function getTwitterConfig(consumerKey, consumerSecret, token, tokenSecret) {
  return {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token: token,
    access_token_secret: tokenSecret
  };
}
