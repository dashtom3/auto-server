/**
 * Created by JayZhu on 19/12/12.
 */
var Image = require('../middlewares/mongo').Image;

module.exports = {

    //添加
    create : (image)=>{
        return Image.create(image).exec();
    },

    //获取所有图片
    findAll : ()=>{
        return Image.find({}).exec();
    },

    //FIXME:需要更新的接口吗，更新什么？
    // update :

    //删除图片，修改isDeleted，不做实际删除
    delete : (id)=>{
        return Image.update({"_id" : id},{$set:{isDeleted:true}}).exec();
    }
}
