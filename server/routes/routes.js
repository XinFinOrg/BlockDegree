var path = require('path');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    if(req.params.courseName) {
      res.redirect('/login?from=' + req.params.courseName)
    } else {
      res.redirect('/login');
    }
  }
}


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

    app.get('/tt', isLoggedIn, (req, res) => {
      console.log('auth tt: ' + req.isAuthenticated())
    });
};
