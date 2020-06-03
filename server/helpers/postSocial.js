const twit = require("twit");
const User = require("../models/user");
const axios = require("axios");
let exec = require("child_process").exec;
const twttr = require("twitter-text");
const SocialShare = require("../models/socialShare");
const uuid = require("uuid");

/**
 * Generic function that will post the B64 content
 * @param {String} email email-id of the user
 * @param {String} msg tweet text content
 * @param {String} b64 base64 string format of the image
 */
const PostSocialTwitter = (email, msg, b64, purpose) => {
  return new Promise((resolve, reject) => {
    User.findOne({ email })
      .then((currUser) => {
        var config = getTwitterConfig(
          process.env.TWITTER_CLIENT_ID,
          process.env.TWITTER_CLIENT_SECRET,
          currUser.auth.twitter.token,
          currUser.auth.twitter.tokenSecret
        );
        let T = new twit(config);

        T.post("media/upload", { media_data: b64 }).then(
          ({ data, response }) => {
            T.post("statuses/update", {
              status: msg, // need to check the length for the length of tweet.
              media_ids: new Array(data.media_id_string),
            }).then(({ data, response }) => {
              console.log("response in twitterPost: ", data, response);
              const newShare = new SocialShare({
                uniqueId: uuid(),
                email,
                purpose,
                platform: "twitter",
              });
              newShare.save().then(() => {
                resolve(newShare.uniqueId);
              });
            });
          }
        );
      })
      .catch((e) => {
        reject(e);
      });
  });
};

/**
 * Generic function that will post the B64 content
 * @param {String} email email id of the user
 * @param {String} msg message accompanying the banner
 * @param {String} pathToFile path to banner
 */
const PostSocialLinkedin = async (email, msg, pathToFile, purpose) => {
  return new Promise((resolve, reject) => {
    User.findOne({ email })
      .then((user) => {
        let authToken = user.auth.linkedin.accessToken;
        let personURN = user.auth.linkedin.id;

        axios({
          method: "post",
          url: "https://api.linkedin.com/v2/assets?action=registerUpload",
          headers: {
            "X-Restli-Protocol-Version": "2.0.0",
            Authorization: `Bearer ${authToken}`,
          },
          data: {
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: `urn:li:person:${personURN}`,
              serviceRelationships: [
                {
                  relationshipType: "OWNER",
                  identifier: "urn:li:userGeneratedContent",
                },
              ],
            },
          },
        }).then((response) => {
          // const uploadURL = response.data.value;
          const uploadMechnism =
            response.data.value.uploadMechanism[
              "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
            ];
          const uploadURL = uploadMechnism.uploadUrl;
          const asset = response.data.value.asset;

          execCmd(
            `curl -i --upload-file ${pathToFile} --header "Authorization: Bearer ${authToken}" --header "X-Restli-Protocol-Version:2.0.0" '${uploadURL}'`
          ).then(() => {
            axios({
              method: "post",
              url: "https://api.linkedin.com/v2/ugcPosts",
              headers: {
                "X-Restli-Protocol-Version": "2.0.0",
                Authorization: `Bearer ${authToken}`,
              },
              data: {
                author: `urn:li:person:${personURN}`,
                lifecycleState: "PUBLISHED",
                specificContent: {
                  "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                      text: msg,
                    },
                    shareMediaCategory: "IMAGE",
                    media: [
                      {
                        status: "READY",
                        description: {
                          text: "Center stage!",
                        },
                        media: asset,
                        title: {
                          text: "LinkedIn Talent Connect 2018",
                        },
                      },
                    ],
                  },
                },
                visibility: {
                  "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
                },
              },
            }).then((resp) => {
              // return res.json({
              //   uploaded: resp.status == 201,
              //   error:
              //     resp.status == 201
              //       ? null
              //       : "something's wrong, we'll look into it. Please try again after some time or contact us",
              // });
              console.log("response in linkedinPost: ", resp);
              const newShare = new SocialShare({
                uniqueId: uuid(),
                email,
                purpose,
                platform: "linkedin",
              });
              newShare.save().then(() => {
                resolve(newShare.uniqueId);
              });
            });
          });
        });
      })
      .catch((e) => {
        reject(e);
      });
  });
};

function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (!err) {
        return resolve({ status: true });
      }
      reject(err);
    });
  });
}

function getTwitterConfig(consumerKey, consumerSecret, token, tokenSecret) {
  return {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token: token,
    access_token_secret: tokenSecret,
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

exports.PostSocialLinkedin = PostSocialLinkedin;
exports.PostSocialTwitter = PostSocialTwitter;
