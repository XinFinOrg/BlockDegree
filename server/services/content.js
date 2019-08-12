const path = require("path");
const events = require("events");
const eventEmitter = require("../listeners/visited").em;

exports.renderCourses = (req, res) => {
  switch (req.params.courseName) {
    case "blockchain-basic": {
      eventEmitter.emit('visited',req.user.email,"basic")
      res.redirect("/courses/blockchain-basic/history-of-blockchain");
      break;
    }

    case "blockchain-advanced": {
      eventEmitter.emit('visited',req.user.email,"advanced")
      res.redirect(
        "/courses/blockchain-advanced/what-is-blockchain-and-bitcoin"
      );
      break;
    }

    case "blockchain-professional": {
      eventEmitter.emit('visited',req.user.email,"professional")
      res.redirect(
        "/courses/blockchain-professional/what-is-ethereum-blockchain"
      );
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