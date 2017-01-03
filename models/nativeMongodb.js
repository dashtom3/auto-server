/**
 * Created by zhujay on 2016/12/29.
 */
const Promise = require('bluebird');
const Mongodb = require('mongodb');
const MongoClient = Mongodb.MongoClient;
const ObjectId = require('bson').ObjectId;
const config = require('config-lite');
const url = config.mongodb;
const co = require('co');

let db = null;

function OBJ(str_id){
    return new ObjectId(str_id);
}

MongoClient.connect(url)
    .then((DB)=>{
        db = DB;
    })
    .catch((e)=>{
        console.log(e);
    });

module.exports={
    privateReport:{
        pass:(id,userId,passed)=>{
            let lastPass = null;//阶段检测变量
            return co(function *(){
                //获取当前的通过状态
                let result = yield db.collection('privatereports')
                                     .findOne({
                                         _id:OBJ(id),
                                         'signUser.userId':OBJ(userId)
                                     },{
                                         'signUser.$':1
                                     });
                //阶段转换
                lastPass = result.signUser[0].passed;
                //如果已经通过了不予修改
                if(lastPass === 1)
                    return 'done';
                //如果是要通过，就该为通过并加入passUser中
                if(passed === 1){
                    yield db.collection('privatereports')
                            .updateOne({
                                _id : OBJ(id),
                                'signUser.userId':OBJ(userId)
                            },{
                                $set:{
                                    'signUser.$.passed':passed
                                },
                                $push:{
                                    'passUser':{
                                        userId:OBJ(userId),
                                        comment:{}
                                    }
                                }
                            })
                }
                else if(passed === -1){
                    yield db.collection('privatereports')
                            .updateOne({
                                _id : OBJ(id),
                                'signUser.userId':OBJ(userId)
                            },{
                                $set:{
                                    'signUser.$.passed':passed
                                }
                            });;
                }
            }).catch(err =>{
                if(lastPass !== null){
                    //进入回滚阶段
                    return db.collection('privatereports')
                             .updateOne({
                                 _id : OBJ(id),
                                 'signUser.userId':OBJ(userId)
                             },{
                                 $set:{
                                     'signUser.$.passed':lastPass
                                 }
                             });
                }
            }).catch(e =>{
                console.error(e.toString());
                return e.toString();
            });
        },
        makeComment:(id,userId,comment)=>{
            return db.collection('privatereports')
                     .updateOne({
                         '_id': OBJ(id),
                         'passUser.userId': OBJ(userId)
                     },{
                         $set:{
                             'passUser.$.comment':comment
                         }
                     });
        },
        passComment:(id,userId,passed)=>{
            return db.collection('privatereports')
                     .updateOne({
                         '_id': OBJ(id),
                         'passUser.userId': OBJ(userId)
                     },{
                         $set:{
                             'passUser.$.comment.passed':passed
                         }
                     });
        }
    }
};
