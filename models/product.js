/**
 * Created by joseph on 16/12/14.
 */
var Product = require('../middlewares/mongo').product;

module.exports = {
    //添加
    create: function create(product) {
        return Product.create(product).exec();
    },
    //TODO:获取所有产品

    //按分类取出所有产品
    getProductByType: function getProductByType(type) {
        return Product.find({tag:type}).exec();
    },
    //按公司取出所有产品
    getProductByCompany: function getProductByCompany(companyName) {
        return Product.find({companyName:companyName}).exec();
    },
    //修改://name,tag,argc,desc,images
    modify: function modify(id,name,tag,argc,desc,images) {
        return Product.update({"_id" : id},{$set:{name:name,tag:tag,argc:argc,
            desc:desc,images:images}}).exec();
    },
    //删除
    deleteRecord: function deleteRecord(id) {
        return Product.remove({"_id" : id}).exec();
    },
    //设置上线／下线
    modifyOnline: function modifyOnline(id,online) {
        return Product.update({"_id" : id},{$set:{isOnline:online}}).exec();
    }

};
