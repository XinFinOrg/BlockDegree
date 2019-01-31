module.exports = function (app, passport) {
    // app.get('/', function (req, res) {
    //     res.render('index.ejs');
    // });
    // app.get('/login', function (req, res) {
    //     res.render('login.ejs', { message: req.flash('loginMessage') });
    // });
    app.post('/login', (req, res, next) => {
        passport.authenticate('local-login', {
            session: true,
        }, async (err, user, info) => {
            res.send({ status: user, message: info })
            console.log(user)
        })(req, res, next);
    });
    // app.get('/signup', function (req, res) {
    //     res.render('signup.ejs', { message: req.flash('signupMessage') });
    // });
    app.post('/signup',(req, res, next) => {
        passport.authenticate('local-signup', {
            session: true,
        }, async (err, user, info) => {
            res.send({ status: user, message: info })
        })(req, res, next);
    });
    // app.get('/sig
    // app.get('/profile', isLoggedIn, function (req, res) {
    //     res.render('profile.ejs', {
    //         user: req.user
    //     });
    // });
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
