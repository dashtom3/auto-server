/**
 * Created by joseph on 16/12/14.
 */
const Product = require('../middlewares/mongo').product;
Product.plugin('POPULATE', require('mongolass-plugin-populate'));

module.exports = {
    //添加
    create: function create(product) {
        return Product.create(product).exec();
    },
    //条件查询产品列表
    getList: (query,numPerPage,pageNum)=>{
        return Product.find(query).POPULATE({ path: 'companyId', select:{'longName':1} , model: 'Company' }).select().skip(numPerPage*(pageNum-1)).limit(numPerPage).exec();
    },
    //获取总产品数
    count:(query)=>{
        return Product.count(query).exec();
    },
    getDetail:(id)=>{
        return Product.findOne({_id:id}).exec();
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
    }
    //     function modifyOnline(id,companyId,online) {
    //     console.log(id,companyId,online);
    //     return Product.update({"_id" : id,"companyId":companyId},{$set:{isOnline:online}}).exec();
    // }

};
