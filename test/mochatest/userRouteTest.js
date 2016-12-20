var assert = require("assert");
var unirest = require("unirest");
var signUpData = require('./datafiles/userRouteData_signup');
var logInData = require('./datafiles/userRouteData_login');

// req.headers({
//   "postman-token": "baeb5b2f-6d98-da59-7a64-323dc95c764c",
//   "cache-control": "no-cache",
//   "content-type": "application/json"
// });


 //这里参数可以设置 before(function(){ ...} 从前面的文件中导出,这里我们简单直接定义.

 //after 是测试完成后把一些后面文件需要的参数全部导出.
// after(function() {
//         global_share_data.game_user = game_user;
// });

//注册
describe("UserRouter——signup", function() {
    signUpData.forEach((test)=>{
        it("POST\t/user/signup\t"+test.des, function(done) {
            var req = unirest("POST", "http://127.0.0.1:3300/user/signup");
            req.type("json");
            req.send(test.data);
            req.end(function (res) {
                assert.equal(res.status,test.exp.status);
                assert.equal(res.body.isSuccess,test.exp.body.isSuccess);
                if(test.exp.body.isSuccess == 1){
                    assert.ok(res.body.data);
                    // console.log(res.body.data);
                }else{
                    assert.equal(res.body.data,test.exp.body.data);
                }
                done();
            });
        });
    })
});

//登录
describe("UserRouter——login", function() {
    logInData.forEach((test)=>{
        var _name = (test.data.name == undefined)?(''):test.data.name;
        var _password = (test.data.name == undefined)?(''):test.data.name;
        it("Get\t/user/signup?name="+_name+'&password='+_password+'\t'+test.des, function(done) {
            var req = unirest("GET", "http://127.0.0.1:3300/user/login");
            req.query({
              "name": test.data.name,
              "password": test.data.password
            });
            req.end(function (res) {
                assert.equal(res.status,test.exp.status);
                assert.equal(res.body.isSuccess,test.exp.body.isSuccess);
                if(test.exp.body.isSuccess == 1){
                    assert.ok(res.body.data);
                    // console.log(res.body.data);
                }else{
                    assert.equal(res.body.data,test.exp.body.data);
                }
                done();
            });
        });
    })
});


// FakeHTTP.request('/account/login', game.makeSign({
//     user_id: userid,
//     password: password
// }), function(status, res) {
//     assert.equal(status, 200);
//     assert.equal(!res.error_code, true, res.error);
//     assert.ok(res.user_id, 'Not found user_id');
//     assert.ok(res.user_token, 'Not found user token');
//     game_user.game_id = res.gameID;
//     game_user.user_id = res.userid;
//     game_user.token = res.user_token;
//     done();
// });
