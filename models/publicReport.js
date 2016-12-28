/**
 * Created by joseph on 16/12/14.
 */
const PubReport = require('../middlewares/mongo').publicReport;
PubReport.plugin('POPULATE', require('mongolass-plugin-populate'));

module.exports = {
    //添加
    create: function create(pubReport) {
        return PubReport.create(pubReport).exec();
    },
    //条件查询产品列表
    getList: (query,numPerPage,pageNum)=>{
        return PubReport
            .find(query)
            .POPULATE({ path: 'companyId', select:{'longName':1} , model: 'Company' })
            .POPULATE({ path: 'productId', select:{'name':1} , model: 'Product' })
            .select()
            .skip(numPerPage*(pageNum-1))
            .limit(numPerPage)
            .exec();
    },
    //获取总产品数
    count:(query)=>{
        return PubReport.count(query).exec();
    },
    //获取详情
    getDetail:(id)=>{
        return PubReport.findOne({_id:id}).exec();
    },
    //按是否上线取出所有专业测评
    getPubReportByOnline: function getPubReportByOnline(online) {
        return PubReport.find({isOnline:online}).exec();
    },
    //按公司取出所有专业测评
    getPubReportByCompany: function getPubReportByCompany(companyName) {
        return PubReport.find({companyName:companyName}).exec();
    },
    //修改
    modifyDetail: function modify(id,companyId,product) {
        return PubReport.update({"_id" : id,"companyId":companyId},{$set:product}).exec();
    },
    //删除
    delete: (id,companyId)=>{
        return PubReport.remove({"_id" : id,"companyId":companyId}).exec();
    },
    //设置上线／下线
    modifyOnline: function modifyOnline(id,companyId,online) {
        return PubReport.update({"_id" : id,"companyId":companyId},{$set:{isOnline:online}}).exec();
    }

};