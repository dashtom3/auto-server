// Requires multiparty
const multiparty = require('connect-multiparty');
const multipartyMiddleware = multiparty();
const fs = require('fs');
const ImageModel = require('../models/image');
const ResData = require('../models/res');
const crypto = require('crypto');
const config = require('config-lite');

const JF = require('../middlewares/JsonFilter');

//test
// var TokenModel = require('../models/token');

const protocol = config.protocol;
const hostname = config.hostname;

// Requires controller
uploadHelper = require('../middlewares/uploadHelper');

module.exports=function (app) {
    app.get('/', function (req, res) {
        res.send('Hello World');
    });
    //测试
    app.post('/upload', function(req, res, next) {
        let images=[];
        let item;

        let arr_promise = [];
        let urlList = [];
        for (item in req.files) {
            // console.log(req.files[item].displayImage);
            let filePath = req.files[item].path.split('/').pop();
            let absPath = protocol + '://' + hostname + '/image/'+filePath;
            let image = {
                timestamp : new Date().getTime().toString(),
                path : absPath,
                isDeleted : false
            };
            urlList.push(absPath);
            images.push(image);
            arr_promise.push(ImageModel.create(image));
            // images = images + filePath + ";" ;
        }

        Promise.all(arr_promise)
            .then((result)=>{
                res.json(new ResData(1,0,{urls:urlList}));
            })
            .catch((e)=>{
                res.json(new ResData(0,701,null));
            });
    });

    //上传单张图片到本地，返回url
    app.post('/picupload',(req,res,next)=>{
        // console.log(req.fields.picbin);
        let data = req.fields.picbin.split(',');
        const hash = crypto.createHash('md5');
        hash.update(data[1]);//第二部分才是base64编码内容
        let bf = new Buffer(data[1],'base64');
        let fileName = hash.digest('hex')+'.'+data[0].split(';')[0].split('/')[1];//获取文件MIME格式后缀
        fs.writeFile('./public/image/'+fileName,bf,()=>{
            let image = {
                timestamp : new Date().getTime().toString(),
                path : protocol + '://' + hostname + '/image/'+fileName,
                isDeleted : false
            };
            ImageModel.create(image)
            .then(function (result) {
                resData = new ResData();
                resData.setData("添加成功");
                resData.setIsSuccess(1);
                resData.url=image.path;
                res.json(resData);
            })
            .catch(function (e) {
                resData = new ResData();
                resData.setData("添加失败");
                resData.setIsSuccess(0);
                res.send(JSON.stringify(resData));
                next(e);
            });
        });
    });

    // app.get('/token',(req,res,next)=>{
    //     TokenModel.put(req.query.id)
    //         .then((result)=>{
    //             res.send(result);
    //         });
    // });

    app.post('/api/uploads', multipartyMiddleware, uploadHelper.uploadFile);


    app.use('/user',require('./userRoute'));
    app.use('/company',require('./companyRoute'));
    app.use('/finance',require('./financeRoute'));
    app.use('/news',require('./newsRoute'));
    app.use('/privateReport',require('./privateReportRoute'));
    app.use('/publicReport',require('./publicReportRoute'));
    app.use('/product',require('./productRoute'));
};
