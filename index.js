var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var config = require('config-lite');
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');
var app = express();

// 1.设置模板目录和引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 2.设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 3.session 中间件
app.use(session({
    name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
    secret: 'autobiz',// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {
        maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({// 将 session 存储到 mongodb
        url: config.mongodb// mongodb 地址
    })
}));

//处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/image'),// 上传文件目录
    keepExtensions: true// 保留后缀
}));

//4.设置路由和日志
// 正常请求的日志
app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));
// 路由
routes(app);
// 错误请求的日志
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));

// 5.error page
app.use(function (err, req, res, next) {
    res.render('error', {
        error: err
    });
});

//6.启动
if (module.parent) {
    module.exports = app;
} else {
    // 监听端口，启动程序
    app.listen(config.port, function () {
        console.log(`${pkg.name} listening on port ${config.port}`);
    });
}