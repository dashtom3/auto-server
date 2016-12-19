// Requires multiparty
multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();

var protocol = 'http';
var hostname = '127.0.0.1:3300';
var util = require('util');

// Requires controller
uploadHelper = require('../middlewares/uploadHelper');

module.exports=function (app) {
    app.get('/', function (req, res) {
        res.send('Hello World');
    });
    //测试
    app.post('/upload', function(req, res, next) {
        var ImageModel = require('../models/image');
        var fs = require('fs');

        var images="";
        var item;

        for (item in req.files) {
            // console.log(req.files[item].displayImage);
            var filePath = req.files[item].path.split('/').pop();
            var absPath = protocol + '://' + hostname + '/image/'+filePath;
            var image = {
                timestamp : new Date().getTime().toString(),
                path : absPath,
                isDeleted : false,
                article_id : '123'
            }
            console.log(image);

            images = images + filePath + ";" ;
        }
        res.send(images);
    });


    app.post('/api/uploads', multipartyMiddleware, uploadHelper.uploadFile);


    app.use('/user',require('./userRoute'));
    app.use('/company',require('./companyRoute'));
    app.use('/finance',require('./financeRoute'));
    app.use('/news',require('./newsRoute'));
    app.use('/privateReport',require('./privateReportRoute'));
    app.use('/publicReport',require('./publicReportRoute'));
    app.use('/product',require('./productRoute'));
};
