/**
 * Created by joseph on 16/12/12.
 */
const express = require('express');
const router = express.Router();
const url = require('url');
const crypto = require('crypto');
const secret = 'xjkjpassword';
const moment = require('moment');
const CompanyModel = require('../models/company');
const ResData = require('../models/res');
const Response = require('../models/response');
const checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

const TokenModel = require('../models/token');
const JF = require('../middlewares/JsonFilter');

function isEmptyObject(obj){

    for (name in obj){
        return false;
    }
    return true;
}

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
 * @apiParam {String} type 企业类型  CM汽车制作，CG汽车零部件，CS汽车销售与服务，NEC新能源汽车，NOC车联网，CC车用化工品，CE汽车金融，PT公共交通，MOC汽车媒体
 * @apiParam {String} longName ?
 * @apiParam {String} shortName ?
 * @apiParam {File} logo Logo
 * @apiParam {String} address 地址
 * @apiParam {String} field ?
 * @apiParam {String} regTime 注册时间 格式YYYY/MM/DD
 * @apiParam {String} legalEntity ?
 * @apiParam {String} regCapital 注册资金？
 * @apiParam {String} regAddress ?
 * @apiParam {String} isNeedCapital 是否需要融资?
 * @apiParam {String} companyDesc 公司介绍
 * @apiParam {String} productDesc 产品介绍
 * @apiParam {String} userDesc ?
 * @apiParam {String} phone 联系电话
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
router.post('/signup', function(req, res) {
    //longName,shortName,address,field,regTime,legalEntity,regCapital,regAddress,isNeedCapital,info
    //companyDesc,productDesc,userDesc
    let name = req.fields.name;
    let password=req.fields.password;
    let position=req.fields.position;
    let info=req.fields.info || '';
    let type=req.fields.type;
    let regTime = req.fields.regTime;
    let phone = req.fields.phone;
    let longName = req.fields.longName || '';
    let shortName = req.fields.shortName || "";
    let address = req.fields.address || "";
    let field = req.fields.field || "";
    let legalEntity = req.fields.legalEntity || "";
    let regCapital = req.fields.regCapital || "";
    let regAddress = req.fields.regAddress || "";
    let isNeedCapital = req.fields.isNeedCapital || "";
    let logo = req.fields.logo || "";
    let companyDesc = req.fields.companyDesc || "";
    let productDesc = req.fields.productDesc ||"";
    let userDesc = req.fields.userDesc || "";
    let regTimeUnix = new Date(moment(regTime,'YYYY/MM/DD')).getTime();

    if((name == null)
    || (position == null)
    || (password == null)
    || (type == null)
    || (regTime == null)
    || (regTimeUnix === 'Invalid date')
    || (phone == null)){
        res.json(new ResData(0,101));
        return;
    }




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
        regTimeUnix: regTimeUnix,
        legalEntity: legalEntity,
        regCapital: regCapital,
        regAddress: regAddress,
        isNeedCapital: isNeedCapital,
        companyDesc: companyDesc,
        productDesc: productDesc,
        userDesc: userDesc,
        timestamp: new Date().getTime().toString(),
        isPassed: 0,
        phone: phone
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
router.get('/login',function (req,res) {
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
/**
 * @api {GET} /company/detail 获取企业详细信息
 * @apiName company_getDetail
 * @apiGroup Company
 *
 * @apiParam {String} token Token
 * @apiParam {String} companyId 企业ID
 *
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
 *              "isPassed":-1
 *          }
 *      }
 * @apiErrorExample {json} Error-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "FAILED",
 *          "errCode": "COMPANY_NOT_EXIST",
 *          "data": null
 *      }
 * */
router.get('/detail',checkCompanyLogin,(req,res)=>{
    let companyId = req.query.companyId;

    if(companyId == null){
        res.json(new ResData(0,101));
        return;
    }
    CompanyModel.getDetail(companyId)
        .then((result)=>{
            if(result == null){
                res.json(new ResData(0,105));
            }else{
                res.json(new ResData(1,0,result));
            }
        })
        .catch((e)=>{
            res.json(new ResData(0,703));
        });

});

// router.get('/getCompanyByName',checkCompanyLogin,function (req,res,next) {
//     let name = req.query.name;
//
//     CompanyModel.getCompanyByName(name)
//         .then(function (company) {
//             delete company.password;
//             // resData = new ResData();
//             // resData.setIsSuccess(1);
//             // resData.setData(company);
//             res.send(company);
//         })
//         .catch(next);
// });

//TODO:getlist

//根据分类获取企业信息
/**
 * @api {GET} /company/list/:numPerPage/:pageNum 条件获取企业列表
 * @apiName company_getList
 * @apiGroup Company
 *
 * @apiParam {String} numPerPage 每页条目数量 这是URL参数不要写在?参数里
 * @apiParam {String} pageNum 第几页 这是URL参数不要写在?参数里
 * @apiParam {String} longName 公司名（模糊查询？）
 * @apiParam {String} type 企业类型
 * @apiParam {String} shortName 简称（模糊查询？）
 * @apiParam {String} address 省市
 * @apiParam {String} regTimeFrom 成立时间搜索起点
 * @apiParam {String} regTimeTo 成立时间搜索终点
 * @apiParam {String} legalEntity 法人
 * @apiParam {String} isNeedCapital 是否需要投融资
 * @apiParam {String} isPassed 是否通过投融资
 * */
router.get('/list/:numPerPage/:pageNum',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        longName:null,
        type:null,
        shortName:null,
        address:null,
        regTimeFrom:null,
        regTimeTo:null,
        legalEntity:null,
        isNeedCapital:null,
        isPassed:null
    },[]);
},function (req,res,next) {
    const _getData = req.query;

    for(key in _getData){
        if(_getData[key] == null){
            delete _getData[key];
        }
    }

    let queryString = _getData;

    //处理模糊查询字段
    if(queryString.longName != undefined){
        queryString.longName = new RegExp(queryString.longName);
    }
    if(queryString.shortName != undefined){
        queryString.shortName = new RegExp(queryString.shortName)
    }
    if(queryString.legalEntity != undefined){
        queryString.legalEntity = new RegExp(queryString.legalEntity);
    }

    //处理时间字段
    let _regTimeUnix = {
        "$gte":null,
        "$lte":null
    };
    if(queryString.regTimeFrom != undefined){
        _regTimeUnix['$gte'] = new Date(moment(queryString.regTimeFrom,'YYYY/MM/DD')).getTime();
        delete queryString.regTimeFrom;
    }
    if(queryString.regTimeTo != undefined){
        _regTimeUnix['$lte'] = new Date(moment(queryString.regTimeTo,'YYYY/MM/DD')).getTime();
        delete queryString.regTimeTo;
    }

    //处理为空字段
    for(key in _regTimeUnix){
        if(_regTimeUnix[key] == null){
            delete _regTimeUnix[key];
        }
    }

    //添加到查询语句
    if (!isEmptyObject(_regTimeUnix))
        queryString.regTimeUnix = _regTimeUnix;


    let numPerPage = parseInt(req.params.numPerPage);
    let pageNum = parseInt(req.params.pageNum);

    CompanyModel.getList(queryString,numPerPage,pageNum)
        .then((result)=>{
            res.json(new ResData(1,0,result));
        })
        .catch((e)=>{
            res.json(new ResData(0,707,e.toString()));
        });

    // let field = url.parse(req.url,true).query.field;
    //
    // CompanyModel.getCompanyByField(field)
    //     .then(function (result) {
    //         for(var i=0;i<result.length;i++){
    //             delete result[i].password;
    //         }
    //         resData = new ResData();
    //         resData.setIsSuccess(1);
    //         resData.setData(result);
    //         res.send(JSON.stringify(resData));
    //     })
    //     .catch(next);
});

//更改公司审核状态
/**
 * @api {GET} /company/modify/approval 更改企业审核状态
 * @apiName company_modifyApprovalStatus
 * @apiGroup Company
 *
 * @apiParam {String} token Token
 * @apiParam {String} companyId 企业ID
 * @apiParam {Number} approvalStatus 审核是否通过 0待审核，1审核通过，-1未通过
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
 *          "errCode": "MODIFY_APPROVAL_FAILED",
 *          "data": null
 *      }
 * */
router.get('/modify/approval',checkCompanyLogin,(req,res)=>{
    let companyId = req.query.companyId;
    let approvalStatus = req.query.approvalStatus;
    const approvalStatusEnum = {
        '-1' : -1,//未通过
        '0' : 0,//未审核
        '1' : 1//已通过
    };
    if(companyId == null
    || approvalStatus == null){
        res.json(new  ResData(0,101,null));
        return;
    }
    if(approvalStatusEnum[approvalStatus] == undefined){
        res.json(new ResData(0,107));
        return;
    }
    CompanyModel.modifyApproval(companyId,approvalStatusEnum[approvalStatus])
        .then((result)=>{
            if(result.result.n == 0){
                res.json(new ResData(0,105));
            }else if(result.result.nModified == 0){
                res.json(new ResData(1,201));
            }else{
                res.json(new ResData(1,0));
            }
        })
        .catch((e)=>{
            res.json(new ResData(0,702));
        });
});

//审核&修改企业权限
// router.get('/modifyType',checkCompanyLogin,function (req,res,next) {
//     var newType=url.parse(req.url,true).query.newType;
//     company=req.session.company;
//     company.type=newType;
//
//     CompanyModel.modifyType(company.name,newType)
//         .then(function (result) {
//             var resData = new ResData();
//             resData.setData("modify succeff");
//             resData.setIsSuccess(1);
//             res.send(JSON.stringify(resData));
//         })
//         .catch(function (e) {
//             var resData = new ResData();
//             resData.setData("modify error");
//             resData.setIsSuccess(0);
//             res.send(JSON.stringify(resData));
//         });
// });

//修改密码
/**
 * @api {GET} /company/modify/password 更改企业用户密码
 * @apiName company_modifyPassword
 * @apiGroup Company
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
router.get('/modify/password',checkCompanyLogin,function (req,res,next) {
    let urlQuery=url.parse(req.url,true).query;
    let oldPassword=urlQuery.oldPassword;
    let newPassword=urlQuery.newPassword;
    let token = urlQuery.token;

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
            return CompanyModel.getOldPassword(user_id)
                .then((result)=>{
                    return Promise.resolve(result);
                })
                .catch((e)=>{
                    res.json(new ResData(0,703));
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
            CompanyModel.modifyPassword(result._id,crypto.createHmac('md5', secret).update(newPassword).digest('hex'))
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

//修改企业信息：
/**
 * @api {POST} /company/modify/info 更改企业信息
 * @apiName company_modifyInfo
 * @apiGroup Company
 *
 * @apiParam {String} token Token
 * @apiParam {String} longName 公司名称
 * @apiParam {String} shortName 公司简称
 * @apiParam {String} address 省市id
 * @apiParam {String} field 业务简述
 * @apiParam {String} regTime 成立时间
 * @apiParam {String} legalEntity 法人代表
 * @apiParam {String} regCapital 注册资本
 * @apiParam {String} regAddress 详细地址
 * @apiParam {Boolean} isNeedCapital 有无投融资需求
 * @apiParam {File} logo Logo
 * @apiParam {String} companyDesc 公司简介
 * @apiParam {String} productDesc 产品简介
 * @apiParam {String} userDesc 目标用户简介
 * @apiParam {String} phone 联系方式
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
router.post('/modify/info',checkCompanyLogin,function (req,res,next) {
    const token = req.fields.token;
    let longName=req.fields.longName;
    let shortName = req.fields.shortName;
    let address=req.fields.address;
    let field=req.fields.field;
    let regTime = req.fields.regTime;
    let legalEntity=req.fields.legalEntity;
    let regCapital=req.fields.regCapital;
    let regAddress=req.fields.regAddress;
    let isNeedCapital = req.fields.isNeedCapital;
    let logo=(req.files.logo == undefined)
        ?"":req.files.logo.path.split('/').pop();
    let companyDesc=req.fields.companyDesc;
    let productDesc=req.fields.productDesc;
    let userDesc = req.fields.userDesc;
    let phone = req.fields.phone;

    if(longName == null || longName.trim() == ''
    || shortName == null || shortName.trim() == ''
    || address == undefined//TODO: 省市idEnum[address] == undefined
    || regTime.trim() ==''
    || regAddress.trim() ==''
    || (isNeedCapital !== true && isNeedCapital !== false)
    || phone.trim() == ''){
        res.json(new ResData(0,101));
        return;
    }

    let newCompanyInfo = {
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
        phoen: phone
    };

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
            CompanyModel.modifyInfo(user_id,newCompanyInfo)
                .then((result)=>{
                    res.json(new ResData(1,0));
                    return;
                })
                .catch((e)=>{
                    res.json(new ResData(0,705));
                    return;
                });
        })
        .catch((e)=>{
            res.json(new ResData(0,705));
            return;
        });

});


module.exports = router;
