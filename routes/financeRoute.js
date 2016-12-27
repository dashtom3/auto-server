/**
 * Created by joseph on 16/12/12.
 */
const express = require('express');
const router = express.Router();
const url = require('url');

const FinanceModel = require('../models/finance');
const ResData = require('../models/res');
const checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;
const TokenModel = require('../models/token');
const JF = require('../middlewares/JsonFilter');

function isEmptyObject(obj){

    for (name in obj){
        return false;
    }
    return true;
}

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
router.get('/add',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        year:null,
        ratio:'',
        input:null,
        increase:'',
        allCapital:'',
        realCapital:'',
        allRatio:'',
        realRatio:'',
        debtRatio:'',
        inputRatio:''

    },['token','year','input']);
},
    function (req,res,next) {
    const urlQuery = req.query;
    const token = urlQuery.token;
    //通过token获取企业用户id
    TokenModel.findUser(token)
        .then(function(result){
            // console.log(result);
            let companyId=result.linkTo;
            if (companyId == undefined || companyId == null){
                res.json(new ResData(0,804));
                return;
            }
            let finance = {
                companyId: companyId,
                year: parseInt(urlQuery.year),
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
            return Promise.resolve(finance);
        })
        .catch(function(e){
            res.json(new ResData(0,803,e.toString()));
        })
        .then((finance)=>{
            FinanceModel.create(finance)
                .then(function (result) {
                    res.json(new ResData(1,0,finance));
                })
                .catch(function (e) {
                    res.json(new ResData(0,708,e.toString()));
                });
        })
        .catch((e)=>{
            res.json(new ResData(0,999,e.toString()));
        });
});

//2.获取某公司所有财务报表
/**
 * @api {GET} /finance/list/:numPerPage/:pageNum  获取财务报表
 * @apiName finance_getList
 * @apiGroup Finance
 *
 * @apiParam {String} numPerPage 每页条目数量 这是URL参数不要写在?参数里
 * @apiParam {String} pageNum 第几页 这是URL参数不要写在?参数里
 * @apiParam {String} companyId 公司Id（精准）(必填)
 * @apiParam {String} yearStart 开始年份
 * @apiParam {String} yearEnd 结束年份
 * */
router.get('/list/:numPerPage/:pageNum',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        companyId:null,
        yearStart:null,
        yearEnd:null
    },['companyId']);
},
    function (req,res,next) {
    //预处理查询语句
    const _getData = req.query;
    for(key in _getData){
        if(_getData[key] == null){
            delete _getData[key];
        }
    }
    let queryString = _getData;

    //处理时间字段
    let _regTimeUnix = {
        "$gte":null,
        "$lte":null
    };
    if(queryString.yearStart != undefined && !isNaN(parseInt(queryString.yearStart))){
        _regTimeUnix['$gte'] = parseInt(queryString.yearStart);
        delete queryString.yearStart;
    }
    if(queryString.yearEnd != undefined && !isNaN(parseInt(queryString.yearEnd))){
        _regTimeUnix['$lte'] = parseInt(queryString.yearEnd);
        delete queryString.yearEnd;
    }
    //处理空字段
    for(key in _regTimeUnix){
        if(_regTimeUnix[key] == null){
            delete _regTimeUnix[key];
        }
    }
    //时间添加到查询语句
    if (!isEmptyObject(_regTimeUnix))
        queryString.year = _regTimeUnix;

    //分页参数
    let numPerPage = parseInt(req.params.numPerPage);
    let pageNum = parseInt(req.params.pageNum);

    FinanceModel.getFinanceList(queryString,numPerPage,pageNum)
        .then(function (result) {
            let responseData={
                list:result
            };
            return FinanceModel.count(queryString)
                .then((result)=>{
                    responseData.totalNum=result;
                    responseData.totalPageNum=Math.ceil(result/numPerPage);
                    responseData.currentPage=pageNum;
                    responseData.numPerPage=numPerPage;
                    if(responseData.totalPageNum==0)
                        responseData.totalPageNum=1;
                    res.json(new ResData(1,0,responseData));
                });
        })
        .catch(function(e){
            res.json(new ResData(0,709,e.toString()));
        });
});

//3.修改财务信息
/**
 * @api {GET} /finance/modify 修改财务信息
 * @apiName finance_modify
 * @apiGroup Finance
 *
 * @apiParam {String} token Token
 * @apiParam {String} financeRecordId 财务信息ID
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
router.get('/modify',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        financeRecordId:null,
        year:null,
        ratio:'',
        input:null,
        increase:'',
        allCapital:'',
        realCapital:'',
        allRatio:'',
        realRatio:'',
        debtRatio:'',
        inputRatio:''
    },['token','year','input','financeRecordId']);
},
    function (req,res,next) {
        let newFinance = req.query;
        const token = newFinance.token;
        delete newFinance.token;
        let financeRecordId = newFinance.financeRecordId;
        delete newFinance.financeRecordId;
        newFinance.year = parseInt(newFinance.year);
        //更改财务信息
        TokenModel.findUser(token)
            .then((result)=>{
                if(result == null){
                    res.json(new ResData(0,803));
                    return;
                }
                let user_id = result.linkTo;
                if (user_id == undefined || user_id == null){
                    res.json(new ResData(0,804));
                    return;
                }
                return Promise.resolve(user_id);
            })
            .catch((e)=>{
                res.json(new ResData(0,804));
            })
            .then((companyId)=>{
                if(companyId === undefined)
                    return;
                FinanceModel.modify(financeRecordId,companyId,newFinance)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,710,e.toString()));
                    });
            })
});

//4.删除财务信息
/**
 * @api {GET} /finance/delete 删除财务信息
 * @apiName finance_delete
 * @apiGroup Finance
 *
 * @apiParam {String} token Token
 * @apiParam {String} financeRecordId 财务信息ID
 * */
router.get('/delete',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        financeRecordId:null
    },['token','financeRecordId']);
},
    function (req,res,next) {
        const financeRecordId = req.query.financeRecordId;
        const token = req.query.token;

        TokenModel.findUser(token)
            .then((result)=>{
                if(result == null){
                    res.json(new ResData(0,803));
                    return;
                }
                let user_id = result.linkTo;
                if (user_id == undefined || user_id == null){
                    res.json(new ResData(0,804));
                    return;
                }
                return Promise.resolve(user_id);
            })
            .catch((e)=>{
                res.json(new ResData(0,804));
            })
            .then((companyId)=>{
                if(companyId === undefined)
                    return;
                FinanceModel.deleteRecord(financeRecordId,companyId)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,710,e.toString()));
                    });
            });
});

module.exports = router;