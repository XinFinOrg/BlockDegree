const fs = require('fs');
const path = require('path');

const utils = require('../utils.js');
let {readJSONFile, isLoggedIn} = utils;

module.exports = function (app, passport) {
  app.post('/login', (req, res, next) => {
      passport.authenticate('local-login', {
          session: true,
      }, async (err, user, info) => {
            req.logIn(user, function(err) {
            if (err) { return next(err); }
            res.send({ status: user, message: info })
            console.log('user logged in',user, info)
          });
      })(req, res, next);
  });


    app.post('/signup',(req, res, next) => {
        passport.authenticate('local-signup', {
            session: true,
        }, async (err, user, info) => {
            res.send({ status: user, message: info })
        })(req, res, next);
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/courses/:courseName', isLoggedIn, function (req, res){
      switch(req.params.courseName) {
        case 'blockchain-basic':
          res.redirect('/courses/blockchain-basic/history-of-blockchain');
          break;
        case 'blockchain-advanced':
          res.redirect('/courses/blockchain-advanced/what-is-blockchain-and-bitcoin');
          break;
        case 'blockchain-professional':
          res.redirect('/courses/blockchain-professional/what-is-ethereum-blockchain');
      }
    });

    app.get('/courses/:courseName/:content', isLoggedIn, function(req, res){
      res.sendFile(path.join( process.cwd(), '/server/protected/courses/' + req.params.courseName + '/' + req.params.content + '.html'));
    });

    app.get('/exam', function(req, res){
      let examQns;

      readJSONFile(path.join( process.cwd(), '/server/protected/exams.json'), (err, json) => {
        if(err){ throw err; }
        // examQns = json
        // let examArr = [];
        // examArr.push(json)
        // examArr.push({scripts: '<script src="/js/exam.js"></script>'})
        // console.log(examArr)
        // examQns.push({scrips: '<script src="/js/exam.js"></script>'})
        res.render('exam', json)
      })
    })

    app.post('/answers', (req, res, next) => {
        // check the verification of user answers
        console.log(req.body) // Answers are send as {'0': 'q0-c0', '1': 'q1-c2'}
        // return the score
        res.send('got the answers')
    })

    app.post('/signup',(req, res, next) => {
        passport.authenticate('local-signup', {
            session: true,
        }, async (err, user, info) => {
            res.send({ status: user, message: info })
        })(req, res, next);
    });

    app.get('/tt', isLoggedIn, (req, res) => {
      console.log('auth tt: ' + req.isAuthenticated())
    });
};
