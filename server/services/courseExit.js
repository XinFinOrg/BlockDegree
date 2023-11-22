const _ = require("lodash");
const { renderForIPFSHash } = require("../helpers/renderCertificate");
const CourseExit = require("../models/CourseExit");
const User = require("../models/user");

exports.course_exit = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const email = req.user.email;

    if (_.isEmpty(question) || _.isEmpty(answer)) {
      res.status(422).json({
        message: "Please fill up the answer",
        status: 422,
      });
    } else {
      const ansSave = new CourseExit({
        isAnsSubmitted: true,
        email: email,
        question: question,
        answer: answer,
        courseId: "video-stream",
      });
      await ansSave.save();
      res.status(200).json({
        message: "Answer Submitted",
        status: 200,
        data: ansSave,
      });
      const user = await User.findOne({ email });
      if (user) {
        renderForIPFSHash(
          user.name,
          "",
          "course-exit",
          new Date(),
          "",
          "video-stream",
          async (bothRender) => {
            if (!bothRender.uploaded) console.log("error:", bothRender);
            else {
              const [report, certi] = bothRender.hash;
              user.examData.certificateHash.push({
                timestamp: Date.now(),
                marks: 0,
                total: 0,
                examType: "Study Blockchain in 60 Minutes",
                headlessHash: report,
                clientHash: certi,
                paymentMode: "paypal",
                // expiryDate: String,
              });

              await user.save();
            }
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something Wrong",
      status: 500,
    });
  }
};

/**
 *
 * CourseId -> video-stream
 *
 */
exports.getCourseExit = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    if (_.isEmpty(courseId))
      return res.status(422).json({
        message: "no course exists",
        status: 422,
      });
    const data = await CourseExit.findOne({
      $and: [{ email: req.body.email }, { courseId }, { isAnsSubmitted: true }],
    });
    console.log("data", data);
    if (data)
      return res.status(200).json({
        data: { submitted: true },
        status: 200,
      });
    return res.status(200).json({
      data: { submitted: false },
      status: 200,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: "Something Wrong",
      status: 500,
    });
  }
};
