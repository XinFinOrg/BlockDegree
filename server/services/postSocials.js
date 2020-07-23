const schedule = require("node-schedule");
const Event = require("../models/social_post_event");
const SocialPostConfig = require("../models/social_post_config");
const SocialPostTemplate = require("../models/socialPostTemplates");
const Emailer = require("../emailer/impl"); //! Needs to be added
const emitPostSocial = require("../listeners/postSocial").em;
const PostConfig = require("../models/social_post_config");
const Post = require("../models/social_post");
const _ = require("lodash");
const uuid = require("uuid/v4");
const fs = require("fs");
const path = require("path");
const generatePostTemplate = require("../helpers/generatePostTemplate");
const FacebookConfig = require("../models/facebookConfig");
const User = require("../models/user");
const Visited = require("../models/visited");

const tmpFilePath = path.join(__dirname, "../tmp-event");
const postTemplatesPath = path.join(__dirname, "../postTemplates");

if (!fs.existsSync(postTemplatesPath)) {
  fs.mkdirSync(postTemplatesPath);
}

/**
 * holds the refernce to all the active jobs.
 * {
 *  eventId: string | null
 *  refVar: Job | null
 *  triggerType: string ('variable' | 'timestamp')
 *  recurring: Boolean
 *  derivedFrom: string | undefined
 *  stateVarName: string
 *  stateVarNextVal: string
 * }
 */
global.ActiveJobs = [];
ActiveJobs.push = function() {
  Array.prototype.push.apply(this, arguments);
  // testActiveJobRefVar();
};

if (!fs.existsSync(tmpFilePath)) {
  fs.mkdir(tmpFilePath, err => {
    if (err !== null) {
      console.error(err);
    }
  });
}

const weekdayToInt = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

/*

	Services: 
	
	1. Schedule Post with Time Trigger
	2. Schedule Post with State Trigger
	3. Re-schedule Scheduled Post
	4. Cancel Scheduled Post
	5. Force Re-Sync
	6. Force Post Scheduled Post ( pending )
  7. Direct Post ( pending )
  8. Enable Auto Post
  9. Disable Auto Post
  
*/

/**
 * ScheduleEventByTime generates an event which will triggered at the appropriate timestamp ( provided as a parameter ).
 * @param {object} req - http request object
 * @param {object} res - http response object
 */
exports.scheduleEventByTime = async (req, res) => {
  try {
    // ! can't parse null, need to perform validations first.
    console.log("called schedule event by time");

    // performing pre-checks for all json strings
    if (
      _.isEmpty(req.body.socialPlatform) ||
      _.isEmpty(req.body.recurrCyclePeriod) ||
      _.isEmpty(req.body.recurrCycleMonthly) ||
      _.isEmpty(req.body.recurrCycleWeekly)
    ) {
      console.log(
        "bad request at postSocials.scheduleEventByTime; missing JSON paramter(s)"
      );
      return res.status(400).json({ status: false, error: "bad request" });
    }

    const eventTS = req.body.eventTS;
    const eventPurpose = req.body.eventPurpose;
    const eventName = req.body.eventName;
    const eventType = req.body.eventType;
    const socialPlatform = JSON.parse(req.body.socialPlatform);
    const useCustom = req.body.useCustom;
    let postStatus = req.body.postStatus;
    const templateId = req.body.templateId;
    const isRecurring = req.body.isRecurring;
    const recurrCyclePeriod = JSON.parse(req.body.recurrCyclePeriod);
    const recurrEventDateAnnual = req.body.recurrEventDateAnnual;
    const recurrEventTimeAnnual = req.body.recurrEventTimeAnnual;
    const recurrCycleMonthly = JSON.parse(req.body.recurrCycleMonthly);
    const recurrEventTimeMonthly = req.body.recurrEventTimeMonthly;
    const recurrCycleWeekly = JSON.parse(req.body.recurrCycleWeekly);
    const recurrEventTimeWeekly = req.body.recurrEventTimeWeekly;
    const recurrEventTimeDaily = req.body.recurrEventTimeDaily;
    // const templateVars = JSON.parse(req.body.templateVars);
    console.log(
      "Is Recurring: ",
      isRecurring,
      "Recurring Cycle Period: ",
      recurrCyclePeriod,
      "Recurring Event Date Annual: ",
      recurrEventDateAnnual,
      "Recurring Event Time Annual: ",
      recurrEventTimeAnnual,
      "Recurring Cycle Monthly: ",
      recurrCycleMonthly,
      "Recurring Cycle Weekly: ",
      recurrCycleWeekly,
      "recurrEventTimeMonthly: ",
      recurrEventTimeMonthly,
      "recurrEventTimeWeekly: ",
      recurrEventTimeWeekly
    );

    if (useCustom === "true") {
      if (_.isEmpty(req.files)) {
        console.log("bad request no files provided");
        return res
          .status(400)
          .json({ error: "no file provided", status: false });
      }
      if (_.isEmpty(postStatus)) {
        console.log(
          "bad request at postSocials.scheduleEventByTime, missing post status"
        );
        return res
          .status(400)
          .json({ error: "bad request, empty post status", status: false });
      }
    }

    if (
      _.isEmpty(eventType) ||
      _.isEmpty(eventPurpose) ||
      _.isNull(socialPlatform) ||
      _.isEmpty(isRecurring)
    ) {
      console.log("bad requests, paramters missing");
      return res
        .status(400)
        .json({ error: "bad request, missing parameters", status: false });
    }

    if (
      !["registrations", "certificates", "visits", "one-time","multi"].includes(
        eventType
      )
    ) {
      return res
        .status(400)
        .json({ status: false, error: "bad request, invalid event type" });
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

    let file = {};
    const event = newEvent();
    let postImagePath = "";

    if (useCustom === "true") {
      console.log("using custom file");
      file = req.files.file;
      const currentFilePath = tmpFilePath + "/" + event.id + "__" + file.name;
      fs.writeFileSync(currentFilePath, file.data);
      postImagePath = currentFilePath;
    } else {


      //! To be removed, broken logic

      // generate the file dynamically from the template.
      /*

        1. Generate the post from the html-template 
        2. Save the template in tmp-event.
        3. Generate the status from the text-template.

      */
      // console.log(
      //   "Typeof templateId: ",
      //   typeof templateId,
      //   "Template ID: ",
      //   templateId
      // );
      // const currTemplate = await SocialPostTemplate.findOne({ id: templateId });
      // if (currTemplate === null) {
      //   console.error(`template with id ${templateId} does not exists.`);
      //   return res
      //     .status(400)
      //     .json({ status: false, error: "bad request, template not found" });
      // }
      // const templateImagePath = await generatePostTemplate.generatePostImage(
      //   eventType,
      //   "test",
      //   templateId
      // );
      // const templateStatus = await generatePostTemplate.generatePostStatus(
      //   eventType,
      //   "test",
      //   templateId
      // );

      // console.log(
      //   `Generated templateImagepath: ${templateImagePath} \n templateStatus: ${templateStatus}`
      // );
      // postStatus = templateStatus;
      // postImagePath = templateImagePath;
    }

    // common validations complete.
    if (isRecurring === "false") {
      console.log("[*] inside isRecurring false");

      if (_.isEmpty(eventTS)) {
        console.error(
          "error at postSocials.scheduleEventByTime, missing event TS"
        );
        return res
          .status(400)
          .json({ status: false, error: "bad request, missing eventTS" });
      }

      const dateObj = new Date(eventTS);
      if (!_.isDate(dateObj)) {
        console.log("bad request, invalid date ts");
        return res
          .status(400)
          .json({ status: false, error: "bad request, invalid date" });
      }

      event.eventName = eventName;
      event.eventPurpose = eventPurpose;
      event.eventType = eventType;
      event.nextPostPath = postImagePath;
      event.nextPostScheduleTS = "" + dateObj.getTime();
      event.nextPostStatus = postStatus;
      event.platform = socialPlatform;
      event.templateId = templateId;
      const currEvntId = event.id;

      await event.save();
      let currJob = schedule.scheduleJob(dateObj, () => {
        setImmediate(async () => {
          try {
            console.log(`[*] Event fired ------- ${currEvntId}`);
            const socialPostConfig = await SocialPostConfig.findOne({});
            if (
              socialPostConfig === null ||
              socialPostConfig.autoPost === false
            ) {
              console.log(
                "social config not initiated / autoPost has been turned off, skipping the event ",
                currEvntId
              );
              return;
            }
            emitPostSocial.emit("postSocial", currEvntId);
            removeEvent(currEvntId);
          } catch (err2) {
            console.log(
              "exception at services.postSocials.scheduleEventByTime: ",
              err2
            );
            console.log(`skipping the event ${currEvntId}`);
            return;
          }
        });
      });
      ActiveJobs.push({
        eventId: currEvntId,
        refVar: currJob,
        recurring: false,
        triggerType: "timestamp"
      });
      return res.json({ status: true, message: "new event generated" });
    } else if (isRecurring === "true") {
      console.log("[*] inside isRecurring true");

      event.eventName = eventName;
      event.eventPurpose = eventPurpose;
      event.nextPostPath = postImagePath;

      event.nextPostStatus = postStatus;
      event.platform = socialPlatform;
      event.recurring = isRecurring === "true";
      event.eventType = eventType;
      event.templateId = templateId;
      const recurringRule = generateRecurringPattern(
        recurrCyclePeriod,
        new Date(recurrEventDateAnnual),
        new Date(recurrEventTimeAnnual),
        recurrCycleMonthly === null ? null : parseInt(recurrCycleMonthly.value),
        new Date(recurrEventTimeMonthly),
        recurrCycleWeekly === null ? null : recurrCycleWeekly.value,
        new Date(recurrEventTimeWeekly),
        new Date(recurrEventTimeDaily)
      );
      console.log(
        "RecurringRule: ",
        recurringRule,
        "Typeof RecurringRule: ",
        typeof recurringRule
      );

      if (recurringRule === null) {
        console.error(
          "exception occured at generateRecurringRule: ",
          recurringRule
        );
        return res.status(500).json({ status: false, error: "internal error" });
      }

      event.recurringRule = recurringRule;
      
      const currEvntId = event.id;
      console.log("saved the new event");
      let currJob = schedule.scheduleJob(recurringRule, async () => {
        try {
          console.log(`[*] Event fired ------- ${currEvntId}`);
          const socialPostConfig = await SocialPostConfig.findOne({});
          if (
            socialPostConfig === null ||
            socialPostConfig.autoPost === false
          ) {
            console.log(
              "[*] Auto post has been disabled, skipping the current event"
            );
            return;
          }

          /**
           * Get the latest data & gen. a fresh banner
           */

          const newPostStatus = await generatePostTemplate.generatePostStatus_Multi(event.templateId);
          const newPostPath = await generatePostTemplate.generatePostImage_Multi(event.templateId);
          event.nextPostPath = newPostPath;
          event.nextPostStatus = newPostStatus;
          await event.save();
          emitPostSocial.emit("postSocial", currEvntId);
        } catch (err2) {
          console.log(
            "exception at services.postSocials.scheduleEventByTime: ",
            err2
          );
          console.log(`skipping the event ${currEvntId}`);
          return;
        }
      });

      event.nextPostScheduleTS = new Date(currJob.nextInvocation()).getTime()
      await event.save();

      // Don't remove recurring events
      // removeEvent(currEvntId);
      if (currJob === null) {
        console.error(
          `some error occured while scheduling the job at postSocials.scheduleEventByTime; job returned was null `
        );
        return res.status(500).json({ status: false, error: "internal error" });
      }

      ActiveJobs.push({
        eventId: currEvntId,
        refVar: currJob,
        recurring: true,
        triggerType: "timestamp"
      });
      console.log("Current Job Next Innvocation: ", currJob.nextInvocation());
      return res.json({ status: true, message: "event generated" });
    }
  } catch (e) {
    console.error("exception at postSocials.scheduleEventByTime: ");
    console.log(e);
    return res.status(500).json({ erorr: "internal error" });
  }
};

exports.scheduleEventByState = async (req, res) => {
  console.log("called schedule event by state based trigger");
  try {
    const eventName = req.body.eventName;
    const eventPurpose = req.body.eventPurpose;
    // const eventType = req.body.eventType;
    const platforms = JSON.parse(req.body.platforms);
    const nearestTS = new Date(req.body.nearestTS);
    const postAsap = req.body.postAsap;
    const stateVarName = req.body.stateVarName;
    const useCustomFile = req.body.useCustomFile;
    const isRecurring = req.body.isRecurring;
    const event = newEvent();
    if (
      _.isEmpty(eventName) ||
      _.isEmpty(eventPurpose) ||
      _.isEmpty(stateVarName) ||
      _.isEmpty(useCustomFile) ||
      _.isEmpty(isRecurring) 
      // _.isEmpty(eventType) ||
      // nearestTS === null
    ) {
      console.log("missing parameters");
      return res
        .status(400)
        .json({ status: false, error: "missing parameters" });
    }

    if (postAsap===false && nearestTS===null){
      console.log("missing nearestTS");
      return res
        .status(400)
        .json({ status: false, error: "missing parameters" });
    }

    if (
      !platforms.postFacebook &&
      !platforms.twitter &&
      !platforms.linkedin &&
      !platforms.telegram
    ) {
      // no platform selected
      return res.status(400).json({ status: false, error: "bad request" });
    }

    let file,
      postStatus,
      postImagePath,
      templateId,
      currTemplate,
      stateVarInterval,
      stateVarStartValue,
      stateVarStopValue,
      stateVarValue;

    if (useCustomFile === "true") {
      if (_.isEmpty(req.body.postStatus)) {
        return res
          .status(400)
          .json({ status: false, error: "bad request, missing postStatus" });
      }
      postStatus = req.body.postStatus;
      if (req.files && req.files.file) {
        file = req.files.file;
        const currentFilePath = tmpFilePath + "/" + event.id + "__" + file.name;
        fs.writeFileSync(currentFilePath, file.data);
        postImagePath = currentFilePath;
      } else {
        return res
          .status(400)
          .json({ status: false, error: "bad request,missing file" });
      }
    } else {
      // templateId
      templateId = req.body.templateId;
      if (_.isEmpty(templateId)) {
        return res
          .status(400)
          .json({ status: false, error: "bad request, missing template" });
      }
      currTemplate = await SocialPostTemplate.findOne({ id: templateId });
      if (currTemplate === null) {
        console.log("cannot find template: ", templateId);
        return res.json({
          status: false,
          error: "cannot find the templateId"
        });
      }
      // found the template
      let count;

      if (isRecurring === "true") {
        if (_.isEmpty(req.body.stateVarStartValue)) {
          return res
            .status(400)
            .json({ status: false, error: "missing parameters" });
        }
        count = req.body.stateVarStartValue;
      } else {
        stateVarValue = req.body.stateVarValue;
        if (_.isEmpty(stateVarValue)) {
          return res.status(400).json({
            status: false,
            error: "bad request, missing state var value"
          });
        }
        count = stateVarValue;
      }
      const templateImagePath = await generatePostTemplate.generatePostImage(
        "",
        count,
        templateId
      );
      const templateStatus = await generatePostTemplate.generatePostStatus(
        "",
        count,
        templateId
      );

      console.log(
        `Generated templateImagepath: ${templateImagePath} \n templateStatus: ${templateStatus}`
      );
      postStatus = templateStatus;
      postImagePath = templateImagePath;

      event.templateId = templateId;
    }

    event.postStatus = postStatus;
    event.postImagePath = postImagePath;

    if (isRecurring === "true") {
      // isRecurring
      stateVarInterval = req.body.stateVarInterval;
      stateVarStartValue = req.body.stateVarStartValue;
      stateVarStopValue = req.body.stateVarStopValue;
      if (
        _.isEmpty(stateVarInterval) ||
        _.isEmpty(stateVarStartValue) ||
        _.isEmpty(stateVarStopValue)
      ) {
        return res
          .status(400)
          .json({ status: false, error: "bad request, missing state vars" });
      }
      event.conditionVar = stateVarName;
      event.conditionInterval = stateVarInterval;
      event.conditionScopeStart = stateVarStartValue;
      event.conditionScopeStop = stateVarStopValue;
      event.conditionPrevTrigger = "";
    } else {
      // is not recurring
      stateVarValue = req.body.stateVarValue;
      if (_.isEmpty(stateVarValue)) {
        return res.status(400).json({
          status: false,
          error: "bad request, missing state var value"
        });
      }
      event.conditionValue = parseFloat(stateVarValue);
    }

    event.eventName = eventName;
    event.eventPurpose = eventPurpose;
    event.platforms = platforms;
    event.postAsap = postAsap;
    event.nearestTS = "" + nearestTS.getTime();
    event.conditionVar = stateVarName;
    event.nextPostPath = postImagePath;
    event.nextPostStatus = postStatus;
    event.platform = platforms;
    event.variableTrigger = true;
    event.recurring = isRecurring === "true";

    ActiveJobs.push({
      eventId: event.id,
      recurring: event.recurring,
      triggerType: "variable",
      stateVarName: stateVarName,
      refVar: null,
      stateVarNextVal:
        isRecurring === "true" ? stateVarStartValue : stateVarValue
    });
    await event.save();

    res.json({ status: true, message: "event generated" });
    emitPostSocial.emit("varTriggerUpdate", stateVarName);
  } catch (e) {
    console.log("exception at scheduleEventByState: ", e);
    res.status(500).json({ status: false, error: "internal error" });
  }
};

//! needs to be implemented
exports.reschedulePost = (req, res) => {
  console.log("called reschedule event");
};

//! needs to be implemented
exports.cancelScheduledPost = async (req, res) => {
  console.log("called cancelScheduledPost");
  try {
    const eventId = req.body.eventId;
    if (_.isEmpty(eventId)) {
      console.log("error at postSocials.cancelSchedulePost; missing paramters");
      return res
        .status(400)
        .json({ status: false, error: "bad request,  missing parameters" });
    }
    const currEvent = await Event.findOne({ id: eventId });
    if (currEvent === null) {
      return res.status(400).json({
        error: "cannot find event corresponding to the id",
        status: false
      });
    }
    currEvent.status = "cancelled";
    removeAllEvent(eventId);
    await currEvent.save();
    res.json({ status: true, message: "event cancelled" });
  } catch (e) {
    console.log("exception at postSocials.cancelScheduledPost ", e);
    res.status(500).json({ status: false, error: "internal error" });
  }
};

/**
 * ForceResync function to be called on every restart as node-schedule
 * is an in-application internal process manager.
 * @param req express request object
 * @param res express response object
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
    // if AutoPost is true, has pending events, schedule them
    const socialPostConfig = await SocialPostConfig.findOne({});
    if (socialPostConfig !== null && socialPostConfig.autoPost === true) {
      console.log("config file found & auto post is true");
      pendingEvents.forEach(evnt => {
        // only schedule events which are in future.
        if (eventExists(evnt.id)) {
          // skip already schduled jobs
          return;
        }
        console.log(
          "Current Event: ",
          evnt.nextPostScheduleTS,
          typeof evnt.nextPostScheduleTS
        );
        if (
          evnt.variableTrigger === true ||
          new Date(parseFloat(evnt.nextPostScheduleTS)).getTime() > Date.now()
        ) {
          console.log("future event");
          if (!evnt.recurring && !evnt.variableTrigger) {
            console.log("[*] scheduling one-time event");
            const refVar = schedule.scheduleJob(
              new Date(parseFloat(evnt.nextPostScheduleTS)),
              () => {
                console.log(`[*] Event fired --------- ${evnt.id}`);
              }
            );
            ActiveJobs.push({
              eventId: evnt.id,
              refVar: refVar,
              recurring: evnt.recurring,
              triggerType: "timestamp"
            });
          } else if (
            evnt.recurring === true &&
            evnt.variableTrigger === false
          ) {
            console.log("[*] scheduling recurring event");
            const refVar = schedule.scheduleJob(evnt.recurringRule, () => {
              console.log(`[*] Event fired -------- ${evnt.id}`);
              emitPostSocial.emit("postSocial", evnt.id);
            });
            ActiveJobs.push({
              eventId: evnt.id,
              refVar: refVar,
              recurring: evnt.recurring,
              triggerType: "timestamp",
              stateVarName: null
            });
          } else if (evnt.variableTrigger === true) {
            console.log(`[*] scheduleing variable based event`);
            // !implement the logic to process the recurring event based on the variable trigger
            /**
             * Cannot schedule the event directly using node-schedule
             * Push to ActiveJobs array
             */
            ActiveJobs.push({
              eventId: evnt.id,
              refVar: null,
              nextInvocation: null,
              recurring: evnt.recurring,
              triggerType: "variable",
              stateVarName: evnt.conditionVar
            });
            emitPostSocial.emit("varTriggerUpdate", evnt.conditionVar);
          }else if (evnt.variableTrigger===false && evnt.recurring===true) {
            /**
             * Multi Events
             */

          }
        } else {
          surpassedTS.push(evnt.id);
        }
      });
    }

    // if any events were not fired due to server-downtime & their TS were surpassed, mail admin.
    if (surpassedTS.length > 0) {
      console.log("[*] surpassed events exists, mailing admin...");
      // Emailer.sendMailInternal(
      //   "blockdegree-bot@blockdegree.org",
      //   process.env.SUPP_EMAIL_ID,
      //   "Unable to fire event",
      //   `Due to some internal issues / server went down we were not able to fire the following events ${surpassedTS.toString()}`
      // );
    }
    console.log("[*] event sync successful");
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

exports.removePost = (req, res) => {
  console.log("called remove post");
  console.log(req.body);
  const eventId = req.body.eventId;
  const derivedFrom = req.body.derivedFrom;
  if (_.isEmpty(eventId) && _.isEmpty(derivedFrom)) {
    return res
      .status(400)
      .json({ status: false, error: "bad request, missing event id" });
  }
  for (let i = 0; i < ActiveJobs.length; i++) {
    let currJob = ActiveJobs[i];
    if (_.isEmpty(derivedFrom)) {
      if (currJob.eventId === eventId) {
        // found the event job
        if (currJob.refVar) currJob.refVar.cancel();
        if (removeEvent(eventId, derivedFrom)) {
          return res.json({
            status: true,
            message: "succesfully deleted the event"
          });
        }
      }
    } else {
      if (currJob.derivedFrom === derivedFrom) {
        // found the event job
        if (currJob.refVar) currJob.refVar.cancel();
        if (removeEvent(eventId, derivedFrom)) {
          return res.json({
            status: true,
            message: "succesfully deleted the event"
          });
        }
      }
    }
  }
  console.log("event not found in active jobs array");
  res.json({ status: false, error: "event not found" });
};

//! needs to be implemented
exports.directPost = (req, res) => {
  console.log("called directPost");
};

/**
 * @param {string} eventId id of the event whose next innvocation is to be fetched.
 * @returns {Job} returns the currJob object, null if the eventId is not found.
 */
exports.getEventNextInvocation = eventId => {
  console.log(
    `called getEventNextInvocation at postSocial for event: ${eventId}`
  );
  for (let i = 0; i < ActiveJobs.length; i++) {
    if (ActiveJobs[i].eventId === eventId) return ActiveJobs[i].currJob;
  }
  return null;
};

/**
 * AddPostTemplate adds a new template for posting on social-media
 * @param {object} req express-request object
 * @param {object} req.body express-request object's body
 * @param {string} req.body.eventType event-type (one of certificates, accounts, visits)
 * @param {string} req.body.templateStatus template for status of the social-post
 * @param {object} req.files array of attached files, only interest in req.files[0]
 * @param {object} req.files.file template for image of the social-post
 * @param res express-response object
 */
exports.addPostTemplate = (req, res) => {
  console.log("called addPostTemplate");
  console.log(req.body);
  if (_.isEmpty(req.body)) {
    console.error(
      "error at services.postSocials.addPostTemplate, bad request missing req.body"
    );
    return res
      .status(400)
      .json({ error: "bad request, body missing", status: false });
  }
  if (_.isNull(req.files)) {
    console.error(
      "error at services.postSocials.addPostTemplate, bad request missing file"
    );
    return res
      .status(400)
      .json({ error: "bad request, file missing", status: false });
  }
  const eventType = req.body.eventType;
  const templateFile = req.files.file;
  const templateStatus = req.body.templateStatus;
  const templateName = req.body.templateName;
  const templatePurpose = req.body.templatePurpose;

  if (
    _.isEmpty(eventType) ||
    _.isNull(templateFile) ||
    _.isEmpty(templateStatus) ||
    _.isEmpty(templateName) ||
    _.isEmpty(templatePurpose)
  ) {
    console.error(
      "error at services.postSocials.addPostTemplate, bad request missing parameters"
    );
    return res
      .status(400)
      .json({ error: "bad request, missing parameters", status: false });
  }

  // all data is valid
  try {
    const postTemplate = newPostTemplate();
    postTemplate.templateName = templateName;
    postTemplate.templatePurpose = templatePurpose;
    postTemplate.eventType = eventType;
    postTemplate.createdBy = req.user.email || "rudresh@xinfin.org";
    postTemplate.isActive = false;
    postTemplate.createdAt = Date.now();
    postTemplate.lastUsed = "";
    postTemplate.templateStatus = templateStatus;
    postTemplate.templateVars = req.body.templateVars.split(",");
    const eventFolder = path.join(postTemplatesPath, eventType);
    if (!fs.existsSync(eventFolder)) {
      console.log(`[*] folder at ${eventFolder} does not exists, creating...`);
      fs.mkdirSync(eventFolder);
    }
    const templateFilePath = eventFolder + "/" + postTemplate.id + ".ejs";
    fs.writeFileSync(templateFilePath, templateFile.data);
    console.log(`saved the file at the path ${templateFilePath}`);
    postTemplate.templateFilePath = templateFilePath;
    postTemplate.save();
    console.log(`saved the template`,postTemplate);
    res.json({ status: true, message: "added new template" });
  } catch (e) {
    console.error("internal error: ", e);
    return res.status(500).json({ status: false, error: "internal error" });
  }
};

exports.enableAutoPost = async (req, res) => {
  console.log("called enableAutoPost");
  try {
    const currConfig = await SocialPostConfig.findOne({});
    if (currConfig === null) {
      console.log("no config found.");
      return res.json({
        status: false,
        error: "internal error, no config doc found"
      });
    }
    if (currConfig.autoPost === true) {
      return res.json({
        status: false,
        error: "bad request, autoPost already enabled"
      });
    }
    currConfig.autoPost = true;
    await currConfig.save();
    return res.json({ status: true, message: "AutoPost Enabled" });
  } catch (e) {
    console.log("error at services.postSocials.enableAutoPost: ", e);
    return res.status(500).json({ status: false, error: "internal error" });
  }
};

exports.disableAutoPost = async (req, res) => {
  console.log("called disableAutoPost");
  try {
    const currConfig = await SocialPostConfig.findOne({});
    if (currConfig === null) {
      console.log("no config found.");
      return res.json({
        status: false,
        error: "internal error, no config doc found"
      });
    }
    if (currConfig.autoPost === false) {
      return res.json({
        status: false,
        error: "bad request, autoPost already disabled"
      });
    }
    currConfig.autoPost = false;
    await currConfig.save();
    return res.json({ status: true, message: "AutoPost Disabled" });
  } catch (e) {
    console.log("error at services.postSocials.disableAutoPost: ", e);
    return res.status(500).json({ status: false, error: "internal error" });
  }
};

exports.initiateSocialPostConfig = async (req, res) => {
  console.log("called initiateSocialPostConfig");
  try {
    const configExists = await SocialPostConfig.find();
    if (configExists.length > 0) {
      console.log(
        "error at services.postSocials.initiateSocialPostConfig, config already initiated"
      );
      return res.json({
        status: false,
        error: "bad request, config already initiated"
      });
    }
    const newConfig = newSocialPostConfig();
    await newConfig.save();
    res.json({
      status: true,
      message: "initiated the configuration for social post"
    });
  } catch (e) {
    console.log("exception at services.postSocials.initiateSocialPostConfig");
    return res.status(500).json({ status: false, error: "internal error" });
  }
};

exports.getCurrentEventJobs = async (req, res) => {
  console.log("called getCurrentEventJobs");
  try {
    let retJobs = [];
    for (let x = 0; x < ActiveJobs.length; x++) {
      const currJob = ActiveJobs[x];
      let currEvent = await Event.findOne({ id: currJob.eventId });
      if (currEvent === null) {
        currEvent = await Event.findOne({ id: currJob.derivedFrom });
        if (currEvent === null) {
          continue;
        }
      }
      retJobs.push({
        eventName: currEvent.eventName,
        eventPurpose: currEvent.eventPurpose,
        eventId: currJob.eventId,
        nextInvocation:
          currJob.refVar === null
            ? currJob.nextInvocation
            : currJob.refVar.nextInvocation()._date.toDate(),
        recurring: currJob.recurring,
        triggerType: currJob.triggerType,
        stateVarName: currJob.stateVarName,
        stateVarNextVal: currJob.stateVarNextVal,
        derivedFrom: currJob.derivedFrom,
        nextTrigger:
          currEvent.conditionPrevTrigger === ""
            ? currEvent.conditionScopeStart
            : parseFloat(currEvent.conditionPrevTrigger) +
              parseFloat(currEvent.conditionInterval)
      });
    }

    return res.json({ status: true, jobs: retJobs });
  } catch (e) {
    console.log("exception at services.postSocials.getCurrentEventJobs: ", e);
    return res.status(500).json({ status: false, error: "internal error" });
  }
};

exports.fetchFacebookLastUpdate = async (req, res) => {
  console.log("called fetchTimeToExpire");
  const config = await FacebookConfig.findOne({});
  if (config === null) {
    return res.json({ status: false, error: "config not initiated" });
  }
  return res.json({ status: true, lastUpdate: config.lastUpdate });
};

function newSocialPostConfig() {
  return new SocialPostConfig({
    platforms: {
      facebook: {
        postCount: 0,
        autoPost: false,
        lastPost: "",
        firstPost: ""
      },
      twitter: {
        postCount: 0,
        autoPost: false,
        lastPost: "",
        firstPost: ""
      },
      linkedin: {
        postCount: 0,
        autoPost: false,
        lastPost: "",
        firstPost: ""
      },
      telegram: {
        postCount: 0,
        autoPost: false,
        lastPost: "",
        firstPost: ""
      }
    },
    autoPost: false
  });
}

function newPostTemplate() {
  return new SocialPostTemplate({
    id: uuid(),
    eventType: "",
    templatePath: "",
    templateStatus: "",
    isActive: false,
    created: "",
    lastUsed: "",
    createdBy: "",
    templateVars:""
  });
}

function newEvent() {
  return new Event({
    id: uuid(),
    autoPost: false,
    eventName: "",
    eventPurpose: "",
    templateId: "",
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
    recurring: false, // optional
    recurringRule: {},
    /* 
    
      Event-Based Triggers
    
      1. conditionVar, ConditionScope, conditionOperator, conditionOperator -> Required to evaluate the expression.
      2. scope for the condition
    
    */
    variableTrigger: false,
    conditionVar: "",
    conditionInterval: "",
    conditionOperator: "",
    conditionValue: "",
    conditionScopeStart: "",
    conditionScopeStop: "",
    conditionPrevTrigger: "",
    /*
  
    Next Scheduled Post Timestamp
    
    -> timestamp at which the next social-post is to be posted
  
    */
    nextPostScheduleTS: "",
    nextPostPath: "",
    nextPostStatus: ""
  });
}

/**
 * generateRecurringPattern genetates & returns the rule object to be given as a
 * node-schedule input. Returns null on error
 * @param {object} recurrCyclePeriod annually, monthly or weekly
 * @param {Date} recurrEventDateAnnual date object for annual event date
 * @param {Date} recurrEventTimeAnnual date object for annual event time
 * @param {int} recurrCycleMonthly string containing the date of month (1-31)
 * @param {Date} recurrEventTimeMonthly date object for annual event date
 * @param {string} recurrCycleWeekly string containing the day of the week (monday, tuesday,..., sunday)
 * @param {Date} recurrEventTimeWeekly date object for annual event date
 * @returns {object} node-schedule recurrence rule
 */
function generateRecurringPattern(
  recurrCyclePeriod,
  recurrEventDateAnnual,
  recurrEventTimeAnnual,
  recurrCycleMonthly,
  recurrEventTimeMonthly,
  recurrCycleWeekly,
  recurrEventTimeWeekly,
  recurrEventTimeDaily
) {
  console.log("RecurrCyclePeriodd: ", recurrCyclePeriod);
  try {
    switch (recurrCyclePeriod.value) {
      case "annually": {
        console.log("generateRecurringPattern inside annually");
        let rule = new schedule.RecurrenceRule();
        rule.month = recurrEventDateAnnual.getMonth();
        rule.date = recurrEventDateAnnual.getDate();
        rule.hour = recurrEventTimeAnnual.getHours();
        rule.minute = recurrEventTimeAnnual.getMinutes();
        // rule.second = recurrEventTimeAnnual.getMinutes();
        // console.log("[*] Recurring Minute Span: ", rule.minute);
        return rule;
      }
      case "monthly": {
        console.log("generateRecurringPattern inside monthly");
        let rule = new schedule.RecurrenceRule();
        rule.date = recurrCycleMonthly;
        rule.hour = recurrEventTimeMonthly.getHours();
        rule.minute = recurrEventTimeMonthly.getMinutes();
        return rule;
      }
      case "weekly": {
        console.log("generateRecurringPattern inside weekly");
        let rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = weekdayToInt[recurrCycleWeekly];
        rule.hour = recurrEventTimeWeekly.getHours();
        rule.minute = recurrEventTimeWeekly.getMinutes();
        return rule;
      }

      case "daily" : {
        console.log("generateRecurringPattern inside daily")
        let rule = new schedule.RecurrenceRule();
        rule.hour = recurrEventTimeDaily.getHours();
        rule.minute = recurrEventTimeDaily.getMinutes();
        return rule;
      }
      default: {
        return null;
      }
    }
  } catch (err) {
    console.error("exception at generateRecurringRule: ", err);
    return null;
  }
}

/**
 * ! FWD call to WebSocket
 * removes the event from the ActiveJobs array by its eventId
 * @param {string} eventId
 * @returns {boolean} deleted
 */
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

function removeAllEvent(eventId) {
  console.log(`called removeAllEvent for ID: ${eventId}`);
  for (let x = 0; x < ActiveJobs.length; x++) {
    if (ActiveJobs[x].derivedFrom === eventId) {
      ActiveJobs.splice(x, 1);
      return true;
    } else if (ActiveJobs[x].eventId === eventId) {
      ActiveJobs.splice(x, 1);
      return true;
    }
  }
}

function eventExists(eventId) {
  for (let i = 0; i < ActiveJobs.length; i++) {
    if (ActiveJobs[i].eventId === eventId) {
      return true;
    }
  }
  return false;
}

/**
 * ! Re-Implement to FWD call to the WebSocket
 */
// function testActiveJobRefVar() {
//   console.log("pushed into active jobs");
//   console.log("currently active jobs: ", ActiveJobs.length);
//   ActiveJobs.forEach(currObj => {
//     if (currObj.refVar !== null) {
//       const nextInnvocation = currObj.refVar.nextInvocation()._date.toDate();
//       console.log("Next Invocation at testActiveJobRefVar: ", nextInnvocation);
//     }
//   });
// }

async function getSiteStats() {
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
      if (allUsers[y].examData.certificateHash) {
        totCertis += allUsers[y].examData.certificateHash.length - 1;
      }
    }

    return {
      userCnt: userCnt,
      visitCnt: visitCnt,
      totCertis: totCertis,
      caCnt: caCnt
    };
  } catch (e) {
    console.log(`exception at getUserStat: `, e);
    return null;
  }
}

generatePostTemplate.generatePostImage_Multi('b2e86340-8f12-43ea-a876-56ad9ba55f03').then((path) => {
  console.log("PATH:::::::::", path);
})
