/**
 * Created by joseph on 16/12/14.
 */
const PriReport = require('../middlewares/mongo').privateReport;

const native = require('./nativeMongodb');

module.exports = {
    //添加
    create: function create(report) {
        return PriReport.create(report).exec();
    },
    //按条件取列表
    getList:(query,numPerPage,pageNum)=>{
        return PriReport.find(query,{'passUser.comment':0}).exec();
    },
    //计数
    count:(query)=>{
        return PriReport.count(query).exec();
    },
    //修改产品信息
    modify: function modify(id,companyId,report) {
        return PriReport.update({
                            "_id" : id,
                            "companyId": companyId
                        },{
                            $set:report
                        })
                        .exec();
    },
    //检查用户是否已经参加了测评
    checkSign: (id,userId)=>{
        return PriReport.count({'_id':id,'signUser.userId':userId}).exec();
    },
    //检查用户是否已经在通过队列中
    checkInPassArray: (id,userId)=>{
        return PriReport.count({'_id':id,'passUser.userId':userId})
                        .exec()
                        .then( n => {
                            if(n === 1){
                                return Promise.resolve(true);
                            }else{
                                return Promise.resolve(false);
                            }
                        });
    },
    //检查用户是否已经通过了审核
    checkPass: (id,userId)=>{
        return PriReport.findOne({
                                    '_id':id,
                                    'signUser.userId':userId
                                },{
                                    'signUser.$':1
                                })
                        .exec()
                        .then( r => {
                            if (r.signUser[0].passed !== 0)
                                return Promise.resolve(true);
                            else {
                                return Promise.resolve(false);
                            }
                        })
    },
    //用户报名参加测评
    sign: function sign(id,userObj) {
        return PriReport.update({"_id" : id},{$push:{signUser:userObj}}).exec();
    },
    //通过用户报名
    pass:native.privateReport.pass,
    //获取评测详情
    getDetail: (id)=>{
        return PriReport.findOne({"_id" : id}).exec();
    },
    //删除
    delete: (id,companyId)=>{
        return PriReport.remove({"_id" : id,"companyId":companyId}).exec();
    },
    //用户发表评论
    makeComment: native.privateReport.makeComment,
    //审核用户评论
    passComment: native.privateReport.passComment

};
