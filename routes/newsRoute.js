/**
 * Created by joseph on 16/12/12.
 */
const express = require('express');
const router = express.Router();
const url = require('url');

const NewsModel = require('../models/news');
const ResData = require('../models/res');
const checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

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

//1.添加信息
/**
 * @api {POST} /news/add 添加一条资讯
 * @apiName news_add
 * @apiGroup News
 *
 * @apiParam {String} token Token
 * @apiParam {String} title 资讯标题
 * @apiParam {String} author 作者
 * @apiParam {Boolean} isFirst 是否原创
 * @apiParam {String} tag 资讯标签
 * @apiParam {String} desc 简述
 * @apiParam {String} pic 缩略图URL
 * @apiParam {String} wysiwyg 资讯内容DOM
 * */
router.post('/add',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        title:null,
        author:'',
        isFirst:null,
        tag:'',
        desc:null,
        pic:null,
        wysiwyg:null
    },['token','title','isFirst','desc','pic','wysiwyg']);
},
    function (req,res,next) {
        //post表单：title,author,isFirst,isOnline,tag,desc,pic,wysiwyg
        const _postData = req.fields;
        // news.isOnline = true;
        // news.timestamp = new Date().getTime();

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
            .then((user_id)=>{
                if(user_id === undefined)
                    return;
                let news = _postData;
                delete news.token;
                news.isOnline = true;
                news.timestamp = new Date().getTime();
                news.companyId = user_id;
                return Promise.resolve(news);
            })
            .then((news)=>{
                if(news === undefined)
                    return;
                NewsModel.create(news)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,754,e.toString()));
                    });
            })
            .catch((e)=>{
                res.json(new ResData(0,804,e.toString()));
            });
});

//2.条件获取资讯列表
/**
 * @api {GET} /news/list/:numPerPage/:pageNum 根据条件获取资讯列表
 * @apiName news_getList
 * @apiGroup News
 *
 * @apiParam {String} numPerPage 每页的数量（URL参数）
 * @apiParam {String} pageNum 第几页（URL参数）
 * @apiParam {String} title 标题（模糊）
 * @apiParam {String} author 作者（模糊）
 * @apiParam {String} isFirst 是否原创匹配条件（精确）
 * @apiParam {String} tag 根据标签匹配条件（精确）
 * @apiParam {String} isOnline 根据是否上线匹配条件（精确）
 * @apiParam {String} companyId 企业Id
 * @apiParam {String} startTime 时间搜索起点
 * @apiParam {String} endTime 时间搜索终点
 * */
router.get('/list/:numPerPage/:pageNum',(req,res,next)=>{
    JF(req,res,next,{
        title:null,
        author:null,
        isFirst:null,
        companyId:null,
        tag:null,
        desc:null,
        wysiwyg:null,
        isOnline:null,
        startTime:null,
        endTime:null
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
        if(queryString.title != undefined){
            queryString.title = new RegExp(queryString.title);
        }
        if(queryString.author != undefined){
            queryString.author = new RegExp(queryString.author)
        }
        if(queryString.desc != undefined){
            queryString.desc = new RegExp(queryString.desc);
        }
        if(queryString.wysiwyg != undefined){
            queryString.wysiwyg = new RegExp(queryString.wysiwyg);
        }

        //处理boolean类型

        if(queryString.isFirst != undefined && str2bool[queryString.isFirst] !== undefined){
            queryString.isFirst = str2bool[queryString.isFirst];
        }
        if(queryString.isOnline != undefined && str2bool[queryString.isOnline] !== undefined){
            queryString.isOnline = str2bool[queryString.isOnline];
        }

        //处理时间字段
        let _regTimeUnix = {
            "$gte":null,
            "$lte":null
        };
        if(queryString.startTime != undefined){
            _regTimeUnix['$gte'] = new Date(moment(queryString.startTime,'YYYY/MM/DD')).getTime();
            delete queryString.startTime;
        }
        if(queryString.endTime != undefined){
            _regTimeUnix['$lte'] = new Date(moment(queryString.endTime,'YYYY/MM/DD')).getTime();
            delete queryString.endTime;
        }

        //处理为空字段
        for(let key in _regTimeUnix){
            if(_regTimeUnix[key] == null){
                delete _regTimeUnix[key];
            }
        }

        //添加到查询语句
        if (!isEmptyObject(_regTimeUnix))
            queryString.timestamp = _regTimeUnix;

        let numPerPage = parseInt(req.params.numPerPage);
        let pageNum = parseInt(req.params.pageNum);

        NewsModel.getlist(queryString,numPerPage,pageNum)
            .then((result)=>{
                let responseData={
                    list:result
                };
                return NewsModel.count(queryString)
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
                res.json(new ResData(0,706,e.toString()));
            });
});

//3.获取资讯详情
/**
 * @api {GET} /news/detail 获取资讯详情
 * @apiName news_getDetail
 * @apiGroup News
 *
 * @apiParam {String} newsId 资讯Id
 * */
router.get('/detail',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{newsId : null},['newsId']);
},
    function (req,res,next) {
       const id = req.query.newsId;

        NewsModel.getNewsById(id)
            .then(function (result) {
                res.json(new ResData(1,0,result));
            })
            .catch(function (e) {
                res.json(new ResData(0,712,e.toString()));
            });
});

//4.设置上线／下线
/**
 * @api {GET} /news/modify/online 更改资讯上下线
 * @apiName news_modifyOnlineStatus
 * @apiGroup News
 *
 * @apiParam {String} token Token
 * @apiParam {String} newsId 资讯Id
 * @apiParam {Number} isOnline 是否上线 true上线 false下线
 * */
router.get('/modify/online',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        newsId:null,
        isOnline:null
    },['token','newsId','isOnline']);
},
    function (req,res,next) {
        const token = req.query.token;
        const newsId = req.query.newsId;
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
                NewsModel.modifyOnline(newsId,companyId,isOnline)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,713,e.toString()));
                    });
            });
});

//5.修改资讯
/**
 * @api {POST} /news/modify/detail 修改资讯
 * @apiName news_modifyDetail
 * @apiGroup News
 *
 * @apiParam {String} token Token
 * @apiParam {String} newsId 资讯Id
 * @apiParam {String} title 标题
 * @apiParam {String} author 作者
 * @apiParam {Boolean} isFirst 是否原创
 * @apiParam {String} tag 资讯标签
 * @apiParam {String} desc 简述
 * @apiParam {String} pic 缩略图URL
 * @apiParam {String} wysiwyg 资讯内容DOM
 * */
router.post('/modify/detail',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        newsId:null,
        title:null,
        author:'',
        isFirst:null,
        tag:'',
        desc:null,
        pic:null,
        wysiwyg:null
    },['token','newsId','title','isFirst','desc','pic','wysiwyg']);
},
    function (req,res,next) {
        //提交post表单修改：title,author,isFirst,tag,desc,pic,wysiwyg
        let _getData = req.fields;
        //处理未传入的查询字段
        for(let key in _getData){
            if(_getData[key] == null){
                delete _getData[key];
            }
        }
        const token = _getData.token;
        delete _getData.token;
        const newsId = _getData.newsId;
        delete _getData.newsId;

        const news = _getData;
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
                NewsModel.modifyNews(newsId,companyId,news)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,714,e.toString()));
                    });
            });
});

//6.删除资讯
/**
 * @api {GET} /news/delete 删除资讯
 * @apiName news_delete
 * @apiGroup News
 *
 * @apiParam {String} token Token
 * @apiParam {String} newsId 资讯Id
 * */
router.get('/delete',checkCompanyLogin,(req,res,next)=>{
    JF(req,res,next,{
        token:null,
        newsId:null,
    },['token','newsId']);
},
    function (req,res,next) {
        const token = req.query.token;
        const newsId = req.query.newsId;

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
                NewsModel.deleteRecord(newsId,companyId)
                    .then(function (result) {
                        res.json(new ResData(1,0));
                    })
                    .catch(function (e) {
                        res.json(new ResData(0,715,e.toString()));
                    });
            });
});

module.exports = router;