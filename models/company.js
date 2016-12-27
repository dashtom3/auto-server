/**
 * Created by joseph on 16/12/9.
 */
const Company = require('../middlewares/mongo').Company;

module.exports = {
    //注册
    create: function create(company) {
        return Company.create(company).exec();
    },
    //按分类取出所有公司信息
    // getCompanyByField: function getCompanyList(field) {
    //     return Company.find({field:field}).exec();
    // },
    //根据name查找公司
    getCompanyByName: function getCompanyByName(name) {
        return Company.findOne({name:name}).exec();
    },
    //根据id查详情
    getDetail: (_id)=>{
        return Company.findOne({_id:_id},{password:0}).exec();
    },
    //查询旧密码
    getOldPassword: (_id)=>{
        return Company.findOne({_id:_id},{password:1}).exec();
    },
    //更改密码
    modifyPassword: function modifyPassword(companyId,newPassword) {
        return Company.update({_id:companyId},{$set:{password:newPassword}}).exec();
    },
    //修改权限
    // modifyType: function modifyType(name,newType) {
    //     return Company.update({name:name},{$set:{type:newType}}).exec();
    // },
    //修改信息：longName,shortName,logo,address,field,regTime,legalEntity,regCapital,regAddress,
    // isNeedCapital,companyDesc,productDesc,userDesc
    modifyInfo: function modify(companyId,newInfo) {
        return Company.update({_id:companyId},{$set:newInfo}).exec();
    },
    //修改审核状态
    modifyApproval : (companyId,isPassed)=>{
        return Company.update({_id:companyId},{$set:{isPassed:isPassed}}).exec();
    },
    //按需查询
    getList : (query,numPerPage,pageNum)=>{
        return Company.find(query).select({password:0}).skip(numPerPage*(pageNum-1)).limit(numPerPage).exec();
    },
    //获取用户数量（query）
    count:(query)=>{
        return Company.count(query).exec();
    },

};