/// <reference path="../typings/index.d.ts" />
/**
 * Created by joseph on 16/12/14.
 */
const express = require('express');
const router = express.Router();
const url = require('url');

const PriReportModel = require('../models/privateReport');
const ResData = require('../models/res');
const checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;
const checkAdminLogin = require('../middlewares/check').checkAdminLogin;
const checkUserLogin = require('../middlewares/check').checkUserLogin;

const TokenModel = require('../models/token');
const UserModle = require('../models/user');
const JF = require('../middlewares/JsonFilter');
const ProductModel = require('../models/product');
const Mongolass = require('mongolass');
const moment = require('moment');
const co = require('co');
const Promise = require('bluebird');

const passedEnum={
    '0':0,
    '-1':-1,
    '1':1
}
const str2bool={
    'true':true,
    'false':false
};
function isEmptyObject(obj){

    for (name in obj){
        return false;
    }
    return true;
}

function getTimeStamp(){
    return new Date().getTime();
}

//1.添加测评
/**
 * @api {POST} /report/private/add 添加个人测评
 * @apiName privateReport_add
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} productId 产品Id *
 * @apiParam {String} title 测评名称 *
 * @apiParam {String} dateStart 测评开始日期 * YYYY-MM-DD
 * @apiParam {String} dateEnd 测评结束日期 * YYYY-MM-DD
 * @apiParam {String} type 测评类型 * 实地：'local'，邮寄：'mail'
 * @apiParam {String} address 测评地点 type='local'时必填
 * @apiParam {Number} maxUserNum 报名人数上限 *
 * @apiParam {String[]} argc 测评参数数组 至少一项 *
 * @apiParam {String[]} images 测评图片URL 至少一张 *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.post('/add',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        productId:null,
        title:null,
        dateStart:null,
        dateEnd:null,
        type:null,
        address:'',
        maxUserNum:null,
        argc:null,
        images:null
    },['token','productId','title','dateStart','dateEnd','type','address','maxUserNum','argc','images'])
},function (req,res,next) {
    const _postData = req.fields;
    const token = _postData.token;
    if(_postData.type !== 'local' && _postData.type !== 'mail'){
        res.json(new ResData(0,101));
        return;
    }
    if(typeof _postData.address !== 'string'){
        res.json(new ResData(0,101));
        return;
    }
    if(_postData.type === 'local' && _postData.address.trim() === ''){
        res.json(new ResData(0,101));
        return;
    }
    if(_postData.argc.constructor !== Array || _postData.images.constructor !== Array){
        res.json(new ResData(0,101));
        return;
    }

    let report = _postData;
    delete report.token;
    report.dateStart = new Date(moment(report.dateStart,'YYYY/MM/DD')).getTime();
    report.dateEnd = new Date(moment(report.dateEnd,'YYYY/MM/DD')).getTime();
    report.state = 0;
    report.signUser = [];
    report.passUser = [];
    report.timestamp = new Date().getTime();
    report.isOnline = true;

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
            res.json(new ResData(0,804,e.toString()));
        })
        .then((companyId)=>{
            if(companyId === undefined) return;
            report.companyId = companyId;
            return PriReportModel.create(report)
                .then((result)=>{
                    return Promise.resolve({'reportId':result.ops[0]._id,'companyId':companyId});
                })
                .catch((e)=>{
                    res.json(new ResData(0,729,e.toString()));
                });
        })
        .then((data)=>{
            return ProductModel.pushPrivateReport(report.productId,data.companyId,data.reportId)
                .then((result)=>{
                    res.json(new ResData(1,0));
                })
                .catch((e)=>{
                    return Promise.reject({msg:e.toString(),reportId:data.reportId,companyId:data.companyId});
                });
        })
        .catch((e)=>{
            PriReportModel.delete(e.reportId,e.companyId)
                .then((result)=>{
                    res.json(new ResData(0,729,e.msg));
                    return;
                })
                .catch((e)=>{
                    res.json(new ResData(0,723,e.toString()));
                });
        });
});

//2.按分类取出所有用户测评
router.get('/getPriReportByField',checkCompanyLogin,function (req,res,next) {
    var type = url.parse(req.url,true).query.type;

    PriReportModel.getPriReportByField(type)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//3.按公司取出所有用户测评
router.get('/getPriReportByCompany',checkCompanyLogin,function (req,res,next) {
    var companyName = url.parse(req.url,true).query.companyName;

    PriReportModel.getPriReportByCompany(companyName)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//4.按状态取出所有用户测评
router.get('/getPriReportByState',checkCompanyLogin,function (req,res,next) {
    var state = url.parse(req.url,true).query.state;

    PriReportModel.getPriReportByState(state)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//5.修改测评
router.get('/modify/detail',checkCompanyLogin,function (req,res,next) {
    //modify?id=xxx&title=xxx&product=xxx&date=xxx
    //可修改：title,product,type
    var urlQuery = url.parse(req.url,true).query;

    PriReportModel.modify(urlQuery.id,urlQuery.title,urlQuery.product,urlQuery.date)
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

//6.删除测评信息
router.get('/delete',checkCompanyLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;

    PriReportModel.deleteRecord(id)
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

//7.获取单个测评详情
router.get('/getPriReportById',checkCompanyLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;

    PriReportModel.getPriReportById(id)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//8.用户报名
/**
 * @api {GET} /report/private/sign 用户报名
 * @apiName privateReport_sign
 * @apiGroup Provate Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评Id *
 * @apiParam {String} phone 联系电话 *
 * @apiParam {String} address 地址 *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.get('/sign',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        reportId:null,
        token:null,
        phone:null,
        address:null
    },['reportId','token','phone','address']);
},function (req,res,next) {
    const _getData = req.query;

    TokenModel.findUser(_getData.token)
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
            res.json(new ResData(0,804,e.toString()));
        })
        .then((userId)=>{
            if(userId === undefined) return;
            return UserModle.checkPassed(userId)
                .then((n)=>{
                    if(n === 0){
                        res.json(new ResData(0,108));
                        return Promise.resolve(undefined);
                    }else{
                        return Promise.resolve(userId);
                    }
                })
                .catch((e)=>{
                    res.json(new ResData(0,731,e.toString()));
                    return Promise.resolve(undefined);
                });
        })
        .then((userId)=>{
            if(userId === undefined) return;
            return PriReportModel.checkSign(_getData.reportId,userId)
                .then((n)=>{
                    if(n > 0){
                        res.json(new ResData(0,109));
                        return Promise.resolve(undefined);
                    }else{
                        return Promise.resolve(userId);
                    }
                })
                .catch((e)=>{
                    res.json(new ResData(0,731,e.toString()));
                    return Promise.resolve(undefined);
                });
        })
        .then((userId)=>{
            if(userId === undefined) return;
            PriReportModel.sign(_getData.reportId,{
                userId:userId,
                passed:0,
                phoneNumber:_getData.phone,
                address:_getData.address
            })
                .then((result)=>{
                    res.json(new ResData(1,0));
                })
                .catch((e)=>{
                    res.json(new ResData(0,730,e.toString()));
                });
        });
});

//9.审核通过用户的报名(admin权限)
/**
 * @api {GET} /report/private/pass 审核用户报名
 * @apiName privateReport_pass
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评Id *
 * @apiParam {String} userId 用户Id *
 * @apiParam {Number} passed 审核状态 * 0未审核 1审核通过 -1审核不通过
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.get('/pass',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null,
        userId:null,
        passed:null
    },['token','reportId','userId','passed']);
},function (req,res,next) {
    let _getData = req.query;
    if(isNaN(parseInt(_getData.passed))
    || (parseInt(_getData.passed) !== -1
    && parseInt(_getData.passed) !== 0
    && parseInt(_getData.passed) !== 1)){
        res.json(new ResData(0,101));
        return;
    }else{
        _getData.passed=parseInt(_getData.passed);
    }
    PriReportModel.checkPass(_getData.reportId,_getData.userId)
        .then((n)=>{
            if(n){
                res.json(new ResData(0,110));
                return Promise.resolve(undefined);
            }else{
                return Promise.resolve(null);
            }
        })
        .then((r)=>{
            if(r === undefined) return;
            return PriReportModel.checkSign(_getData.reportId,_getData.userId)
                .then((n)=>{
                    if(n === 0){
                        res.json(new ResData(0,111));
                        return Promise.resolve(undefined)
                    }else{
                        return Promise.resolve(null);
                    }
                })
                .catch((e)=>{
                    res.json(new ResData(0,731,e.toString()));
                    return Promise.resolve(undefined);
                });
        })
        .then((r)=>{
            if(r === undefined) return;
            PriReportModel.pass(_getData.reportId,_getData.userId,_getData.passed)
                .then((result)=>{
                    console.log(result);
                    res.json(new ResData(1,0));
                })
                .catch((e)=>{
                    res.json(new ResData(0,732,e.toString()));
                });
        })
        .catch((e)=>{
            res.json(new ResData(0,732,e.toString()));
        });
});

//10用户发表评论
router.post('/comment',checkUserLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null,
        content:null,
        score:[]
    },['reportId','token','content','score']);
},(req,res,next)=>{
    let _getData = req.fields;
    co(function *(){
        let user = yield TokenModel.findUser(_getData.token);
        //验证用户
        if(user === null){
            res.json(new ResData(0,803));
            return;
        }
        console.log(user);
        let isPassed = yield PriReportModel.checkInPassArray(_getData.reportId,user.linkTo);
        //验证用户是否通过报名
        console.log(isPassed);
        if(!isPassed){
            res.json(new ResData(0,108));
            return;
        }
        return PriReportModel.makeComment(_getData.reportId,user.linkTo,
        {
            content:_getData.content,
            score:_getData.score,
            timestamp:getTimeStamp(),
            passed:0
        });
    })
    .then(_=>{
        res.json(new ResData(1,0));
    })
    .catch(e =>{
        res.json(new ResData(0,733,e.toString()));
    });
});

//11审核用户评论
router.get('/modify/commentpass',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        userId:null,
        reportId:null,
        passed:null
    },['token','userId','reportId','passed']);
},(req,res,next)=>{
    const _getData = req.query;
    if(passedEnum[_getData.passed] === undefined){
        res.json(new ResData(0,101));
        return;
    }
    PriReportModel
    .passComment(_getData.reportId,_getData.userId,passedEnum[_getData.passed])
    .then(r=>{
        if(r.result.n === 0){
            res.json(new ResData(0,112));
            return;
        }else{
            res.json(new ResData(1,0));
        }
    })
    .catch(e=>{
        console.log(e.toString());
    })
});

//12获取所有待审核的报名申请



module.exports = router;
