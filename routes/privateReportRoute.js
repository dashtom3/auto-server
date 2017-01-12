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
const checkValidToken = require('../middlewares/check').checkValidToken;

const TokenModel = require('../models/token');
const UserModle = require('../models/user');
const JF = require('../middlewares/JsonFilter');
const ProductModel = require('../models/product');
const Mongolass = require('mongolass');
const moment = require('moment');
const co = require('co');
const Promise = require('bluebird');

const passedEnum={
    '-1':-1,
    '0':0,
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

function dealWithRegQuery(obj,keyArray){
    for(let key of keyArray){
        if(obj[key] != undefined)
        {
            obj[key] = new RegExp(obj[key]);
        }
    }
}

function dealWithBoolQuery(obj,keyArray){
    for(let key of keyArray){
        if(obj[key] != undefined && str2bool[obj[key]] !== undefined)
        {
            obj[key] = str2bool[obj[key]];
        }
    }
}

function dealWithTimeQuery(obj,keyArray,keyArrayPair){
    for(let n in keyArray){
        obj[keyArray[n]]={
            "$gte":null,
            "$lte":null
        }
        if(obj[keyArrayPair[n*2]] != undefined){
            obj[keyArray[n]]['$gte'] = new Date(moment(obj[keyArrayPair[n*2]],'YYYY/MM/DD')).getTime();
            delete obj[keyArrayPair[n*2]];
        }
        if(obj[keyArrayPair[n*2+1]] != undefined){
            obj[keyArray[n]]['$lte'] = new Date(moment(obj[keyArrayPair[n*2+1]],'YYYY/MM/DD')).getTime();
            delete obj[keyArrayPair[n*2+1]];
        }
        for(let k in obj[keyArray[n]]){
            if(obj[keyArray[n]][k] == null){
                delete obj[keyArray[n]][k];
            }
        }
        if (isEmptyObject(obj[keyArray[n]]))
            delete obj[keyArray[n]];
    }
};

function dealWithNumCompQuery(obj,keyArray,keyArrayPair){
    for(let n in keyArray){
        obj[keyArray[n]]={
            "$gte":null,
            "$lte":null
        }
        if(obj[keyArrayPair[n*2]] != undefined){
            obj[keyArray[n]]['$gte'] = Number.parseFloat(obj[keyArrayPair[n*2]]);
            delete obj[keyArrayPair[n*2]];
        }
        if(obj[keyArrayPair[n*2+1]] != undefined){
            obj[keyArray[n]]['$lte'] = Number.parseFloat(obj[keyArrayPair[n*2+1]]);
            delete obj[keyArrayPair[n*2+1]];
        }
        for(let k in obj[keyArray[n]]){
            if(obj[keyArray[n]][k] == null){
                delete obj[keyArray[n]][k];
            }
        }
        if (isEmptyObject(obj[keyArray[n]]))
            delete obj[keyArray[n]];
    }
}

function dealWithIntQuery(obj,keyArray){
    for(let key of keyArray){
        if(obj[key] != undefined)
        {
            obj[key] = Number.parseInt(obj[key]);
        }
    }
}

function dealWithFloatQuery(obj,keyArray){
    for(let key of keyArray){
        if(obj[key] != undefined)
        {
            obj[key] = Number.parseFloat(obj[key]);
        }
    }
}

function dealWithArrayQuery(obj,keyArray){
    for(let key of keyArray){
        if(obj[key] != undefined)
        {   
            obj[key] = {'$in':obj[key].split(',')};
        }
    }
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
 * @apiParam {String} testDesc 测评描述
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
        images:null,
        testDesc:'暂无',
        _userID:null
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
    report.scores=[];
    report.scoredUserNum=0;
    for(let n in report.argc)
    {
        report.scores.push(0);
    }

    co(function*(){
        report.companyId = req.fields._userID;
        let detail = yield ProductModel.getDetail(report.productId);
        if(detail.privateReport !== undefined){
            res.json(new ResData(0,113));
            return;
        }
        let priRep = yield PriReportModel.create(report);
        const reportId = priRep.ops[0]._id;
        let result = yield ProductModel.pushPrivateReport(report.productId,report.companyId,reportId);
        res.json(new ResData(1,0));
        return;
    })
    .catch(e=>{
        res.json(new ResData(0,729,e.toString()));
    })
});

//2.按条件取出测评列表
/**
 * @api {GET} /report/private/list/:numPerPage/:pageNum 按条件取出测评列表
 * @apiName privateReport_getList
 * @apiGroup Private Report
 *
 * @apiParam {String} productId 产品Id
 * @apiParam {String} title 测评名称
 * @apiParam {String} startDateStart 测评开始日期的开始搜索范围 YYYY-MM-DD
 * @apiParam {String} endDateStart 测评开始日期的结束搜索范围 YYYY-MM-DD
 * @apiParam {String} startDateEnd 测评结束日期的开始搜索范围 YYYY-MM-DD
 * @apiParam {String} endDateEnd 测评结束日期的结束搜索返回 YYYY-MM-DD
 * @apiParam {String} type 测评类型  实地：'local'，邮寄：'mail'
 * @apiParam {String} address 测评地点
 * @apiParam {Number} maxUserNum_Min 报名人数上限的开始搜索范围
 * @apiParam {Number} maxUserNum_Max 报名人数上限的结束搜索范围
 * @apiParam {String[]} argc 测评参数数组 至少一项，逗号隔开
 * @apiParam {Number} state 审核状态 //0:待审核  1:已通过 －1:已被拒 默认0
 * @apiParam {String} signUser 用户Id,可以查这个用户报名的所有测评
 * @apiParam {String} passUser 用户Id,可以查这个用户通过报名的所有测评
 * @apiParam {String} startTime 测评发布日期开始搜索范围 YYYY-MM-DD
 * @apiParam {String} endTime 测评发布日期结束搜索范围 YYYY-MM-DD
 * @apiParam {Boolean} isOnline 上下线状态 ‘true’ or ‘false’
 * @apiParam {String} companyId 公司Id
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":{
 *              "list":[
 *                  {
 *                      "_id":"5870c8bd02479e568e61d529",
 *                      "productId":"58622642c12b98681698ff74",
 *                      "title":"11111111111111111111",
 *                      "dateStart":1482768000000,
 *                      "dateEnd":1484841600000,
 *                      "type":"local","address":"1111",
 *                      "maxUserNum":111,"argc":["11111"],
 *                      "images":[
 *                          "http://123.56.220.72:3300/files/upload_0a36b779fe95b885ba5d8d1984a7b748.png",
 *                          "http://123.56.220.72:3300/files/upload_514737112ad7173aed503c6c2c259e87.png",
 *                          "http://123.56.220.72:3300/files/upload_1f977e84cb6f3629ff7086a051f68d41.png"
 *                      ],
 *                      "state":0,
 *                      "signUser":[],
 *                      "passUser":[],
 *                      "timestamp":1483786429007,
 *                      "isOnline":true,"scores":[0],
 *                      "scoredUserNum":0,
 *                      "companyId":"585b7d66b6a493e45ea96060"
 *                  },
 *                  {
 *                      "_id":"5870ad1102479e568e61d523",
 *                      "productId":"586db978c29f014d6df8e74a",
 *                      "title":"111",
 *                      "dateStart":1484064000000,
 *                      "dateEnd":1484668800000,
 *                      "type":"local",
 *                      "address":"11",
 *                      "maxUserNum":111,
 *                      "argc":["111"],
 *                      "images":[
 *                          "http://123.56.220.72:3300/files/upload_fe26ebc9811b99a580d0e8e146b081ab.jpg"
 *                      ],
 *                      "state":0,
 *                      "signUser":[],
 *                      "passUser":[],
 *                      "timestamp":1483779345093,
 *                      "isOnline":true,
 *                      "scores":[0],
 *                      "scoredUserNum":0,
 *                      "companyId":"585b7d66b6a493e45ea96060"
 *                  },{
 *                      "_id":"5870acf802479e568e61d521",
 *                      "productId":"58622642c12b98681698ff74",
 *                      "title":"111",
 *                      "dateStart":1484064000000,
 *                      "dateEnd":1484668800000,
 *                      "type":"local",
 *                      "address":"111",
 *                      "maxUserNum":11,
 *                      "argc":["1111"],
 *                      "images":[
 *                          "http://123.56.220.72:3300/files/upload_49b1ab79b0f7a624c4680f81acad4a0e.jpg"
 *                      ],
 *                      "state":0,
 *                      "signUser":[],
 *                      "passUser":[],
 *                      "timestamp":1483779320454,
 *                      "isOnline":true,
 *                      "scores":[0],
 *                      "scoredUserNum":0,
 *                      "companyId":"585b7d66b6a493e45ea96060"
 *                  }
 *              ],
 *              "totalNum":8,
 *              "totalPageNum":3,
 *              "currentPage":1,
 *              "numPerPage":3
 *          }
 *      }
 * */
router.get('/list/:numPerPage/:pageNum',(req,res,next)=>{
    JF(req,res,next,{
        productId:null,
        title:null,
        //dateStart
        startDateStart:null,
        endDateStart:null,
        //--dateStart
        //dateEnd
        startDateEnd:null,
        endDateEnd:null,
        //--dateEnd
        type:null,
        address:null,
        //maxUserNum
        maxUserNum_Min:null,
        maxUserNum_Max:null,
        //--maxUserNum
        argc:null,
        state:null,
        signUser:null,
        passUser:null,
        //timestamp
        startTime:null,
        endTime:null,
        //--timestamp
        isOnline:null,
        companyId:null,
    },[]);
},function (req,res,next) {
    const _getData = req.query;

    //处理未传入的查询字段
    for(let key in _getData){
        if(_getData[key] == null){
            delete _getData[key];
        }
    }

    let queryString = _getData;

    //处理模糊查询字段
    dealWithRegQuery(queryString,['title','address',]);

    //处理boolean类型
    dealWithBoolQuery(queryString,['isOnline']);

    //处理数字字段
    dealWithIntQuery(queryString,['state']);

    //处理数字比较类型
    dealWithNumCompQuery(queryString,['maxUserNum'],['maxUserNum_Min','maxUserNum_Max']);

    //处理时间字段
    dealWithTimeQuery(queryString,['dateStart','dateEnd','timestamp'],['startDateStart','endDateStart','startDateEnd','endDateEnd','startTime','endTime']);

    //处理数组字段
    dealWithArrayQuery(queryString,['argc']);

    //处理userSign userPass
    if(queryString.signUser !== undefined){
        queryString['signUser.userId'] = queryString.signUser;
        delete queryString.signUser;
    }
    if(queryString.passUser !== undefined){
        queryString['passUser.userId'] = queryString.passUser;
        delete queryString.passUser;
    }
        
    let numPerPage = parseInt(req.params.numPerPage);
    let pageNum = parseInt(req.params.pageNum);

    co(function *(){
        let list = yield PriReportModel.getList(queryString,numPerPage,pageNum);
        for(let k in list){
            // console.log(list[k].signUser.length);
            list[k].signUserNum = list[k].signUser.length;
            list[k].passUserNum = list[k].passUser.length;
            delete list[k].signUser;
            delete list[k].passUser;
        }
        let responseData={
            list:list
        };
        let count = yield PriReportModel.count(queryString);
        responseData.totalNum=count;
        responseData.totalPageNum=Math.ceil(count/numPerPage);
        responseData.currentPage=pageNum;
        responseData.numPerPage=numPerPage;
        if(responseData.totalPageNum==0)
            responseData.totalPageNum=1;
        res.json(new ResData(1,0,responseData));
    })
    .catch(e=>{
        res.json(new ResData(0,736,e.toString()));
    })
});

//3.修改测评
/**
 * @api {POST} /report/private/modify/detail 修改测评
 * @apiName privateReport_modifyDetail
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评id *
 * @apiParam {String} productId 产品Id 
 * @apiParam {String} title 测评名称 
 * @apiParam {String} dateStart 测评开始日期  YYYY-MM-DD
 * @apiParam {String} dateEnd 测评结束日期  YYYY-MM-DD
 * @apiParam {String} type 测评类型  实地：'local'，邮寄：'mail'
 * @apiParam {String} address 测评地点 type='local'时必填
 * @apiParam {Number} maxUserNum 报名人数上限 
 * @apiParam {String[]} argc 测评参数数组 至少一项 
 * @apiParam {String[]} images 测评图片URL 至少一张 
 * @apiParam {String} testDesc 测评描述
 * 
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.post('/modify/detail',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null,
        title:null,
        dateStart:null,
        dateEnd:null,
        type:null,
        address:null,
        maxUserNum:null,
        argc:null,
        images:null,
        testDesc:null
    },['token','reportId']);
},function (req,res,next) {
    let _postData = req.fields;
    //处理未传入的查询字段
    for(let key in _postData){
        if(_postData[key] == null){
            delete _postData[key];
        }
    }
    const token = _postData.token;
    delete _postData.token;
    const reportId = _postData.reportId;
    delete _postData.reportId;

    if(_postData.type !== undefined && _postData.type !== 'local' && _postData.type !== 'mail'){
        res.json(new ResData(0,101));
        return;
    }
    if(_postData.type !== undefined && typeof _postData.address !== 'string'){
        res.json(new ResData(0,101));
        return;
    }
    if(_postData.type === 'local' && _postData.address.trim() === ''){
        res.json(new ResData(0,101));
        return;
    }
    if(_postData.argc !== undefined){
        if(_postData.argc.constructor !== Array){
            res.json(new ResData(0,101));
            return;
        }
    }

    let report = _postData;
    report.dateStart = new Date(moment(report.dateStart,'YYYY/MM/DD')).getTime();
    report.dateEnd = new Date(moment(report.dateEnd,'YYYY/MM/DD')).getTime();

    // const report = _postData;
    co(function *(){
        const user = yield TokenModel.findUser(token);
        if(user === null){
            res.json(new ResData(0,803));
            return;
        }
        if(isEmptyObject(report)){
            res.json(new ResData(1,0));
            return;
        }else{
            return PriReportModel.modify(reportId,user.linkTo,report)
                                 .then(r=>{
                                     res.json(new ResData(1,0));
                                 })
        }
    })
    .catch(e=>{
        res.json(new ResData(0,735,e.toString()));
    });
});

//4.删除测评信息
/**
 * @api {GET} /report/private/delete 删除测评信息
 * @apiName privateReport_delete
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评id *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.get('/delete',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null
    },['token','reportId']);
},function (req,res,next) {
    const token = req.query.token;
    const reportId = req.query.reportId;

    co(function *(){
        const user = yield TokenModel.findUser(token);
        if(user === null){
            res.json(new ResData(0,803));
            return;
        }
        return PriReportModel.delete(reportId,user.linkTo)
                             .then(r=>{
                                 res.json(new ResData(1,0));
                             });
    })
    .catch(e=>{
        res.json(new ResData(0,803,e.toString()));
    })
});

//5.获取单个测评详情
/**
 * @api {GET} /report/private/detail 获取单个测评详情
 * @apiName privateReport_getDetail
 * @apiGroup Private Report
 *
 * @apiParam {String} reportId 测评id *
 *
 * */
router.get('/detail',(req,res,next)=>{
    JF(req,res,next,{
        reportId:null
    },['reportId']);
},function (req,res,next) {
    var id = req.query.reportId;

    PriReportModel.getDetail(id)
        .then(r=>{
            res.json(new ResData(1,0,r));
        })
        .catch(e=>{
            res.json(new ResData(0,737,e.toString()));
        });
});

//6.用户报名
/**
 * @api {GET} /report/private/sign 用户报名
 * @apiName privateReport_sign
 * @apiGroup Private Report
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
router.get('/sign',checkUserLogin(),(req,res,next)=>{
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
                address:_getData.address,
                timestamp:new Date().getTime()
            })
                .then((result)=>{
                    res.json(new ResData(1,0));
                })
                .catch((e)=>{
                    res.json(new ResData(0,730,e.toString()));
                });
        });
});

//7.审核用户的报名(admin权限)
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

//8用户发表评论
/**
 * @api {POST} /report/private/comment 用户发表评论
 * @apiName privateReport_comment
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评id *
 * @apiParam {String} content 评论内容 *
 * @apiParam {[Number]} score 打分 *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.post('/comment',checkUserLogin(),(req,res,next)=>{
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
        })
        .then(r=>{
            res.json(new ResData(1,0));
        });
    })
    .catch(e =>{
        res.json(new ResData(0,733,e.toString()));
    });
});

//9审核用户评论
/**
 * @api {GET} /report/private/modify/commentpass 审核用户评论
 * @apiName privateReport_commentPass
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评id *
 * @apiParam {String} userId 用户Id *
 * @apiParam {Number} passed 是否通过 1,0,-1
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
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
    co(function *(){
        // let passed = yield PriReportModel.checkCommentPass(_getData.reportId,_getData.userId);
        // if(passed === true){
        //     res.json(new ResData(0,110));
        //     return;
        // }
        PriReportModel
        .passComment(_getData.reportId,_getData.userId,passedEnum[_getData.passed],passed)
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
            res.json(new ResData(0,740,e.toString()));
        })
    })
    .catch(e=>{
        console.log(e);
        res.json(new ResData(0,740,e.toString()));
    });
    
});

//10审核用户测评上下线
/**
 * @api {GET} /report/private/modify/approval 审核用户测评通过
 * @apiName privateReport_modifyApproval
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评id *
 * @apiParam {Number} state 是否通过 1,0,-1
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.get('/modify/approval',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null,
        state:null
    },['token','reportId','state'])
},(req,res,next)=>{
    let reportId = req.query.reportId;
    let approvalStatus = req.query.state;
    const approvalStatusEnum = {
        '-1' : -1,//未通过
        '0' : 0,//未审核
        '1' : 1//已通过
    };
    if(reportId == null
    || approvalStatus == null){
        res.json(new  ResData(0,101,null));
        return;
    }
    if(approvalStatusEnum[approvalStatus] == undefined){
        res.json(new ResData(0,107));
        return;
    }
    PriReportModel.modifyApproval(reportId,approvalStatusEnum[approvalStatus])
    .then(r=>{
        res.json(new ResData(1,0));
    })
    .catch(e=>{
        res.json(new ResData(0,739,e.toString()));
    })
});

//11获取通过的评论
/**
 * @api {GET} /report/private/comment/list 获取通过的评论
 * @apiName privateReport_commentList
 * @apiGroup Private Report
 *
 * @apiParam {String} reportId 测评id *
 *
 * */
router.get('/comment/list',(req,res,next)=>{
    JF(req,res,next,{
        reportId:null
    },['reportId']);
},(req,res,next)=>{
    const reportId = req.query.reportId;
    PriReportModel.getCommentList(reportId)
    .then(r=>{
        res.json(new ResData(1,0,r));
    })
    .catch(e=>{
        res.json(new ResData(0,741,e.toString()));
    })
});

//12获取所有待审核的报名申请
/**
 * @api {GET} /report/private/signlist 获取所有待审核的报名申请
 * @apiName privateReport_signlist
 * @apiGroup Private Report
 *
 * @apiParam {String} reportId 测评id *
 *
 * */
router.get('/signlist',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        reportId:null
    },['reportId']);
},(req,res,next)=>{
    const reportId = req.query.reportId;
    PriReportModel.getSignUserList(reportId)
    .then(r=>{
        res.json(new ResData(1,0,r));
    })
    .catch(e=>{
        res.json(new ResData(0,738,e.toString()));
    })
});

//13获取所有测评中用户
/**
 * @api {GET} /report/private/topasslist 获取所有测评中用户
 * @apiName privateReport_topasslist
 * @apiGroup Private Report
 *
 * @apiParam {String} reportId 测评id *
 *
 * */
router.get('/comment/topasslist',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        reportId:null
    },['reportId']);
},(req,res,next)=>{
    const reportId = req.query.reportId;
    PriReportModel.getCommentToPassList(reportId)
    .then(r=>{
        res.json(new ResData(1,0,r));
    })
    .catch(e=>{
        res.json(new ResData(0,738,e.toString()));
    })
});

//14获取所有被拒绝的评论
/**
 * @api {GET} /report/private/refused 获取所有被拒绝的评论
 * @apiName privateReport_refused
 * @apiGroup Private Report
 *
 * @apiParam {String} reportId 测评id *
 *
 * */
router.get('/refused',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        reportId:null
    },['reportId']);
},(req,res,next)=>{
    const reportId = req.query.reportId;
    co(function *(){
        let signRefusedList = yield PriReportModel.getSignRefusedList(reportId);
        // console.log(signRefusedList);
        let commentRefusedList = yield PriReportModel.getCommentRefusedList(reportId);
        // console.log(commentRefusedList);
        return signRefusedList.concat(commentRefusedList);
    })
    .then(r=>{
        res.json(new ResData(1,0,r));
    })
    .catch(e=>{
        res.json(new ResData(0,999,e))
    })
});

//15.a设置个人测评上下线
/**
 * @api {GET} /report/private/modify/online 更改个人测评上下线
 * @apiName privateReport_modifyisOnline
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评id *
 * @apiParam {Boolean} isOnline 上下线 'true' or 'false'
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.get('/modify/online',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null,
        isOnline:null
    },['token','reportId','isOnline']);
},(req,res,next)=>{
    const companyId = req.fields._userID;
    const isOnline = req.query.isOnline;
    const reportId = req.query.reportId;
    if(str2bool[isOnline] === undefined)
    {
        res.json(new ResData(0,101));
        return;
    }
    PriReportModel.modifyOnline(reportId,companyId,str2bool[isOnline])
    .then(r=>{
        res.json(new ResData(1,0));
    })
    .catch(e=>{
        res.json(new ResData(0,742,e.toString()));
    });
});

//15.b设置个人测评上下线(admin)
/**
 * @api {GET} /report/private/modify/online/admin 更改个人测评上下线(管理员用)
 * @apiName privateReport_modifyisOnlineAdmin
 * @apiGroup Private Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评id *
 * @apiParam {Boolean} isOnline 上下线 'true' or 'false'
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":null
 *      }
 * */
router.get('/modify/online/admin',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null,
        isOnline:null
    },['token','reportId','isOnline']);
},(req,res,next)=>{
    const isOnline = req.query.isOnline;
    const reportId = req.query.reportId;

    if(str2bool[isOnline] === undefined)
    {
        res.json(new ResData(0,101));
        return;
    }

    PriReportModel.modifyOnlineAdmin(reportId,str2bool[isOnline])
    .then(r=>{
        res.json(new ResData(1,0));
    })
    .catch(e=>{
        res.json(new ResData(0,742,e.toString()));
    });
});

//16按条件获取signUser列表
router.get('/signuser/list',checkValidToken,(req,res,next)=>{
    JF(req,res,next,{
        passed:null,
        reportId:null
    },['reportId']);
},(req,res,next)=>{
    const _getData = req.query;
    if(req.fields._type === 'user' || req.fields._type === 'guest'){
        res.sendStatus(403);
        return;
    }
    if(_getData.passed !== null && passedEnum[_getData.passed] === undefined){
        res.json(new ResData(0,101));
        return;
    }
    let passed = (_getData.passed === null) ? null : passedEnum[_getData.passed];
    PriReportModel.getSignUserListV2(_getData.reportId,passed)
    .then(r=>{
        res.json(new ResData(1,0,r));
        return;
    })
    .catch(e=>{
        res.json(new ResData(0,738,e.toString()));
    });
})

//17按条件获取passUser列表
router.get('/passuser/list',checkValidToken,(req,res,next)=>{
    JF(req,res,next,{
        passed:null,
        reportId:null
    },['reportId']);
},(req,res,next)=>{
    const _getData = req.query;
    if(req.fields._type === 'user' || req.fields._type === 'guest'){
        res.sendStatus(403);
        return;
    }
    if(_getData.passed !== null && passedEnum[_getData.passed] === undefined){
        res.json(new ResData(0,101));
        return;
    }
    let passed = (_getData.passed === null) ? null : passedEnum[_getData.passed];
    PriReportModel.getCommentListV2(_getData.reportId,passed)
    .then(r=>{
        res.json(new ResData(1,0,r));
        return;
    })
    .catch(e=>{
        res.json(new ResData(0,741,e.toString()));
    });
})



module.exports = router;
