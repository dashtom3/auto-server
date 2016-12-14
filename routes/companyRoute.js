/**
 * Created by joseph on 16/12/12.
 */
var express = require('express');
var router = express.Router();
var url = require('url');
var sha1 = require('sha1');

var CompanyModel = require('../models/company');
var ResData = require('../models/res');
var checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

//注册
router.get('/signup',function (req,res,next) {

});

//登录
router.get('login',function (req,res,next) {
    var urlQuery = url.parse(req.url,true).query;
    var name = urlQuery.name;
    var password = urlQuery.password;

    CompanyModel.getCompanyByName(name)
        .then(function (company) {
            resData = new ResData();
            if(!company){
                resData.setData("company not exist");
                resData.setIsSuccess(0);
            }else if(company.password!==sha1(password)){
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
    var name = req.session.company.name;

    CompanyModel.getCompanyByName(name)
        .then(function (company) {
            delete company.password;
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(company);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

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

    //更改用户类型
    CompanyModel.modifyType(company.name,newType)
        .then(function (result) {
            resData = new ResData();
            resData.setData(user);
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
                UserModel.modifyPassword(company.name,sha1(newPassword))
                    .then(function (result) {
                        res.send(JSON.stringify(resData));
                    })
                    .catch(function (e) {
                        resData = new ResData();
                        resData.setData("modify error");
                        resData.setIsSuccess(0);
                        res.send(JSON.stringify(resData));
                        next(e);
                    });
            }
        })
        .catch();
});

//修改企业信息：
//TODO
// router.get('/modifyInfo',checkUserLogin,function (req,res,next) {
//     var urlQuery=url.parse(req.url,true).query;
//     var newNickName=urlQuery.newNickName;
//     var newMail=urlQuery.newMail;
//     var newPhone=urlQuery.newPhone;
//     user=req.session.user;
//
//     //更改用户类型
//     UserModel.modifyInfo(user.name,newNickName,newMail,newPhone)
//         .then(function (result) {
//             user.nikeName=newNickName;
//             user.mail=newMail;
//             user.phone=newPhone
//             resData = new ResData();
//             resData.setData(user);
//             resData.setIsSuccess(1);
//             res.send(JSON.stringify(resData));
//         })
//         .catch(function (e) {
//             resData = new ResData();
//             resData.setData("modify error");
//             resData.setIsSuccess(0);
//             res.send(JSON.stringify(resData));
//             next(e);
//         });
// });


module.exports = router;
















