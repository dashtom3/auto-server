/**
 * Created by joseph on 16/12/12.
 */
const News = require('../middlewares/mongo').News;
News.plugin('POPULATE', require('mongolass-plugin-populate'));

module.exports = {
    //添加
    create: function create(news) {
        return News.create(news).exec();
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
        return News.findOne({"_id" : id}).POPULATE({ path: 'companyId', select:{'longName':1} , model: 'Company' }).exec();
    },
    //设置上线／下线
    modifyOnline: function modifyOnline(id,companyId,isOnline) {
        return News.update({"_id" : id,"companyId":companyId},{$set:{isOnline:isOnline}}).exec();
    },
    //管理员设置上下线
    modifyOnlineAdmin: function modifyOnline(id,isOnline) {
        return News.update({"_id" : id},{$set:{isOnline:isOnline}}).exec();
    },
    //修改:title,author,isFirst,tag,desc,pic,wysiwyg
    modifyNews: function modify(id,companyId,news) {
        return News.update({"_id" : id,"companyId":companyId},{$set:news}).exec();
    },
    //删除ObjectId
    deleteRecord: function deleteRecord(id,companyId) {
        return News.remove({"_id" : id,"companyId":companyId}).exec();
    },
    //获取资讯列表
    getlist: (query,numPerPage,pageNum)=>{
        return News
            .find(query)
            .POPULATE({ path: 'companyId', select:{'longName':1} , model: 'Company' })
            .select({wysiwyg:0})
            .skip(numPerPage*(pageNum-1))
            .limit(numPerPage)
            .sort({timestamp:-1})
            .exec();
    },
    //获取总资讯数
    count:(query)=>{
        return News.count(query).exec();
    },

};