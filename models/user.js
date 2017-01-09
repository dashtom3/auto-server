const User=require('../middlewares/mongo').User;

module.exports={
    //注册
    create: function create(user) {
        return User.create(user).exec();
    },
    //获取用户列表(query,numPerPage，pageNum)
    getUserList: (query,numPerPage,pageNum)=>{
        return User
            .find(query)
            .select({ password: 0 })
            .skip(numPerPage*(pageNum-1))
            .limit(numPerPage)
            .sort({timestamp:-1})
            .exec();
    },
    //获取用户数量（query）
    count:(query)=>{
        return User.count(query).exec();
    },
    //根据name找到用户
    getUserByname: function getUserByname(name) {
        return User.findOne({name:name}).exec();
    },
    //更改用户类型
    modifyUserType: (id,newType)=>{
        return User.update({_id:id},{$set:{userType:newType}}).exec();
    },
    //更改用户审核情况
    modifyApproval:(id,approvalStatus)=>{
        return User.update({_id:id},{$set:{isPassed:approvalStatus}}).exec();
    },
    //查询旧密码
    getOldPassword: (_id)=>{
        return User.findOne({_id:_id},{password:1}).exec();
    },
    //更改密码
    modifyPassword: (_id,newPassword)=>{
        return User.update({_id:_id},{$set:{password:newPassword}}).exec();
    },
    //更改用户信息：nickName,mail,phone
    modifyInfo: function modifyInfo(_id,newInfo) {
        return User.update({_id:_id},{$set:newInfo}).exec();
    },
    //检查用户是否通过审核
    checkPassed:(_id)=>{
        return User.count({_id:_id,isPassed:1}).exec();
    }
};
