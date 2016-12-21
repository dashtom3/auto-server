const sha1 = require('sha1');
const express = require('express');
const router = express.Router();
const url = require('url');
const crypto = require('crypto');
const secret = 'xjkjpassword';

const UserModel = require('../models/user');
const ResData = require('../models/res');
const Response = require('../models/response');
const checkUserLogin = require('../middlewares/check').checkUserLogin;

const TokenModel = require('../models/token');


//用户注册
/**
 * @api {post} /user/signup 用户注册接口
 * @apiName user_signup
 * @apiGroup User
 *
 * @apiParam {String} name 用户名
 * @apiParam {String} password 密码
 * @apiParam {String} nickname 昵称
 * @apiParam {String} mail 邮箱
 * @apiParam {String} phone 手机号
 * @apiParam {File} idImg1 ?
 * @apiParam {File} idImg2 ?
 * @apiParam {String} userType 用户类型
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":
 *          {
 *              "name":"testusername",
 *              "nikeName":"thisisnikname",
 *              "mail":"123@qq.com",
 *              "phone":"12345",
 *              "idImg1":"",
 *              "idImg2":"",
 *              "userType":"normal",
 *              "timestamp":"1482314023487",
 *              "isPassed":0,
 *              "_id":"585a51272a4c3bc1bcef57c8",
 *              "token":"9ccc2ff448458bdbc4a8aab5f143ddc4"
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

    let name = req.fields.name;
    let nikeName=req.fields.nickname;
    let password=req.fields.password;
    let userType=req.fields.userType;
    let mail=req.fields.mail || "";
    let phone=req.fields.phone || "";
    let idImg1=(req.files.idImg1 == undefined)
        ?"":req.files.idImg1.path.split('/').pop();
    let idImg2=(req.files.idImg2 == undefined)
        ?"":req.files.idImg2.path.split('/').pop();

    if((name == null)
    || (nikeName == null)
    || (password == null)
    || (userType == null)){
        res.json(Response(0,'101'));
        return;
    }

    // 明文密码加密
    // password = sha1(password);
    password = crypto.createHmac('md5', secret)
                   .update(password)
                   .digest('hex');

    // 待写入数据库的用户信息
    let user = {
        name: name,
        nikeName: nikeName,
        password: password,
        mail: mail,
        phone: phone,
        idImg1: idImg1,
        idImg2: idImg2,
        userType: userType,
        timestamp: new Date().getTime().toString(),
        isPassed: 0
    };
    // 用户信息写入数据库
    UserModel.create(user)
        .then(function (result) {
            // 此 user 是插入 mongodb 后的值，包含 _id
            user = result.ops[0];
            // console.log(user);
            TokenModel.create(user._id)
                .then((token)=>{
                    // console.log('token:',token);
                    //添加token信息
                    user.token = token;
                    delete user.password;
                    //返回用户json
                    res.json(new ResData(1,0,user));
                })
                .catch((e)=>{
                    // console.log(e.toString());
                    res.json(new ResData(0,801,null));
                });
        })
        .catch(function (e) {
            if (e.message.match('E11000 duplicate key')) {
                res.json(new ResData(0,102,null));
            }
        });
});

//用户登录
/**
 * @api {GET} /user/login 用户登录接口
 * @apiName user_login
 * @apiGroup User
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
 *              "_id":"585a51272a4c3bc1bcef57c8",
 *              "name":"testusername",
 *              "nikeName":"thisisnikname",
 *              "mail":"123@qq.com",
 *              "phone":"12345",
 *              "idImg1":"",
 *              "idImg2":"",
 *              "userType":"normal",
 *              "timestamp":"1482314023487",
 *              "isPassed":0,
 *              "token":"7bce023885525c0b0fa0469caa61f961"
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
router.get('/login',function (req, res , next) {
    let urlQuery=url.parse(req.url,true).query;
    let name=urlQuery.name;
    let password=urlQuery.password ;

    if((name == null || name == '')
    || (password == null || password == '')){
        res.json(Response(0,'101'));
        return;
    }

    //找到用户
    UserModel.getUserByname(name)
        .then(function (user) {
            var resData = new ResData();
            if(!user){
                res.json(new ResData(0,104,null));
            }else if(user.password!==crypto.createHmac('md5', secret).update(password).digest('hex')){
                res.json(new ResData(0,106,null));
            }else {
                TokenModel.create(user._id)
                    .then((token)=>{
                        //添加token信息
                        user.token = token;
                        delete user.password;
                        //返回用户json
                        res.json(new ResData(1,0,user));
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

//用户登出
/**
 * @api {GET} /user/logout 用户登出接口
 * @apiName user_logout
 * @apiGroup User
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
router.get('/logout',checkUserLogin,function (req,res,next) {
    let token = req.query.token;

    TokenModel.del(token)
        .then((result)=>{
            res.json(new ResData(1,0,null));
        })
        .catch((e)=>{
            res.json(new ResData(0,802,null));
        });
});

//获取用户列表
router.get('/getUserList',checkUserLogin,function (req,res,next) {
    UserModel.getUserList(2,2)
        .then(function (result) {
            for (var i = 0; i < result.length; i++) {
                delete result[i].password;
            };
            resData=new ResData();
            resData.setData(result);
            resData.setIsSuccess(1);
            res.json(resData);
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("getUserList error");
            resData.setIsSuccess(0);
            res.json(resData);
            // next(e);
        });
});

router.get('/count',(req,res,next)=>{
    UserModel.getTotalNum()
        .then((result)=>{
            res.json({count:result});
        })
        .catch((e)=>{

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
