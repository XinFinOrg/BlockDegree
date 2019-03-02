var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var Token = require('./models/tokenVerification');
const emailer = require('../emailer/impl');
const Joi = require('joi');
var crypto = require('crypto');
module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            const schema = Joi.object().keys({
                password: Joi.string(),
                email: Joi.string().email({ minDomainAtoms: 2 })
            });

            const result = Joi.validate(req.body, schema);
            // if (result.error) {
            //     console.log(result.error.details[0].message);
            //     return done(result.error.details[0].message);
            // }
            // else {
            console.log(req.body, email, password)
            process.nextTick(function () {
                User.findOne({ 'local.email': email }, function (err, user) {
                    if (err) {
                        console.log("some error", err);
                        return done(err);
                    }

                    if (user) {
                        console.log("email already taken");
                        return done(null, false, 'That email is already taken.');
                    } else {
                        // emailer.sendMail(email);
                        console.log("in method creating user")
                        var newUser = new User();
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.local.payment.course_1 = false;
                        newUser.local.payment.course_2 = false;
                        newUser.local.payment.course_3 = false;
                        newUser.save(function (err) {
                            if (err) {
                                console.log("Error:", err)
                                throw err;
                            }

                            var token = new Token({ email: email, token: crypto.randomBytes(16).toString('hex') });
                            token.save(function (err) {
                                if (err) {
                                    console.log(err)
                                    return done(null, false, "token errror")
                                }
                                console.log(email, token)
                                emailer.sendTokenMail(email, token, req);
                                return done(null, newUser);
                            });
                        });

                    }

                });

            });


            // }

        }));
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {

            console.log("In login ",email,password);
            
            User.findOne({ 'local.email': email }, function (err, user) {
                if (err)
                    return done(err);
                else if (!user)
                    return done(null, false, 'No user found.');
                else if (!user.validPassword(password))
                    return done(null, false, 'Oops! Wrong password.');
                else if (!user.local.isVerified)
                    return done(null, false, 'User is not verified, Please check your email');
                return done(null, user);

            });

        }));

};
