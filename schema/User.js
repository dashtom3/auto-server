/// <reference path="../typings/index.d.ts" />

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
    name: String, //*
    nikeName: String,// *
    password: String,// *
    mail: String,//
    phone: String,//
    idImg1: String,//身份证正反面 *
    idImg2: String,// *
    userType: {type:String, enum:['normal','vc','admin','forbid','wr']},//-1:wr,0:admin,1:normal,2:vc,3:wr *
    isPassed: Number,// *
    timestamp: String// *
})