/// <reference path="../typings/index.d.ts" />
const config = require('config-lite');
const mongoose = require('mongoose');
const UserSchema = require('../schema/User');
const PrivateReportSchema = require('../schema/PrivateReport');
mongoose.connect(config.mongodb);

module.exports.User = mongoose.model('User',UserSchema);

module.exports.PrivateReport = mongoose.model('privateReport',PrivateReportSchema);