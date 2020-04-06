const Event = require("events");
const uuidv4 = require("uuid/v4");
const UserFundRequest = require("../models/userFundRequest");
const User = require("../models/user");
const Notification = require("../models/notifications");
const Course = require("../models/coursePrice");
const xdc3 = require("../helpers/blockchainConnectors").rinkInst;
const xdcToUsd = require("../helpers/cmcHelper").xdcToUsd;

const txListener = [];

const em = new Event.EventEmitter();

/**
 * will start the processing of a donation
 * @param {string} fundId
 * @param {string} tx
 */
function startProcessingDonation(fundId, tx, name) {
  setImmediate(async () => {
    try {
      console.log(`started processing tx ${tx} by ${name}`);

      const currentReq = await UserFundRequest.findOne({ fundId: fundId });
      const currUser = await User.findOne({ email: currentReq.email });
      const course = await Course.findOne({ courseId: currentReq.courseId });

      const currInterval = setInterval(async () => {
        try {
          console.log(`called interval`);

          const txReceipt = await xdc3.eth.getTransactionReceipt(tx);
          const txRecord = await xdc3.eth.getTransaction(tx);
          console.log(`tx receipt: `, txReceipt);
          console.log(`tx record: `, txRecord);

          if (txReceipt !== null) {
            currUser.examData.payment[currentReq.courseId] = true;
            currUser.examData.payment[
              `${currentReq.courseId}_payment`
            ] = `donation:${fundId}`;
            currUser.examData.payment[`${currentReq.courseId}_doner`] = name;

            currentReq.status = "completed";
            currentReq.amountReached = await xdcToUsd(
              xdc3.utils.fromWei(txRecord.value)
            );
            await currentReq.save();
            await currUser.save();
            clearInterval(currInterval);

            let newNoti = newDefNoti();
            newNoti.type = "success";
            newNoti.email = currentReq.email;
            newNoti.eventName = "funding completed";
            newNoti.eventId = uuidv4();
            newNoti.title = "Funding Completed";
            newNoti.message = `Your funding request for course ${course.courseName} is now  completed!`;
            newNoti.displayed = false;
            await newNoti.save();
          }
        } catch (e) {
          console.log(
            `exception at ${__filename}.startProcessingDonation: `,
            e
          );
          return null;
        }
      }, 10000);
    } catch (e) {
      console.log(`exception at ${__filename}.startProcessingDonation: `, e);
      return;
    }
  });
}

function syncPendingDonation() {
  setImmediate(async () => {
    const allPendingDonation = await UserFundRequest.find({
      $and: [
        {
          status: "pending",
        },
        { valid: true },
      ],
    }).lean();
    if (allPendingDonation.length === 0) {
      console.log(`[*] no pending donations...`);
      return;
    }
    allPendingDonation.forEach((currentDonation) => {
      startProcessingDonation(currentDonation.fundId, currentDonation.tx);
    });
  });
}

function newDefNoti() {
  return new Notification({
    email: "",
    eventName: "",
    eventId: "",
    type: "",
    title: "",
    message: "",
    displayed: false,
  });
}

em.on("processDonationTx", startProcessingDonation);
em.on("syncPendingDonation", syncPendingDonation);

exports.em = em;
