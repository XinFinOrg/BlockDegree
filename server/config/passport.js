var LocalStrategy = require("passport-local").Strategy;
const googleStrategy = require("passport-google-oauth20").Strategy;
var GithubStrategy = require("passport-github").Strategy;
var User = require("./models/user");
var Token = require("./models/tokenVerification");
const emailer = require("../emailer/impl");
var crypto = require("crypto");
var keys = require("./keys");

const facebookStrategy = require("passport-facebook").Strategy;
const twitterStrategy = require("passport-twitter").Strategy;

function newDefaultUser() {
  return new User({
    local: {
      name: "",
      email: "",
      password: "",
      isVerified: false,
      payment: {
        course_1: false,
        course_2: false,
        course_3: false
      },
      examBasic: {
        attempts: 0,
        marks: 0
      },
      examAdvanced: {
        attempts: Number,
        marks: Number
      },
      examProfessional: {
        attempts: 0,
        marks: 0
      },
      certificateHash: ""
    },
    facebook: {
      id: "",
      token: "",
      name: "",
      email: ""
    },
    twitter: {
      id: "",
      token: "",
      name: "",
      username: ""
    },
    google: {
      id: "",
      token: "",
      email: "",
      name: ""
    }
  });
}

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        console.log(req.body, email, password);
        process.nextTick(function() {
          User.findOne({ "local.email": email }, function(err, user) {
            if (err) {
              console.log("some error", err);
              return done(err);
            }

            if (user) {
              console.log("email already taken");
              return done(null, false, "That email is already taken.");
            } else {
              // emailer.sendMail(email);
              console.log("in method creating user");
              var newUser = newDefaultUser();
              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);
              //   newUser.local.payment.course_1 = false;
              //   newUser.local.payment.course_2 = false;
              //   newUser.local.payment.course_3 = false;
              //   newUser.local.examBasic.attempts = 0;
              //   newUser.local.examBasic.marks = 0;
              //   newUser.local.examAdvanced.attempts = 0;
              //   newUser.local.examAdvanced.marks = 0;
              //   newUser.local.examProfessional.attempts = 0;
              //   newUser.local.examProfessional.marks = 0;
              newUser.save(function(err) {
                if (err) {
                  console.log("Error:", err);
                  throw err;
                }

                var token = new Token({
                  email: email,
                  token: crypto.randomBytes(16).toString("hex")
                });
                token.save(function(err) {
                  if (err) {
                    console.log(err);
                    return done(null, false, "token errror");
                  }
                  console.log(email, token);
                  emailer
                    .sendTokenMail(email, token, req, "signup")
                    .then(res => console.log("emailer res>>>>>", res))
                    .catch(err => console.log("emailer err>>>>", err));
                  return done(null, newUser);
                });
              });
            }
          });
        });
      }
    )
  );
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        User.findOne({ "local.email": email }, function(err, user) {
          if (err) return done(err);
          else if (!user) return done(null, false, "No user found.");
          else if (!user.validPassword(password))
            return done(null, false, "Oops! Wrong password.");
          else if (!user.local.isVerified)
            return done(
              null,
              false,
              "User is not verified, Please check your email"
            );
          return done(null, user);
        });
      }
    )
  );

  // Google with Google
  passport.use(
    new googleStrategy(
      {
        clientID: keys.googleAuth.clientID,
        clientSecret: keys.googleAuth.clientSecret,
        callbackURL: keys.googleAuth.callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        const existingUser = await User.findOne({ "google.id": profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        newUser = newDefaultUser();
        newUser.google.id = profile.id;
        newUser.google.email = profile.emails[0].value;
        newUser.google.name = profile._json.name;

        const user = await new User(newUser).save();
        return done(null, user);
      }
    )
  );

  // Login with Facebook
  passport.use(
    new facebookStrategy(
      {
        clientID: keys.facebookAuth.clientID,
        clientSecret: keys.facebookAuth.clientSecret,
        callbackURL: keys.facebookAuth.callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        const existingUser = await User.findOne({ "facebook.id": profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        console.log("Profile Name: ", profile);

        newUser = newDefaultUser();
        newUser.facebook.id = profile.id;
        // newUser.google.email = profile.emails[0].value;
        // newUser.google.name = profile._json.name;

        const user = await new User(newUser).save();
        // console.log("Google login profile: ",profile)
        // const user = await new User({ googleId: profile.id }).save();
        return done(null, user);
      }
    )
  );

  // Login with Twitter
  passport.use(
    new twitterStrategy(
      {
        consumerKey: keys.twitterAuth.clientID,
        consumerSecret: keys.twitterAuth.clientSecret,
        callbackURL: keys.twitterAuth.callbackURL,
        includeEmail: true
      },
      async (token, tokenSecret, profile, done) => {
        const existingUser = await User.findOne({ "twitter.id": profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        console.log("Twitter Profile: ", profile);
        newUser = newDefaultUser();
        newUser.twitter.id = profile.id;
        newUser.twitter.name = profile.displayName;
        newUser.twitter.email = profile.emails[0].value;
        const user = await new User(newUser).save();
        done(null, user);
      }
    )
  );
};

// Github login

// passport.use('github', new GithubStrategy({
//     clientID: configAuth.githubAuth.clientID,
//     clientSecret: configAuth.githubAuth.clientSecret,
//     callbackURL: configAuth.githubAuth.callbackURL,
//     scope: 'user:email'
//   },
//   function (token, refreshToken, profile, done)

//   {
//     console.log('GitHubStrategy',profile, token);
//     process.nextTick(function() {
//         User.findOne({
//             'local.email': profile.emails[0].value
//         }, function(err, user) {
//             console.log('github callback', user, err);
//             if(user){
//                 // already have this user
//                 console.log('user is: ', user);
//                 done(null, user);
//             } else {
//                 var newUser = new User();
//                 newUser.local.email = profile.emails[0].value;
//                 // newUser.local.password = newUser.generateHash(password);
//                 newUser.local.payment.course_1 = false;
//                 newUser.local.payment.course_2 = false;
//                 newUser.local.payment.course_3 = false;
//                 newUser.local.examBasic.attempts = 0;
//                 newUser.local.examBasic.marks = 0;
//                 newUser.local.examAdvanced.attempts = 0;
//                 newUser.local.examAdvanced.marks = 0;
//                 newUser.local.examProfessional.attempts = 0;
//                 newUser.local.examProfessional.marks = 0;
//                 newUser.save(function (err) {
//                     if (err) {
//                         console.log("Error:", err)
//                         throw err;
//                     }

//                     // var token = new Token({ email: email, token: crypto.randomBytes(16).toString('hex') });
//                     // token.save(function (err) {
//                     //     if (err) {
//                     //         console.log(err)
//                     //         return done(null, false, "token errror")
//                     //     }
//                     //     console.log(email, token)
//                     //     emailer.sendTokenMail(email, token, req, 'signup');
//                     //     return done(null, newUser);
//                     // });
//                     return done(null, newUser);
//                 });
//             }
//         });
//     });
// }));
