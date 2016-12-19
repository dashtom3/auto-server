/**
 * Created by JayZhu on 19/12/12.
 */
var Image = require('../middlewares/mongo');

module.exports = {

    //添加
    create : (image)=>{
        return Image.create(image).exec();
    },

    //根据article的_id字段来查询属于它的所有图片
    findByArticleId : (id)=>{
        return Image.find({article_id : id}).exec();
    },

    //FIXME:需要更新的接口吗，更新什么？
    // update :

    //删除图片，修改isDeleted，不做实际删除
    deleteById : (id)=>{
        return Image.update({"_id" : id},{$set:{isDeleted:true}}).exec();
    }
}
