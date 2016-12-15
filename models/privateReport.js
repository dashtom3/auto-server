/**
 * Created by joseph on 16/12/14.
 */
var PriReport = require('../middlewares/mongo').privateReport;

module.exports = {
    //添加
    create: function create(report) {
        return PriReport.create(report).exec();
    },
    //按分类取出所有用户测评
    getPriReportByField: function getPriReportByField(field) {
        return PriReport.find({type:field}).exec();
    },
    //按公司取出所有用户测评
    getPriReportByCompany: function getPriReportByCompany(companyName) {
        return PriReport.find({companyName:companyName}).exec();
    },
    //按状态取出所有用户测评
    getPriReportByState: function getPriReportByState(state) {
        return PriReport.find({state:state}).exec();
    },
    //修改:title,product,type
    modify: function modify(id,title,product,type) {
        return PriReport.update({"_id" : id},{$set:{title:title,product:product,type:type}}).exec();
    },
    //删除
    deleteRecord: function deleteRecord(id) {
        return PriReport.remove({"_id" : id}).exec();
    },
    //用户报名参加测评
    sign: function sign(id,newNum,newName) {
        return PriReport.update({"_id" : id},{$set:{signUserNum:newNum,signUserName:newName}}).exec();
    },
    //通过用户报名
    pass: function modify(id,newNum,newName) {
        return PriReport.update({"_id" : id},{$set:{passUserNum:newNum,passUserName:newName}}).exec();
    },
    //根据id查找信息测评
    getPriReportById: function getPriReportById(id) {
        return PriReport.findOne({"_id" : id}).exec();
    }
    // //设置上线／下线
    // modifyOnline: function modifyOnline(name,PriReportType) {
    //     return PriReport.update({title:name},{$set:{isOnline:PriReportType}}).exec();
    // },

};