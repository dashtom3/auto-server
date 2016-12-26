/**
 * Created by joseph on 16/12/12.
 */
var express = require('express');
var router = express.Router();
var url = require('url');

var NewsModel = require('../models/news');
var ResData = require('../models/res');
var checkCompanyLogin = require('../middlewares/check').checkCompanyLogin;

//1.添加信息
router.post('/add',checkCompanyLogin,function (req,res,next) {
    //post表单：title,author,isFirst,isOnline,tag,desc,pic,wysiwyg
    var postFields = req.fields;

    var news = {
        title: postFields.title,
        author: postFields.author,
        isFirst: postFields.isFirst,
        isOnline: "0",
        company: req.session.company.name,
        tag: postFields.tag,
        desc: postFields.desc,
        pic: req.files.pic.path.split('/').pop(),
        wysiwyg: postFields.wysiwyg
    };

    NewsModel.create(news)
        .then(function (result) {
            resData = new ResData();
            // resData.setData(result.ops[0]);
            // resData.setIsSuccess(1);
            // res.send(resData.data.wysiwyg);
            resData.setData("添加成功");
            resData.setIsSuccess(1);
            res.send(resData);
        })
        .catch(function (e) {
            resData = new ResData();
            resData.setData("添加失败");
            resData.setIsSuccess(0);
            res.send(JSON.stringify(resData));
            next(e);
        });
});

/**
 * @api {GET} /news/list 根据条件获取新闻列表
 * @apiName news_getList
 * @apiGroup News
 *
 * @apiParam {String} title 标题匹配条件
 * @apiParam {String} author 作者匹配条件
 * @apiParam {String} isFirst 是否原创匹配条件
 * @apiParam {String} tag 根据标签匹配条件
 * @apiParam {String} isOnline 根据是否上线匹配条件
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
router.get('/getNewsByField',checkCompanyLogin,function (req,res,next) {
    var tag = url.parse(req.url,true).query.tag;

    NewsModel.getNewsByField(tag)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

//3.根据公司获取资讯(不显示详情)
router.get('/getNewsByCompany',checkCompanyLogin,function (req,res,next) {
    var company = url.parse(req.url,true).query.company;

    NewsModel.getNewsByCompany(company)
        .then(function (result) {
            resData = new ResData();
            resData.setIsSuccess(1);
            resData.setData(result);
            res.send(JSON.stringify(resData));
        })
        .catch(next);
});

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