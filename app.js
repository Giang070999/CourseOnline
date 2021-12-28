// ! Set environment variables
require('dotenv').config()

// ! Import third-party
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const swaggerUi = require('swagger-ui-express');

// ! Import local file
const swaggerDocument = require('./swagger.json');
const corsConfig = require('./src/configs/cors.config');
var loginApi = require('./src/apis/login.api');
var accountApi = require('./src/apis/account.api')
var userApi = require('./src/apis/user.api')
var testApi = require('./src/apis/test.api')
var adminApi = require('./src/apis/admin.api')


var app = express();
const dev = app.get('env') !== 'production';

// ! ======== Connect MongoDB with mongoose =========
const mongoose = require('mongoose');
const MONGO_URL = dev ? process.env.MONGO_URL_LOCAL : process.env.MONGO_URL;
mongoose.connect(MONGO_URL, {})
  .then(result => { console.log('> Connect mongoDB successful') })
  .catch(err => console.log(`> Error while connecting to mongoDB : ${err.message}`));


// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// ! App setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(cors(corsConfig));

// ========== Router - APIs =============

app.use('/api/admin', adminApi); // api liên quan đến admin

app.use('/api/accounts', accountApi); // api liên quan đến account

app.use('/api/login', loginApi); // api liên quan đến login

app.use('/api/users', userApi); // api liên quan đến user


app.use('/api/test', testApi); // api liên quan đến login


app.use('/apis-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
