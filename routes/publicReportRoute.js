/**
 * Created by joseph on 16/12/14.
 */
const express = require('express');
const router = express.Router();
const url = require('url');

const PubReportModel = require('../models/publicReport');
const ResData = require('../models/res');
const checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

const path = require('path');
const config = require('config-lite');
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
                });
        })
        .then((data)=>{
            return ProductModel.pushPublicReport(report.productId,data.companyId,data.reportId)
                .then((result)=>{
                    res.json(new ResData(1,0));
                })
                .catch((e)=>{
                    return Promise.reject({msg:e.toString(),reportId:data.reportId});
                });
        })
        .catch((e)=>{
            PubReportModel.delete(e.reportId)
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
 * */
router.get('/list/:numPerPage/:pageNum',checkCompanyLogin,(req,res,next)=>{
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
                })
                .catch((e)=>{
                    return Promise.reject(e);
                });
        })
        .catch((e)=>{
            res.json(new ResData(0,724,e.toString()));
        });
});

// //3.取出专业测评详情
// router.get('/getPubReportByCompany',checkCompanyLogin,function (req,res,next) {
//     var companyName = url.parse(req.url,true).query.companyName;
//
//     PubReportModel.getPubReportByCompany(companyName)
//         .then(function (result) {
//             resData = new ResData();
//             resData.setIsSuccess(1);
//             resData.setData(result);
//             res.send(JSON.stringify(resData));
//         })
//         .catch(next);
// });

//4.设置上线／下线 #
/**
 * @api {GET} /report/public/modify/online 设置测评上下线
 * @apiName publicReport_modifyOnline
 * @apiGroup Public Report
 *
 * @apiParam {String} token Token
 * @apiParam {String} reportId 测评Id
 * @apiParam {Boolean} isOnline 是否上线 true上线 false下线
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