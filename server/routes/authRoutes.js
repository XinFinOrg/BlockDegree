var User = require("../models/user");
const emailer = require("../emailer/impl");
const passport = require("passport");
const requireLogin = require("../middleware/requireLogin");

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
    console.log("HIT current user");
    
    if (req.user){
      res.json({status:true});
    }
    else{
      res.json({status:false})
    }
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
        if (user==false){
          // login not done
          // return info
          console.log(info)
          return res.send({ status: user, message: info });
          // console.log("user logged in", user, info);
        }
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

  app.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate(
      "google",
      { failureRedirect: "/login" },
      (err, user, info) => {
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, err => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          var url = req.session.redirectTo || "/";
          if (url == "/login" || url == "/exam-result") {
            url = "/";
          }
          // res.send({status:user,info:"msg"})
          res.redirect(url);
          // next();
        });
      }
    )(req, res,next);
  });

  app.get("/auth/facebook/callback", (req, res) => {
    passport.authenticate(
      "facebook",
      { failureRedirect: "/login" },
      (err, user, info) => {
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, err => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          var url = req.session.redirectTo || "/";
          if (url == "/login" || url == "/exam-result") {
            url = "/";
          }
          res.redirect(url);
        });
      }
    )(req, res);
  });

  app.get("/auth/twitter/callback", (req, res) => {
    passport.authenticate(
      "twitter",
      { failureRedirect: "/login" },
      (err, user, info) => {
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, err => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          var url = req.session.redirectTo || "/";
          if (url == "/login" || url == "/exam-result") {
            url = "/";
          }
          res.redirect(url);
        });
      }
    )(req, res);
  });

  app.get("/auth/linkedin/callback", (req, res) => {
    passport.authenticate(
      "linkedin",
      { failureRedirect: "/login" },
      (err, user, info) => {
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, err => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          var url = req.session.redirectTo || "/";
          if (url == "/login" || url == "/exam-result") {
            url = "/";
          }
          res.redirect(url);
        });
      }
    )(req, res);
  });

  app.get("/api/getAuthStatus",requireLogin,(req,res) => {
    if (!req.user){
      res.redirect("/login");
    }
    const user = User.findOne({email:req.user.email}).catch(err => {
      console.error(err);
      res.status(500).json({error:err,status:500,info:"error while looking up the database for the user"})
    })
    res.status(200).json({
      localAuth:user.auth.local.password!="",
      twitterAuth:user.auth.twitter.id!="",
      facebookAuth:user.auth.facebook.id!="",
      googleAuth:user.auth.google.id!=""
    })
  })
};
