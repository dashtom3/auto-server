/// <reference path="../typings/index.d.ts" />
const Token=require('../middlewares/mongo').Token;
const crypto = require('crypto');
const config = require('config-lite');
Token.plugin('POPULATE', require('mongolass-plugin-populate'));

module.exports={
    //PUT token
    //没有则创建，有则覆盖更新（踢人）
    create : (linkId)=>{
        return Token.findOne({linkTo:linkId}).exec()
            .then((result)=>{
                if(result==null){
                    //以毫秒时间戳加随机数作为盐，几乎不可能出现重复盐
                    let salt = new Date().getTime() + Math.random()*1000;
                    let expireTS = new Date().getTime() + config.token.maxAge;//24小时过期
                    let token = {
                        linkTo : linkId,
                        token : crypto.createHmac('md5',salt.toString()).update(linkId.toHexString()).digest('hex'),
                        expiredAt : expireTS
                    };
                    return Token.create(token).exec()
                        .then((result)=>{
                            return Promise.resolve(token.token);
                        })
                        .catch((e)=>{
                            return Promise.reject(e);
                        });
                }else{
                    let _id = result._id;
                    let salt = new Date().getTime() + Math.random()*1000;
                    let _token = crypto.createHmac('md5',salt.toString()).update(linkId.toHexString()).digest('hex');
                    let _expiredAt = new Date().getTime() + config.token.maxAge;
                    return Token.update({_id:_id},{$set:{token:_token,expiredAt:_expiredAt}}).exec()
                        .then((result)=>{
                            return Promise.resolve(_token);
                        })
                        .catch((e)=>{
                            return Promise.reject(e);
                        });
                }
            })
            .catch((e)=>{
                return Promise.reject(e);
            });
    },

    //检查token是否过期，过期则删除并返回false，未过期则返回true,未找到也返回false
    check : (_token)=>{
        if(_token === 'guest') 
            return Promise.resolve(false);
        else
            return Token.findOne({token:_token}).exec()
            .then((result)=>{
                if(result==null || result.expiredAt < new Date().getTime()){
                    if(result == null) return Promise.resolve(false);
                    else
                    return Token.remove({_id:result._id}).exec()
                        .then((result)=>{
                            return Promise.resolve(false);
                        })
                        .catch((e)=>{
                            return Promise.reject(e);
                        });
                }else{
                    return Token.update({_id:result._id},{$set:{expiredAt:new Date().getTime() + config.token.maxAge}}).exec()
                        .then((result)=>{
                            return Promise.resolve(true);
                        })
                        .catch((e)=>{
                            return Promise.reject(e);
                        });
                }
            })
            .catch((e)=>{
                return Promise.reject(e);
            });
    },

    //删除token
    del : (_token)=>{
        return Token.remove({token : _token}).exec();
    },

    //反查用户账户
    findUser : (_token)=>{
        return Token.findOne({token : _token},{linkTo:1}).exec();
    },

    //反查用户账户详情
    findUserPopulate : (_token)=>{
        return Token.findOne({token : _token}).POPULATE({ path: 'linkTo' , model: 'User' }).select({_id:0}).exec();
    },
    //反查公司账户详情
    findCompanyPopulate : (_token)=>{
        return Token.findOne({token : _token}).POPULATE({ path: 'linkTo' , model: 'Company' }).select({_id:0}).exec();
    }
};
