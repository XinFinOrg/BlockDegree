const CoursePrice = require("../models/coursePrice");

exports.addCourse = async (req, res) => {
  if (
    req.body.courseId == undefined ||
    req.body.courseId == "" ||
    (req.body.courseName == undefined || req.body.courseName == "") ||
    (req.body.coursePriceUsd == undefined || req.body.coursePriceUsd == "") ||
    (req.body.xdceTolerance == undefined || req.body.xdceTolerance == "") ||
    (req.body.xdcTolerance == undefined || req.body.xdcTolerance == "")
  ) {
    res.json({ error: "bad request", status: false });
  }
  let newCourse = newDefCourse(req.body.courseId);
  newCourse.courseId = req.body.courseId;
  newCourse.courseName = req.body.courseName;
  newCourse.priceUsd = req.body.coursePriceUsd;
  newCourse.xdcTolerance = req.body.xdcTolerance;
  newCourse.xdceTolerance = req.body.xdceTolerance;
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
    let course = await CoursePrice.findOne({ course: req.body.courseId });
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
    let course = await CoursePrice.findOne({ course: req.body.courseId });
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
    let course = await CoursePrice.findOne({ course: req.body.courseId });
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

function newDefCourse(courseId) {
  return new CoursePrice({
    courseId: courseId,
    courseName: "",
    xdceTolerance: "",
    xdcTolerance: "",
    priceUsd: ""
  });
}
