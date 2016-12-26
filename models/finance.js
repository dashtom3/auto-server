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
    getFinanceList: function getFinanceList(queryString,numPerPage,pageNum) {
        return Finance.find(queryString).skip(numPerPage*(pageNum-1)).limit(numPerPage).exec();
    },
    //根据companyName、year获取该公司该年财务列表
    getFinance: function getFinance(name,year) {
        return Finance.findOne({companyName:name,year:year}).exec();
    },
    //修改：ratio,input,increase,allCapital,realCapital,allRatio,realRatio,debtRatio,inputRatio
    modify: function modify(id,year,ratio,input,increase,allCapital,
                            realCapital,allRatio,realRatio,debtRatio,inputRatio) {
        return Finance.update({"_id" : id},{$set:{year:year,ratio:ratio,
            input:input,increase:increase, allCapital:allCapital,realCapital:realCapital,
            allRatio:allRatio,realRatio:realRatio,debtRatio:debtRatio,inputRatio:inputRatio}}).exec();
    },
    //删除
    deleteRecord: function deleteRecord(id) {
        return Finance.remove({"_id" : id}).exec();
    }


};