/**
 * Created by joseph on 16/12/14.
 */
var express = require('express');
var router = express.Router();
var url = require('url');

var PubReportModel = require('../models/publicReport');
var ResData = require('../models/res');
var checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

//1.添加测评
router.get('/add',checkCompanyLogin,function (req,res,next) {
    //add?productId=xxx&productName=xxx&date=xxx&team=xxx&site=xxx
    var urlQuery = url.parse(req.url,true).query;
    company=req.session.company;

    var pubReport = {
        companyName: company.name,
        productId: urlQuery.productId,
        productName: urlQuery.productName,
        date: urlQuery.date,
        team: urlQuery.team,
        site: urlQuery.site,
        isOnline: "0"  //0:下线  1:上线
    };

    PubReportModel.create(pubReport)
        .then(function (result) {
            resData = new ResData();
            resData.setData(result.ops[0]);
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("添加测评出错");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});

//2.按是否上线取出所有专业测评
router.get('/getPubReportByOnline',checkCompanyLogin,function (req,res,next) {
    var isOnline = url.parse(req.url,true).query.isOnline;

    PubReportModel.getPubReportByOnline(isOnline)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//3.按公司取出所有专业测评
router.get('/getPubReportByCompany',checkCompanyLogin,function (req,res,next) {
    var companyName = url.parse(req.url,true).query.companyName;

    PubReportModel.getPubReportByCompany(companyName)
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

    PubReportModel.modifyOnline(id,isOnline)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData("modify success");
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//5.修改测评
router.get('/modify',checkCompanyLogin,function (req,res,next) {
    //modify?id=xxx&productId=xxx&productName=xxx&date=xxx&team=xxx&site=xxx
    //可修改：productId,productName,date,team,site
    var urlQuery = url.parse(req.url,true).query;

    PubReportModel.modify(urlQuery.id,urlQuery.productId,urlQuery.productName,
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

//6.删除测评信息
router.get('/delete',checkCompanyLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;

    PubReportModel.deleteRecord(id)
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