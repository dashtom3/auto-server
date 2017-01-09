/// <reference path="../typings/index.d.ts" />

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
    companyId: mongoose.SchemaTypes.ObjectId,//ID *
    title: String,// 测评名称 *
    productId: mongoose.SchemaTypes.ObjectId,// ID *
    dateStart: Number,//起止日期*
    dateEnd: Number,//起止日期*
    type: {type: String,enum:['local','mail']},//测评类型enum{'实地'，'邮寄'} *
    address:{type: String,default:''},//如果是实地 *
    state: Number,//0:待审核  1:已通过  2:已结束  －1:已被拒 默认0 *
    maxUserNum: Number,//报名人数上限 *
    signUser: [{
        userId: mongoose.SchemaTypes.ObjectId,
        passed: Number,
        phoneNumber: String,
        address: String
    }],//实际报名人数 def 0
    passUser: [{
        userId: mongoose.SchemaTypes.ObjectId,
        comment:{
            content: String,
            timestamp: Number,
            passed: Number,
            score:[Number]
        }
    }],
    argc:[String],//评分参数[]结束之后有个平均分、打分人数 *
    scores:[Number],//各参数评分数组
    scoredUserNum: Number,//参与评分人数
    images:[String],//File[] def [] *
    timestamp:Number,//发布评测时间
    isOnline:Boolean//上下线
})