/// <reference path="../typings/index.d.ts" />
const User = require('../middlewares/mongoose').User;
const PrivateReport = require('../middlewares/mongoose').PrivateReport;
const mongoose = require('mongoose');

module.exports = {
    getCommentList: (id)=>{
        PrivateReport.aggregate({$match:{'_id':mongoose.Types.ObjectId(id)}},
                                   {$project:{'passUser':1,'_id':0}},
                                   {'$unwind':'$passUser'},
                                   {$match:{'passUser.comment.passed':1}},
                                   {$group:{_id:'$passUser.userId'}})
                    .exec((err,result)=>{
                        if(err)
                            return Promise.reject(err);
                        else 
                            return Promise.resolve(result);
                    })
                        // .populate({ path: 'passUser.userId', select:{'name':1} , model: 'User' })
                        // .execPopulate();
    }
}