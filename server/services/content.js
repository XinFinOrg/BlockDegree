const path = require("path");

exports.renderCourses = (req, res) => {
  switch (req.params.courseName) {
    case "blockchain-basic":
      res.redirect("/courses/blockchain-basic/history-of-blockchain");
      break;
    case "blockchain-advanced":
      res.redirect(
        "/courses/blockchain-advanced/what-is-blockchain-and-bitcoin"
      );
      break;
    case "blockchain-professional":
      res.redirect(
        "/courses/blockchain-professional/what-is-ethereum-blockchain"
      );
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
