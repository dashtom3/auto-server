/**
 * Created by joseph on 16/12/14.
 */
const Product = require('../middlewares/mongo').product;
Product.plugin('POPULATE', require('mongolass-plugin-populate'));
const Mongolass = require('mongolass');

module.exports = {
    //添加
    create: function create(product) {
        return Product.create(product).exec();
    },
    //条件查询产品列表
    getList: (query,numPerPage,pageNum)=>{
        return Product.find(query)
                      .POPULATE({ path: 'companyId', select:{'longName':1,'logo':1} , model: 'Company' })
                      .POPULATE({ path: 'privateReport', select:{'scores':1,'scoredUserNum':1,'argc':1,'isOnline':1,'state':1} , model: 'privateReport' })
                      .POPULATE({ path: 'publicReport', select:{'report':1,'isOnline':1} , model: 'publicReport' })
                      .select()
                      .skip(numPerPage*(pageNum-1))
                      .limit(numPerPage)
                      .sort({timestamp:-1})
                      .exec();
    },
    //获取总产品数
    count:(query)=>{
        return Product.count(query).exec();
    },
    //获取详情
    getDetail:(id)=>{
        return Product.findOne({_id:id}).POPULATE({ path: 'companyId', select:{'longName':1,'logo':1} , model: 'Company' }).select().exec();
    },
    //按分类取出所有产品
    getProductByType: function getProductByType(type) {
        return Product.find({tag:type}).exec();
    },
    //按公司取出所有产品
    getProductByCompany: function getProductByCompany(companyName) {
        return Product.find({companyName:companyName}).exec();
    },
    //修改://name,tag,argc,desc,images
    modifyProduct: function modify(id,companyId,product) {
        return Product.update({"_id" : id,"companyId":companyId},{$set:product}).exec();
    },
    //删除
    deleteRecord: function deleteRecord(id,companyId) {
        return Product.remove({"_id" : id,"companyId":companyId}).exec();
    },
    //设置上线／下线
    modifyOnline: function modifyOnline(id,companyId,isOnline) {
        return Product.update({"_id" : id,"companyId":companyId},{$set:{state:isOnline}}).exec();
    },
    //管理员设置上线／下线
    modifyOnlineAdmin: function modifyOnline(id,isOnline) {
        return Product.update({"_id" : id},{$set:{state:isOnline}}).exec();
    },
    //添加专业测评
    pushPublicReport:(id,companyId,reportID)=>{
        return Product.update({"_id" : id,'companyId':companyId},{$set:{publicReport:reportID}}).exec();
    },
    //删除专业评测
    pullPublicReport:(id,companyId,reportID)=>{
        return Product.update({"_id" : id,'companyId':companyId},{$unset:{publicReport:''}}).exec();
    },
    //添加个人测评
    pushPrivateReport:(id,companyId,reportID)=>{
        return Product.update({"_id" : id,'companyId':companyId},{$set:{privateReport:reportID}}).exec();
    },
    //删除个人评测
    pullPrivateReport:(id,companyId,reportID)=>{
        return Product.update({"_id" : id,'companyId':companyId},{$unset:{privateReport:''}}).exec();
    }

};
