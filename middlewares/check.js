/// <reference path="../typings/index.d.ts" />
const ResData = require("../models/res");
const TokenModel = require('../models/token.js');
const config = require('config-lite');
const co = require('co');
const expireTime = config.token.maxAge;

function forbiden(res){
    res.sendStatus(403);
}
function EXCEPTION(res){
    res.sendStatus(500);
}

function checkUserLogin(authArray=['normal','vc','admin','forbid','wr']) {
    return (req,res,next)=>{
        const token = req.query.token || req.fields.token;
        if(token == undefined){
            forbiden(res);
            return;
        }
        co(function *(){
            const user = yield TokenModel.findUserPopulate(token);
            if(user == null || user.linkTo['_id'] == undefined || user.linkTo.userType == undefined){
                forbiden(res);
                return;
            }
            const type = user.linkTo.userType;
            if(authArray.includes(type) && checkExpired(user)){
                req.fields._userID=user.linkTo._id;
                next();
            }
            else{
                forbiden(res);
                return;
            }
        })
        .catch(e=>{
            console.log('***AUTH_EXCEPTION***',e.toString);
            EXCEPTION(res);
            return;
        });
    }
}

/**
 * boolean 没过期true，过期false
*/
function checkExpired(user){
    if(new Date().getTime() - user.expiredAt > expireTime){
        return false;
    }else{
        return true;
    }
}

module.exports={
    checkUserLogin: checkUserLogin,

    checkCompanyLogin: function checkCompanyLogin(req, res, next) {
        const token = req.query.token || req.fields.token;
        if(token == undefined){
            forbiden(res);
            return;
        }
        co(function *(){
            const user = yield TokenModel.findCompanyPopulate(token);
            if(user == null || user.linkTo['_id'] == undefined || !checkExpired(user)){
                forbiden(res);
                return;
            }
            req.fields._userID=user.linkTo._id;
            next();
        })
        .catch(e=>{
            console.log('***AUTH_EXCEPTION***',e.toString);
            EXCEPTION(res);
            return;
        });
    },

    checkValidToken: (req,res,next)=>{
        const token = req.query.token || req.fields.token;
        if(token == undefined){
            forbiden(res);
            return;
        }
        co(function *(){
            const user = yield TokenModel.findUserPopulate(token);
            if(user == null || !checkExpired(user)){
                forbiden(res);
                return;
            }else{
                if(typeof user.linkTo.toHexString === 'function'){
                    req.fields._type = 'company';
                    req.fields._userID = user.linkTo.toHexString();
                }else{
                    if(user.linkTo.userType !== 'admin'){
                        req.fields._type = 'user';
                        req.fields._userID = user.linkTo._id;
                    }else{
                        req.fields._type = 'admin';
                        req.fields._userID = user.linkTo._id;
                    }
                }
                next();
            }
        })
        .catch(e=>{
            console.log('***AUTH_EXCEPTION***',e.toString);
            console.dir(e);
            EXCEPTION(res);
            return;
        });
    },

    checkAdminLogin: checkUserLogin(['admin']),

    removeToken: (req,res,next)=>{
        if(req.query.token)
            delete req.query.token;
        if(req.fields.token)
            delete req.fields.token;
        next();
    }
};
