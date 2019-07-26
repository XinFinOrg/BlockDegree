var LocalStrategy = require("passport-local").Strategy;
const googleStrategy = require("passport-google-oauth20").Strategy;
// var GithubStrategy = require("passport-github").Strategy;
var User = require("../models/user");
var Token = require("../models/tokenVerification");
const emailer = require("../emailer/impl");
var crypto = require("crypto");
require("dotenv").config();

const facebookStrategy = require("passport-facebook").Strategy;
const twitterStrategy = require("passport-twitter").Strategy;
const linkedinStrategy = require("passport-linkedin-oauth2").Strategy;

function newDefaultUser() {
  return new User({
    email:"",
  name: "",
  examData: {
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
      attempts: 0,
      marks: 0
    },
    examProfessional: {
      attempts: 0,
      marks: 0
    },
    certificateHash: [{
      timestamp : "",
      marks : 0,
      total:0,
      examType : "",
      hash : ""
    }]
  },
  auth : {
    facebook: {
      id: "",
      accessToken: "",
      refreshToken: ""
    },
    twitter: {
      id: "",
      token: "",
      tokenSecret: ""
    },
    google: {
      id: "",
      accessToken: "",
      refreshToken: ""
    },
    local: {
      password: "",
      isVerified: false
    },
    linkedin : {
      accessToken:"",
      id : ""
    }
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
          User.findOne({ "email": email }, function(err, user) {
            if (err) {
              console.log("some error", err);
              return done(err);
            }

            if (user) {
              console.log(user.auth.local.password);
              
              if (user.auth.local.password!=""){
                console.log("email already taken");
                return done(null, false, "That email is already taken.");
              }else{
                console.log("email registered to another social");
                return done(null, false, "This email is registered to another one of the socials below.");
              }
              
            } else {
              console.log("in method creating user");
              var newUser = newDefaultUser();
              newUser.email = email;
              newUser.auth.local.password = newUser.generateHash(password);
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
        User.findOne({ "email": email }, function(err, user) {
          if (err) return done(err);
          else if (!user) return done(null, false, "No user found.");
          else if (!user.validPassword(password))
            return done(null, false, "Oops! Wrong password.");
          else if (!user.auth.local.isVerified)
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
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        if (existingUser) {
          if (existingUser.auth.google.accessToken==""){
            // store google credentials.
            existingUser.auth.google.accessToken=accessToken;
            existingUser.auth.google.refreshToken=refreshToken;
            existingUser.auth.google.id=profile.id;
          }
          return done(null, existingUser);
        }
        newUser = newDefaultUser();
        newUser.auth.google.id = profile.id;
        newUser.email = profile.emails[0].value;
        newUser.name = profile._json.name;
        newUser.auth.google.accessToken = accessToken;
        newUser.auth.google.refreshToken = refreshToken;
        const user = await new User(newUser).save();
        return done(null, user);
      }
    )
  );

  // Login with Facebook
  passport.use(
    new facebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "https://localhost:3000/auth/facebook/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        const existingUser = await User.findOne({ "facebook.id": profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        console.log("Profile Name: ", profile);

        newUser = newDefaultUser();
        newUser.auth.facebook.id = profile.id;
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
        consumerKey: process.env.TWITTER_CLIENT_ID,
        consumerSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: "/auth/twitter/callback",
        includeEmail: true
      },
      async (token, tokenSecret, profile, done) => {
        const existingUser = await User.findOne({ "twitter.id": profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        console.log("Twitter Profile: ", profile);
        newUser = newDefaultUser();
        newUser.auth.twitter.id = profile.id;
        newUser.name = profile.displayName;
        newUser.email = profile.emails[0].value;
        newUser.auth.twitter.token = token;
        newUser.auth.twitter.tokenSecret = tokenSecret;
        const user = await new User(newUser).save();
        done(null, user);
      }
    )
  );

  passport.use(
    new linkedinStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT,
        clientSecret: process.env.LINKEDIN_SECRET,
        callbackURL: "http://localhost:3000/auth/linkedin/callback",
        scope: ["r_liteprofile", "r_emailaddress"]
      },
      async ( accessToken, refreshToken, profile, done) => {

        process.nextTick(async function () {
          // To keep the example simple, the user's LinkedIn profile is returned to
          // represent the logged-in user. In a typical application, you would want
          // to associate the LinkedIn account with a user record in your database,
          // and return that user instead.        
          newUser = newDefaultUser();
          newUser.auth.linkedin.id = profile.id;
          newUser.name = profile.displayName;
          newUser.email = profile.emails[0].value;
          newUser.auth.linkedin.accessToken = accessToken;
          const user = await new User(newUser).save();
          return done(null, user);
        });       
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
