/**
 * Created by zhujay on 2017/1/2.
 */
const Promise = require('bluebird');
const co = require('co');
const fs = Promise.promisifyAll(require("fs"),{suffix:'AS'});

// co(function *(){
//     var result = yield fs.readFileAS('省市.json','utf-8');
//     console.log(result);
// }).catch(onerror);

co(function *(){
    // resolve multiple promises in parallel
    let a = yield Promise.resolve(1);
    global.a = a;
    let b = yield Promise.reject(2);
    let c = yield Promise.resolve(3);
    console.log(a,b,c);
    // => [1, 2, 3]
}).catch(err =>{
    console.log(global.a !== undefined);
    if(a === 1){
        console.log('rollback');
        delete a;
    }
    console.log(err);
    console.log(global.a === undefined);
});

function onerror(err) {
    // console.error(err.stack);
    console.error(err);
    if (a === 1)
        console.log('roll back');
}