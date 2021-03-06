/**
 * Created by joseph on 16/12/14.
 */
const PriReport = require('../middlewares/mongo').privateReport;
const Mongolass = require('mongolass');
const native = require('./nativeMongodb');
PriReport.plugin('POPULATE', require('mongolass-plugin-populate'));

module.exports = {
    //添加
    create: function create(report) {
        return PriReport.create(report).exec();
    },
    //按条件取列表
    getList:(query,numPerPage,pageNum)=>{
        return PriReport
            .find(query,{'passUser.comment':0})
            .POPULATE({ path: 'companyId', select:{'longName':1,'logo':1} , model: 'Company' })
            .POPULATE({ path: 'productId', select:{'name':1} , model: 'Product' })
            .skip(numPerPage*(pageNum-1))
            .limit(numPerPage)
            .sort({timestamp:-1})
            .exec();
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
                                return Promise.resolve(false);
                            else {
                                return Promise.resolve(false);
                            }
                        })
    },
    //检查用户评论是否已经通过了审核
    checkCommentPass: (id,userId)=>{
        return PriReport.findOne({
                                    '_id':id,
                                    'passUser.userId':userId
                                },{
                                    'passUser.$':1
                                })
                        .exec()
                        .then( r => {
                            if (r.passUser[0].comment.passed !== 0)
                                return Promise.resolve(true);
                            else {
                                return Promise.resolve(r.passUser[0].comment.score);
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
    passComment: native.privateReport.passComment,
    //获取某评测中所有待审核用户
    getSignUserList: (id)=>{
        // console.log(id);
        return PriReport.aggregate({$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                //    {$project:{'signUser':1,'_id':0}},
                                   {'$unwind':'$signUser'},
                                   {$match:{'signUser.passed':0}},
                                   {$lookup:
                                        {
                                            from:'users',
                                            localField: 'signUser.userId',
                                            foreignField: '_id',
                                            as: 'signUser.userId'
                                        }
                                   },
                                   {$project:{'signUser.address':1,'signUser.phoneNumber':1,'signUser.passed':1,'signUser.userId.name':1,'_id':0}},
                                   {$match:{'signUser.passed':0}})
                        .exec()
    },
    //获取某评测中所有待审核评论和未评论的用户
    getCommentToPassList: (id)=>{
        // console.log(id);
        return PriReport.aggregate({$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                   {'$unwind':'$passUser'},
                                   {$lookup:
                                        {
                                            from:'users',
                                            localField: 'passUser.userId',
                                            foreignField: '_id',
                                            as: 'passUser.userId'
                                        }
                                    },
                                   {$match:{$or:[{'passUser.comment.passed':0},{'passUser.comment':{}}]}},
                                   {$project:{'passUser.comment':1,'passUser.userId.name':1,'signUser.userId.logo':1,'_id':0}},
                                   {$match:{'passUser.comment.passed':0}})
                        .exec()
    },
    //获取某评测中所有通过的评论
    getCommentList: (id)=>{
        // console.log(id);
        return PriReport.aggregate({$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                   {'$unwind':'$passUser'},
                                   {$match:{'passUser.comment.passed':1}},
                                   {$lookup:
                                        {
                                            from:'users',
                                            localField: 'passUser.userId',
                                            foreignField: '_id',
                                            as: 'passUser.userId'
                                        }
                                    },
                                   {$project:{'passUser.comment':1,'passUser.userId.name':1,'_id':0}},
                                   {$project:{'passUser.comment':1,'passUser.userId.name':1,'_id':0}})
                        .exec()
    },
    //审核测评通过
    modifyApproval:(id,approvalState)=>{
        return PriReport.update({'_id':id},{$set:{'state':approvalState}}).exec()
    },
    //获取某评测中所有报名被拒绝的用户
    getSignRefusedList: (id)=>{
        // console.log(id);
        return PriReport.aggregate({$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                   {'$unwind':'$signUser'},
                                   {$match:{'signUser.passed':-1}},
                                   {$lookup:
                                        {
                                            from:'users',
                                            localField: 'signUser.userId',
                                            foreignField: '_id',
                                            as: 'signUser.userId'
                                        }
                                    },
                                   {$project:{'signUser.address':1,'signUser.phoneNumber':1,'signUser.passed':1,'signUser.userId.name':1,'_id':0}},
                                   {$match:{'passUser.comment.passed':-1}})
                        .exec()
    },
    //获取某评测中所有评论被拒绝的用户
    getCommentRefusedList: (id)=>{
        // console.log(id);
        return PriReport.aggregate({$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                   {'$unwind':'$passUser'},
                                   {$match:{'passUser.comment.passed':-1}},
                                   {$lookup:
                                        {
                                            from:'users',
                                            localField: 'passUser.userId',
                                            foreignField: '_id',
                                            as: 'passUser.userId'
                                        }
                                    },
                                   {$project:{'passUser.comment':1,'passUser.userId.name':1,'_id':0}},
                                   {$project:{'passUser.comment':1,'passUser.userId.name':1,'_id':0}})
                        .exec()
    },

    //上下线
    modifyOnline:(id,companyId,isOnline)=>{
        return PriReport.update({'_id':id,'companyId':companyId},{$set:{'isOnline':isOnline}}).exec();
    },
    //上下线Admin
    modifyOnlineAdmin:(id,isOnline)=>{
        return PriReport.update({'_id':id},{$set:{'isOnline':isOnline}}).exec();
    },
    //按条件获取signUserList
    getSignUserListV2: (id,passed)=>{
        // console.log(passed);
        if(passed !== null)
        return PriReport.aggregate({$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                //    {$project:{'signUser':1,'_id':0}},
                                   {'$unwind':'$signUser'},
                                   {$match:{'signUser.passed':passed}},
                                   {$lookup:
                                        {
                                            from:'users',
                                            localField: 'signUser.userId',
                                            foreignField: '_id',
                                            as: 'signUser.userId'
                                        }
                                   },
                                   {$project:{'signUser.timestamp':1,'signUser.address':1,'signUser.phoneNumber':1,'signUser.passed':1,'signUser.userId._id':1,'signUser.userId.name':1,'signUser.userId.logo':1,'_id':0}},
                                   {$match:{'signUser.passed':passed}})
                        .exec();
        else
            return PriReport.aggregate(
                                {$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                {'$unwind':'$signUser'},
                                {
                                    $lookup:{
                                        from:'users',
                                        localField: 'signUser.userId',
                                        foreignField: '_id',
                                        as: 'signUser.userId'
                                    }
                                },
                                {$project:{'signUser.timestamp':1,'signUser.address':1,'signUser.phoneNumber':1,'signUser.passed':1,'signUser.userId._id':1,'signUser.userId.name':1,'signUser.userId.logo':1,'_id':0}},
                                {$project:{'signUser.timestamp':1,'signUser.address':1,'signUser.phoneNumber':1,'signUser.passed':1,'signUser.userId.name':1,'signUser.userId.logo':1,'_id':0}}
                            )
                            .exec();
    },
    //条件获取passUserList
    getCommentListV2: (id,passed)=>{
        // console.log(id);
        if(passed !== null)
        return PriReport.aggregate({$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                   {'$unwind':'$passUser'},
                                   {$match:{'passUser.comment.passed':passed}},
                                   {$lookup:
                                        {
                                            from:'users',
                                            localField: 'passUser.userId',
                                            foreignField: '_id',
                                            as: 'passUser.userId'
                                        }
                                    },
                                   {$project:{'passUser.signTimestamp':1,'passUser.phoneNumber':1,'passUser.address':1,'passUser.comment':1,'passUser.userId._id':1,'passUser.userId.name':1,'passUser.userId.logo':1,'_id':0}},
                                   {$project:{'passUser.signTimestamp':1,'passUser.phoneNumber':1,'passUser.address':1,'passUser.comment':1,'passUser.userId._id':1,'passUser.userId.name':1,'passUser.userId.logo':1,'_id':0}})
                        .exec();
        else
            return PriReport.aggregate(
                                {$match:{'_id':Mongolass.Types.ObjectId(id)}},
                                {'$unwind':'$passUser'},
                                {
                                    $lookup:{
                                        from:'users',
                                        localField:'passUser.userId',
                                        foreignField: '_id',
                                        as: 'passUser.userId'
                                    }
                                },
                                {$project:{'passUser.signTimestamp':1,'passUser.phoneNumber':1,'passUser.address':1,'passUser.comment':1,'passUser.userId.name':1,'passUser.userId._id':1,'passUser.userId.logo':1,'_id':0}},
                                {$project:{'passUser.signTimestamp':1,'passUser.phoneNumber':1,'passUser.address':1,'passUser.comment':1,'passUser.userId.name':1,'passUser.userId._id':1,'passUser.userId.logo':1,'_id':0}}
                            )
    },

};
