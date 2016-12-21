/**
 * Created by joseph on 16/12/12.
 */
const express = require('express');
const router = express.Router();
const url = require('url');
// var sha1 = require('sha1');
const crypto = require('crypto');
const secret = 'xjkjpassword';

const CompanyModel = require('../models/company');
const ResData = require('../models/res');
const Response = require('../models/response');
const checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

const TokenModel = require('../models/token');

//注册
/**
 * @api {POST} /company/signup 企业注册接口
 * @apiName company_signup
 * @apiGroup Company
 *
 * @apiParam {String} name 用户名
 * @apiParam {String} password 密码
 * @apiParam {String} position 地域
 * @apiParam {File} info 企业信息文件
 * @apiParam {String} type 企业类型
 * @apiParam {String} longName ?
 * @apiParam {String} shortName ?
 * @apiParam {File} logo Logo
 * @apiParam {String} address 地址
 * @apiParam {String} field ?
 * @apiParam {String} regTime 注册时间
 * @apiParam {String} legalEntity ?
 * @apiParam {String} regCapital 注册资金？
 * @apiParam {String} regAddress ?
 * @apiParam {String} isNeedCapital 是否需要融资?
 * @apiParam {String} companyDesc 公司介绍
 * @apiParam {String} productDesc 产品介绍
 * @apiParam {String} userDesc ?
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":
 *          {
 *              "name":"nametestanabda",
 *              "position":"position A",
 *              "info":"",
 *              "type":"CM",
 *              "longName":"",
 *              "shortName":"",
 *              "logo":"",
 *              "address":"",
 *              "field":"",
 *              "regTime":"yyyy-mm-dd",
 *              "legalEntity":"",
 *              "regCapital":"",
 *              "regAddress":"",
 *              "isNeedCapital":"",
 *              "companyDesc":"",
 *              "productDesc":"",
 *              "userDesc":"",
 *              "timestamp":"1482308102170",
 *              "isPassed":0,
 *              "_id":"585a3a06bb0880b84291290d",
 *              "token":"e481fbecc301b158a30cc6eba448fdbb"
 *          }
 *      }
 * @apiErrorExample {json} Error-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "FAILED",
 *          "errCode": "USER_EXIST",
 *          "data": null
 *      }
 * */
router.post('/signup', function(req, res, next) {
    //longName,shortName,address,field,regTime,legalEntity,regCapital,regAddress,isNeedCapital,info
    //companyDesc,productDesc,userDesc
    let name = req.fields.name;
    let password=req.fields.password;
    let position=req.fields.position;
    let info=(req.files.info == undefined)
        ?"":req.files.info.path.split('/').pop();
    let type=req.fields.type;
    let regTime = req.fields.regTime;

    if((name == null)
    || (position == null)
    || (password == null)
    || (type == null)
    || (regTime == null)){
        res.json(Response(0,'101'));
        return;
    }

    let longName="";
    let shortName = "";
    let address="";
    let field="";
    let legalEntity="";
    let regCapital="";
    let regAddress="";
    let isNeedCapital = "";

    let logo="";
    let companyDesc="";
    let productDesc="";
    let userDesc = "";

    // 明文密码加密
    password = crypto.createHmac('md5', secret)
                   .update(password)
                   .digest('hex');

    // 待写入数据库的公司信息
    let company = {
        name: name,
        password: password,
        position: position,
        info: info,//file
        type: type,
        longName: longName,
        shortName: shortName,
        logo: logo,//file
        address: address,
        field: field,
        regTime: regTime,
        legalEntity: legalEntity,
        regCapital: regCapital,
        regAddress: regAddress,
        isNeedCapital: isNeedCapital,
        companyDesc: companyDesc,
        productDesc: productDesc,
        userDesc: userDesc,
        timestamp: new Date().getTime().toString(),
        isPassed: 0
    };
    // 信息写入数据库
    CompanyModel.create(company)
        .then(function (result) {
            company = result.ops[0];
            TokenModel.create(company._id)
                .then((token)=>{
                    //添加token信息
                    company.token = token;
                    delete company.password;
                    //返回用户json
                    res.json(new ResData(1,0,company));
                })
                .catch((e)=>{
                    res.json(new ResData(0,801,null));
                });
        })
        .catch(function (e) {
            if (e.message.match('E11000 duplicate key')) {
                res.json(new ResData(0,104,null));
            }
        });
});

//登录
/**
 * @api {GET} /company/login 企业登录接口
 * @apiName company_login
 * @apiGroup Company
 *
 * @apiParam {String} name 用户名
 * @apiParam {String} password 密码
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":
 *          {
 *              "_id":"585a3e5d6611b4ba5c4e12ac",
 *              "name":"company",
 *              "position":"position A",
 *              "info":"",
 *              "type":"CM",
 *              "longName":"",
 *              "shortName":"",
 *              "logo":"",
 *              "address":"",
 *              "field":"",
 *              "regTime":"yyyy-mm-dd",
 *              "legalEntity":"",
 *              "regCapital":"",
 *              "regAddress":"",
 *              "isNeedCapital":"",
 *              "companyDesc":"",
 *              "productDesc":"",
 *              "userDesc":"",
 *              "timestamp":"1482309213079",
 *              "isPassed":0,
 *              "token":"6b2c60171cdc4bc925259af73a8a3b7c"
 *          }
 *      }
 * @apiErrorExample {json} Error-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "FAILED",
 *          "errCode": "USERNAME_PASSWORD_MISMATCH",
 *          "data": null
 *      }
 * */
router.get('/login',function (req,res,next) {
    let urlQuery = url.parse(req.url,true).query;
    let name = urlQuery.name;
    let password = urlQuery.password;

    CompanyModel.getCompanyByName(name)
        .then(function (company) {
            if(!company){
                res.json(new ResData(0,105,null));
            }else if(company.password!==crypto.createHmac('md5', secret).update(password).digest('hex')){
                res.json(new ResData(0,106,null));
            }else {
                TokenModel.create(company._id)
                    .then((token)=>{
                        //添加token信息
                        company.token = token;
                        delete company.password;
                        //返回用户json
                        res.json(new ResData(1,0,company));
                    })
                    .catch((e)=>{
                        res.json(new ResData(0,801,null));
                    });
            }
        })
        .catch((e)=>{
            res.json(new ResData(0,901,null));
        });
});

//登出
/**
 * @api {GET} /company/logout 企业登出接口
 * @apiName company_logout
 * @apiGroup Company
 *
 * @apiParam {String} token Token
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * @apiErrorExample {json} Error-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "FAILED",
 *          "errCode": "TOKEN_DELETE_FAILED",
 *          "data": null
 *      }
 * */
router.get('/logout',checkCompanyLogin,function (req,res,next) {
    let token = req.query.token;

    TokenModel.del(token)
        .then((result)=>{
            res.json(new ResData(1,0,null));
        })
        .catch((e)=>{
            res.json(new ResData(0,802,null));
        });
});

//获取企业详细信息
router.get('/getCompanyByName',checkCompanyLogin,function (req,res,next) {
    var name = req.query.name;

    CompanyModel.getCompanyByName(name)
        .then(function (company) {
            delete company.password;
            // resData = new ResData();
            // resData.setIsSuccess(1);
            // resData.setData(company);
            res.send(company);
        })
        .catch(next);
});

//TODO:getlist

//更改公司审核状态
router.get('/modify');

//根据分类获取企业信息
router.get('/getCompanyByField',checkCompanyLogin,function (req,res,next) {
    var field = url.parse(req.url,true).query.field;

    CompanyModel.getCompanyByField(field)
        .then(function (result) {
            for(var i=0;i<result.length;i++){
                delete result[i].password;
            }
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//审核&修改企业权限
router.get('/modifyType',checkCompanyLogin,function (req,res,next) {
    var newType=url.parse(req.url,true).query.newType;
    company=req.session.company;
    company.type=newType;

    CompanyModel.modifyType(company.name,newType)
        .then(function (result) {
            var resData = new ResData();
            resData.setData("modify succeff");
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            var resData = new ResData();
            resData.setData("modify error");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
        });
});

//修改密码
router.get('/modifyPassword',checkCompanyLogin,function (req,res,next) {
    var urlQuery=url.parse(req.url,true).query;
    var oldPassword=urlQuery.oldPassword;
    var newPassword=urlQuery.newPassword;

    sessionCompany=req.session.company;
    resData=new ResData();
    CompanyModel.getCompanyByName(sessionCompany.name)
        .then(function (company) {
            if(sha1(oldPassword)!==company.password){
                resData.setIsSuccess(0);
                resData.setData("password error");
                res.send(JSON.stringify(resData));
            }
            else{
                resData.setIsSuccess(1);
                resData.setData("modifyPassword success");
                CompanyModel.modifyPassword(company.name,sha1(newPassword))
                    .then(function (result) {
                        res.send(JSON.stringify(resData));
                    })
                    .catch(function (e) {
                        resData = new ResData();
                        resData.setData("modify error");
                        resData.setIsSuccess(0);
                        res.send(JSON.stringify(resData));
                    });
            }
        })
        .catch();
});

//修改企业信息：
router.post('/modifyInfo',checkCompanyLogin,function (req,res,next) {
    var longName=req.fields.longName;
    var shortName = req.fields.shortName;
    var address=req.fields.address;
    var field=req.fields.field;
    var regTime = req.fields.regTime;
    var legalEntity=req.fields.legalEntity;
    var regCapital=req.fields.regCapital;
    var regAddress=req.fields.regAddress;
    var isNeedCapital = req.fields.isNeedCapital;

    var logo=req.files.logo.path.split('/').pop();
    var companyDesc=req.fields.companyDesc;
    var productDesc=req.fields.productDesc;
    var userDesc = req.fields.userDesc;
    company=req.session.company;


    CompanyModel.modify(company.name,longName,shortName,logo,address,field,regTime,legalEntity,
        regCapital,regAddress, isNeedCapital,companyDesc,productDesc,userDesc)
        .then(function (result) {
            //更新session
            CompanyModel.getCompanyByName(sessionCompany.name)
                .then(function (newCompany) {
                    req.session.company=newCompany;
                    resData = new ResData();
                    resData.setData("modify success");
                    resData.setIsSuccess(1);
                    res.send(JSON.stringify(resData));
                })
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("modify error");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});


module.exports = router;
