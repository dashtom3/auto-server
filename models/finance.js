/**
 * Created by joseph on 16/12/12.
 */
var Finance = require('../middlewares/mongo').Finances;

module.exports = {
    //添加
    create: function create(finance) {
        return Finance.create(finance).exec();
    },
    //根据companyName获取该公司所有财务列表
    getFinanceList: function getFinanceList(name) {
        return Finance.find({companyName:name}).exec();
    },
    //根据companyName、year获取该公司该年财务列表
    getFinance: function getFinance(name,year) {
        return Finance.findOne({companyName:name,year:year}).exec();
    },
    //修改：ratio,input,increase,allCapital,realCapital,allRatio,realRatio,debtRatio,inputRatio
    modify: function modify(name,year,ratio,input,increase,allCapital,realCapital,allRatio,realRatio,debtRatio,inputRatio) {
        return Finance.update({companyName:name,year:year},{$set:{ratio:ratio,input:input,increase:increase,allCapital:allCapital,realCapital:realCapital,allRatio:allRatio,realRatio:realRatio,debtRatio:debtRatio,inputRatio:inputRatio}}).exec();
    },
    //删除
    deleteRecord: function deleteRecord(name,year) {
        return Finance.remove({companyName:name,year:year}).exec();
    }


};