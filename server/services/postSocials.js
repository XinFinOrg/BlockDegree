const schedule = require("node-schedule");
const Event = require("../models/social_post_event");
const Emailer = require("../emailer/impl");
const PostConfig = require("../models/social_post_config");
const Post = require("../models/social_post");
const _ = require("lodash");
const uuid = require("uuid/v4");
const fs = require("fs");
const path = require("path");

const tmpFilePath = path.join(__dirname, "../tmp-event");

if (!fs.existsSync(tmpFilePath)) {
  fs.mkdir(tmpFilePath, err => {
    if (err !== null) {
      console.error(err);
    }
  });
}

/*

	Services: 
	
	1. Schedule Post with Time Trigger
	2. Schedule Post with Event Trigger
	3. Re-schedule Scheduled Post
	4. Cancel Scheduled Post
	5. Force Re-Sync
	6. Force Post Scheduled Post
  7. Direct Post
  8. Enable Auto Post
  9. Disable Auto Post
  
*/

/**
 * scheduleEventByTime generates an event which will triggered at the appropriate timestamp ( provided as a parameter ).
 */
exports.scheduleEventByTime = (req, res) => {
  try {
    console.log("called schedule event by time");

    const eventTS = req.body.eventTS;
    const eventPurpose = req.body.eventPurpose;
    const eventName = req.body.eventName;
    const socialPlatform = JSON.parse(req.body.socialPlatform);
    const useCustom = req.body.useCustom;
    const postStatus = req.body.postStatus;

    if (useCustom === "true" && _.isEmpty(req.files)) {
      console.log("bad request no files provided");
      return res.status(400).json({ error: "no file provided" });
    }

    let file = {};
    if (useCustom === "true") {
      console.log("using custom file");
      file = req.files.file;
    } else {
      // generate the file dynamically from the template.
      /*

        1. Generate the post from the html-template 
        2. Save the template in tmp-event.
        3. Generate the status from the text-template.
        4. Schedule & save the event.

      */
    }

    const dateObj = new Date(eventTS);
    if (!_.isDate(dateObj)) {
      console.log("bad request, invalid date ts");
      return res
        .status(400)
        .json({ status: false, error: "bad request, invalid date" });
    }
    if (
      _.isNull(file) ||
      _.isEmpty(eventTS) ||
      _.isEmpty(eventPurpose) ||
      _.isNull(socialPlatform) ||
      _.isEmpty(postStatus)
    ) {
      console.log("bad requests, paramters missing");
      return res
        .status(400)
        .json({ error: "bad request, missing parameters", status: false });
    }

    if (
      !socialPlatform.facebook &&
      !socialPlatform.telegram &&
      !socialPlatform.twitter &&
      !socialPlatform.linkedin
    ) {
      console.log("bad requests");
      return res.status(400).json({
        error: "bad request, select atleast one platform",
        status: false
      });
    }

    const event = newEvent();
    const currentFilePath = tmpFilePath + "/" + event.id + "__" + file.name;
    fs.writeFile(currentFilePath, file.data, err => {
      if (err != null) {
        console.error("error while saving the new file");
        return res.status(400).json({ error: "internal error", status: false });
      }

      event.eventName = eventName;
      event.eventPurpose = eventPurpose;
      event.nextPostPath = currentFilePath;
      event.nextPostScheduleTS = "" + dateObj.getTime();
      event.nextPostStatus = postStatus;
      event.platform = socialPlatform;
      const currEvntId = event.id;
      try {
        event.save();
        schedule.scheduleJob(dateObj, () => {
          console.log(`[*] Event fired ------- ${currEvntId}`);
        });
        return res.json({ status: true, message: "new event generated" });
      } catch (e) {
        console.error(
          "exception while saving the event at postSocials.scheduleEventByTime: "
        );
        console.log(e);
        return res.status(500).json({ erorr: "internal error", status: false });
      }
    });
  } catch (e) {
    console.error("exception at postSocials.scheduleEventByTime: ");
    console.log(e);
    return res.status(500).json({ erorr: "internal error" });
  }
};

exports.scheduleEventByEvent = (req, res) => {
  console.log("called schedule event by event");
};

exports.reschedulePost = (req, res) => {
  console.log("called reschedule event");
};

exports.cancelScheduledPost = (req, res) => {
  console.log("called cancelScheduledPost");
};

/**
 * ForceResync function to be called on every restart as node-schedule
 * is an in-application internal process manager.
 */
exports.forceReSync = async (req, res) => {
  console.log("called forceReSync");
  try {
    const surpassedTS = [];
    const pendingEvents = await Event.find({ status: "pending" });
    if (_.isNull(pendingEvents) || pendingEvents.length == 0) {
      // no pending events, lets continue
      console.log("[*] no pending events");
      if (res != undefined)
        return res.json({
          status: true,
          message: "no pending events to Re-Sync"
        });
    }
    // has pending events, schedule them
    pendingEvents.forEach(evnt => {
      // only schedule events which are in future.
      if (new Date(evnt.nextPostScheduleTS).getTime() > Date.now())
        schedule.scheduleJob(new Date(evnt.nextPostScheduleTS), () => {
          console.log(`[*] Event fired --------- ${evnt.id}`);
        });
      else {
        surpassedTS.push(event.id);
      }
    });

    // if any events were not fired due to server-downtime & their TS were surpassed, mail admin.
    if (surpassedTS.length > 0) {
      console.log("[*] surpassed events exists, mailing admin...");
      Emailer.sendMailInternal(
        "blockdegree-bot@blockdegree.org",
        process.env.SUPP_EMAIL_ID,
        "Unable to fire event",
        `Due to some internal issues / server went down we were not able to fire the following events ${surpassedTS.toString()}`
      );
    }
    console.log("[*] event sync successfull");
    if (res != undefined)
      res.json({ status: true, message: "successfully synced the events" });
  } catch (e) {
    console.log("exception at postSocials.forceReSync: ", e);
    if (res != undefined)
      res.status(500).json({ error: "internal error", status: false });
  }
};

exports.forcePost = (req, res) => {
  console.log("called forcePost");
};

exports.directPost = (req, res) => {
  console.log("called directPost");
};

function newEvent() {
  return new Event({
    id: uuid(),
    autoPost: false,
    eventName: "",
    eventPurpose: "",
    /**
     * Status the current status of the events
     */
    status: "pending",
    platform: {
      facebook: false,
      twitter: false,
      linkedin: false,
      telegram: false
    },
    posts: [
      // {
      //   facebook: { postId: String, timestamp: String },
      //   twitter: { postId: String, timestamp: String },
      //   linkedin: { postId: String, timestamp: String },
      //   telegram: { postId: String, timestamp: String }
      // }
    ],
    recurring: false, // optional
    /* 
    
      Event-Based Triggers
  
      1. conditionVar, ConditionScope, conditionOperator, conditionOperator -> Required to evaluate the expression.
      2. scope for the condition
  
    */
    conditionVar: "",
    conditionScope: "",
    conditionOperator: "",
    conditionValue: "",
    conditionScopeStart: "",
    conditionScopeStop: "",
    /*
  
    Next Scheduled Post Timestamp
    
    -> timestamp at which the next social-post is to be posted
  
    */
    nextPostScheduleTS: "",
    nextPostPath: ""
  });
}
