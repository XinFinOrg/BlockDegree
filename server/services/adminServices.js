const CoursePrice = require("../models/coursePrice");

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
            { courseId: req.body.courseId, "burnToken.tokenName": filteredTokenName },
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
