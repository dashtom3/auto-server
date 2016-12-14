/**
 * Created by joseph on 16/12/9.
 */
var Company = require('../middlewares/mongo').Company;

module.exports = {
    //注册
    create: function create(company) {
        return Company.create(company).exec();
    },
    //按分类取出所有公司信息
    getCompanyByField: function getCompanyList(field) {
        return Company.find({field:field}).exec();
    },
    //根据name查找公司
    getCompanyByName: function getCompanyByName(name) {
        return Company.findOne({name:name}).exec();
    },
    //修改权限
    modifyType: function modifyType(name,newType) {
        return Company.update({name:name},{$set:{type:newType}}).exec();
    }


};