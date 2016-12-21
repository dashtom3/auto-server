/**
 * Created by joseph on 16/12/12.
 */
var express = require('express');
var router = express.Router();
var url = require('url');
// var sha1 = require('sha1');
const crypto = require('crypto');
const secret = 'xjkjpassword';

var CompanyModel = require('../models/company');
var ResData = require('../models/res');
var Response = require('../models/response');
var checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

//注册
router.post('/signup', function(req, res, next) {
    //longName,shortName,address,field,regTime,legalEntity,regCapital,regAddress,isNeedCapital,info
    //companyDesc,productDesc,userDesc
    var name = req.fields.name;
    var password=req.fields.password;
    var position=req.fields.position;
    var info=(req.files.info == undefined)
        ?"":req.files.info.path.split('/').pop();
    var type=req.fields.type;

    if((name == null)
    || (position == null)
    || (password == null)
    || (type == null)){
        res.json(Response(0,'101'));
        return;
    }

    var longName="";
    var shortName = "";
    var address="";
    var field="";
    var regTime = "";
    var legalEntity="";
    var regCapital="";
    var regAddress="";
    var isNeedCapital = "";

    var logo="";
    var companyDesc="";
    var productDesc="";
    var userDesc = "";


    // var longName=req.fields.longName;
    // var shortName = req.fields.shortName;
    // var address=req.fields.address;
    // var field=req.fields.field;
    // var regTime = req.fields.regTime;
    // var legalEntity=req.fields.legalEntity;
    // var regCapital=req.fields.regCapital;
    // var regAddress=req.fields.regAddress;
    // var isNeedCapital = req.fields.isNeedCapital;

    // var logo=req.files.logo.path.split('/').pop();
    // var companyDesc=req.fields.companyDesc;
    // var productDesc=req.fields.productDesc;
    // var userDesc = req.fields.userDesc;
    // 明文密码加密
    password = crypto.createHmac('md5', secret)
                   .update(password)
                   .digest('hex');

    // 待写入数据库的公司信息
    var company = {
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
            // 将信息存入 session
            delete company.password;
            req.session.company = company;
            //返回用户json
            resData = new ResData();
            resData.setData(company);
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            if (e.message.match('E11000 duplicate key')) {
                resData = new ResData();
                resData.setData("user exist");
                resData.setIsSuccess(0);
                res.send(JSON.stringify(resData));
            }
            next(e);
        });
});

router.get('/', function (req, res) {
    res.send('Hello company');
});

//登录
router.get('/login',function (req,res,next) {
    var urlQuery = url.parse(req.url,true).query;
    var name = urlQuery.name;
    var password = urlQuery.password;

    CompanyModel.getCompanyByName(name)
        .then(function (company) {
            resData = new ResData();
            if(!company){
                resData.setData("company not exist");
                resData.setIsSuccess(0);
            }else if(company.password!==crypto.createHmac('md5', secret).update(password).digest('hex')){
                resData.setData("password error");
                resData.setIsSuccess(0);
            }else {
                resData.setData(company);
                resData.setIsSuccess(1);
                delete company.password;
                req.session.company=company;
            }
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//登出
router.get('/logout',checkCompanyLogin,function (req,res,next) {
    req.session.company=null;
    resData=new ResData();
    resData.setIsSuccess(1);
    resData.setData("logout success");
    res.send(JSON.stringify(resData));
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
