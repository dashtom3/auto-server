/**
 * Created by joseph on 16/12/12.
 */
var News = require('../middlewares/mongo').News;

module.exports = {
    //添加
    create: function create(News) {
        return News.create(News).exec();
    },
    //按分类取出所有资讯
    getNewsByField: function getNewsList(field) {
        return News.find({tag:field},{wysiwyg:0}).exec();
    },
    //按公司取出所有资讯
    getNewsByCompany: function getNewsByCompany(name) {
        return News.find({company:name},{wysiwyg:0}).exec();
    },
    //根据ID查找资讯
    getNewsById: function getNewsById(id) {
        return News.findOne({"_id" : ObjectId(id)}).exec();
    },
    //设置上线／下线
    modifyOnline: function modifyOnline(id,NewsType) {
        return News.update({"_id" : ObjectId(id)},{$set:{isOnline:NewsType}}).exec();
    },
    //修改:title,author,isFirst,tag,desc,pic,wysiwyg
    modify: function modify(id,title,author,isFirst,tag,desc,pic,wysiwyg) {
        return News.update({"_id" : ObjectId(id)},{$set:{title:title,author:author,
            isFirst:isFirst,tag:tag,desc:desc,pic:pic,wysiwyg:wysiwyg}}).exec();
    },
    //删除
    deleteRecord: function deleteRecord(id) {
        return News.remove({"_id" : ObjectId(id)}).exec();
    }


};