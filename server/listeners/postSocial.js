const EventEmitter = require("events").EventEmitter;
const twit = require("twit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const socialPostConfig = require("../config/socialPostKeys");
const SocialPostConfig = require("../models/social_post_config");
const FormData = require("form-data");
const concat = require("concat-stream");
const Event = require("../models/social_post_event");
const SocialPostLog = require("../models/social_post_log");
const SocialConfig = require("../models/social_post_config");
const SocialPost = require("../models/social_post");
const schedule = require("node-schedule");
// ! causes circular dependencies, need to make the ActiveJobs array GLOBAL
// const getEventNextInvocation = require("../services/postSocials")
//   .getEventNextInvocation;
const generatePostTemplate = require("../helpers/generatePostTemplate");

let exec = require("child_process").exec;

const em = new EventEmitter();

let postCount = 0;

const filePath = path.join(__dirname, "../../Certificate.jpg");
console.log("FilePath: ", filePath);

/**
 * PostSocial function posts the event on the respective social-medias corresponding to the param eventId.
 * @todo
 * 1. contained error-handling in all posting functions.
 * 2. Add Bot for telegram.
 * 3. Functionality to auto-renew access token for facebook.
 * @note Should be called internally only - triggered by timestamp or state-update.
 * @param {string} eventId
 */
async function postSocial(eventId) {
  console.log("called function post social");
  try {
    const currEvent = await Event.findOne({ id: eventId });
    let postedTwitter = currEvent.platform.twitter,
      postedLinkedIn = currEvent.platform.linkedin,
      postedFacebook = currEvent.platform.facebook,
      postTwitErr = false,
      postLinkErr = false,
      postFaceErr = false;
    if (currEvent === null) {
      console.error(
        `event with id:${eventId} not found, quiting the function postSocial.postSocial`
      );
      return;
    }
    const eventFilePath = currEvent.nextPostPath;
    const eventStatus = currEvent.nextPostStatus;

    console.log(
      "Post Social EventFilePath: %s, EventStatus: %s\n",
      eventFilePath,
      eventStatus
    );
    // !This will probably never be reached, need to refactor to throw on error by keeping the execution stack in check.
    if (postedTwitter) {
      try {
        twitterPostId = await postTwitter(eventFilePath, eventStatus, eventId);
      } catch (twitter_error) {
        console.error(`error while posting the status on twitter`);
        console.error(twitter_error);
        postedTwitter = false;
        postTwitErr = true;
      }
    }

    if (postedLinkedIn) {
      try {
        linkedInPostId = await postLinkedin(
          eventFilePath,
          eventStatus,
          eventId
        );
      } catch (linkedin_error) {
        console.error(`error while posting the status on linkedin`);
        console.error(linkedin_error);
        postedLinkedIn = false;
        postLinkErr = true;
      }
    }

    if (postedFacebook) {
      try {
        facebookPostId = await postFacebook(
          eventFilePath,
          eventStatus,
          eventId
        );
      } catch (facebook_error) {
        console.error(`error while posting the status on facebook`);
        console.error(facebook_error);
        postedFacebook = false;
        postFaceErr = true;
      }
    }

    if (postTwitErr || postLinkErr || postFaceErr) {
      console.error(
        "some occured while posting at listeners.postSocial.postSocial error in posting"
      );
      console.log(
        `Twitter Error: ${postTwitErr} LinkedIn Error: ${postLinkErr} Facebook Error: ${postFaceErr}`
      );
      // notify admin
    } else {
      // no error at all
      console.log("[*] no errors");
    }
    if (currEvent.recurring && !currEvent.variableTrigger) {
      console.log("[*] event is recurring");
      //  update the next post innvocation time, next post innvocation status, next post innvocation filepath
      //  -> nextPostScheduleTS
      //  -> nextPostStatus
      //  -> nextPostPath
      const currJob = findActiveJob(currEvent.id);
      console.log("current Job from ActiveJobs : ", currJob);
      console.log(
        `next job innvocation for event with id: ${currEvent.id}, name: ${currEvent.eventName}: `,
        currJob.refVar.nextInvocation()._date.toDate()
      );
      currEvent.nextPostScheduleTS = currJob.refVar
        .nextInvocation()
        ._date.toDate()
        .getTime();
      const templateImage = await generatePostTemplate.generatePostImage(
        currEvent.eventType,
        `next test ${++postCount}`,
        currEvent.templateId
      );
      const templateStatus = await generatePostTemplate.generatePostStatus(
        currEvent.eventType,
        `next test ${postCount}`,
        currEvent.templateId
      );
      currEvent.nextPostPath = templateImage;
      currEvent.nextPostStatus = templateStatus;

      console.log("updated the nextPostPath: ", templateImage);
      console.log("updated the nextPostStatus: ", templateStatus);

      /*
          1. Generate the post's image & save to the event document
          2. Generate the post's status & save the filepath to the event document
          3. Save the document
        */
    } else if (currEvent.variableTrigger) {
      console.log(
        "[*] event has variable trigger : ",
        currEvent.variableTrigger
      );
    } else {
      currEvent.status = "completed";
    }
    await currEvent.save();
  } catch (e) {
    console.error("exception at postSocial.postSocial");
    console.error(e);
    return;
  }
}

/**
 *
 * @param {*} fp
 * @param {*} postStatus
 * @param {*} eventId
 */
async function postLinkedin(fp, postStatus, eventId) {
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

  /**
   * Old way to upload using IO, exec if a file is given at  a path.
   */
  let os = new os_func();
  os.execCommand(
    `curl -i --upload-file ${fp} --header "Authorization: Bearer ${authToken}" --header "X-Restli-Protocol-Version:2.0.0" '${uploadURL}'`,
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
                  text: postStatus
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
        console.log("Post on linkedin status: ", resp.status);
        console.log("Linkedin Response Data", resp.data);

        const socialPostConfig = await SocialPostConfig.findOne({});
        // No need to check for AutoPost.
        if (socialPostConfig !== null) {
          socialPostConfig.platforms.linkedin.postCount++;
          socialPostConfig.platforms.linkedin.lastPost = "" + Date.now();
          if (socialPostConfig.platforms.linkedin.firstPost === "") {
            socialPostConfig.platforms.linkedin.firstPost = "" + Date.now();
          }
        }
        // currEvent.posts.linkedin.push({
        //   postId: resp.data.id,
        //   timestamp: "" + Date.now()
        // });
        // await currEvent.save();

        // setImmediate(() => {
        //   DefChannel.sendToQueue(
        //     "db_queue",
        //     Buffer.from(
        //       JSON.stringify({
        //         eventId: eventId,
        //         data: {
        //           linkedin: {
        //             postId: resp.data.id,
        //             timestamp: "" + Date.now()
        //           }
        //         }
        //       })
        //     )
        //   );
        // });

        await newSocialPostLog(eventId, "linkedin", resp.data.id).save();

        await socialPostConfig.save();
      } catch (e) {
        console.error("Exception while making axios request: ", e);
      }
    },
    err => {
      console.error("Error while uploading the media to the asset: ", err);
    }
  );
}

/**
 *
 * @param {*} fp
 * @param {*} postStatus
 * @param {*} eventId
 */
async function postTwitter(fp, postStatus, eventId) {
  var config = getTwitterConfig(
    process.env.TWITTER_CLIENT_ID,
    process.env.TWITTER_CLIENT_SECRET,
    socialPostConfig.twitter.token,
    socialPostConfig.twitter.tokenSecret
  );
  let T = new twit(config);

  let buffer = fs.readFileSync(fp).toString("base64");

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
      T.post(
        "statuses/update",
        {
          status: postStatus, // need to check the length for the length of tweet.
          media_ids: new Array(data.media_id_string)
        },
        async function(err, data, response) {
          if (err) {
            console.log("ERROR: ", err);
          } else {
            console.log("Posted the status on twitter!");
            try {
              const socialPostConfig = await SocialPostConfig.findOne({});
              // No need to check for AutoPost.
              if (socialPostConfig !== null) {
                socialPostConfig.platforms.twitter.postCount++;
                socialPostConfig.platforms.twitter.lastPost = "" + Date.now();
                if (socialPostConfig.platforms.twitter.firstPost === "") {
                  socialPostConfig.platforms.twitter.firstPost =
                    "" + Date.now();
                }
              }
              // currEvent.posts.twitter.push({
              //   postId: data.id,
              //   timestamp: "" + Date.now()
              // });
              // await currEvent.save();
              // setImmediate(() => {
              //   DefChannel.sendToQueue(
              //     "db_queue",
              //     Buffer.from(
              //       JSON.stringify({
              //         eventId: eventId,
              //         data: {
              //           twitter: {
              //             postId: data.id,
              //             timestamp: "" + Date.now()
              //           }
              //         }
              //       })
              //     )
              //   );
              // });

              await newSocialPostLog(eventId, "twitter", data.id).save();

              await socialPostConfig.save();
            } catch (catch_e) {
              console.log("catch expression: ", catch_e);
            }
            return data.id_str;
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

/**
 * @todo 1. The Facebook token generation is broken, need to make it short-lived & renew at even intervals
 * @param {string} fp absolute filepath to the event at tmp-event
 * @param {string} postStatus status ( msg ) to be attached to the post-image
 * @param {string} eventId ID of the event in the DB
 */
// !Facebook Page_Access_Token Flow is broken, please fix it.
async function postFacebook(fp, postStatus, eventId) {
  console.log("called postFacebook");
  const uploadFile = fs.createReadStream(fp);
  /*
      1. make get to https://graph.facebook.com/${page_id}?fields=access_token&access_token=${user_access_token}
      2. will return {access_token:"",id:""}
    */
  const res = await axios.get(
    `https://graph.facebook.com/${socialPostConfig.facebook.pageId}?fields=access_token&access_token=${socialPostConfig.facebook.accessToken}`
  );
  // console.log(res);
  let newForm = new FormData();
  newForm.append("file", uploadFile);
  axios
    .post(
      `https://graph.facebook.com/${socialPostConfig.facebook.pageId}/photos`,
      newForm,
      {
        headers: newForm.getHeaders(),
        mimeType: "multipart/form-data",
        contentType: false,
        processData: false,
        params: {
          access_token: res.data.access_token,
          message: postStatus
        }
      }
    )
    .then(async res => {
      if (res.status == 200) {
        console.log("successfully posted image on facebook");
        const socialPostConfig = await SocialPostConfig.findOne({});
        // No need to check for AutoPost.
        if (socialPostConfig !== null) {
          socialPostConfig.platforms.facebook.postCount++;
          socialPostConfig.platforms.facebook.lastPost = "" + Date.now();
          if (socialPostConfig.platforms.facebook.firstPost === "") {
            socialPostConfig.platforms.facebook.firstPost = "" + Date.now();
          }
        }
        // currEvent.posts.facebook.push({
        //   postId: res.data.id,
        //   timestamp: "" + Date.now()
        // });
        // await currEvent.save();
        // setImmediate(() => {
        //   DefChannel.sendToQueue(
        //     "db_queue",
        //     Buffer.from(
        //       JSON.stringify({
        //         eventId: eventId,
        //         data: {
        //           facebook: {
        //             postId: res.data.id,
        //             timestamp: "" + Date.now()
        //           }
        //         }
        //       })
        //     )
        //   );
        // });

        await newSocialPostLog(eventId, "facebook", res.data.id).save();

        await socialPostConfig.save();
      }
    });
}

// !Needs to be implemented
async function postTelegram(fp, postStatus) {
  console.log("called postTelegram.");
}

em.on("postSocial", postSocial);
exports.em = em;

/*

	Miscellaneous Functions

	1. New OS Job
	2. Get Twitter Configuration

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

function findActiveJob(eventId) {
  for (let i = 0; i < ActiveJobs.length; i++) {
    if (ActiveJobs[i].eventId === eventId) {
      return ActiveJobs[i];
    }
  }
  return null;
}

function newSocialPostLog(eventId, platform, postId) {
  return new SocialPostLog({
    eventId: eventId,
    platform: platform,
    postId: postId,
    timestamp: "" + Date.now()
  });
}
