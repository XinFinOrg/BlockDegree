var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var hbs = require( 'express-handlebars');
var cors = require('cors');

var app = express();
require("dotenv").config();
mongoose.connect(process.env.DATABASE_URI,{useNewUrlParser:true});
require('./services/passport')(passport);
mongoose.set('useCreateIndex', true);

// view engine setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'base',
  layoutsDir:  path.join(process.cwd() + '/src/partials/layouts'),
  partialsDir:  path.join(process.cwd() + '/src/partials/')
}));
app.set('views', path.join(process.cwd() + '/src/partials/layouts'))
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('dist', { extensions: ['html', 'htm'] }));
app.use(express.static('server/protected/courses', { extensions: ['html', 'htm'] }));
app.use(cors());

// required for passport
app.use(session({ 
  secret: 'itsmeakshayhere',
  resave: true,
	saveUninitialized: true,
	cookie: {
	    httpOnly: true,
      maxAge: 180000000
	}
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes/paymentRoutes.js')(app)
require('./routes/authRoutes')(app)
require('./routes/examRoutes')(app)
// require('./routes/paymentRoutes')(app) // Not working; need to make a further dive.
require('./routes/contentRoutes')(app)
require('./routes/emailVeriRoutes')(app);
require('./routes/shareSocialsRoutes')(app);
require('./routes/certificateRoutes')(app);
require('./routes/contactUsRoutes')(app);
<<<<<<< HEAD
// require("./routes/testRoutes")(app);
=======
>>>>>>> local

// catch 404 and render 404 page
app.use('*', function(req, res) {
  res.render('error')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen("3000", console.log('server started'))

module.exports = app;