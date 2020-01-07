const schedule = require("node-schedule");
const Event = require("../models/social_post_event");
const SocialPostTemplate = require("../models/socialPostTemplates");
const Emailer = require("../emailer/impl");
const emitPostSocial = require("../listeners/postSocial").em;
const PostConfig = require("../models/social_post_config");
const Post = require("../models/social_post");
const _ = require("lodash");
const uuid = require("uuid/v4");
const fs = require("fs");
const path = require("path");
const generatePostTemplate = require("../helpers/generatePostTemplate");

const tmpFilePath = path.join(__dirname, "../tmp-event");
const postTemplatesPath = path.join(__dirname, "../postTemplates");

if (!fs.existsSync(postTemplatesPath)) {
  fs.mkdirSync(postTemplatesPath);
}

/**
 * holds the refernce to all the active jobs.
 * {
 *  eventId: string
 *  refVar: Job
 * }
 */
global.ActiveJobs = [];
ActiveJobs.push = function() {
  Array.prototype.push.apply(this, arguments);
  testActiveJobRefVar();
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
 * @param {object} req - http request object
 * @param {object} res - http response object
 */
exports.scheduleEventByTime = async (req, res) => {
  try {
    // ! can't parse null, need to perform validations first.
    console.log("called schedule event by time");
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
      // _.isNull(file) ||
      // _.isEmpty(eventTS) ||
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
      !["registrations", "certificates", "visits", "one-time"].includes(
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
      // generate the file dynamically from the template.
      /*

        1. Generate the post from the html-template 
        2. Save the template in tmp-event.
        3. Generate the status from the text-template.

      */
      console.log(
        "Typeof templateId: ",
        typeof templateId,
        "Template ID: ",
        templateId
      );
      const currTemplate = await SocialPostTemplate.findOne({ id: templateId });
      if (currTemplate === null) {
        console.error(`template with id ${templateId} does not exists.`);
        return res
          .status(400)
          .json({ status: false, error: "bad request, template not found" });
      }
      const templateImagePath = await generatePostTemplate.generatePostImage(
        eventType,
        "test",
        templateId
      );
      const templateStatus = await generatePostTemplate.generatePostStatus(
        eventType,
        "test",
        templateId
      );

      console.log(
        `Generated templateImagepath: ${templateImagePath} \n templateStatus: ${templateStatus}`
      );
      postStatus = templateStatus;
      postImagePath = templateImagePath;
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
      schedule.scheduleJob(dateObj, () => {
        console.log(`[*] Event fired ------- ${currEvntId}`);
        emitPostSocial.emit("postSocial", currEvntId);
        removeEvent(currEvntId);
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
        new Date(recurrEventTimeWeekly)
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
      await event.save();
      const currEvntId = event.id;
      console.log("saved the new event");
      let currJob = schedule.scheduleJob(recurringRule, () => {
        console.log(`[*] Event fired ------- ${currEvntId}`);
        emitPostSocial.emit("postSocial", currEvntId);
        // Don't remove recurring events
        // removeEvent(currEvntId);
      });

      if (currJob === null) {
        console.error(
          `some error occured while scheduling the job at postSocials.scheduleEventByTime; job returned was null `
        );
        return res.status(500).json({ status: false, error: "internal error" });
      }

      ActiveJobs.push({ eventId: currEvntId, refVar: currJob });
      console.log("Current Job Next Innvocation: ", currJob.nextInvocation());
      return res.json({ status: true, message: "event generated" });
    }
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
    // has pending events, schedule them
    pendingEvents.forEach(evnt => {
      // only schedule events which are in future.
      if (new Date(evnt.nextPostScheduleTS).getTime() > Date.now()) {
        if (!evnt.recurring && !evnt.variableTrigger) {
          console.log("[*] scheduling one-time event");
          const refVar = schedule.scheduleJob(
            new Date(evnt.nextPostScheduleTS),
            () => {
              console.log(`[*] Event fired --------- ${evnt.id}`);
            }
          );
          ActiveJobs.push({ eventId: evnt.id, refVar: refVar });
        } else if (evnt.recurring === true) {
          console.log("[*] scheduling recurring event");
          const refVar = schedule.scheduleJob(evnt.recurringRule, () => {
            console.log(`[*] Event fired -------- ${evnt.id}`);
          });
          ActiveJobs.push({ eventId: evnt.id, refVar: refVar });
        } else if (evnt.variableTrigger === true) {
          console.log(`[*] scheduleing variable recurring event`);
          // !implement the logic to process the recurring event based on the variable trigger
        }
      } else {
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
    postTemplate.createdBy = req.user || "rudresh@xinfin.org";
    postTemplate.isActive = false;
    postTemplate.createdAt = Date.now();
    postTemplate.lastUsed = "";
    postTemplate.templateStatus = templateStatus;
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
    console.log(`saved the template`);
    res.json({ status: true, message: "added new template" });
  } catch (e) {
    console.error("internal error: ", e);
    return res.status(500).json({ status: false, error: "internal error" });
  }
};

function newPostTemplate() {
  return new SocialPostTemplate({
    id: uuid(),
    eventType: "",
    templatePath: "",
    templateStatus: "",
    isActive: false,
    created: "",
    lastUsed: "",
    createdBy: ""
  });
}

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
    variableTrigger: false,
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
    nextPostPath: "",
    nextPostStatus: ""
  });
}

/**
 * generateRecurringPattern genetates & returns the rule object to be given as a
 *  node-schedule input. Returns null on error
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
  recurrEventTimeWeekly
) {
  try {
    switch (recurrCyclePeriod.value) {
      case "annually": {
        console.log("generateRecurringPattern inside annually");
        let rule = new schedule.RecurrenceRule();
        rule.month = recurrEventDateAnnual.getMonth();
        rule.date = recurrEventDateAnnual.getDate();
        rule.hour = recurrEventTimeAnnual.getHours();
        rule.minute = recurrEventTimeAnnual.getMinutes();
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
function removeEvent(eventId) {
  console.log(`called removeEvent ${eventId}`);
  for (let x = 0; x < ActiveJobs.length; x++) {
    if (ActiveJobs[x].eventId === eventId) {
      delete ActiveJobs[x];
      return true;
    }
  }
  return false;
}

/**
 * ! Re-Implement to FWD call to the WebSocket
 */
function testActiveJobRefVar() {
  console.log("pushed into active jobs");
  console.log("currently active jobs: ", ActiveJobs.length);
  ActiveJobs.forEach(currObj => {
    const nextInnvocation = currObj.refVar.nextInvocation()._date.toDate();
    console.log("Next Invocation at testActiveJobRefVar: ", nextInnvocation);
  });
}
