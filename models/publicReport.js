/**
 * Created by joseph on 16/12/14.
 */
var PubReport = require('../middlewares/mongo').publicReport;

module.exports = {
    //添加
    create: function create(pubReport) {
        return PubReport.create(pubReport).exec();
    },
    //按是否上线取出所有专业测评
    getPubReportByOnline: function getPubReportByOnline(online) {
        return PubReport.find({isOnline:online}).exec();
    },
    //按公司取出所有专业测评
    getPubReportByCompany: function getPubReportByCompany(companyName) {
        return PubReport.find({companyName:companyName}).exec();
    },
    //修改:productId,productName,date,team,site
    modify: function modify(id,productId,productName,date,team,site) {
        return PubReport.update({"_id" : ObjectId(id)},{$set:{productId:productId,
            productName:productName,date:date,team:team,site:site}}).exec();
    },
    //删除
    deleteRecord: function deleteRecord(id) {
        return PubReport.remove({"_id" : ObjectId(id)}).exec();
    },
    //设置上线／下线
    modifyOnline: function modifyOnline(id,online) {
        return PubReport.update({"_id" : ObjectId(id)},{$set:{isOnline:online}}).exec();
    }

};