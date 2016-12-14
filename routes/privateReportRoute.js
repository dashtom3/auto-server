/**
 * Created by joseph on 16/12/14.
 */
var express = require('express');
var router = express.Router();
var url = require('url');

var PriReportModel = require('../models/privateReport');
var ResData = require('../models/res');
var checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;
var checkAdminLogin = require('../middlewares/check').checkAdminLogin;

//1.添加测评
router.get('/add',checkCompanyLogin,function (req,res,next) {
    //add?title=xxx&product=xxx&date=xxx&type=xxx&maxUserNum=xxx
    var urlQuery = url.parse(req.url,true).query;
    company=req.session.company;

    var priReport = {
        companyName: company.name,
        title: urlQuery.title,
        product: urlQuery.product,
        date: urlQuery.date,
        type: urlQuery.type,
        state: "0",//0:待审核  1:已发布  2:已结束  －1:已被拒
        maxUserNum: urlQuery.maxUserNum,
        signUserNum: "0",
        signUserName: "",
        passUserNum: "0",
        passUserName: ""
    };

    PriReportModel.create(priReport)
        .then(function (result) {
            resData = new ResData();
            resData.setData(result);
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

//2.按分类取出所有用户测评
router.get('/getPriReportByField',checkCompanyLogin,function (req,res,next) {
    var type = url.parse(req.url,true).query.type;

    PriReportModel.getPriReportByField(type)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//3.按公司取出所有用户测评
router.get('/getPriReportByCompany',checkCompanyLogin,function (req,res,next) {
    var companyName = url.parse(req.url,true).query.companyName;

    PriReportModel.getPriReportByCompany(companyName)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//4.按状态取出所有用户测评
router.get('/getPriReportByState',checkCompanyLogin,function (req,res,next) {
    var state = url.parse(req.url,true).query.state;

    PriReportModel.getPriReportByState(state)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//5.修改测评
router.get('/modify',checkCompanyLogin,function (req,res,next) {
    //modify?id=xxx&title=xxx&product=xxx&date=xxx
    //可修改：title,product,type
    var urlQuery = url.parse(req.url,true).query;

    PriReportModel.modify(urlQuery.id,urlQuery.title,urlQuery.product,urlQuery.date)
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

    PriReportModel.deleteRecord(id)
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

//7.获取单个测评详情
router.get('/getPriReportById',checkCompanyLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;

    PriReportModel.getPriReportById(id)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//8.用户报名
router.get('/sign',checkCompanyLogin,function (req,res,next) {
    //sign?id=xxx&newName=xxx
    var id = url.parse(req.url,true).query.id;
    var userName = url.parse(req.url,true).query.newName;

    PriReportModel.getPriReportById(id)
        .then(function (privateReport) {
            var newNum = privateReport.signUserNum+1;
            var newName= privateReport.signUserName+";"+userName;

            PriReportModel.sign(id,newNum,newName)
                .then(function (result) {
                    resData = new ResData();
                    resData.setIsSuccess(1);
                    resData.setData(result);
                    res.send(JSON.stringify(resData));
                })
                .catch(next);
        })
        .catch(next);

});

//9.审核通过用户的报名(admin权限)
router.get('/pass',checkAdminLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;
    var userName = url.parse(req.url,true).query.newName;

    PriReportModel.getPriReportById(id)
        .then(function (privateReport) {
            var newNum = privateReport.passUserNum+1;
            var newName= privateReport.passUserName+";"+userName;

            PriReportModel.pass(id,newNum,newName)
                .then(function (result) {
                    resData = new ResData();
                    resData.setIsSuccess(1);
                    resData.setData(result);
                    res.send(JSON.stringify(resData));
                })
                .catch(next);
        })
        .catch(next);

});


module.exports = router;