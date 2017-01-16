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
const checkAdminLogin = require('../middlewares/check').checkAdminLogin;

const TokenModel = require('../models/token');
const JF = require('../middlewares/JsonFilter');

const withoutAdmin = ['normal','vc','forbid','wr'];

//用户注册
/**
 * @api {post} /user/signup 用户注册接口
 * @apiName user_signup
 * @apiGroup User
 *
 * @apiParam {String} name 用户名
 * @apiParam {String} password 密码
 * @apiParam {String} nikeName 昵称
 * @apiParam {String} mail 邮箱
 * @apiParam {String} phone 手机号
 * @apiParam {File} idImg1 ?
 * @apiParam {File} idImg2 ?
 * @apiParam {String} userType 用户类型
 * @apiParam {String} avatar 用户头像url
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
    let nikeName=req.fields.nikeName;
    let password=req.fields.password;
    let userType=req.fields.userType;
    let mail=req.fields.mail || "";
    let phone=req.fields.phone || "";
    let idImg1=(req.fields.idImg1 == undefined)
        ?"":req.fields.idImg1;
    let idImg2=(req.fields.idImg2 == undefined)
        ?"":req.fields.idImg2;
    let avatar=(req.fields.avatar == undefined)
        ?"":req.fields.avatar;

    if((name == null)
    || (nikeName == null)
    || (password == null)
    || (userType == null)){
        res.json(new ResData(0,101));
        return;
    }

    // 明文密码加密
    // password = sha1(password);
    password = ccrypto.createHash('md5').update(password).digest('hex');

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
        isPassed: 0,
        avatar: avatar
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
            }else if(user.password!==crypto.createHash('md5').update(password).digest('hex')){
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
router.get('/logout',checkUserLogin(),function (req,res,next) {
    let token = req.query.token;

    TokenModel.del(token)
        .then((result)=>{
            res.json(new ResData(1,0,null));
        })
        .catch((e)=>{
            res.json(new ResData(0,802,null));
        });
});

//条件获取用户列表
/**
 * @api {GET} /user/list/:numPerPage/:pageNum 按条件获取用户列表
 * @apiName user_getList
 * @apiGroup User
 *
 * @apiParam {String} numPerPage 每页条目数量 这是URL参数不要写在?参数里
 * @apiParam {String} pageNum 第几页 这是URL参数不要写在?参数里
 * @apiParam {String} nikeName 用户昵称（模糊）
 * @apiParam {String} userType 用户类型（精准）
 * @apiParam {String} isPassed 是否通过审核
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":
 *          {
 *              "list":[
 *                  {
 *                      "_id":"5858f90f6a08676a4ffa018c",
 *                      "name":"nametest",
 *                      "nikeName":"thisisnikname",
 *                      "mail":"123@qq.com",
 *                      "phone":"12345",
 *                      "idImg1":"",
 *                      "idImg2":"",
 *                      "userType":"normal",
 *                      "timestamp":"1482225935324",
 *                      "isPassed":0
 *                  }
 *              ],
 *              "totalNum":16,
 *              "totalPageNum":16,
 *              "currentPage":1,
 *              "numPerPage":1
 *          }
 *      }
 * */
router.get('/list/:numPerPage/:pageNum',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        nikeName:null,
        // mail:null,
        // phone:null,
        userType:null,
        isPassed:null
    },[]);
},
    function (req,res,next) {
        const _getData = req.query;

        for(let key in _getData){
            if(_getData[key] == null){
                delete _getData[key];
            }
        }

        let queryString = _getData;

        //处理模糊查询字段
        if(queryString.nikeName != undefined){
            queryString.nikeName = new RegExp(queryString.nikeName);
        }
        // if(queryString.mail != undefined){
        //     queryString.mail = new RegExp(queryString.mail)
        // }
        // if(queryString.phone != undefined){
        //     queryString.phone = new RegExp(queryString.phone);
        // }

        //处理数字
        if(queryString.isPassed != undefined){
            queryString.isPassed = parseInt(queryString.isPassed);
        }

        let numPerPage = parseInt(req.params.numPerPage);
        let pageNum = parseInt(req.params.pageNum);

        UserModel.getUserList(queryString,numPerPage,pageNum)
            .then((result)=>{
                let responseData={
                    list:result
                };
                return UserModel.count(queryString)
                    .then((result)=>{
                    responseData.totalNum=result;
                    responseData.totalPageNum=Math.ceil(result/numPerPage);
                    responseData.currentPage=pageNum;
                    responseData.numPerPage=numPerPage;
                    if(responseData.totalPageNum==0)
                        responseData.totalPageNum=1;
                    return Promise.resolve(responseData);
                    });
            })
            .then((result)=>{
                res.json(new ResData(1,0,result));
            })
            .catch(function (e) {
                res.json({e:e.toString()});
            });
});

//修改用户类型
/**
 * @api {GET} /user/modify/type 更改用户类型
 * @apiName user_modifyType
 * @apiGroup User
 *
 * @apiParam {String} token Token
 * @apiParam {String} userId 用户Id
 * @apiParam {String} newType 新的用户类型
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "SUCCEED",
 *          "errCode": "NO_ERROR",
 *          "data": null
 *      }
 * */
router.get('/modify/type',checkUserLogin(),(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        newType:null,
        userId:null
    },['token','newType','userId']);
},
    function (req,res,next) {
        const _getData = req.query;
        const token = _getData.token;
        const newType = _getData.newType;
        const userId = _getData.userId;
        if(!['normal','vc','forbid','wr'].includes(newType)){
            res.json(new ResData(0,112));
            return;
        }

        UserModel.modifyUserType(userId,newType)
            .then((result)=>{
                res.json(new ResData(1,0));
            })
            .catch((e)=>{
                res.json(new ResData(0,750,e.toString()));
            });
        // TokenModel.findUser(token)
        //     .then((result)=>{
        //         if(result == null){
        //             res.json(new ResData(0,803));
        //             return;
        //         }
        //         let user_id = result.linkTo;
        //         if (user_id == undefined || user_id == null){
        //             res.json(new ResData(0,804));
        //             return;
        //         }
        //         return Promise.resolve(user_id);
        //     })
        //     .then((user_id)=>{
        //         if(user_id === undefined)
        //             return;
        //         UserModel.modifyUserType(user_id,newType)
        //             .then((result)=>{
        //                 res.json(new ResData(1,0));
        //             })
        //             .catch((e)=>{
        //                 res.json(new ResData(0,750,e.toString()));
        //             });
        //     })
        //     .catch((e)=>{
        //         res.json(new ResData(0,804));
        //     });
});

//审核用户
/**
 * @api {GET} /user/modify/approval 更改用户审核状态
 * @apiName user_modifyApproval
 * @apiGroup User
 *
 * @apiParam {String} token Token
 * @apiParam {String} userId 要修改用户类型的用户ID
 * @apiParam {Number} approvalStatus 审核是否通过 0未审核 1审核通过 -1未通过
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "SUCCEED",
 *          "errCode": "NO_ERROR",
 *          "data": null
 *      }
 * */
router.get('/modify/approval',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        userId:null,
        approvalStatus:null
    },['token','userId','approvalStatus']);
},
    (req,res,next)=>{
        const _getData = req.query;
        const token = _getData.token;
        const userId = _getData.userId;
        const approvalStatus = parseInt(_getData.approvalStatus);

        UserModel.modifyApproval(userId,approvalStatus)
            .then((result)=>{
                res.json(new ResData(1,0));
            })
            .catch((e)=>{
                res.json(new ResData(0,751,e.toString()));
            });
});

//修改密码
/**
 * @api {GET} /user/modify/password 修改用户密码
 * @apiName user_modifyPassword
 * @apiGroup User
 *
 * @apiParam {String} token Token
 * @apiParam {String} oldPassword 旧密码
 * @apiParam {String} newPassword 新密码
 *
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
 *          "errCode": "USERNAME_PASSWORD_MISMATCH",
 *          "data": null
 *      }
 * */
router.get('/modify/password',checkUserLogin(withoutAdmin),(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        oldPassword:null,
        newPassword:null,
    },['token','oldPassword','newPassword']);
},(req,res,next)=>{
    const _getData = req.query;
    const token = _getData.token;
    const oldPassword = _getData.oldPassword;
    const newPassword = _getData.newPassword;

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
        .then((user_id)=>{
            if(user_id === undefined)
                return;
            return UserModel.getOldPassword(user_id)
                .then((result)=>{
                    return Promise.resolve(result);
                })
                .catch((e)=>{
                    res.json(new ResData(0,752));
                    return;
                });
        })
        .then((result)=>{
            if(result === undefined)
                return;
            const encrypted = crypto.createHmac('md5', secret).update(oldPassword).digest('hex');
            if(encrypted != result.password){
                res.json(new ResData(0,106));
                return;
            }
            UserModel.modifyPassword(result._id,crypto.createHmac('md5', secret).update(newPassword).digest('hex'))
                .then((result)=>{
                    res.json(new ResData(1,0));
                })
                .catch((e)=>{
                    res.json(new ResData(0,704));
                    return;
                });
        })
        .catch((e)=>{
            res.json(new ResData(0,804));
            return;
        });
});

//修改用户信息：nickName,mail,phone
/**
 * @api {GET} /user/modify/info 更改用户信息
 * @apiName user_modifyInfo
 * @apiGroup User
 *
 * @apiParam {String} token Token
 * @apiParam {String} nikeName 昵称
 * @apiParam {String} mail 邮箱
 * @apiParam {String} phone 手机号
 * @apiParam {String} avatar 头像url
 *
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
 *          "errCode": "USERNAME_PASSWORD_MISMATCH",
 *          "data": null
 *      }
 * */
router.get('/modify/info',checkUserLogin(withoutAdmin),(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        nikeName:null,
        mail:null,
        phone:null,
        avatar:null
    },['token']);
},
    (req,res,next)=>{
        const _getDate = req.query;
        const token = _getDate.token;
        const nikeName = _getDate.nikeName;
        const mail = _getDate.mail;
        const phone = _getDate.phone;

        let newUserInfo = {
            nikeName: nikeName,
            mail: mail,
            phone: phone
        };

        for(let key in newUserInfo){
            if(newUserInfo[key] == null){
                delete newUserInfo[key];
            }
        }

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
            .then((user_id)=>{
                if(user_id === undefined)
                    return;
                UserModel.modifyInfo(user_id,newUserInfo)
                    .then((result)=>{
                        res.json(new ResData(1,0));
                        return;
                    })
                    .catch((e)=>{
                        res.json(new ResData(0,753,e.toString()));
                        return;
                    });
            })
            .catch((e)=>{
                res.json(new ResData(0,804,e.toString()));
                return;
            });
});


module.exports = router;
