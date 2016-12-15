/**
 * Created by joseph on 16/12/14.
 */
var express = require('express');
var router = express.Router();
var url = require('url');

var ProductModel = require('../models/product');
var ResData = require('../models/res');
var checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

//1.添加产品
router.post('/add',checkCompanyLogin,function (req,res,next) {
    //add post(name,tag,argc,desc,images)
    var name = req.fields.name;
    var tag = req.fields.tag;
    var argc = req.fields.argc;
    var desc = req.fields.desc;

    //todo
    // var images = req.files.images.path.split(path.sep).pop();
    var images="";
    var item;
    for (item in files) {
        var filePath = files[item].path.split(path.sep).pop();
        images = images + filePath + ";" ;
    }
    company=req.session.company;

    var product = {
        companyName: company.name,
        name: name,
        tag: tag,
        state: "0",
        argc: argc,
        desc: desc,
        images: images,
        isOnline: "0"  //0:下线  1:上线
    };

    ProductModel.create(product)
        .then(function (result) {
            resData = new ResData();
            resData.setData(result);
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("添加产品出错");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});

//2.按分类取出所有产品
router.get('/getProductByType',checkCompanyLogin,function (req,res,next) {
    var type = url.parse(req.url,true).query.type;

    ProductModel.getProductByType(type)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//3.按公司取出所有产品
router.get('/getProductByCompany',checkCompanyLogin,function (req,res,next) {
    var companyName = url.parse(req.url,true).query.companyName;

    ProductModel.getProductByCompany(companyName)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//4.设置上线／下线
router.get('/modifyOnline',checkCompanyLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;
    var isOnline = url.parse(req.url,true).query.isOnline;

    ProductModel.modifyOnline(id,isOnline)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//5.修改产品
router.post('/modify',checkCompanyLogin,function (req,res,next) {
    //modify?id=xxx&productId=xxx&productName=xxx&date=xxx&team=xxx&site=xxx
    //可修改：productId,productName,date,team,site
    var urlQuery = url.parse(req.url,true).query;

    ProductModel.modify(urlQuery.id,urlQuery.productId,urlQuery.productName,
        urlQuery.date,urlQuery.team,urlQuery.site)
        .then(function (result) {
            resData = new ResData();
            resData.setData("modify success");
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("modify error");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});

//6.删除产品
router.get('/delete',checkCompanyLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;

    ProductModel.deleteRecord(id)
        .then(function (result) {
            resData = new ResData();
            resData.setData("delete success");
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("delete error");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});


module.exports = router;