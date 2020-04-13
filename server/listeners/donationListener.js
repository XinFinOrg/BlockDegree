const Event = require("events");
const uuidv4 = require("uuid/v4");
const __ = require("lodash");
const UserFundRequest = require("../models/userFundRequest");
const User = require("../models/user");
const Notification = require("../models/notifications");
const Course = require("../models/coursePrice");
const WsServer = require("../listeners/websocketServer").em;
const burnEmitter = require("./burnToken").em;
const emailer = require("../emailer/impl");
const xdc3 = require("../helpers/blockchainConnectors").xdcInst;
const equateAddress = require("../helpers/common").equateAddress;
const xdcToUsd = require("../helpers/cmcHelper").xdcToUsd;

const recipients = [];

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
      const courseInsts = [];

      for (let i = 0; i < currentReq.courseId.length; i++) {
        const currCourse = await Course.findOne({
          courseId: currentReq.courseId[i],
        });
        courseInsts.push(currCourse);
      }

      const currInterval = setInterval(async () => {
        try {
          console.log(`called interval`);

          const txReceipt = await xdc3.eth.getTransactionReceipt(tx);
          const txRecord = await xdc3.eth.getTransaction(tx);
          console.log(`tx receipt: `, txReceipt);
          console.log(`tx record: `, txRecord);

          if (txReceipt !== null) {
            let courseNames = "";
            for (let i = 0; i < currentReq.courseId.length; i++) {
              currUser.examData.payment[currentReq.courseId[i]] = true;
              currUser.examData.payment[
                `${currentReq.courseId[i]}_payment`
              ] = `donation:${fundId}`;
              currUser.examData.payment[
                `${currentReq.courseId[i]}_doner`
              ] = name;
              if (i < currentReq.courseId.length - 1) {
                courseNames += `${courseInsts[i].courseName}, `;
              } else {
                courseNames += `${courseInsts[i].courseName}`;
              }
            }

            currentReq.status = "completed";
            currentReq.amountReached = await xdcToUsd(
              xdc3.utils.fromWei(txRecord.value)
            );
            currentReq.burnStatus = "pending";
            currentReq.fundTx = tx;
            await currentReq.save();
            await currUser.save();
            clearInterval(currInterval);

            let newNoti = newDefNoti();
            newNoti.type = "success";
            newNoti.email = currentReq.email;
            newNoti.eventName = "funding completed";
            newNoti.eventId = uuidv4();
            newNoti.title = "Funding Completed";
            newNoti.message = `Your funding request for ${courseNames} course(s) is now  completed! Check in your <a href="/profile#fmd-requests">Profile</a>`;
            newNoti.displayed = false;
            await newNoti.save();
            removeRecipient(currentReq.receiveAddr);
            burnEmitter.emit("donationTokenBurn", currentReq.fundId);
            // WsServer.emit("new-noti", currentReq.email);
            emailer.sendFMDCompleteUser(
              currentReq.email,
              currUser.name,
              courseNames
            );

            if (
              currentReq.donerEmail !== "" &&
              currentReq.donerEmail !== null &&
              currentReq.donerEmail !== undefined
            ) {
              emailer.sendFMDCompleteFunder(
                currentReq.donerEmail,
                currentReq.userName,
                currentReq.donerName,
                courseNames
              );
            }
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

/**
 * syncPendingDonation will start processing pending tx
 */
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
      startProcessingDonation(currentDonation.fundId, currentDonation.fundTx);
    });
  });
}

/**
 * will sync the addresses to lookout for deposits in new headers
 */
async function syncRecipients() {
  try {
    let count = 0;
    const uninitiatedRecipient = await UserFundRequest.find({
      $and: [
        {
          status: "uninitiated",
        },
        { valid: true },
      ],
    }).lean();
    uninitiatedRecipient.forEach((currReq) => {
      if (!recipients.includes(currReq.receiveAddr)) {
        count++;
        recipients.push({ address: currReq.receiveAddr, id: currReq.fundId });
      }
    });
    console.log(`[*] synced ${count} recipients`);
  } catch (e) {
    console.log(`[*] exception at ${__filename}.syncRecipient: `, e);
    return;
  }
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

// function syncMissedBlocks() {
//   try {
//   } catch (e) {
//     console.log(`exception at ${__filename}.syncMissedBlocks: `, e);
//   }
// }

em.on("processDonationTx", startProcessingDonation);
em.on("syncPendingDonation", syncPendingDonation);
em.on("syncRecipients", syncRecipients);
// em.on("syncMissedTx", syncMissedBlocks);

exports.em = em;

// ---------------------------------------- Donation ----------------------------------------

xdc3.eth.subscribe("newBlockHeaders").on("data", async (result) => {
  try {
    let retryCount = 0;
    let txCount = await xdc3.eth.getBlockTransactionCount(result.number);
    console.log(`[*] syncing block ${result.number} TX count: `, txCount);

    while (txCount === null) {
      if (retryCount === 10) {
        console.log(`dropping block ${result.number}`);
        return;
      }
      retryCount++;
      txCount = await xdc3.eth.getBlockTransactionCount(result.number);
      console.log(
        `[*] re-syncing block ${result.number} TX count: ${txCount} try: ${retryCount}`
      );
    }

    if (txCount > 0) {
      for (let i = 0; i < txCount; i++) {
        let currBlockTx = await xdc3.eth.getTransactionFromBlock(
          result.number,
          i
        );

        if (currBlockTx === null) {
          continue;
        }

        let currIndex = -1;

        for (let i = 0; i < recipients.length; i++) {
          if (equateAddress(recipients[i].address, currBlockTx.to)) {
            currIndex = i;
          }
        }

        if (currIndex > -1) {
          console.log(`got anonymous deposit`);
          const currFundReq = await UserFundRequest.findOne({
            fundId: recipients[currIndex].id,
          }).lean();
          if (
            currFundReq.fundTx !== undefined &&
            currFundReq.fundTx !== null &&
            currFundReq.fundTx !== ""
          ) {
            continue;
          }
          const user = await User.findOne({ email: currFundReq.email });
          if (user.examData.payment[currFundReq.courseId] === true) {
            emailer.sendMailInternal(
              "blockdegree-bot@blockdegree.org",
              process.env.SUPP_EMAIL_ID,
              "Invalid Anonymous Donation",
              `Got an invalid donation for fund id ${currFundReq.fundId}`
            );
            continue;
          }
          if (currFundReq.status !== "uninitiated") {
            emailer.sendMailInternal(
              "blockdegree-bot@blockdegree.org",
              process.env.SUPP_EMAIL_ID,
              "Invalid Anonymous Donation",
              `Got an invalid donation for fund id ${currFundReq.fundId}`
            );
            continue;
          }

          const courseId = currFundReq.courseId;
          const course = await Course.findOne({ courseId: courseId });
          const valUsd = await xdcToUsd(currBlockTx.value);
          const min = valUsd - valUsd / 10;
          const max = valUsd + valUsd / 10;
          if (
            min <= parseFloat(currFundReq.amountGoal) &&
            parseFloat(currFundReq.amountGoal) <= max
          ) {
            startProcessingDonation(currFundReq.fundId, currBlockTx.hash, "");
          }
        }
      }
    }
  } catch (e) {
    console.log(`exception at ${__filename}.newBlockHeaders: `, e);
    return;
  }
});

function removeRecipient(address) {
  let removeIndex = -1;
  for (let i = 0; i < recipients.length; i++) {
    if (recipients[i].address === address) {
      removeIndex = i;
    }
  }
  if (removeIndex > -1) {
    recipients.splice(removeIndex, 1);
  }
}
