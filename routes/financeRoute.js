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
/**
 * @api {GET} /finance/add 添加财务信息接口
 * @apiName finance_add
 * @apiGroup Finance
 *
 * @apiParam {String} companyId 公司Id
 * @apiParam {String} year 财年
 * @apiParam {String} ratio 市盈率
 * @apiParam {String} input 营业收入
 * @apiParam {String} increase 收入增长率
 * @apiParam {String} allCapital 总资产
 * @apiParam {String} realCapital 净资产
 * @apiParam {String} allRatio 毛利率
 * @apiParam {String} realRatio 净利率
 * @apiParam {String} debtRatio 资产负债率
 * @apiParam {String} inputRatio 资产收益率
 * @apiParam {String} token Token
 * */
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

//2.获取公司财务报表列表
// router.get('/getFinance',checkCompanyLogin,function (req,res,next) {
//     var year = url.parse(req.url,true).query.year;
//     var name = req.session.company.name;
//
//     FinanceModel.getFinance(name,year)
//         .then(function (finance) {
//             resData = new ResData();
//             resData.setIsSuccess(1);
//             resData.setData(finance);
//             res.send(JSON.stringify(resData));
//         })
//         .catch(next);
// });

//3.获取某公司所有财务报表
/**
 * @api {GET} /finance/list/:numPerPage/:pageNum  获取财务报表
 * @apiName finance_getList
 * @apiGroup Finance
 *
 * @apiParam {String} numPerPage 每页条目数量 这是URL参数不要写在?参数里
 * @apiParam {String} pageNum 第几页 这是URL参数不要写在?参数里
 * @apiParam {String} companyId 公司Id（精准）
 * @apiParam {String} companyName 公司名（模糊）
 * @apiParam {String} yearStart 开始年份
 * @apiParam {String} yserEnd 结束年份
 * */
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
/**
 * @api {GET} /finance/modify 修改财务信息
 * @apiName finance_modify
 * @apiGroup Finance
 *
 * @apiParam {String} token Token
 * @apiParam {String} year 财年
 * @apiParam {String} ratio 市盈率
 * @apiParam {String} input 营业收入
 * @apiParam {String} increase 收入增长率
 * @apiParam {String} allCapital 总资产
 * @apiParam {String} realCapital 净资产
 * @apiParam {String} allRatio 毛利率
 * @apiParam {String} realRatio 净利率
 * @apiParam {String} debtRatio 资产负债率
 * @apiParam {String} inputRatio 资产收益率
 * */
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
/**
 * @api {GET} /finance/delete 删除财务信息
 * @apiName finance_delete
 * @apiGroup Finance
 *
 * @apiParam {String} token Token
 * @apiParam {String} financeRecordId 财务信息ID
 * */
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