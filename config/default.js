module.exports={
    port:3300,
    session:{
        secrct:'autobiz',
        key:'autobiz',
        maxAge:86400000//24小时
    },
    token:{
        maxAge:7200000//2小时过期
    },
    mongodb:'mongodb://localhost:27017/autobiz',
    protocol:'http',
    hostname:'123.56.220.72:3300'

};
