// Requires multiparty
multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();

// Requires controller
uploadHelper = require('../middlewares/uploadHelper');

module.exports=function (app) {
    app.get('/', function (req, res) {
        res.send('Hello World');
    });
    //测试
    app.post('/upload', function(req, res, next) {
        var images="";
        var item;
        for (item in req.files) {
            var filePath = req.files[item].path.split('/').pop();
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