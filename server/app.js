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

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('dist', { extensions: ['html', 'htm'] }));
app.use(express.static('server/protected/courses', { extensions: ['html', 'htm'] }));
app.use(cors());

// required for passport
app.use(session({ secret: 'itsmeakshayhere' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes/routes.js')(app, passport);

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

app.listen('3000', console.log('server started'))

module.exports = app;
