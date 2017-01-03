/**
 * Created by zhujay on 2017/1/2.
 */
const async = require('async');
const fs = require('fs');

console.log('start',new Date().toLocaleString());
async.series([
    function(callback) {
        console.log('here is one',new Date().toLocaleString());
        setTimeout(function() {
            console.log(1,'start',new Date().toLocaleString());
            callback(null, 1);
            console.log(1,'end',new Date().toLocaleString());
        }, 2000);
    },
    function(callback) {
    console.log('here is two',new Date().toLocaleString());
        setTimeout(function () {
            console.log(2,'start',new Date().toLocaleString());
            callback(null, 2);
            console.log(2,'end',new Date().toLocaleString());
        }, 1000);
    }
], function(err, results) {
    console.log(results);
    // results is now equal to: {one: 1, two: 2}
});