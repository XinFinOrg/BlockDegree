const EventEmitter = require("events").EventEmitter;
const twit = require("twit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const socialPostConfig = require("../config/socialPostKeys");
const FormData = require("form-data");
const concat = require("concat-stream");
const EventConfig = require("../models/social_post_event");
const SocialConfig = require("../models/social_post_config");
const SocialPost = require("../models/social_post");
let exec = require("child_process").exec;

const em = new EventEmitter();

const filePath = path.join(__dirname, "../../Certificate.jpg");
console.log("FilePath: ", filePath);

async function postSocial(eventId, pathToFile) {
  console.log("called post social");
}

async function postLinkedin(eventId) {
  // register an upload : will get upload URL
  let authToken = socialPostConfig.linkedin.accessToken;
  let personURN = socialPostConfig.linkedin.id;
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
  let pathToFile = path.join(__dirname, "../../Certificate.jpg");

  msg = "test";
  /**
   * Old way to upload using IO, exec if a file is given at  a path.
   */
  let os = new os_func();
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
      }

      console.log(resp.status);
    },
    err => {
      console.error("Error while uploading the media to the asset: ", err);
    }
  );
}

async function postTwitter(eventId) {
  var config = getTwitterConfig(
    process.env.TWITTER_CLIENT_ID,
    process.env.TWITTER_CLIENT_SECRET,
    socialPostConfig.twitter.token,
    socialPostConfig.twitter.tokenSecret
  );
  let T = new twit(config);

  let buffer = fs.readFileSync(pathToFile).toString("base64");

  // User should be able to set the status for post
  T.post("media/upload", { media_data: buffer }, function(
    // asynchronous
    err,
    data,
    response
  ) {
    if (err) {
      console.log("ERROR:");
      console.log(err);
      return;
    } else {
      console.log("Twitter Response (1): ", response);
      T.post(
        "statuses/update",
        {
          status: msg, // need to check the length for the length of tweet.
          media_ids: new Array(data.media_id_string)
        },
        function(err, data, response) {
          if (err) {
            console.log("ERROR: ", err);
          } else {
            console.log("Posted the status on twitter!");
            console.log("Twitter Media Uploaded data: ", data);
            console.log("Twitter Media Uploaded Respinse: ", response);
          }
        }
      ).catch(e => {
        console.error(`Exception at T.post while Posting Tweeting: `, e);
      });
    }
  }).catch(e => {
    console.error(
      `Exception at T.post while uploading image for posting Tweeting: `,
      e
    );
  });
}

async function postFacebook(eventId) {
  console.log("called postFacebook");
  const pageId = "105301110986098";
  const uploadFile = fs.createReadStream(filePath);
  const accessToken =
    "EAAG6hQoZBb1sBAI6dP57rySZB4ScuV6jw33tZAA3OKrnM2ZBv0ZBS96mDxcNAI2P0mNcj2kpnkWPBWGr3KTel5FGkUB7ZCkoNG10esLxZBaMR37btPDZCzwXJji8KZBhsVJLZCQIejFGXgWMpZCxgsxwOzGaRZCHRbeJ92YwqzSmYbV3DFrm1lkv0cUPeGZCkndCZA8fBV9LYi7Pf2WAZDZD";
  let newForm = new FormData();
  newForm.append("file", uploadFile);
  axios
    .post(`https://graph.facebook.com/${socialPostConfig.facebook.pageId}/photos`, newForm, {
      headers: newForm.getHeaders(),
      mimeType: "multipart/form-data",
      contentType: false,
      processData: false,
      params: {
        access_token:socialPostConfig.facebook.accessToken,
        message: "This is a new test, pepepls"
      }
    })
    .then(res => {
      console.log("response from user: ", res);
      if (res.status == 200) {
        console.log("successfully posted the message");
      }
    })
    .catch(e => {
      console.log(
        "error while making the API call to graph.facebook.com : ",
        e
      );
    });
}

em.on("postSocial", postSocial);

/*

	Miscellaneous Functions

	1. New OS Job
	2. Get Twitter Configuration
	3. Check Tweet Characters Length

*/

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
