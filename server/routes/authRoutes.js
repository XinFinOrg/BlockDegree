var User = require("../models/user");
const emailer = require("../emailer/impl");
const passport = require("passport");

module.exports = app => {
  app.get("/logout", function(req, res) {
    req.logout();
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });

  app.post("/signup", (req, res, next) => {
    passport.authenticate(
      "local-signup",
      {
        session: true
      },
      async (err, user, info) => {
        res.send({ status: user, message: info });
      }
    )(req, res, next);
  });

  app.post("/login", (req, res, next) => {
    passport.authenticate(
      "local-login",
      {
        session: true
      },
      async (err, user, info) => {
        console.log("login1111>>>>>>", user);
        req.logIn(user, function(err) {
          if (err) {
            console.log("login err>>>>>>>>>>>", err);
          }
          res.send({ status: user, message: info });
          console.log("user logged in", user, info);
        });
      }
    )(req, res, next);
  });

  app.post("/forgotPassword", (req, res) => {
    console.log("called forgot password");
    User.findOne({ email: req.body.email }).then(result => {
      if (result == null || result.auth.local.password == "") {
        res.send("User not found");
      } else if (result.auth.local.password == null) {
        res.send("Password");
      } else {
        emailer.forgotPasswordMailer(
          result.email,
          result.auth.local.password,
          res
        );
      }
    });
  });

  app.post("/resetPassword", (req, res) => {
    console.log(req.body);
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(result => {
      if (!bcrypt.compareSync(result.dataValues.uniqueId, req.body.resetId)) {
        console.log("false");
      } else {
        console.log("true");
        res.render("resetPassword", { email: result.dataValues.email });
      }
    });
  });

  app.post("/updatePassword", (req, res) => {
    console.log("called update password");
    var data = JSON.stringify(req.body);
    var dataupdate = JSON.parse(data);
    console.log(data, dataupdate);
    const backUrl = req.header("Referer");
    userobj = new User();
    hash = userobj.generateHash(dataupdate.password);
    console.log("body:", dataupdate.password, backUrl.email);
    User.findOneAndUpdate(
      { "auth.local.password": dataupdate.token },
      { "auth.local.password": hash },
      { upsert: false },
      (err, doc) => {
        if (err) {
          console.log("Something went wrong when updating data!", err);
          res.send({ status: "false", message: info });
        }
        res.redirect("/");
      }
    );
  });

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile ", "email"]
    })
  );

  app.get(
    "/auth/facebook",
    passport.authenticate("facebook", {
      scope: ["public_profile", "email"]
    })
  );

  app.get("/auth/twitter", passport.authenticate("twitter"));

  app.get("/auth/linkedin", passport.authenticate("linkedin"));

  app.get("/auth/google/callback", (req, res) => {
    passport.authenticate(
      "google",
      { failureRedirect: "/login" },
      (err, user) => {
        console.log(`Hit google callback ${err} ${user.email}`);
        if (err != null) {
          res.status(400).json(err);
        }
        var url = req.session.redirectTo || "/";
        res.redirect(url);
      }
    )(req, res);
  });

  app.get("/auth/facebook/callback", (req, res) => {
    passport.authenticate(
      "facebook",
      { failureRedirect: "/login" },
      (err, user) => {
        console.log(`Hit facebook callback ${err} ${user.email}`);
        if (err != null) {
          res.status(400).json(err);
        }
        var url = req.session.redirectTo || "/";
        res.redirect(url);
      }
    )(req, res);
  });

  app.get("/auth/twitter/callback", (req, res) => {
    passport.authenticate(
      "twitter",
      { failureRedirect: "/login" },
      (err, user) => {
        console.log(`Hit twitter callback ${err} ${user.email}`);
        if (err != null) {
          res.status(400).json(err);
        }
        var url = req.session.redirectTo || "/";
        res.redirect(url);
      }
    )(req, res);
  });

  app.get("/auth/linkedin/callback", (req, res) => {
    passport.authenticate(
      "linkedin",
      { failureRedirect: "/login" },
      (err, currUser) => {
        console.log(`Hit linkedin callback ${err} ${currUser.email}`);
        if (err != null) {
          res.status(400).json(err);
        }
        var url = req.session.redirectTo || "/";
        res.redirect(url);
      }
    )(req, res);
  });
};
