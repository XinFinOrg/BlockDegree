const CoursePrice = require("../models/coursePrice");
const AllWallet = require("../models/wallet");
const KeyConfig = require("../config/keyConfig");

exports.addCourse = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    (req.body.courseName == undefined || req.body.courseName == "") ||
    (req.body.coursePriceUsd == undefined || req.body.coursePriceUsd == "") ||
    (req.body.xdceTolerance == undefined || req.body.xdceTolerance == "") ||
    (req.body.xdceConfirmation == undefined ||
      req.body.xdceConfirmation == "") ||
    (req.body.xdceTolerance == undefined || req.body.xdceTolerance == "") ||
    (req.body.xdcConfirmation == undefined || req.body.xdcConfirmation == "")
  ) {
    res.json({ error: "bad request", status: false });
    return;
  }
  let newCourse = newDefCourse(req.body.courseId);
  newCourse.courseId = req.body.courseId;
  newCourse.courseName = req.body.courseName;
  newCourse.priceUsd = req.body.coursePriceUsd;
  newCourse.xdcTolerance = req.body.xdcTolerance;
  newCourse.xdceTolerance = req.body.xdceTolerance;
  newCourse.xdceConfirmation = req.body.xdceConfirmation;
  newCourse.xdcConfirmation = req.body.xdcConfirmation;

  try {
    await newCourse.save();
  } catch (saveError) {
    console.error(
      "Some error occured while trying to save the model: ",
      saveError
    );
    res.json({
      status: false,
      error: "internal error while saving the new model"
    });
    return;
  }
  res.json({ status: true, error: null });
};

exports.setXdceTolerance = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    req.body.xdceTolerance == undefined ||
    req.body.xdceTolerance == ""
  ) {
    console.error("Bad request at adminServices.setXdceTolerance");
    res.json({ status: false, error: "bad request" });
    return;
  }

  try {
    let course = await CoursePrice.findOne({ courseId: req.body.courseId });
    let filteredTolerance = req.body.xdceTolerance.trim();
    if (course == null) {
      console.error(
        "Bad request at adminServices.setXdceTolerance, course not found"
      );
      res.json({ status: false, error: "bad request, course not found" });
      return;
    }
    // course found
    if (course.xdceTolerance === filteredTolerance) {
      // same value, no need to set it again
      console.error("bad request, same XdceTolerance as the existing value");
      res.json({
        status: false,
        error: "bad request, same value of the xdceTolerance"
      });
      return;
    }
    course.xdceTolerance = filteredTolerance;
    await course.save();
  } catch (e) {
    console.error(
      "Some exception occured ay adminServices.setXdceTolerance: ",
      e
    );
    res.json({ status: false, error: "internal error" });
    return;
  }
  res.json({ status: true, error: null });
};

exports.setXdcTolerance = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    req.body.xdcTolerance == undefined ||
    req.body.xdcTolerance == ""
  ) {
    console.error("Bad request at adminServices.setXdcTolerance");
    res.json({ status: false, error: "bad request" });
    return;
  }

  try {
    let course = await CoursePrice.findOne({ courseId: req.body.courseId });
    let filteredTolerance = req.body.xdcTolerance.trim();
    if (course == null) {
      console.error(
        "Bad request at adminServices.setXdcTolerance, course not found"
      );
      res.json({ status: false, error: "bad request, course not found" });
      return;
    }
    // course found
    if (course.xdcTolerance === filteredTolerance) {
      // same value, no need to set it again
      console.error("bad request, same XdcTolerance as the existing value");
      res.json({
        status: false,
        error: "bad request, same value of the xdcTolerance"
      });
      return;
    }
    course.xdcTolerance = filteredTolerance;
    await course.save();
  } catch (e) {
    console.error(
      "Some exception occured ay adminServices.setXdcTolerance: ",
      e
    );
    res.json({ status: false, error: "internal error" });
    return;
  }
  res.json({ status: true, error: null });
};

exports.setPriceUsd = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    req.body.priceUsd == undefined ||
    req.body.priceUsd == ""
  ) {
    console.error("Bad request at adminServices.setPriceUsd");
    res.json({ status: false, error: "bad request" });
    return;
  }

  try {
    let course = await CoursePrice.findOne({ courseId: req.body.courseId });
    let filteredPrice = req.body.priceUsd.trim();
    if (course == null) {
      console.error(
        "Bad request at adminServices.setPriceUsd, course not found"
      );
      res.json({ status: false, error: "bad request, course not found" });
      return;
    }
    // course found
    if (course.priceUsd === filteredPrice) {
      // same value, no need to set it again
      console.error("bad request, same priceUsd as the existing value");
      res.json({
        status: false,
        error: "bad request, same value of the priceUsd"
      });
      return;
    }
    course.priceUsd = filteredPrice;
    await course.save();
  } catch (e) {
    console.error("Some exception occured ay adminServices.priceUsd: ", e);
    res.json({ status: false, error: "internal error" });
    return;
  }
  res.json({ status: true, error: null });
};

exports.setXdceConfirmation = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    req.body.xdceConfirmation == undefined ||
    req.body.xdceConfirmation == ""
  ) {
    console.error("Bad request at adminServices.setXdceConfirmation");
    res.json({ status: false, error: "bad request" });
    return;
  }

  try {
    let course = await CoursePrice.findOne({ courseId: req.body.courseId });
    let filteredConfirmation = req.body.xdceConfirmation.trim();
    if (course == null) {
      console.error(
        "Bad request at adminServices.setXdceConfirmation, course not found"
      );
      res.json({ status: false, error: "bad request, course not found" });
      return;
    }
    // course found
    if (course.xdceConfirmation === filteredConfirmation) {
      // same value, no need to set it again
      console.error(
        "bad request, same confirmation number as the existing value"
      );
      res.json({
        status: false,
        error: "bad request, same value of the confirmations"
      });
      return;
    }
    course.xdceConfirmation = filteredConfirmation;
    await course.save();
  } catch (e) {
    console.error(
      "Some exception occured ay adminServices.setXdceConfirmation: ",
      e
    );
    res.json({ status: false, error: "internal error" });
    return;
  }
  res.json({ status: true, error: null });
};

exports.setXdcConfirmation = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    req.body.xdcConfirmation == undefined ||
    req.body.xdcConfirmation == ""
  ) {
    console.error("Bad request at adminServices.setXdcConfirmation");
    res.json({ status: false, error: "bad request" });
    return;
  }

  try {
    let course = await CoursePrice.findOne({ courseId: req.body.courseId });
    let filteredConfirmation = req.body.xdcConfirmation.trim();
    if (course == null) {
      console.error(
        "Bad request at adminServices.setXdcConfirmation, course not found"
      );
      res.json({ status: false, error: "bad request, course not found" });
      return;
    }
    // course found
    if (course.xdcConfirmation === filteredConfirmation) {
      // same value, no need to set it again
      console.error(
        "bad request, same confirmation number as the existing value"
      );
      res.json({
        status: false,
        error: "bad request, same value of the confirmations"
      });
      return;
    }
    course.xdcConfirmation = filteredConfirmation;
    await course.save();
  } catch (e) {
    console.error(
      "Some exception occured ay adminServices.setXdcConfirmation: ",
      e
    );
    res.json({ status: false, error: "internal error" });
    return;
  }
  res.json({ status: true, error: null });
};

exports.setCourseBurnPercent = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    req.body.tokenName == undefined ||
    req.body.tokenName == "" ||
    req.body.burnPercent == undefined ||
    req.body.burnPercent == ""
  ) {
    console.error("Bad request at adminServices.setCourseBurnPercent");
    res.json({ status: false, error: "bad request" });
    return;
  }

  try {
    let course = await CoursePrice.findOne({ courseId: req.body.courseId });
    let filteredTokenName = req.body.tokenName.trim();
    let burnPercent = req.body.burnPercent.trim();
    if (course == null) {
      console.error(
        "Bad request at adminServices.setCourseBurnPercent, course not found"
      );
      res.json({ status: false, error: "bad request, course not found" });
      return;
    }
    // course found
    // let allBurnTokens = course.burnToken;
    let found = false;
    for (let i = 0; i < course.burnToken.length; i++) {
      if (course.burnToken[i].tokenName === filteredTokenName) {
        // found token, it exists
        found = true;
        if (course.burnToken[i].burnPercent === burnPercent) {
          // same value, bad request
          console.error(
            "Bad request at adminServices.setCourseBurnPercent, same value"
          );
          res.json({
            status: false,
            error:
              "Bad request at adminServices.setCourseBurnPercent, same value"
          });
          return;
        } else {
          // course.burnToken[i].burnPercent = burnPercent;
          await CoursePrice.update(
            {
              courseId: req.body.courseId,
              "burnToken.tokenName": filteredTokenName
            },
            { $set: { "burnToken.$.burnPercent": burnPercent } },
            (err, course) => {
              console.log(err, course);
            }
          );
        }
      }
    }

    if (!found) {
      // new token burn addition
      course.burnToken.push({
        tokenName: filteredTokenName,
        burnPercent: burnPercent,
        autoBurn: false
      });
    }

    await course.save();
  } catch (e) {
    console.error(
      "Some exception occured ay adminServices.setXdcConfirmation: ",
      e
    );
    res.json({ status: false, error: "internal error" });
    return;
  }
  res.json({ status: true, error: null });
};

exports.enableBurning = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    req.body.tokenName == undefined ||
    req.body.tokenName == ""
  ) {
    console.error("Bad request at adminServices.enableBurning");
    res.json({ status: false, error: "bad request" });
    return;
  }

  try {
    // course found
    let filteredTokenName = req.body.tokenName.trim();
    await CoursePrice.update(
      { courseId: req.body.courseId, "burnToken.tokenName": filteredTokenName },
      { $set: { "burnToken.$.autoBurn": true } },
      (err, course) => {
        console.log(err, course);
      }
    );
  } catch (e) {
    console.error(
      "Some exception occured ay adminServices.setXdcConfirmation: ",
      e
    );
    res.json({ status: false, error: "internal error" });
    return;
  }
  res.json({ status: true, error: null });
};

exports.disableBurning = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    req.body.tokenName == undefined ||
    req.body.tokenName == ""
  ) {
    console.error("Bad request at adminServices.disableBurning");
    res.json({ status: false, error: "bad request" });
    return;
  }

  try {
    let filteredTokenName = req.body.tokenName.trim();
    await CoursePrice.update(
      { courseId: req.body.courseId, "burnToken.tokenName": filteredTokenName },
      { $set: { "burnToken.$.autoBurn": false } },
      (err, course) => {
        console.log(err, course);
      }
    );
  } catch (e) {
    console.error(
      "Some exception occured ay adminServices.setXdcConfirmation: ",
      e
    );
    res.json({ status: false, error: "internal error" });
    return;
  }
  res.json({ status: true, error: null });
};

// add a wallet address
exports.addWallet = async (req, res) => {
  const wallet_address = req.body.wallet_address;
  const wallet_token_name = req.body.wallet_token_name;
  const wallet_network = req.body.wallet_network;
  const wallet_purpose = req.body.wallet_purpose;
  const wallet_type = req.body.wallet_type;

  if (
    wallet_address == undefined ||
    wallet_address == null ||
    wallet_address == ""
  ) {
    return res.json({
      status: false,
      error: "bad request; invalid wallet address"
    });
  }

  if (
    wallet_token_name == undefined ||
    wallet_token_name == null ||
    wallet_token_name == ""
  ) {
    return res.json({
      status: false,
      error: "bad request; invalid wallet tokenName"
    });
  }

  if (
    wallet_network == undefined ||
    wallet_network == null ||
    wallet_network == ""
  ) {
    return res.json({
      status: false,
      error: "bad request; invalid wall;et network"
    });
  }

  if (
    wallet_purpose == undefined ||
    wallet_purpose == null ||
    wallet_purpose == ""
  ) {
    return res.json({
      status: false,
      error: "bad request; invalid wallet purpose"
    });
  }

  if (wallet_type == undefined || wallet_type == null || wallet_type == "") {
    return res.json({
      status: false,
      error: "bad request; invalid wallet type"
    });
  }

  let existingWallet = null;
  let configWallet = null;

  try {
    configWallet = await AllWallet.findOne();
  } catch (e) {
    console.error("Some error occured at adminServices.addWallet: ", e);
    return res.json({ status: false, error: "Internal Error" });
  }

  switch (wallet_type) {
    case "recipient": {
      for (let i = 0; i < configWallet.recipientWallets.length; i++) {
        if (
          wallet_address === configWallet.recipientWallets[i].wallet_address &&
          wallet_token_name ===
            configWallet.recipientWallets[i].wallet_token_name &&
          wallet_network === configWallet.recipientWallets[i].wallet_network
        ) {
          // wallet exists, return bad request
          return res.json({
            status: false,
            error: "recipient wallet already exists"
          });
        }
      }
      configWallet.recipientWallets.push({
        wallet_address: wallet_address,
        wallet_network: wallet_network,
        wallet_purpose: wallet_purpose,
        wallet_token_name: wallet_token_name
      });
      try {
        await configWallet.save();
      } catch (err) {
        console.error("Some error occured while saving the wallet: ", e);
        return res.json({
          status: false,
          error: "internal error"
        });
      }
      return res.json({ status: true, error: null });
    }
    case "burn": {
      for (let i = 0; i < configWallet.burnWallets.length; i++) {
        if (
          wallet_address === configWallet.burnWallets[i].wallet_address &&
          wallet_token_name === configWallet.burnWallets[i].wallet_token_name &&
          wallet_network === configWallet.burnWallets[i].wallet_network
        ) {
          // wallet exists, return bad request
          return res.json({
            status: false,
            error: "burn wallet already exists"
          });
        }
      }
      configWallet.burnWallets.push({
        wallet_address: wallet_address,
        wallet_network: wallet_network,
        wallet_purpose: wallet_purpose,
        wallet_token_name: wallet_token_name
      });
      try {
        await configWallet.save();
      } catch (err) {
        console.error("Some error occured while saving the wallet: ", e);
        return res.json({
          status: false,
          error: "internal error"
        });
      }
      return res.json({ status: true, error: null });
    }
    default: {
      return res.json({ status: false, error: "unknown wallet type" });
    }
  }
};
// switch the receipient to the given address
exports.switchWalletTo = async (req, res) => {
  /*

    1. Check if wallet exists in MongoDB
    2. Check if wallet's private key exists in the config file, if it does go ahead orelse bad request

  */
  console.log("called switch wallet to");
  const wallet_address = req.body.wallet_address;
  const wallet_type = req.body.wallet_type;
  const wallet_token_name = req.body.wallet_token_name;
  const wallet_network = req.body.wallet_network;

  if (
    wallet_address == undefined ||
    wallet_address == null ||
    wallet_address == ""
  ) {
    return res.json({
      status: false,
      error: "bad request; invalid wallet address"
    });
  }

  if (
    wallet_token_name == undefined ||
    wallet_token_name == null ||
    wallet_token_name == ""
  ) {
    return res.json({
      status: false,
      error: "bad request; invalid wallet tokenName"
    });
  }

  if (
    wallet_network == undefined ||
    wallet_network == null ||
    wallet_network == ""
  ) {
    return res.json({
      status: false,
      error: "bad request; invalid wall;et network"
    });
  }

  if (wallet_type == undefined || wallet_type == null || wallet_type == "") {
    return res.json({
      status: false,
      error: "bad request; invalid wallet type"
    });
  }

  let configWallet;
  try {
    configWallet = await AllWallet.findOne();
  } catch (e) {
    console.log(
      "Some error occured while fecthing the confgi wallet at adminServices: ",
      e
    );
    return res.json({ status: false, error: "internal error" });
  }
  if (configWallet == null) {
    return res.json({ status: false, error: "internal error" });
  }
  switch (wallet_type) {
    case "recipient": {
      console.log("in recipient");
      console.log(configWallet.recipientWallets.length);
      for (let i = 0; i < configWallet.recipientWallets.length; i++) {
        if (
          configWallet.recipientWallets[i].wallet_address === wallet_address &&
          wallet_token_name ===
            configWallet.recipientWallets[i].wallet_token_name &&
          wallet_network === configWallet.recipientWallets[i].wallet_network
        ) {
          // // found the wallet
          // if (KeyConfig[wallet_address] !== undefined && KeyConfig[wallet_address].privateKey === "" ){
          //   // stuff exists

          // }else{
          //   // wallet is not setup properly
          // }
          console.log("Found in recipient wallets");
          let exists = false;
          loop1: {
            for (let z = 0; z < configWallet.recipientActive.length; z++) {
              console.log("In active wallets loop");
              if (
                configWallet.recipientActive[z].wallet_network ===
                  wallet_network &&
                configWallet.recipientActive[z].wallet_token_name ===
                  wallet_token_name
              ) {
                exists = true;
                break loop1;
              }
            }
          }
          if (exists) {
            console.log("exists");
            try {
              // await configWallet.updateOne(
              //   {
              //     "recipientActive.wallet_network": wallet_network,
              //     "recipientActive.wallet_token_name": wallet_token_name
              //   },
              //   { $set: { "recipientActive.$.wallet_address": wallet_address } }
              // );
              for (let f = 0; f < configWallet.recipientActive.length; f++) {
                if (
                  configWallet.recipientActive[f].wallet_network ===
                    wallet_network &&
                  configWallet.recipientActive[f].wallet_token_name ===
                    wallet_token_name
                ) {
                  configWallet.recipientActive[f].wallet_address = wallet_address;
                  configWallet.markModified('recipientActive')
                  await configWallet.save();
                  return res.json({ error: null, status: true }); 
                }
              }
            } catch (e) {
              console.error(
                "some error occured while updating the active account: ",
                e
              );
              return res.json({ error: "internal error", status: false });
            }
          } else {
            // add a new wallet
            console.log("new wallet");
            try {
              configWallet.recipientActive.push({
                wallet_address: wallet_address,
                wallet_network: wallet_network,
                wallet_purpose: configWallet.recipientWallets[i].wallet_purpose,
                wallet_token_name: wallet_token_name
              });
              await configWallet.save();
            } catch (e) {
              console.error(
                "Some error occured while adding new wallet to recipientActive at adminServices.switchWalletTo: ",
                e
              );
              return res.json({ error: "internal error", status: false });
            }
            return res.json({ error: null, status: true });
          }
        }
      }
      break;
    }
    case "burn": {
      console.log("inside burn");
      for (let i = 0; i < configWallet.burnWallets.length; i++) {
        if (
          configWallet.burnWallets[i].wallet_address === wallet_address &&
          wallet_token_name === configWallet.burnWallets[i].wallet_token_name &&
          wallet_network === configWallet.burnWallets[i].wallet_network
        ) {
          // found the wallet
          console.log("found the wallet");
          console.log(KeyConfig[wallet_address]);
          if (
            KeyConfig[wallet_address] !== undefined &&
            KeyConfig[wallet_address].privateKey !== ""
          ) {
            // stuff exists
            console.log("Stuff exists in the KeyConfig");

            let exists = false;
            loop1: {
              for (let z = 0; z < configWallet.burnActive.length; z++) {
                if (
                  configWallet.burnActive[z].wallet_network ===
                    wallet_network &&
                  configWallet.burnActive[z].wallet_token_name ===
                    wallet_token_name
                ) {
                  exists = true;
                  break loop1;
                }
              }
            }
            if (exists) {
              try {
                // await configWallet.burnActive.updateOne(
                //   {
                //     wallet_network: wallet_network,
                //     wallet_token_name: wallet_token_name
                //   },
                //   { $set: { wallet_address: wallet_address } }
                // );
                for (let f = 0; f < configWallet.burnActive.length; f++) {
                  if (
                    configWallet.burnActive[f].wallet_network ===
                      wallet_network &&
                    configWallet.burnActive[f].wallet_token_name ===
                      wallet_token_name
                  ) {
                    configWallet.burnActive[f].wallet_address = wallet_address;
                    configWallet.markModified('burnActive')
                    await configWallet.save();
                    return res.json({ error: null, status: true }); 
                  }
                }
              } catch (e) {
                console.error(
                  "some error occured while updating the active account: ",
                  e
                );
                return res.json({ error: "internal error", status: false });
              }
              return res.json({ error: null, status: true });
            } else {
              // add a new wallet
              try {
                configWallet.burnActive.push({
                  wallet_address: wallet_address,
                  wallet_network: wallet_network,
                  wallet_purpose: configWallet.burnWallets[i].wallet_purpose,
                  wallet_token_name: wallet_token_name
                });
                await configWallet.save();
              } catch (e) {
                console.error(
                  "Some error occured while adding new wallet to burnActive at adminServices.switchWalletTo: ",
                  e
                );
                return res.json({ error: "internal error", status: false });
              }
              return res.json({ error: null, status: true });
            }
          } else {
            // wallet is not setup properly
            return res.json({
              error: "please add privateKey in KeyConfig",
              status: false
            });
          }
        }
      }
      break;
    }
  }
};

exports.initiateWalletConfig = async () => {
  try {
    const configWallet = await AllWallet.find({});
    if (configWallet.length > 1) {
      console.error("More than one wallet configs, please delete one");
    }
    if (configWallet.length == 0) {
      // called first time, add new wallet.
      let newWallet = new AllWallet({
        recipientWallets: [],
        burnWallets: [], // corresponding private key needs to be present in the server/config/config.js file
        recipientActive: [],
        burnActive: []
      });
      await newWallet.save();
      console.log("Wallet initiated, please add some data");
      return;
    }
  } catch (e) {
    console.error(
      "Some error occured at adminServices.initiateWalletConfig: ",
      e
    );
    return;
  }
};

function newDefCourse(courseId) {
  return new CoursePrice({
    courseId: courseId,
    courseName: "",
    xdceTolerance: "",
    xdceConfirmation: "",
    xdcTolerance: "",
    xdcConfirmation: "",
    priceUsd: "",
    burnToken: []
  });
}
