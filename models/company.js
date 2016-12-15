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
    //更改密码
    modifyPassword: function modifyPassword(name,newPassword) {
        return Company.update({name:name},{$set:{password:newPassword}}).exec();
    },
    //修改权限
    modifyType: function modifyType(name,newType) {
        return Company.update({name:name},{$set:{type:newType}}).exec();
    },
    //修改信息：longName,shortName,logo,address,field,regTime,legalEntity,regCapital,regAddress,
    // isNeedCapital,companyDesc,productDesc,userDesc
    modify: function modify(name,longName,shortName,logo,address,field,regTime,legalEntity,
                            regCapital,regAddress,isNeedCapital,companyDesc,productDesc,userDesc) {
        return Company.update({name:name},{$set:{longName:longName,shortName:shortName,logo:logo,
            address:address, field:field,regTime:regTime,legalEntity:legalEntity,regCapital:regCapital,
            regAddress:regAddress,isNeedCapital:isNeedCapital,
            companyDesc:companyDesc,productDesc:productDesc,userDesc:userDesc}}).exec();
    },

};