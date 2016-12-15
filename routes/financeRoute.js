/**
 * Created by joseph on 16/12/12.
 */
var express = require('express');
var router = express.Router();
var url = require('url');

var FinanceModel = require('../models/finance');
var ResData = require('../models/res');
var checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

//1.添加财务信息
router.get('/add',checkCompanyLogin,function (req,res,next) {
    var urlQuery = url.parse(req.url,true).query;
    company=req.session.company;

    var finance = {
        companyName: company.name,
        year: urlQuery.year,
        ratio: urlQuery.ratio,
        input: urlQuery.input,
        increase: urlQuery.increase,
        allCapital: urlQuery.allCapital,
        realCapital: urlQuery.realCapital,
        allRatio: urlQuery.allRatio,
        realRatio: urlQuery.realRatio,
        debtRatio: urlQuery.debtRatio,
        inputRatio: urlQuery.inputRatio
    };

    FinanceModel.create(finance)
        .then(function (result) {
            resData = new ResData();
            resData.setData(result.ops[0]);
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("该年度财务信息已存在");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});

//2.根据年份和公司获取财务报表
router.get('/getFinance',checkCompanyLogin,function (req,res,next) {
    var year = url.parse(req.url,true).query.year;
    var name = req.session.company.name;

    FinanceModel.getFinance(name,year)
        .then(function (finance) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(finance);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//3.获取某公司所有财务报表
router.get('/getFinanceList',checkCompanyLogin,function (req,res,next) {
    var name = req.session.company.name;

    FinanceModel.getFinanceList(name)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//4.修改财务信息
router.get('/modify',checkCompanyLogin,function (req,res,next) {
    //可修改：ratio,input,increase,allCapital,realCapital,allRatio,realRatio,debtRatio,inputRatio
    var urlQuery = url.parse(req.url,true).query;
    company=req.session.company;

    //更改用户类型
    FinanceModel.modify(company.name,urlQuery.year,urlQuery.ratio,urlQuery.input,urlQuery.increase,urlQuery.allCapital,
        urlQuery.realCapital,urlQuery.allRatio,urlQuery.realRatio,urlQuery.debtRatio,urlQuery.inputRatio)
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

//5.删除财务信息
router.get('/delete',checkCompanyLogin,function (req,res,next) {
    var year = url.parse(req.url,true).query.year;
    company=req.session.company;

    //更改用户类型
    FinanceModel.deleteRecord(company.name,year)
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

module.exports = router