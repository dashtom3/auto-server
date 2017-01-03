const path = require('path');
const express = require('express');
const session = require('express-session');
// var MongoStore = require('connect-mongo')(session);
const config = require('config-lite');
const routes = require('./routes');
const pkg = require('./package');
const winston = require('winston');
const expressWinston = require('express-winston');
const app = express();
const cors = require('cors');

//跨域中间件
app.use(cors());

// 1.设置模板目录和引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 2.设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 3.session 中间件
// app.use(session({
//     name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
//     secret: 'autobiz',// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
//     cookie: {
//         maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
//     },
//     store: new MongoStore({// 将 session 存储到 mongodb
//         url: config.mongodb// mongodb 地址
//     })
// }));


var bodyParser = require('body-parser')
var ueditor = require("ueditor")

app.use("/ueditor/ue",bodyParser.urlencoded({extended: true}),bodyParser.json(), ueditor('public', function(req, res, next) {
    // ueditor 客户发起上传图片请求
    if(req.query.action === 'uploadimage'){
        var foo = req.ueditor;

        var imgname = req.ueditor.filename;

        var img_url = '/image/ueditor/';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage'){
        var dir_url = '/image/ueditor/';
        res.ue_list(dir_url);  // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json')
    }}));

//处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/files'),// 上传文件目录
    keepExtensions: true// 保留后缀
}));

//4.设置路由和日志
// 正常请求的日志
app.use(expressWinston.logger({
    transports: [
        // 正常请求不用在控制台打印日志
        // new (winston.transports.Console)({
        //     json: true,
        //     colorize: true
        // }),
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
        // new winston.transports.Console({
        //     json: true,
        //     colorize: true
        // }),
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
