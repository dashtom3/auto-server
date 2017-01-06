/**
 * Created by zhujay on 2016/12/22.
 */
var ResData = require('../models/res');

function filter(req, res, next,defaultJson={},requiredParam=[]) {
    const Method = req.method;
    if(Method === 'GET'){
        //处理Get数据
        const _getData = req.query;
        for(key in defaultJson){
            if(_getData[key] !== undefined){
                defaultJson[key] = _getData[key];
            }
        }
        for(key in requiredParam){
            let _key = requiredParam[key];
            if(_getData[_key] === undefined
            || _getData[_key] === null
            || _getData[_key].trim() === ''){
                res.json(new ResData(0,101));
                return;
                // break;
            }
        }
        req.query = defaultJson;
        next();
    }
    else if(Method === 'POST'){
        //处理Post数据
        const _postData = req.fields;
        for(key in defaultJson){
            if(_postData[key] !== undefined){
                defaultJson[key] = _postData[key];
            }
        }
        for(key in requiredParam){
            let _key = requiredParam[key];
            if(_postData[_key] === undefined
            || _postData[_key] === null
            || (typeof _postData[_key] == 'string' && _postData[_key].trim() === '')){
                res.json(new ResData(0,101,{yourdata:_postData,errorkey:requiredParam[key]}));
                return;
            }
        }
        req.fields = defaultJson;
        next();
    }else{
        res.json({a:'b'});
    }
}

module.exports = filter;