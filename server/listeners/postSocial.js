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
const userStats = require("../services/userStats");
const User = require("../models/user");
const Visited = require("../models/visited");
const FacebookConfig = require("../models/facebookConfig");
const Emailer = require("../emailer/impl");
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
      postedTelegram = currEvent.platform.telegram,
      postTwitErr = false,
      postLinkErr = false,
      postTelErr = false,
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

    // if (postedLinkedIn) {
    //   try {
    //     linkedInPostId = await postLinkedin(
    //       eventFilePath,
    //       eventStatus,
    //       eventId
    //     );
    //   } catch (linkedin_error) {
    //     console.error(`error while posting the status on linkedin`);
    //     console.error(linkedin_error);
    //     postedLinkedIn = false;
    //     postLinkErr = true;
    //   }
    // }

    // if (postedFacebook) {
    //   try {
    //     facebookPostId = await postFacebook(
    //       eventFilePath,
    //       eventStatus,
    //       eventId
    //     );
    //   } catch (facebook_error) {
    //     console.error(`error while posting the status on facebook`);
    //     console.error(facebook_error);
    //     postedFacebook = false;
    //     postFaceErr = true;
    //   }
    // }

    if (postedTelegram) {
      try {
        await postTelegram(eventFilePath, eventStatus, eventId);
      } catch (telegram_error) {
        console.error(`error while posting the status on telegram`);
        console.error(telegram_error);
        postedTelegram = false;
        postTelErr = true;
      }
    }

    if (postTwitErr || postLinkErr || postFaceErr || postTelErr) {
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
      console.log("[*] event is recurring, timestamp");
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

      // need to fix this logic
      const templateImage = await generatePostTemplate.generatePostImage(
        currEvent.eventType,
        `${++postCount}`,
        currEvent.templateId
      );
      const templateStatus = await generatePostTemplate.generatePostStatus(
        currEvent.eventType,
        `${postCount}`,
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
      //! Need to implement logic to update the Status / Image based
      //! on the current state value.

      if (currEvent.recurring === false) {
        // one timetime
        // status='completed'
        currEvent.status = "completed";
        removeEvent("", currEvent.id);
        removeEvent(currEvent.id);
      } else {
        // recurring
        // cnt<conditionScopeStop ? goAhead : Mark 'completed'
        // update nextPostStatus
        // update nextPostPath
        // update conditionPrevTrigger
        const currStat = await getSiteStats(currEvent.conditionVar);
        let currTrigVal, nextTrigVal;
        if (currEvent.conditionPrevTrigger === "") {
          // first time executing
          currTrigVal = parseFloat(currEvent.conditionScopeStart);
          nextTrigVal = currTrigVal + parseFloat(currEvent.conditionInterval);
        } else {
          currTrigVal =
            parseFloat(currEvent.conditionPrevTrigger) +
            parseFloat(currEvent.conditionInterval);
          nextTrigVal = currTrigVal + parseFloat(currEvent.conditionInterval);
        }

        console.log(
          `inside recurring event: currTrigVal ${currTrigVal}, nextTrigVal ${nextTrigVal}`
        );
        if (
          currStat >= parseFloat(currEvent.conditionScopeStop) ||
          nextTrigVal > parseFloat(currEvent.conditionScopeStop)
        ) {
          // stop is reached; mark the event completed
          currEvent.status = "completed";
          removeEvent("", currEvent.id);
          removeEvent(currEvent.id);
        } else {
          // more events possible; set next post status, templateImage

          const templateImage = await generatePostTemplate.generatePostImage(
            currEvent.eventType,
            nextTrigVal,
            currEvent.templateId
          );
          const templateStatus = await generatePostTemplate.generatePostStatus(
            currEvent.eventType,
            nextTrigVal,
            currEvent.templateId
          );
          currEvent.nextPostPath = templateImage;
          currEvent.nextPostStatus = templateStatus;
          currEvent.conditionPrevTrigger = currTrigVal + "";
          removeEvent("", currEvent.id);
        }
      }
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
    async function (returnValue) {
      let resp;
      try {
        resp = await axios({
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
                  text: postStatus,
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
    (err) => {
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

  let buffer = fs
    .readFileSync(fp.split(".")[0] + "__twitter.png")
    .toString("base64");

  // User should be able to set the status for post
  T.post("media/upload", { media_data: buffer }, function (
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
          media_ids: new Array(data.media_id_string),
        },
        async function (err, data, response) {
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
      ).catch((e) => {
        console.error(`Exception at T.post while Posting Tweeting: `, e);
      });
    }
  }).catch((e) => {
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
  // const res = await axios.get(
  //   `https://graph.facebook.com/${socialPostConfig.facebook.pageId}?fields=access_token&access_token=${socialPostConfig.facebook.accessToken}`
  // );
  // console.log(res);

  const currConfig = await FacebookConfig.findOne({});
  if (currConfig === null) {
    console.log("config not set for facebook social posts, quitting...");
    return;
  }
  const lastUpdateDate = new Date(parseFloat(currConfig.lastUpdate));
  const currDate = new Date();
  currDate.setMonth(currDate.getMonth() + 1);
  if (lastUpdateDate.getTime() > currDate.getTime()) {
    console.log("one month since last month, pls refresh token.");
    Emailer.sendMailInternal(
      "blockdegree-bot@blockdegree.org",
      process.env.SUPP_EMAIL_ID,
      "Refresh Facebo0k Token (ADMIN)",
      "Please update the facebook token from the newadmin."
    );
  }
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
          access_token: currConfig.longTermToken,
          message: postStatus,
        },
      }
    )
    .then(async (res) => {
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
const postTelegram = (fp, postStatus, eventId) => {
  console.log("called postTelegram.");
  // https://api.telegram.org/bot<token>/METHOD_NAME
  // https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/getMe
  // multipart/form-data (use to upload files)
  try {
    const postUrl = `https://api.telegram.org/bot${socialPostConfig.telegram.token}/sendPhoto`;
    console.log("postUrl: ", postUrl);

    let newForm = new FormData();
    newForm.append("chat_id", "@blockdegree");
    newForm.append("photo", fs.createReadStream(fp));
    newForm.append("caption", postStatus);

    axios
      .post(postUrl, newForm, { headers: newForm.getHeaders() })
      .then(async (resp) => {
        if (resp.data.ok === true) {
          const socialPostConfig = await SocialPostConfig.findOne({});
          // No need to check for AutoPost.
          if (socialPostConfig !== null) {
            socialPostConfig.platforms.facebook.postCount++;
            socialPostConfig.platforms.facebook.lastPost = "" + Date.now();
            if (socialPostConfig.platforms.facebook.firstPost === "") {
              socialPostConfig.platforms.facebook.firstPost = "" + Date.now();
            }
          }
          await newSocialPostLog(
            eventId,
            "telegram",
            resp.data.message_id
          ).save();
        } else {
          console.log("error while generating the new post");
          console.log("Response: ", resp);
          console.log("quiting...");
        }
      })
      .catch((e) => {
        console.log(
          "exception while generating the post at postSocials.postTelegram ",
          e
        );
        console.log("quiting...");
        // console.log("error");
      });
  } catch (e) {
    console.log(
      "exception while generating the post at postSocials.postTelegram ",
      e
    );
    console.log("quiting...");
  }
};

async function varTriggerUpdate(varName) {
  console.log("called varTriggerUpdate");
  const siteStat = await getSiteStats();
  console.log("siteStat: ", siteStat);
  switch (varName) {
    case "certificates": {
      console.log("certificates");
      const pendingEvents = await Event.find({
        conditionVar: "certificates",
        status: "pending",
        variableTrigger: true,
      });
      pendingEvents.forEach((currEvent) => {
        console.log(`task id: ${currEvent.id}`);
        if (currEvent.recurring === false) {
          console.log(`not recurring`);
          // if curr certi count >= currEvent.conditionValue then emit 'postSocial'
          if (siteStat.totCertis >= parseFloat(currEvent.conditionValue)) {
            // em.emit("postSocial", currEvent.id);
            scheduleVarTrigger(currEvent.id);
          } else {
            console.log("condition not met, quiting...");
          }
        } else {
          console.log("is recurring");
          if (currEvent.conditionPrevTrigger === "") {
            // has never been invoked
            // if curr certi count >= currEvent.conditionScopeStart then emit 'postSocial'
            // update currEvent.conditionPrevTrigger
            // if currEvent.conditionPrevTrigger > currEvent.conditionScopeStop
            console.log("has never been invoked");
            if (
              siteStat.totCertis >= parseFloat(currEvent.conditionScopeStart)
            ) {
              // em.emit("postSocial", currEvent.id);
              scheduleVarTrigger(currEvent.id);
            } else {
              console.log("condition not met, quiting...");
            }
          } else {
            // if curr certi count >= currEvent.conditionPrevTrigger then emit 'postSocial'
            // update currEvent.conditionPrevTrigger
            // if currEvent.conditionPrevTrigger > currEvent.conditionScopeStop
            if (
              siteStat.totCertis >=
              parseFloat(currEvent.conditionPrevTrigger) +
                parseFloat(currEvent.conditionInterval)
            ) {
              // em.emit("postSocial", currEvent.id);
              scheduleVarTrigger(currEvent.id);
            } else {
              console.log("condition not met, quiting...");
            }
          }
        }
      });
      break;
    }
    case "registrations": {
      console.log("registrations");
      const pendingEvents = await Event.find({
        conditionVar: "registrations",
        status: "pending",
        variableTrigger: true,
      });
      pendingEvents.forEach((currEvent) => {
        console.log(`task id: ${currEvent.id}`);
        if (currEvent.recurring === false) {
          console.log(`not recurring`);
          // if curr certi count >= currEvent.conditionValue then emit 'postSocial'
          if (siteStat.userCnt >= parseFloat(currEvent.conditionValue)) {
            // em.emit("postSocial", currEvent.id);
            scheduleVarTrigger(currEvent.id);
          } else {
            console.log("condition not met, quiting...");
          }
        } else {
          console.log("is recurring");
          if (currEvent.conditionPrevTrigger === "") {
            // has never been invoked
            // if count >= currEvent.conditionScopeStart then emit 'postSocial'
            // update currEvent.conditionPrevTrigger
            // if currEvent.conditionPrevTrigger > currEvent.conditionScopeStop
            console.log("has never been invoked");
            if (siteStat.userCnt >= parseFloat(currEvent.conditionScopeStart)) {
              // em.emit("postSocial", currEvent.id);
              scheduleVarTrigger(currEvent.id);
            } else {
              console.log("condition not met, quiting...");
            }
          } else {
            // if curr certi count > currEvent.conditionPrevTrigger then emit 'postSocial'
            // update currEvent.conditionPrevTrigger
            // if currEvent.conditionPrevTrigger > currEvent.conditionScopeStop
            if (siteStat.userCnt > parseFloat(currEvent.conditionPrevTrigger)) {
              // em.emit("postSocial", currEvent.id);
              scheduleVarTrigger(currEvent.id);
            } else {
              console.log("condition not met, quiting...");
            }
          }
        }
      });
      break;
    }
    case "visits": {
      console.log("visits");
      const pendingEvents = await Event.find({
        conditionVar: "visits",
        status: "pending",
        variableTrigger: true,
      });
      pendingEvents.forEach((currEvent) => {
        console.log(`task id: ${currEvent.id}`);

        if (currEvent.recurring === false) {
          console.log(`not recurring`);
          // if count >= currEvent.conditionValue then emit 'postSocial'
          if (siteStat.visitCnt >= parseFloat(currEvent.conditionValue)) {
            // em.emit("postSocial", currEvent.id);
            scheduleVarTrigger(currEvent.id);
          } else {
            console.log("condition not met, quiting...");
          }
        } else {
          console.log("is recurring");
          if (currEvent.conditionPrevTrigger === "") {
            // has never been invoked
            // if curr certi count >= currEvent.conditionScopeStart then emit 'postSocial'
            // update currEvent.conditionPrevTrigger
            // if currEvent.conditionPrevTrigger > currEvent.conditionScopeStop
            console.log("has never been invoked");
            if (
              siteStat.visitCnt >= parseFloat(currEvent.conditionScopeStart)
            ) {
              // em.emit("postSocial", currEvent.id);
              scheduleVarTrigger(currEvent.id);
            } else {
              console.log("condition not met, quiting...");
            }
          } else {
            // if count > currEvent.conditionPrevTrigger then emit 'postSocial'
            // update currEvent.conditionPrevTrigger
            // if currEvent.conditionPrevTrigger > currEvent.conditionScopeStop
            if (
              siteStat.visitCnt > parseFloat(currEvent.conditionPrevTrigger)
            ) {
              // em.emit("postSocial", currEvent.id);
              scheduleVarTrigger(currEvent.id);
            } else {
              console.log("condition not met, quiting...");
            }
          }
        }
      });
      break;
    }
  }
  // Update redis cache
  updateRedisCache(varName);
}

async function updateRedisCache(stateName) {[]
  try {
    RedisClient.get("siteStats", (err, res) => {
      if (err) {
        console.log(`error at ${__filename}.RedisClient.getItem: `, err);
        return;
      }
      const resJson = JSON.parse(res);
      resJson[stateName]++;
      RedisClient.set("siteStats", JSON.stringify(resJson));
      console.log("[*] updated redis state");      
    });
  } catch (e) {
    console.log(`exception at ${__filename}.updadteRedisCache: `, e);
  }
}

async function scheduleVarTrigger(eventId) {
  console.log(`called scheduleVarTriggger: ${eventId}`);
  try {
    const currEvent = await Event.findOne({ id: eventId });
    if (currEvent === null) {
      console.log(`event not found, quiting...`);
      return;
    }
    console.log(`event found`);
    let scheduledTime = new Date(parseFloat(currEvent.nearestTS));
    if (currEvent.postAsap === true) {
      const socialPostConfig = await SocialPostConfig.findOne({});
      if (socialPostConfig === null || socialPostConfig.autoPost === false) {
        console.log(
          "social config not initiated / autoPost has been turned off, skipping the event ",
          eventId
        );
        return;
      }
      // autoPostActive, postSocial
      postSocial(eventId);
      return;
    }
    const hours = scheduledTime.getHours();
    const minutes = scheduledTime.getMinutes();
    let today = new Date();
    today.setHours(hours);
    today.setMinutes(minutes);
    today.setSeconds(0);
    // Event missed today's time, schedule to post on the next day
    console.log("today: ", today.toString());
    if (today.getTime() < Date.now()) {
      today.setDate(today.getDate() + 1);
    }
    const currJob = schedule.scheduleJob(today, async () => {
      console.log("[*] Fired trigger for event");
      const socialPostConfig = await SocialPostConfig.findOne({});
      if (socialPostConfig === null || socialPostConfig.autoPost === false) {
        console.log(
          "social config not initiated / autoPost has been turned off, skipping the event ",
          eventId
        );
        return;
      }
      // autoPostActive, postSocial
      postSocial(eventId);
    });
    ActiveJobs.push({
      eventName: currEvent.eventName,
      eventPurpose: currEvent.eventPurpose,
      eventId: "",
      triggerType: "timestamp",
      refVar: currJob,
      derivedFrom: currEvent.id,
      nextInvocation: today.toString(),
    });
    console.log("scheduled the var trigger by timestamp");
  } catch (e) {
    console.log("exception at scheduleVarTrigger: ", e);
    console.log("quiting...");
    return;
  }
}

em.on("postSocial", postSocial);
em.on("varTriggerUpdate", varTriggerUpdate);
exports.em = em;

/*

	Miscellaneous Functions

	1. New OS Job
	2. Get Twitter Configuration

*/

function os_func() {
  this.execCommand = function (cmd, callback, callbackError) {
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
    access_token_secret: tokenSecret,
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

function removeEvent(eventId, derivedFrom) {
  console.log(`called removeEvent ${eventId}`);
  for (let x = 0; x < ActiveJobs.length; x++) {
    if (derivedFrom === "true") {
      if (ActiveJobs[x].derivedFrom === eventId) {
        ActiveJobs.splice(x, 1);
        return true;
      }
    } else if (ActiveJobs[x].eventId === eventId) {
      ActiveJobs.splice(x, 1);
      return true;
    }
  }
  return false;
}

function newSocialPostLog(eventId, platform, postId) {
  return new SocialPostLog({
    eventId: eventId,
    platform: platform,
    postId: postId,
    timestamp: "" + Date.now(),
  });
}

async function getSiteStats(type) {
  try {
    let allUsers = await User.find({});
    let allVisits = await Visited.find({});

    let userCnt = 0,
      visitCnt = 0,
      caCnt = 20,
      totCertis = 0;
    if (allUsers != null) {
      userCnt = allUsers.length;
    }

    if (allVisits != null) {
      visitCnt = allVisits.length;
    }

    for (let y = 0; y < allUsers.length; y++) {
      if (allUsers[y].examData.certificateHash.length > 1) {
        totCertis += allUsers[y].examData.certificateHash.length - 1;
      }
    }

    switch (type) {
      case "certificates": {
        return totCertis;
      }
      case "registrations": {
        return userCnt;
      }
      case "visits": {
        return visitCnt;
      }
      default: {
        return {
          userCnt: userCnt,
          visitCnt: visitCnt,
          totCertis: totCertis,
          caCnt: caCnt,
        };
      }
    }
  } catch (e) {
    console.log(`exception at getUserStat: `, e);
    return null;
  }
}
