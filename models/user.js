var User=require('../middlewares/mongo').User;

module.exports={
    //注册
    create: function create(user) {
        return User.create(user).exec();
    },
    //获取所有用户
    getUserList: function getUserList() {
        return User.find().exec();
    },
    //根据name找到用户
    getUserByname: function getUserByname(name) {
        return User.findOne({name:name}).exec();
    },
    //更改用户类型
    modifyUserType: function modifyUserType(name,newType) {
        return User.update({name:name},{$set:{userType:newType}}).exec();
    },
    //更改密码
    modifyPassword: function modifyPassword(name,newPassword) {
        return User.update({name:name},{$set:{password:newPassword}}).exec();
    },
    //更改用户信息：nickName,mail,phone
    modifyInfo: function modifyInfo(name,newNickName,newMail,newPhone) {
        return User.update({name:name},{$set:{nikeName:newNickName,mail:newMail,phone:newPhone}}).exec();
    }

};