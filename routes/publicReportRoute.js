/**
 * Created by joseph on 16/12/14.
 */
const express = require('express');
const router = express.Router();
const url = require('url');

const PubReportModel = require('../models/publicReport');
const ResData = require('../models/res');
const checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;
const checkAdminLogin = require('../middlewares/check').checkAdminLogin;

const TokenModel = require('../models/token');
const JF = require('../middlewares/JsonFilter');
const ProductModel = require('../models/product');
const Mongolass = require('mongolass');
const moment = require('moment');


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

//1.添加测评
/**
 * @api {POST} /report/public/add 添加专业测评
 * @apiName publicReport_add
 * @apiGroup Public Report
 *
 * @apiParam {String} token Token
 * @apiParam {String} productId 产品id *
 * @apiParam {String} testDesc 测评简述
 * @apiParam {String} date 测评时间 (YYYY-MM-DD)
 * @apiParam {String} team 测评团队 *
 * @apiParam {String} site 测评地址
 * @apiParam {String} report 报告URL *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "SUCCEED",
 *          "errCode": "NO_ERROR",
 *          "data": null
 *      }
 * */
router.post('/add',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        productId:null,
        testDesc:'',
        date:'',
        team:null,
        site:'',
        report:null
    },['token','productId','team','report']);
},
    function (req,res,next) {
    const token = req.fields.token;
    delete req.fields.token;

    let report = req.fields;
    report.isOnline = true;
    report.productId = Mongolass.Types.ObjectId(report.productId);
    report.date = (report.date === '')
                    ? 0
                    : (new Date(moment(report.date,'YYYY/MM/DD')).getTime());

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
            return PubReportModel.create(report)
                .then((result)=>{
                return Promise.resolve({'reportId':result.ops[0]._id,'companyId':companyId});
                })
                .catch((e)=>{
                    res.json(new ResData(0,722,e.toString()));
                    return Promise.resolve(undefined);
                });
        })
        .then((data)=>{
            if(data === undefined) return;
            return ProductModel.pushPublicReport(report.productId,data.companyId,data.reportId)
                .then((result)=>{
                    res.json(new ResData(1,0));
                    return Promise.resolve();
                })
                .catch((e)=>{
                    return Promise.reject({msg:e.toString(),reportId:data.reportId,companyd:data.companyId});
                });
        })
        .catch((e)=>{
            PubReportModel.delete(e.reportId,e.companyId)
                .then((result)=>{
                    res.json(new ResData(0,722,e.msg));
                })
                .catch((e)=>{
                    res.json(new ResData(0,723,e.toString()))
                });
        });
});

//2.取出专业评测列表
/**
 * @api {GET} /report/public/list/:numPerPage/:pageNum 按条件取出专业评测列表
 * @apiName publicReport_getList
 * @apiGroup Public Report
 *
 * @apiParam {String} numPerPage 每页的数量（URL参数）*
 * @apiParam {String} pageNum 第几页（URL参数）*
 * @apiParam {String} productId 产品Id（精准）
 * @apiParam {String} testDesc 简述内容（模糊）
 * @apiParam {String} dateStart 日期开始时间 YYYY-MM-DD
 * @apiParam {String} dateEnd 日期结束时间 YYYY-MM-DD
 * @apiParam {String} team 测评团队（模糊）
 * @apiParam {String} site 测评地点（模糊）
 * @apiParam {Boolean} isOnline 是否上线
 * @apiParam {String} companyId 企业Id（精准）
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
 *                      "_id":"5863766370decc9c448dca75",
 *                      "productId":
 *                      {
 *                          "_id":"58633f9f7a4e508a7fae7802",
 *                          "name":"4号产品"
 *                      },
 *                      "testDesc":"测评简述",
 *                      "date":0,
 *                      "team":"专业测评团队1",
 *                      "site":"上海",
 *                      "report":"http://127.0.0.1:3300/Files/upload_151924ed0d1939946dbfe61395f69fb2.pdf",
 *                      "isOnline":true,
 *                      "companyId":
 *                      {
 *                          "_id":"585b7d66b6a493e45ea96060",
 *                          "longName":"这是企业名称"
 *                      }
 *                  }
 *              ],
 *              "totalNum":2,
 *              "totalPageNum":2,
 *              "currentPage":1,
 *              "numPerPage":1
 *          }
 *      }
 * */
router.get('/list/:numPerPage/:pageNum',(req,res,next)=>{
    JF(req,res,next,{
        productId:null,
        testDesc:null,
        dateStart:null,
        dateEnd:null,
        team:null,
        site:null,
        isOnline:null,
        companyId:null
    },[]);
},
    function (req,res,next) {
    const _getData = req.query;

    //处理未传入的查询字段
    for(let key in _getData){
        if(_getData[key] == null){
            delete _getData[key];
        }
    }

    let queryString = _getData;

    //处理模糊查询字段
    if(queryString.testDesc != undefined){
        queryString.testDesc = new RegExp(queryString.testDesc);
    }
    if(queryString.team != undefined){
        queryString.team = new RegExp(queryString.team)
    }
    if(queryString.site != undefined){
        queryString.site = new RegExp(queryString.site);
    }

    //处理boolean类型
    if(queryString.isOnline != undefined && str2bool[queryString.isOnline] !== undefined){
        queryString.isOnline = str2bool[queryString.isOnline];
    }

    //处理时间字段
    let date = {
        "$gte":null,
        "$lte":null
    };
    if(queryString.dateStart != undefined){
        date['$gte'] = new Date(moment(queryString.dateStart,'YYYY/MM/DD')).getTime();
        delete queryString.dateStart;
    }
    if(queryString.dateEnd != undefined){
        date['$lte'] = new Date(moment(queryString.dateEnd,'YYYY/MM/DD')).getTime();
        delete queryString.dateEnd;
    }

    //处理为空字段
    for(let key in date){
        if(date[key] == null){
            delete date[key];
        }
    }

    //添加到查询语句
    if (!isEmptyObject(date))
        queryString.date = date;

    let numPerPage = parseInt(req.params.numPerPage);
    let pageNum = parseInt(req.params.pageNum);

    PubReportModel.getList(queryString,numPerPage,pageNum)
        .then((result)=>{
            let responseData={
                list:result
            };
            return PubReportModel.count(queryString)
                .then((result)=>{
                    responseData.totalNum=result;
                    responseData.totalPageNum=Math.ceil(result/numPerPage);
                    responseData.currentPage=pageNum;
                    responseData.numPerPage=numPerPage;
                    if(responseData.totalPageNum==0)
                        responseData.totalPageNum=1;
                    res.json(new ResData(1,0,responseData));
                    return Promise.resolve();
                })
                .catch((e)=>{
                    return Promise.reject(e);
                });
        })
        .catch((e)=>{
            res.json(new ResData(0,724,e.toString()));
        });
});

//3.获取单个测评详情
/**
 * @api {GET} /report/public/detail 获取单个测评详情
 * @apiName publicReport_getDetail
 * @apiGroup Public Report
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

    PubReportModel.getDetail(id)
        .then(r=>{
            res.json(new ResData(1,0,r));
        })
        .catch(e=>{
            res.json(new ResData(0,737,e.toString()));
        });
});

//4.设置上线／下线 #
/**
 * @api {GET} /report/public/modify/online 设置测评上下线
 * @apiName publicReport_modifyOnline
 * @apiGroup Public Report
 *
 * @apiParam {String} token Token
 * @apiParam {String} reportId 测评Id
 * @apiParam {Boolean} isOnline 是否上线 true上线 false下线
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "SUCCEED",
 *          "errCode": "NO_ERROR",
 *          "data": null
 *      }
 * */
router.get('/modify/online',checkCompanyLogin,(req,res,next)=>{
        JF(req,res,next,{
            token:null,
            reportId:null,
            isOnline:null
        },['token','reportId','isOnline']);
    },
    function (req,res,next) {
        const token = req.query.token;
        const reportId = req.query.reportId;
        if(str2bool[req.query.isOnline] === undefined){
            res.json(new ResData(0,101));
            return;
        }
        const isOnline = str2bool[req.query.isOnline];

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
                return;
            })
            .then((companyId)=>{
                if(companyId === undefined)
                    return;
                PubReportModel.modifyOnline(reportId,companyId,isOnline)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,725,e.toString()));
                    });
            });
    });

//4.b 管理员设置上下线
/**
 * @api {GET} /report/public/modify/online/admin 设置测评上下线(管理员用)
 * @apiName publicReport_modifyOnlineAdmin
 * @apiGroup Public Report
 *
 * @apiParam {String} token Token
 * @apiParam {String} reportId 测评Id
 * @apiParam {Boolean} isOnline 是否上线 true上线 false下线
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "SUCCEED",
 *          "errCode": "NO_ERROR",
 *          "data": null
 *      }
 * */
router.get('/modify/online/admin',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
            token:null,
            reportId:null,
            isOnline:null
        },['token','reportId','isOnline']);
},(req,res,next)=>{
    const token = req.query.token;
        const reportId = req.query.reportId;
        if(str2bool[req.query.isOnline] === undefined){
            res.json(new ResData(0,101));
            return;
        }
        const isOnline = str2bool[req.query.isOnline];

    PubReportModel.modifyOnlineAdmin(reportId,isOnline)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,725,e.toString()));
                    });
});

//5.修改测评
/**
 * @api {POST} /report/public/modify/detail 修改评测详情
 * @apiName publicReport_modifyDetail
 * @apiGroup Public Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评Id *
 * @apiParam {String} testDesc 测评简述
 * @apiParam {String} date 测评时间 (YYYY-MM-DD)
 * @apiParam {String} team 测评团队 *
 * @apiParam {String} site 测评地址
 * @apiParam {String} report 报告URL *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "SUCCEED",
 *          "errCode": "NO_ERROR",
 *          "data": null
 *      }
 * */
router.post('/modify/detail',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null,
        testDesc:null,
        date:null,
        team:null,
        site:null,
        report:null
    },['token','reportId','team','report']);
},
    function (req,res,next) {
    let _getData = req.fields;
    //处理未传入的查询字段
    for(let key in _getData){
        if(_getData[key] == null){
            delete _getData[key];
        }
    }
    const token = _getData.token;
    delete _getData.token;
    const reportId = _getData.reportId;
    delete _getData.reportId;

    const report = _getData;
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
            return;
        })
        .then((companyId)=>{
            if(companyId === undefined)
                return;
            PubReportModel.modifyDetail(reportId,companyId,report)
                .then(function (result) {
                    res.json(new ResData(1,0));
                })
                .catch(function (e) {
                    res.json(new ResData(0,726,e.toString()));
                });
        });
});

//6.删除测评信息
/**
 * @api {GET} /report/public/delete 删除测评
 * @apiName publicReport_delete
 * @apiGroup Public Report
 *
 * @apiParam {String} token Token *
 * @apiParam {String} reportId 测评Id *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus": "SUCCEED",
 *          "errCode": "NO_ERROR",
 *          "data": null
 *      }
 * */
router.get('/delete',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        reportId:null,
    },['token','reportId']);
},
    function (req,res,next) {
        const token = req.query.token;
        const reportId = req.query.reportId;

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
                return;
            })
            .then((companyId)=>{
                if(companyId === undefined)
                    return;
                return PubReportModel.getDetail(reportId)
                    .then((result)=>{
                        return Promise.resolve({'productId':result.productId,'companyId':companyId});
                    })
                    .catch((e)=>{
                        res.json(new ResData(0,728,e.toString()));
                        return Promise.resolve(undefined);
                    });
            })
            .then((data)=>{
                if(data === undefined) return;
                return ProductModel.pullPublicReport(data.productId,data.companyId,reportId)
                    .then((result)=>{
                        return Promise.resolve(data.companyId);
                    })
                    .catch((e)=>{
                        res.json(new ResData(0,727,e.toString()));
                        return Promise.resolve(undefined);
                    });
            })
            .then((companyId)=>{
                if(companyId === undefined) return;
                PubReportModel.delete(reportId,companyId)
                    .then((result)=>{
                        res.json(new ResData(1,0));
                    })
                    .catch((e)=>{
                        res.json(new ResData(0,727,e.toString()));
                    });
            });
});


module.exports = router;