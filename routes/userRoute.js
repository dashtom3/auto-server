var sha1 = require('sha1');
var express = require('express');
var router = express.Router();
var url = require('url');

var UserModel = require('../models/user');
var ResData = require('../models/res');
var checkUserLogin = require('../middlewares/check').checkUserLogin;

//用户注册
router.post('/signup', function(req, res, next) {
    var name = req.fields.name;
    var nikeName=req.fields.nikeName;
    var password=req.fields.password;
    var mail=req.fields.mail;
    var phone=req.fields.phone;
    var idImg1=req.files.idImg1.path.split('/').pop();
    var idImg2=req.files.idImg2.path.split('/').pop();
    // 明文密码加密
    password = sha1(password);

    // 待写入数据库的用户信息
    var user = {
        name: name,
        nikeName: nikeName,
        password: password,
        mail: mail,
        phone: phone,
        idImg1: idImg1,
        idImg2: idImg2,
        userType: 'no'
    };
    // 用户信息写入数据库
    UserModel.create(user)
        .then(function (result) {
            // 此 user 是插入 mongodb 后的值，包含 _id
            user = result.ops[0];
            // 将用户信息存入 session
            delete user.password;
            req.session.user = user;
            //返回用户json
            resData = new ResData();
            resData.setData(user);
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

//用户登录
router.get('/login',function (req, res , next) {
    var urlQuery=url.parse(req.url,true).query;
    var name=urlQuery.name;
    var password=urlQuery.password;

    //找到用户
    UserModel.getUserByname(name)
        .then(function (user) {
            resData = new ResData();
            if(!user){
                resData.setData("user not exist");
                resData.setIsSuccess(0);
            }else if(user.password!==sha1(password)){
                resData.setData("password error");
                resData.setIsSuccess(0);
            }else {
                resData.setData(user);
                resData.setIsSuccess(1);
                delete user.password;
                req.session.user=user;
            }
            res.send(JSON.stringify(resData))
        })
        .catch(next);

});

//用户登出
router.get('/logout',checkUserLogin,function (req,res,next) {
    req.session.user=null;
    resData=new ResData();
    resData.setIsSuccess(1);
    resData.setData("logout success");
    res.send(JSON.stringify(resData));
});

//获取用户列表
router.get('/getUserList',checkUserLogin,function (req,res,next) {
    UserModel.getUserList()
        .then(function (result) {
            for (var i = 0; i < result.length; i++) {
                delete result[i].password;
            };
            resData=new ResData();
            resData.setData(result);
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("getUserList error");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});


//审核用户&修改用户类型
router.get('/modifyType',checkUserLogin,function (req,res,next) {
    var newType=url.parse(req.url,true).query.newType;
    user=req.session.user;
    user.userType=newType;

    //更改用户类型
    UserModel.modifyUserType(user.name,newType)
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
router.get('/modifyPassword',checkUserLogin,function (req,res,next) {
    var urlQuery=url.parse(req.url,true).query;
    var oldPassword=urlQuery.oldPassword;
    var newPassword=urlQuery.newPassword;

    sessionUser=req.session.user;
    resData=new ResData();
    UserModel.getUserByname(sessionUser.name)
        .then(function (user) {
            if(sha1(oldPassword)!==user.password){
                resData.setIsSuccess(0);
                resData.setData("password error");
                res.send(JSON.stringify(resData));
            }
            else{
                resData.setIsSuccess(1);
                resData.setData("modifyPassword success");
                UserModel.modifyPassword(user.name,sha1(newPassword))
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

//修改用户信息：nickName,mail,phone
router.get('/modifyInfo',checkUserLogin,function (req,res,next) {
    var urlQuery=url.parse(req.url,true).query;
    var newNickName=urlQuery.newNickName;
    var newMail=urlQuery.newMail;
    var newPhone=urlQuery.newPhone;
    user=req.session.user;

    //更改用户类型
    UserModel.modifyInfo(user.name,newNickName,newMail,newPhone)
        .then(function (result) {
            user.nikeName=newNickName;
            user.mail=newMail;
            user.phone=newPhone
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


module.exports = router;
