// Requires multiparty
multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();

var protocol = 'http';
var hostname = '127.0.0.1:3300';

// Requires controller
uploadHelper = require('../middlewares/uploadHelper');

module.exports=function (app) {
    app.get('/', function (req, res) {
        res.send('Hello World');
    });
    //测试
    app.post('/upload', function(req, res, next) {
        var ImageModel = require('../models/image');
        var ResData = require('../models/res');

        var fs = require('fs');

        var images=[];
        var item;

        var arr_promise = [];

        for (item in req.files) {
            // console.log(req.files[item].displayImage);
            var filePath = req.files[item].path.split('/').pop();
            var absPath = protocol + '://' + hostname + '/image/'+filePath;
            var image = {
                timestamp : new Date().getTime().toString(),
                path : absPath,
                isDeleted : false
            };
            images.push(image);
            arr_promise.push(ImageModel.create(image));
            // images = images + filePath + ";" ;
        }

        Promise.all(arr_promise)
        .then(function (result) {
                resData = new ResData();
                resData.setData("添加成功");
                resData.setIsSuccess(1);
                resData.imgs=images;
                res.send(resData);
            })
            .catch(function (e) {
                resData = new ResData();
                resData.setData("添加失败");
                resData.setIsSuccess(0);
                res.send(JSON.stringify(resData));
                next(e);
            });
        // console.log(images);
        // res.send(images);
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
