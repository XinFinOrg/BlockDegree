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
const Xdc3 = require("xdc3");
const xdcWs = require("../helpers/constant").WsXinfinMainnet;
const equateAddress = require("../helpers/common").equateAddress;
const { xdcToUsd, usdToXdc } = require("../helpers/cmcHelper");
const {
  renderFunderCerti,
  renderBulkCerti,
} = require("../helpers/renderFunderCerti");
const BulkPayment = require("../models/bulkCourseFunding");
const CorporateUser = require("../models/corporateUser");
const {
  makeValueTransferXDC,
  getBalance,
} = require("../helpers/blockchainHelpers");
const KeyConfig = require("../config/keyConfig");
const recipients = [];
const bulkRecipients = [];
const bulkPayments = [];

let xdc3Provider = new Xdc3.providers.WebsocketProvider(xdcWs);
let xdc3 = new Xdc3(xdc3Provider);

let subscriptionNewHeaders;

let inReconnXDC = false;
let processorInUse = false;

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
            currentReq["completionDate"] = Date.now() + "";
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
            WsServer.emit("fmd-trigger");
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
              renderFunderCerti(currentReq.donerName, currentReq.fundId);
              emailer.sendFMDCompleteFunder(
                currentReq.donerEmail,
                currentReq.userName,
                currentReq.donerName,
                courseNames,
                currentReq.requestUrlShort
              );
            }

            // const walletKeys = Object.keys(KeyConfig);
            // let to = null;
            // for (let i = 0; i < walletKeys.length; i++) {
            //   if (
            //     KeyConfig[walletKeys[i]].wallet_network === "50" &&
            //     KeyConfig[walletKeys[i]].wallet_type === "burn"
            //   ) {
            //     to = walletKeys[i];
            //     break;
            //   }
            // }
            // if (to === null) {
            //   return;
            // }
            // if (to.startsWith("0x")) {
            //   to = "xdc" + to.slice(2);
            // }
            // let transferAmnt =
            //   getBalance(currentReq.receiveAddr) - Math.pow(10, 18);
            // const receipt = await makeValueTransferXDC(
            //   to,
            //   transferAmnt,
            //   currentReq.receiveAddrPrivKey
            // );

            // emailer.sendMailInternal(
            //   "blockdegree-bot@blokcdegree.org",
            //   process.env.SUPP_EMAIL_ID,
            //   "Transferred FMD tokens to Wallet",
            //   `Hello,\n we have transfered ${transferAmnt} tokens into the burn wallet for XDC for the fund with id ${
            //     currentReq.fundId
            //   }.\n Receipt: ${JSON.stringify(receipt)}`
            // );
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

async function syncPendingBulkCoursePayments() {
  try {
    console.log("called syncPendingBulkCoursePayments");
    const allRequests = await BulkPayment.find(
      { status: "uninitiated" },
      "receiveAddr"
    );
    for (let i = 0; i < allRequests.length; i++) {
      if (!bulkPayments.includes[allRequests[i].receiveAddr])
        bulkPayments.push(allRequests[i].receiveAddr);
    }
  } catch (e) {
    console.log(
      `exception at ${__filename}.syncPendingBulkCoursePayments: `,
      e
    );
  }
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

async function syncBulkRecipients() {
  try {
    let count = 0;
    const uninitiatedRecipient = await BulkPayment.find({
      status: "uninitiated",
    }).lean();
    uninitiatedRecipient.forEach((currReq) => {
      if (!bulkRecipients.includes(currReq.receiveAddr)) {
        count++;
        bulkRecipients.push({
          address: currReq.receiveAddr,
          id: currReq.bulkId,
        });
      }
    });
    console.log(`[*] synced ${count} bulk recipients`);
    // console.log("[*] Current recipients", bulkRecipients);
  } catch (e) {
    console.log(`[*] exception at ${__filename}.syncBulkRecipients: `, e);
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
em.on("bulkRecipients", syncBulkRecipients);
em.on("syncPendingBulkCoursePayments", syncPendingBulkCoursePayments);
em.on("processChildFMD", processChildFMD);
// em.on("syncMissedTx", syncMissedBlocks);

exports.em = em;

// ---------------------------------------- Donation ----------------------------------------

newBlockProcessor();

async function checkPendingCompletion() {
  try {
    const funds = await UserFundRequest.find({
      $or: [{ status: "uninitiated" }, { status: "pending" }],
    }).select({ receiveAddrPrivKey: 0 });

    funds.forEach(async (currFundReq) => {
      const xdcBalance = await xdc3.eth.getBalance(currFundReq.receiveAddr);
      if (xdcBalance > 0) {
        const min =
          parseFloat(currFundReq.amountGoal) -
          parseFloat(currFundReq.amountGoal) / 10;
        const max =
          parseFloat(currFundReq.amountGoal) +
          parseFloat(currFundReq.amountGoal) / 10;
        const valUsd = await xdcToUsd(
          parseFloat(xdc3.utils.fromWei(xdcBalance))
        );
        console.log("pending balance: ", xdcBalance, "value usd", valUsd);
        if (
          parseFloat(min) <= parseFloat(valUsd) &&
          parseFloat(valUsd) <= parseFloat(max)
        ) {
          emailer.sendMailInternal(
            "blockdegree-bot@blockdegree.org",
            process.env.SUPP_EMAIL_ID,
            "Payment Missed",
            `Missed payment for fund ${
              currFundReq.fundId
            }, has an amount balance of ${xdc3.utils.fromWei(xdcBalance)}`
          );
        }
      }
    });
  } catch (e) {
    console.log(`exception at ${__filename}.checkPendingCompletion: `, e);
  }
}

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

function removeBulkPayment(address) {
  let removeIndex = -1;
  for (let i = 0; i < bulkPayments.length; i++) {
    if (bulkPayments[i] === address) {
      removeIndex = i;
    }
  }
  if (removeIndex > -1) {
    bulkPayments.splice(removeIndex, 1);
  }
}

function removeBulkRecipient(address) {
  let removeIndex = -1;
  for (let i = 0; i < bulkRecipients.length; i++) {
    if (bulkRecipients[i] === address) {
      removeIndex = i;
    }
  }
  if (removeIndex > -1) {
    bulkRecipients.splice(removeIndex, 1);
  }
}

setInterval(() => {
  checkPendingCompletion();
}, 60 * 60 * 1000);

checkPendingCompletion();

function connectionHeartbeat() {
  setInterval(async () => {
    try {
      const isActiveXdc = await xdc3.eth.net.isListening();
      console.log(`connection status XDC donationListener:${isActiveXdc}`);
      if (!isActiveXdc && inReconnXDC === false) xdcReconn();
    } catch (e) {
      if (inReconnXDC === false) xdcReconn();
    }
  }, 5000);
}

function xdcReconn() {
  try {
    console.log("[*] reconn xdc running");
    inReconnXDC = true;
    let currInterval = setInterval(() => {
      let xdcProvider = new Xdc3.providers.WebsocketProvider(xdcWs);
      xdc3 = new Xdc3(xdcProvider);
      xdcProvider.on("connect", () => {
        console.log(`[*] xdc reconnected to ws at ${__filename}`);
        inReconnXDC = false;
        subscriptionNewHeaders.unsubscribe();
        processorInUse = false;
        newBlockProcessor();
        clearInterval(currInterval);
      });
    }, 5000);
  } catch (e) {
    console.log(`exception at ${__filename}.xdcReconn: `, e);
  }
}

connectionHeartbeat();

async function processChildFMD(bulkId) {
  try {
    const bulkPayment = await BulkPayment.findOne({ bulkId: bulkId });
    if (bulkPayment === null) {
      console.log(`[*] bulk payment not found`);
      return;
    }
    const fundIds = bulkPayment.fundIds;
    if (fundIds === undefined || fundIds === null || fundIds.length === 0) {
      console.log(`exception at ${__filename}.donationListener: `, e);
      emailer.sendMailInternal(
        "",
        "",
        "ERROR: BulkPayment",
        `no child fundIds found for bulkPayment: ${bulkId}`
      );
      return;
    }
    for (let i = 0; i < fundIds.length; i++) {
      const fundId = fundIds[i];
      markFMDComplete(
        fundId.fundId,
        {
          type: bulkPayment.type,
          donerEmail: bulkPayment.donerEmail,
          corporateEmail: bulkPayment.companyEmail,
        },
        bulkId
      );
    }
  } catch (e) {
    console.log(`exception at ${__filename}.processChildFMD: `, e);
  }
}

async function markFMDComplete(
  fundId,
  { type, donerEmail, corporateEmail },
  bulkId
) {
  console.log(fundId, type, donerEmail, corporateEmail);

  try {
    const fund = await UserFundRequest.findOne({ fundId: fundId });
    const recipient = await User.findOne({ email: fund.email });
    const bulkPayments = await BulkPayment.findOne({ bulkId });
    if (fund === null) {
      console.log(
        `[*] fundid ${fundId} not found at ${__filename}.markFMDComplete`
      );
      sendMailInternal(
        "",
        "",
        "ERROR: BulkPayment",
        `fundid ${fundId} not found`
      );
      return;
    }
    if (type === "bulk") {
      const user = await User.findOne({ email: donerEmail });
      let courseNames = "";
      fund.donerEmail = user.email;
      fund.donerName = user.name;
      fund.bulkId = bulkId;
      fund.type = "bulk";
      fund.status = "completed";
      fund.completionDate = Date.now();
      for (let i = 0; i < fund.courseId.length; i++) {
        recipient.examData.payment[fund.courseId[i]] = true;
        recipient.examData.payment[
          `${fund.courseId[i]}_payment`
        ] = `donation-bulk:${bulkId}`;
        recipient.examData.payment[`${fund.courseId[i]}_doner`] = user.name;
        courseNames += getCourseName(fund.courseId[i]);
        if (i < fund.courseId.length - 1) {
          courseNames += ", ";
        }
      }
      await fund.save();
      await recipient.save();
      WsServer.emit("fmd-trigger");
      emailer.sendFMDCompleteFunderBulk(
        user.email,
        bulkPayments.fundIds.length
      );
    } else if (type === "corporate") {
      const user = await CorporateUser.findOne({
        companyEmail: corporateEmail,
      });
      let courseNames = "";
      fund.donerEmail = user.companyEmail;
      fund.donerName = user.companyName;
      fund.bulkId = bulkId;
      fund.type = "bulk";
      fund.status = "completed";
      fund.completionDate = Date.now();
      for (let i = 0; i < fund.courseId.length; i++) {
        recipient.examData.payment[fund.courseId[i]] = true;
        recipient.examData.payment[
          `${fund.courseId[i]}_payment`
        ] = `donation-corp:${bulkId}`;
        recipient.examData.payment[`${fund.courseId[i]}_doner`] =
          user.companyName;
        courseNames += getCourseName(fund.courseId[i]);
        if (i < fund.courseId.length - 1) {
          courseNames += ", ";
        }
      }
      user.fundedCount = user.fundedCount + bulkPayments.fundIds.length;
      await user.save();
      await fund.save();
      await recipient.save();
      WsServer.emit("fmd-trigger");
      emailer.sendFMDCompleteFunderBulk(
        user.companyEmail,
        bulkPayments.fundIds.length
      );
      emailer.sendFMDCompleteUser(fund.email, user.companyName, courseNames);
      renderFunderCerti(user.companyEmail, fund.fundId);
      burnEmitter.emit("donationTokenBurn", fund.fundId);
    }
  } catch (e) {
    console.log(`exception at ${__filename}.markFMDComplete: `, e);
  }
}

function newBlockProcessor() {
  console.log("[*] starting new block processor");
  if (processorInUse !== true) {
    processorInUse = true;
    subscriptionNewHeaders = xdc3.eth.subscribe("newBlockHeaders");
    subscriptionNewHeaders.on("data", async (result) => {
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
              const valUsd = await xdcToUsd(
                xdc3.utils.fromWei(currBlockTx.value, "ether")
              );
              const totAmnt = parseFloat(currFundReq.amountGoal);
              const min = totAmnt - totAmnt / 10;
              const max = totAmnt + totAmnt / 10;
              console.log(`min ${min} max ${max} valUsd ${valUsd}`);
              if (min <= parseFloat(valUsd) && parseFloat(valUsd) <= max) {
                startProcessingDonation(
                  currFundReq.fundId,
                  currBlockTx.hash,
                  ""
                );
              } else {
                console.log("invalid amount");
              }
            } else {
              for (let h = 0; h < bulkRecipients.length; h++) {
                if (equateAddress(bulkRecipients[h].address, currBlockTx.to)) {
                  const coursePayemnt = await BulkPayment.findOne({
                    receiveAddr: bulkRecipients[h].address,
                  });
                  if (
                    coursePayemnt.txHash !== undefined &&
                    coursePayemnt.txHash !== "" &&
                    coursePayemnt.txHash !== null
                  ) {
                    continue;
                  }
                  const amountGoal =
                    (await usdToXdc(coursePayemnt.amountGoal)) *
                    Math.pow(10, 18);
                  const min = amountGoal - parseFloat(amountGoal) / 10;
                  const max = amountGoal + parseFloat(amountGoal) / 10;
                  const currAmnt = currBlockTx.value;
                  console.log(min, max, currAmnt);

                  if (min <= currAmnt && currAmnt <= max) {
                    console.log("calid value");

                    coursePayemnt.status = "completed";
                    coursePayemnt.txHash = currBlockTx.hash;
                    coursePayemnt.completionDate = Date.now() + "";
                    await coursePayemnt.save();
                    emailer.sendMailInternal(
                      "blockdegree-bot@blockdegree.org",
                      process.env.SUPP_EMAIL_ID,
                      "Got Entire Course Payemnt",
                      `Got an entire course payment by transaction in XDC to address ${currBlockTx.to} for bulk-payment id ${coursePayemnt.bulkId}. Please do the needful`
                    );
                    console.log("update done");

                    removeBulkRecipient(coursePayemnt.receiveAddr);
                    renderBulkCerti(coursePayemnt.bulkId);
                    console.log("processing fmd");

                    processChildFMD(coursePayemnt.bulkId);
                  } else {
                    emailer.sendMailInternal(
                      "blockdegree-bot@blockdegree.org",
                      process.env.SUPP_EMAIL_ID,
                      "Got Partial Course Payemnt",
                      `Got an entire course's payment <b>Partially</b> by transaction in XDC to address ${currBlockTx.to} for bulk-payment id ${coursePayemnt.bulkId}. Please do the needful`
                    );
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.log(`exception at ${__filename}.newBlockHeaders: `, e);
        subscriptionNewHeaders.unsubscribe();
        processorInUse = false;
        // emailer.sendMailInternal(
        //   "blockdegree-bot@blockdegree.org",
        //   process.env.SUPP_EMAIL_ID,
        //   "New Block sub. cleared",
        //   `have cleared subscriptions to new block headers at ${__filename} due to some error ${String(
        //     e
        //   )}\nStarting a new block processor.`
        // );
        newBlockProcessor();
        return;
      }
    });
  } else {
    console.log("[*] block processor called twice");
  }
}

function getCourseName(id) {
  switch (id) {
    case "course_1":
      return "Blockchain Basic";
    case "course_2":
      return "Blockchain Advanced";
    case "course_3":
      return "Blockchain Professional";
    case "course_4":
      return "Cloud Computing";
    default:
      return "";
  }
}
