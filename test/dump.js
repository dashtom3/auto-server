var mysql   = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  database : 'qicai',
  port:3306
});

const fs = require('fs');
const crypto = require('crypto');
const Mongodb = require('mongodb');
const MongoClient = Mongodb.MongoClient;
const url = 'mongodb://123.56.220.72:27017/autobiz';
const ObjectId = require('bson').ObjectId;

connection.connect();

connection.query('SELECT * from admin_user', function(err, rows, fields) {
  if (err) throw err;
 
 var typeEnum = ['normal','admin'];

  var a=[];
  for(let k in rows){
      a.push({
          name:rows[k].loginname,
          nikeName:rows[k].nickname,
          password:rows[k].password.toLowerCase(),
          mail:rows[k].email,
          phone:rows[k].phone,
          idImg1:'',
          idImg2:'',
          userType:typeEnum[rows[k].type],
          timestamp:new Date().getTime().toString(),
          isPassed:1,
          logo:'',
      });
  }
//   console.log(a);

  MongoClient.connect(url, function(err, db) {
        if(err != null){
            console.log('ERROR');
            return;
        }
        console.log("Connected correctly to server");
        let collection = db.collection('users');
        for(let key in a){
            console.log(a[key]);
            collection.insert(a[key]);
        }
        // db.close();
    });

});