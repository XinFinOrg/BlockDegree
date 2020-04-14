const twit = require("twit");
const ipfsClient = require("ipfs-http-client");
const puppeteer = require("puppeteer");
const fs = require("fs");
const User = require("../models/user");
const axios = require("axios");
const BitlyClient = require("bitly").BitlyClient;
let exec = require("child_process").exec;
const twttr = require("twitter-text");

require("dotenv").config();

// Rate  Limited 1000 calls per hour i.e. {windowMs,max} -> only max requests allowed over windowMs
const bitly = new BitlyClient(process.env.BITLY_ACCESS_TOKEN, {});

let clientIPFS = "";
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
  console.log("Called share on twitter by : ", req.user.email);
  if (!req.user) {
    return res.redirect("/login");
  } else {
    let user;
    try {
      user = await User.findOne({ email: req.user.email });
    } catch (e) {
      console.error(`Exception in shareSocial.postTwitter/User.findOne: `, e);
      return res.json({
        uploaded: false,
        error:
          "Some error has occured please try again after sometime or contact us"
      });
    }
    if (!user) {
      return res.redirect("/login");
    } else if (
      user.auth.twitter.token == "" ||
      user.auth.twitter.token == undefined ||
      user.auth.twitter.tokenSecret == "" ||
      user.auth.twitter.tokenSecret == undefined
    ) {
      return res.redirect("/auth/twitter");
    } else if (req.body.hash == undefined || req.body.hash == "") {
      return res.json({ uploaded: false, error: "No hash provided" });
    } else {
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
        console.error(`Error while shortning the URL ${fullURL} Error: `, e);
        shortURL = fullURL;
      }

      let msg =
        req.body.msg ||
        `Hey, I just got certified in blockchain from Blockdegree.org. Check it out!!`;
      if (req.body.certiLink == "true") {
        msg += `\n Link : ${shortURL} `;
      }
      if (!getTweetCharacterLength(msg)) {
        console.error(
          `Error in shareSocial.postTweet: invalid number of characters in tweet : ${msg} by ${req.user.email}`
        );
        return res.json({
          error: "invalid number of characters in the post",
          uploaded: false
        });
      } else {
        let currUser;
        try {
          currUser = await User.findOne({ email: req.user.email });
        } catch (e) {
          console.error(
            `Exception in shareSocial.postTwitter/User.findOne: `,
            e
          );
          return res.json({ uploaded: false, error: e });
        }
        var config = getTwitterConfig(
          process.env.TWITTER_CLIENT_ID,
          process.env.TWITTER_CLIENT_SECRET,
          currUser.auth.twitter.token,
          currUser.auth.twitter.tokenSecret
        );
        let T = new twit(config);
        let imgHTML = "";
        let b64content;
        if (checkCached(hash)) {
          // found in cache
          console.log("serving from cache");
          b64content = fs
            .readFileSync(`server/cached/${hash}.png`)
            .toString("base64");
        } else {
          // not found in cache, query and save it
          clientIPFS.get(hash, (err, files) => {
            if (err) {
              return res.json({ uploaded: false, error: err });
            } else {
              files.forEach(async file => {
                var localPath = "server/cached" + file.path + ".png";
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
                  return res.json({
                    error:
                      "Some error occured while posting,please try again after sometime or else contact-us",
                    uploaded: false
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
        }

        // User should be able to set the status for post
        T.post("media/upload", { media_data: b64content }, function(
          // asynchronous
          err,
          data,
          response
        ) {
          if (err) {
            console.log("ERROR:");
            console.log(err);
            return res.json({ uploaded: false, error: err });
          } else {
            T.post(
              "statuses/update",
              {
                status: msg, // need to check the length for the length of tweet.
                media_ids: new Array(data.media_id_string)
              },
              function(err, data, response) {
                if (err) {
                  console.log("ERROR: ", err);
                  res.json({ uploaded: false, error: err });
                } else {
                  console.log("Posted the status!");
                  res.json({ uploaded: true, error: null });
                }
              }
            ).catch(e => {
              console.error(`Exception at T.post while Posting Tweeting: `, e);
              return res.json({
                error:
                  "Some error occured while posting,please try again after sometime or else contact-us",
                uploaded: false
              });
            });
          }
        }).catch(e => {
          console.error(
            `Exception at T.post while uploading image for posting Tweeting: `,
            e
          );
          return res.json({
            error:
              "Some error occured while posting,please try again after sometime or else contact-us",
            uploaded: false
          });
        });
      }
    }
  }
};

// exports.postLinkedin = async (req, res) => {
//   console.log(req.body);
//   let user;
//   try {
//     user = await User.findOne({ email: req.user.email });
//   } catch (e) {
//     console.log(
//       `error while fetching the user ${req.user.email} in postLinked: `,
//       e
//     );
//   }
//   if (!user) {
//     return res.redirect("/login");
//   }
//   if (
//     user.auth.linkedin.accessToken == "" ||
//     user.auth.linkedin.accessToken == undefined ||
//     user.auth.linkedin.id == "" ||
//     user.auth.linkedin.id == undefined
//   ) {
//     // set linkedin credentials and post.
//     return res.redirect("/auth/linkedin");
//   }
//   if (req.body.hash == undefined || req.body.hash == "") {
//     return res.json({ uploaded: false, error: "No hash provided" });
//   }
//   const hash =
//     req.body.hash ||
//     user.examData.certificateHash[user.examData.certificateHash.length - 1]
//       .clientHash;
//   let fullURL = "";
//   let shortURL = "";
//   if (process.env.IPFS_NETWORK == "local") {
//     fullURL = `http://localhost:8081/ipfs/${hash}`;
//   } else if (process.env.IPFS_NETWORK == "xinfin") {
//     fullURL = `https://ipfs-gateway.xinfin.network/${hash}`;
//   }
//   try {
//     let shortUrlObj = await bitly.shorten(fullURL);
//     shortURL = shortUrlObj.url;
//   } catch (e) {
//     console.error(`Error while shortning the URL ${fullURL}; Error: ${e}`);
//     shortURL = fullURL;
//     console.log(`Using full URL for ${req.user.email} Link: ${shortURL}`);
//   }
//   let msg =
//     req.body.msg ||
//     `Hey, I just got certified in blockchain from Blockdegree.org. Check it out!!`;
//   if (req.body.certiLink == "true") {
//     msg += `\n Link : ${shortURL} `;
//   }
//   try {
//     const response = await axios({
//       method: "post",
//       url: "https://api.linkedin.com/v2/ugcPosts",
//       headers: {
//         "X-Restli-Protocol-Version": "2.0.0",
//         Authorization: `Bearer ${user.auth.linkedin.accessToken}`
//       },
//       data: {
//         author: `urn:li:person:${user.auth.linkedin.id}`,
//         lifecycleState: "PUBLISHED",
//         specificContent: {
//           "com.linkedin.ugc.ShareContent": {
//             shareCommentary: {
//               text: msg
//             },
//             shareMediaCategory: "ARTICLE",
//             media: [
//               {
//                 status: "READY",
//                 description: {
//                   text: "Blockdegree - Opensource blockchain training"
//                 },
//                 originalUrl: "https://uat.blockdegree.org",
//                 title: {
//                   text: "Blockdegree - Opensource blockchain training"
//                 }
//               }
//             ]
//           }
//         },
//         visibility: {
//           "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
//         }
//       }
//     });
//     console.log(response.status);
//     return res.json({ uploaded: true, error: null, status: response.status });
//   } catch (e) {
//     console.error(`Error while making post for registering the upload: `, e);
//     res.json({
//       uploaded: false,
//       error:
//         "Some error has occurred please try again after sometime or contact us via contact us page"
//     });
//   }
// };

exports.postFacebook = async (req, res) => {};

exports.uploadImageLinkedin = async (req, res) => {
  // set the credentials from req.user;
  let user;
  try {
    user = await User.findOne({ email: req.user.email });
  } catch (e) {
    console.error(`Error while fetching user at User.findOne: `, e);
  }
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
  if (req.body.hash == undefined || req.body.hash == "") {
    return res.json({ uploaded: false, error: "No hash provided" });
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

  // register an upload : will get upload URL
  let authToken = user.auth.linkedin.accessToken;
  let personURN = user.auth.linkedin.id;
  var response;
  try {
    response = await axios({
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
  } catch (e) {
    console.error(`Exception while registering upload: `, e);
  }

  console.log("Response from register: ", response.status);

  // const uploadURL = response.data.value;
  const uploadMechnism =
    response.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ];
  const uploadURL = uploadMechnism.uploadUrl;
  const asset = response.data.value.asset;

  console.log("ASSET: ", asset);
  console.log("UploadURL : ", uploadURL);
  // let localPath = "";
  let pathToFile = "";
  if (checkCached(hash)) {
    // found the cache
    console.log("serving from cache");
    pathToFile = `server/cached/${hash}.png`;
  } else {
    // not cached, query & save the cache
    clientIPFS.get(hash, (err, files) => {
      if (err) {
        return res.json({ uploaded: false, error: err });
      }
      files.forEach(async file => {
        pathToFile = "server/cached/" + file.path + ".png";
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
          await page.screenshot({ path: pathToFile });
        } catch (e) {
          console.error(
            "Exception in between launching headless browser & taking screenshot: ",
            e
          );
          return res.json({
            uploaded: false,
            error:
              "something's wrong, we'll look into it. Please try again after some time or contact us"
          });
        }
        browser.close().then(() => {
          console.log(`local path: ${pathToFile}`);
        });
      });
    });
  }
  var os = new os_func();
  os.execCommand(
    `curl -i --upload-file ${pathToFile} --header "Authorization: Bearer ${authToken}" --header "X-Restli-Protocol-Version:2.0.0" '${uploadURL}'`,
    async function(returnValue) {
      let resp;
      try {
        resp = await axios({
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
                  text: msg
                },
                shareMediaCategory: "IMAGE",
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
        });
      } catch (e) {
        console.error("Exception while making axios request: ", e);
        return res.json({
          uploaded: false,
          error:
            "something's wrong, we'll look into it. Please try again after some time or contact us"
        });
      }

      console.log(resp.status);
      return res.json({
        uploaded: resp.status == 201,
        error:
          resp.status == 201
            ? null
            : "something's wrong, we'll look into it. Please try again after some time or contact us"
      });
    },
    err => {
      console.error("Error while uploading the media to the asset: ", err);
      return res.json({
        uploaded: false,
        error:
          "something's wrong, we'll look into it. Please try again after some time or contact us"
      });
    }
  );
};

function os_func() {
  this.execCommand = function(cmd, callback, callbackError) {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        callbackError(error);
        return;
      }

      callback(stdout);
    });
  };
}

function getTwitterConfig(consumerKey, consumerSecret, token, tokenSecret) {
  return {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token: token,
    access_token_secret: tokenSecret
  };
}
exports.checkTweetCharacters = (req, res) => {
  let tweet = req.body.tweet;
  console.log("inside check tweets");
  if (tweet == undefined || tweet == null || tweet.length < 1) {
    return res.json({ error: "bad request", valid: null });
  }
  if (req.body.includeLink == "true") {
    // append link
    tweet += "111111111111111"; // padding for max 15 characters
  }
  res.json({ valid: getTweetCharacterLength(tweet), error: null });
};

function getTweetCharacterLength(msg) {
  let retObj = twttr.parseTweet(msg);
  return retObj.valid;
}

function checkCached(hash) {
  return fs.existsSync(`server/cached/${hash}.png`);
}
