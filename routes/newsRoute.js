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
 * @apiParam {String} companyId 企业ID
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
        // companyId:null,
        tag:'',
        desc:null,
        pic:null,
        wysiwyg:null
    },['title','isFirst','desc','pic','wysiwyg']);
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
 * @api {GET} /news/list 根据条件获取资讯列表
 * @apiName news_getList
 * @apiGroup News
 *
 * @apiParam {String} title 标题（模糊）
 * @apiParam {String} author 作者（模糊）
 * @apiParam {String} isFirst 是否原创匹配条件（精确）
 * @apiParam {String} tag 根据标签匹配条件（精确）
 * @apiParam {String} isOnline 根据是否上线匹配条件（精确）
 * */
router.get('/list',(req,res,next)=>{
    let data = req.query;

    let query={};

    if(data.title){
        query.title = data.title;
    }
    if(data.author){
        query.author = data.author;
    }
    if(data.isFirst){
        query.isFirst = data.isFirst;
    }
    if(data.tag){
        query.tag = data.tag;
    }
    if(data.isOnline){
        query.isOnline = data.isOnline;
    }

    NewsModel.getlist(query)
        .then((result)=>{
            res.json(new ResData(1,0,result));
        })
        .catch((e)=>{
            res.json(new ResData(0,706,e.toString()));
        });

});


//2.根据分类获取资讯(不显示详情)
// router.get('/getNewsByField',checkCompanyLogin,function (req,res,next) {
//     var tag = url.parse(req.url,true).query.tag;
//
//     NewsModel.getNewsByField(tag)
//         .then(function (result) {
//             resData = new ResData();
//             resData.setIsSuccess(1);
//             resData.setData(result);
//             res.send(JSON.stringify(resData));
//         })
//         .catch(next);
// });
//
// //3.根据公司获取资讯(不显示详情)
// router.get('/getNewsByCompany',checkCompanyLogin,function (req,res,next) {
//     var company = url.parse(req.url,true).query.company;
//
//     NewsModel.getNewsByCompany(company)
//         .then(function (result) {
//             resData = new ResData();
//             resData.setIsSuccess(1);
//             resData.setData(result);
//             res.send(JSON.stringify(resData));
//         })
//         .catch(next);
// });

//4.获取资讯详情
router.get('/getNewsById',checkCompanyLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;

    NewsModel.getNewsById(id)
        .then(function (result) {
            resData = new ResData();
            resData.setData(result);
            resData.setIsSuccess(1);
            // res.send(JSON.stringify(resData));
            res.send(resData.data.wysiwyg);
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("error");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});

//5.设置上线／下线
router.get('/modifyOnline',checkCompanyLogin,function (req,res,next) {
    var urlQuery = url.parse(req.url,true).query;

    NewsModel.modifyOnline(urlQuery.id,urlQuery.type)
        .then(function (result) {
            resData = new ResData();
            resData.setData("modify onLine");
            resData.setIsSuccess(1);
            res.send(JSON.stringify(resData));
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("error");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});

//6.修改资讯
router.post('/modify',checkCompanyLogin,function (req,res,next) {
    //提交post表单修改：title,author,isFirst,tag,desc,pic,wysiwyg
    var postFields = req.fields;

    NewsModel.modify(postFields.id,postFields.title,postFields.author,postFields.isFirst,
        postFields.tag,postFields.desc,req.files.pic.path.split('/').pop(),postFields.wysiwyg)
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

//7.删除资讯
router.get('/delete',checkCompanyLogin,function (req,res,next) {
    var id = url.parse(req.url,true).query.id;

    NewsModel.deleteRecord(id)
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

module.exports = router;