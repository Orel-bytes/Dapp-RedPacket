'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const cors = require("cors");
let mongoose = require("mongoose");
var routes = require('./routes/index');
var users = require('./routes/users');

const configJson = require('./conf/config.json');
const config = configJson[configJson.current_net];
global.config = config;

let db = mongoose.createConnection(config.mongdb_url, {
    useNewUrlParser: true
});
db.on('connected', function (err) {
    if (err) {
        console.log('Unable to connect to database(' + config.mongdb_url + ')：' + err);
        console.log('Aborting');
        process.exit();
    } else {
        console.log('Connecting to database is successful!');
        global.mongoDB = db;
    }
});

var app = express();
app.use(cors());
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.all("*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("ACCESS-Control-Allow-Headers", "X-Requested-With,Content-Type");
    //  允许客户端发送跨域请求时携带cookie信息 这个很重要
    res.header('Access-Control-Allow-Credentials', 'true');
    next()
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
        });
});

app.set('port', process.env.PORT || config.web_port);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
