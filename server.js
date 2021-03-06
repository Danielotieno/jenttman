var express = require('express');
var app = express();
var path = require('path');
var util = require('util');
var mongodb =  require('mongodb');
var mongoose = require('mongoose');
var fs = require('fs');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connect = require('connect');
var engine = require('ejs-mate');
var ejs = require('ejs');
var qs = require('query-string');
var url = require('url');
var base64url = require('base64url');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var mongo = require('mongodb');
var mongostore = require('connect-mongo')(session);
var bcrypt = require('bcryptjs');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var paypal = require('paypal-rest-sdk');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var Storage = require('@google-cloud/storage');
var format = require('util').format;
var now = require('moment');

var env = process.env.NODE_ENV || 'development';

var db = require('./config/setting');
var options = {
  authMechanism:'SCRAM-SHA-1'
}
var mongouri = db.getDB(env)+"?authMechanism=SCRAM-SHA-1";
mongoose.connect(mongouri)

require('./config/passport.js')(passport);

// set static folder
app.use(express.static(__dirname + '/assets'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/fashion/item/',  express.static(__dirname + '/assets'));
app.use('/category/',  express.static(__dirname + '/assets'));
app.use('/category/uploads',  express.static(__dirname + '/uploads'));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/fashion/item/uploads', express.static(__dirname + '/uploads'));
app.use('/admin/blog/uploads', express.static(__dirname + '/uploads'));
app.use('/blog/item/',  express.static(__dirname + '/assets'));
app.use('/admin/product/uploads', express.static('/uploads'));
app.use('/fashion/cart/', express.static(__dirname + '/assets'));
app.use('/pay/:id', express.static(__dirname + '/assets'));
app.use('/payment/:id', express.static(__dirname + '/assets'));
app.use('/fashion/checkout/', express.static(__dirname + '/assets'));
app.use('/fashion/checkout/uploads', express.static(__dirname + '/uploads'));
app.use('/fashion', express.static(__dirname + '/assets'));

app.use(session({
  resave    : true,
  saveUninitialized:true,
  secret  :db.getSecret(env),
  store   : new mongostore({ url :db.getDB(env), autoReconnect:true}),
  cookie : { maxAge: 180*60*1000}
}));

//Create EJS Engine view
app.set('view engine', 'html');
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(passport.initialize());

app.use(passport.session());

//body-parser and cokie-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(morgan('dev'));


app.use(flash());

app.use(function(req,res,next){
  res.locals.user   = req.user;
  res.locals.message = req.flash();
  res.locals.session = req.session;
  next();
});


var routes = require('./routes/index.js');
app.use(routes);

app.set('port', (process.env.PORT || 8080));
app.listen(app.get('port'), function() {
  console.log("connected to mongo ", db.getDB(env));
  console.log('Hurray am running on port ' + app.get('port'));
  console.log("running nodemailer on email ", db.getEmail(env));
  console.log("running nodemailer on email password ", db.getPassword(env));
});
