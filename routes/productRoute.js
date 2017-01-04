/**
 * Created by joseph on 16/12/14.
 */
const express = require('express');
const router = express.Router();
const url = require('url');

const ProductModel = require('../models/product');
const ResData = require('../models/res');
const checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;
const checkAdminLogin = require('../middlewares/check').checkAdminLogin;

const TokenModel = require('../models/token');
const JF = require('../middlewares/JsonFilter');
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

//1.添加产品
/**
 * @api {POST} /product/add 添加产品信息
 * @apiName product_add
 * @apiGroup Product
 *
 * @apiParam {String} token Token *
 * @apiParam {String} name 产品名称 *
 * @apiParam {String} tag 标签 9大类 * CM汽车制作，CG汽车零部件，CS汽车销售与服务，NEC新能源汽车，NOC车联网，CC车用化工品，CE汽车金融，PT公共交通，MOC汽车媒体
 * @apiParam {String} argc 参数
 * @apiParam {String} desc 介绍
 * @apiParam {Array} images 产品图片URL数组 *
 * @apiParam {String} releaseDate 预计发布日期
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
        name: null,//产品名称 *
        tag: null,//标签 同企业type *
        scoreArgc:[],
        argc: '',//参数
        desc: '',//介绍
        images: [],//File[] *
        releaseDate:'',//预计发布日期
        model:null,//型号
        version:null//版本
    },['token','name','tag','images','scoreArgc']);
},
    function (req,res,next) {

        const _postData = req.fields;
        if(_postData.scoreArgc.constructor !== Array )
            res.json(new ResData(0,101));
        if(_postData.images.constructor !== Array)
            res.json(new ResData(0,101));

        TokenModel.findUser(_postData.token)
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
            .then((user_id)=>{
                if(user_id === undefined)
                    return;
                let product = _postData;
                delete product.token;
                product.state = true;
                product.timestamp = new Date().getTime();
                product.companyId = user_id;
                product.publicReport = [];
                product.privateReport = [];
                return Promise.resolve(product);
            })
            .then((product)=>{
                if(product === undefined)
                    return;
                ProductModel.create(product)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,716,e.toString()));
                    });
            });
});



//2.条件获取产品列表
/**
 * @api {GET} /product/list/:numPerPage/:pageNum 根据条件获取产品列表
 * @apiName product_getList
 * @apiGroup Product
 *
 * @apiParam {String} numPerPage 每页的数量（URL参数）*
 * @apiParam {String} pageNum 第几页（URL参数）*
 * @apiParam {String} name 产品名称（模糊）
 * @apiParam {String} tag 产品标签（精确）
 * @apiParam {String} argc 产品参数（模糊？精确？）
 * @apiParam {String} desc 产品简述（模糊）
 * @apiParam {boolean} state 产品上下线状态（精确）
 * @apiParam {String} companyId 企业Id
 * @apiParam {String} startTime 添加产品时间搜索起点
 * @apiParam {String} endTime 添加产品时间搜索终点
 * @apiParam {String} releaseStartTime 预计发布时间搜索起点
 * @apiParam {String} endTime 预计发布时间搜索终点
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
 *                      "_id":"58622642c12b98681698ff74",
 *                      "name":"1号产品",
 *                      "tag":"CC",
 *                      "argc":"参数参数",
 *                      "desc":"",
 *                      "images":[
 *                          "http://uploadfile.huiyi8.com/2014/0306/20140306103001972.jpg",
 *                          "http://uploadfile.huiyi8.com/2014/0306/20140306103001972.jpg"
 *                      ],
 *                      "releaseDate":1513036800000,
 *                      "state":true,
 *                      "timestamp":1482827330452,
 *                      "companyId":
 *                      {
 *                          "_id":"585b7d66b6a493e45ea96060",
 *                          "longName":"这是企业名称"
 *                      }
 *                  }
 *              ],
 *              "totalNum":11,
 *              "totalPageNum":11,
 *              "currentPage":1,
 *              "numPerPage":1
 *          }
 *      }
 * */
router.get('/list/:numPerPage/:pageNum',(req,res,next)=>{
    JF(req,res,next,{
        "name" : null,
        "tag" : null,
        "argc" : null,
        "desc" : null,
        "state" : null,
        "companyId" : null,
        startTime:null,
        endTime:null,
        releaseStartTime:null,
        releaseEndTime:null
    },[]);
},
    (req,res,next)=>{
        const _getData = req.query;

        //处理未传入的查询字段
        for(let key in _getData){
            if(_getData[key] == null){
                delete _getData[key];
            }
        }

        let queryString = _getData;

        //处理模糊查询字段
        if(queryString.name != undefined){
            queryString.name = new RegExp(queryString.name);
        }
        if(queryString.tag != undefined){
            queryString.tag = new RegExp(queryString.tag)
        }
        if(queryString.desc != undefined){
            queryString.desc = new RegExp(queryString.desc);
        }
        if(queryString.argc != undefined){
            queryString.argc = new RegExp(queryString.argc);
        }

        //处理boolean类型
        if(queryString.state != undefined && str2bool[queryString.state] !== undefined){
            queryString.state = str2bool[queryString.state];
        }

        //处理时间字段
        let timestamp = {
            "$gte":null,
            "$lte":null
        };
        if(queryString.startTime != undefined){
            timestamp['$gte'] = new Date(moment(queryString.startTime,'YYYY/MM/DD')).getTime();
            delete queryString.startTime;
        }
        if(queryString.endTime != undefined){
            timestamp['$lte'] = new Date(moment(queryString.endTime,'YYYY/MM/DD')).getTime();
            delete queryString.endTime;
        }

        let releaseDate = {
            "$gte":null,
            "$lte":null
        };
        if(queryString.releaseStartTime != undefined){
            releaseDate['$gte'] = new Date(moment(queryString.releaseStartTime,'YYYY/MM/DD')).getTime();
            delete queryString.releaseStartTime;
        }
        if(queryString.releaseEndTime != undefined){
            releaseDate['$lte'] = new Date(moment(queryString.releaseEndTime,'YYYY/MM/DD')).getTime();
            delete queryString.releaseEndTime;
        }

        //处理为空字段
        for(let key in timestamp){
            if(timestamp[key] == null){
                delete timestamp[key];
            }
        }
        for(let key in releaseDate){
            if(releaseDate[key] == null){
                delete releaseDate[key];
            }
        }

        //添加到查询语句
        if (!isEmptyObject(timestamp))
            queryString.timestamp = timestamp;
        if (!isEmptyObject(releaseDate))
            queryString.releaseDate = releaseDate;

        let numPerPage = parseInt(req.params.numPerPage);
        let pageNum = parseInt(req.params.pageNum);

        ProductModel.getList(queryString,numPerPage,pageNum)
            .then((result)=>{
                let responseData={
                    list:result
                };
                return ProductModel.count(queryString)
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
                res.json(new ResData(0,717,e.toString()));
            });
});

//3.获取产品详情
/**
 * @api {GET} /product/detail 获取产品详情
 * @apiName product_getDetail
 * @apiGroup Product
 *
 * @apiParam {String} productId 产品Id
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "callStatus":"SUCCEED",
 *          "errCode":"NO_ERROR",
 *          "data":
 *          {
 *              "_id":"58622642c12b98681698ff74",
 *              "name":"1号产品",
 *              "tag":"CC",
 *              "argc":"参数参数",
 *              "desc":"",
 *              "images":[
 *                  "http://uploadfile.huiyi8.com/2014/0306/20140306103001972.jpg",
 *                  "http://uploadfile.huiyi8.com/2014/0306/20140306103001972.jpg"
 *              ],
 *              "releaseDate":1513036800000,
 *              "state":true,
 *              "timestamp":1482827330452,
 *              "companyId":"585b7d66b6a493e45ea96060"
 *          }
 *      }
 * */
router.get('/detail',(req,res,next)=>{
    JF(req,res,next,{productId:null},['productId']);
},
    (req,res,next)=>{
        const id = req.query.productId;

        ProductModel.getDetail(id)
            .then(function (result) {
                res.json(new ResData(1,0,result));
            })
            .catch(function (e) {
                res.json(new ResData(0,718,e.toString()));
            });
});

//4.设置上线／下线
/**
 * @api {GET} /product/modify/online 更改产品上下线
 * @apiName product_modifyOnlineStatus
 * @apiGroup Product
 *
 * @apiParam {String} token Token
 * @apiParam {String} productId 产品Id
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
        productId:null,
        isOnline:null
    },['token','productId','isOnline']);
},
    function (req,res,next) {
    const token = req.query.token;
    const productId = req.query.productId;
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
            ProductModel.modifyOnline(productId,companyId,isOnline)
                .then(function (result) {
                    res.json(new ResData(1,0));
                })
                .catch(function (e) {
                    res.json(new ResData(0,713,e.toString()));
                });
        });
});

//4.b 管理员设置上下线
router.get('/modify/online/admin',checkAdminLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        productId:null,
        isOnline:null
    },['token','productId','isOnline']);
},(req,res,next)=>{
    ProductModel.modifyOnlineAdmin(productId,isOnline)
        .then(function (result) {
            res.json(new ResData(1,0));
        })
        .catch(function (e) {
            res.json(new ResData(0,713,e.toString()));
        });
})

//5.修改产品
/**
 * @api {POST} /product/modify/detail 修改产品
 * @apiName product_modifyDetail
 * @apiGroup Product
 *
 * @apiParam {String} token Token
 * @apiParam {String} productId 产品Id
 * @apiParam {String} name 产品名称 *
 * @apiParam {String} tag 标签 9大类 * CM汽车制作，CG汽车零部件，CS汽车销售与服务，NEC新能源汽车，NOC车联网，CC车用化工品，CE汽车金融，PT公共交通，MOC汽车媒体
 * @apiParam {String} argc 参数
 * @apiParam {String} desc 介绍
 * @apiParam {Array} images 产品图片URL数组 *
 * @apiParam {String} releaseDate 预计发布日期
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
        productId:null,
        name: null,//产品名称 *
        tag: null,//标签 同企业type *
        argc: '',//参数
        desc: '',//介绍
        images: [],//File[] *
        releaseDate:'',//预计发布日期
        model:null,//型号
        version:null//版本号
    },['token','productId','name','tag','images']);
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
        const productId = _getData.productId;
        delete _getData.productId;

        const product = _getData;
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
                ProductModel.modifyProduct(productId,companyId,product)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,719,e.toString()));
                    });
            });
});

//6.删除产品
/**
 * @api {GET} /product/delete 删除产品
 * @apiName product_delete
 * @apiGroup Product
 *
 * @apiParam {String} token Token
 * @apiParam {String} productId 产品Id
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
            productId:null,
        },['token','productId']);
    },
    function (req,res,next) {
        const token = req.query.token;
        const productId = req.query.productId;

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
                ProductModel.deleteRecord(productId,companyId)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,720,e.toString()));
                    });
            });
    });


module.exports = router;