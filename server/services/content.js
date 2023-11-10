const path = require("path");
const events = require("events");
const eventEmitter = require("../listeners/visited").em;

exports.renderCourses = (req, res) => {
  switch (req.params.courseName) {
    case "blockchain-basic": {
      eventEmitter.emit("visited", req, "basic");
      res.redirect("/courses/blockchain-basic-course-for-engineer/history-of-blockchain");
      break;
    }

    case "blockchain-advanced": {
      eventEmitter.emit("visited", req, "advanced");
      res.redirect(
        "/courses/blockchain-advanced/what-is-blockchain-and-bitcoin"
      );
      break;
    }

    case "blockchain-professional": {
      eventEmitter.emit("visited", req, "professional");
      res.redirect(
        "/courses/blockchain-professional/what-is-ethereum-blockchain"
      );
      break;
    }

    case "cloud-computing": {
      eventEmitter.emit("visited", req, "cloud-computing");
      res.redirect("/courses/cloud-computing/what-is-cloud-computing");
      break;
    }

    case "blockchain-wallet": {
      eventEmitter.emit("visited", req, "blockchain-wallet");
      res.redirect(
        "/courses/blockchain-wallet/what-is-blockchain-wallet-and-how-does-it-work"
      );
      break;
    }
  }
};

exports.renderCourseContent = (req, res) => {
  res.sendFile(
    path.join(
      process.cwd(),
      "/server/protected/courses/" +
        req.params.courseName +
        "/" +
        req.params.content +
        ".html"
    )
  );
};

exports.callCurriculum = (req, res) => {
  console.log("called curriculum");
  const courseCurriculum = req.headers.referer.replace(
    process.env.HOST + "/",
    ""
  );
  res.json({ msg: "storing request" });
  eventEmitter.emit("visitedCurriculum", req, `curri-${courseCurriculum}`);
  console.log("after");
};

exports.getCurrentTimestamp = (req, res) => {
  return res.json({ timestamp: Date.now() });
};
