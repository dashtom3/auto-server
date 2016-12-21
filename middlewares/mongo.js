var config = require('config-lite');
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
mongolass.connect(config.mongodb);

//定义token的model
exports.Token = mongolass.model('Token',{
    linkTo:{type:Mongolass.Types.ObjectId},
    token:{type:'string'},
    expiredAt:{type:'number'}
});

//定义用户的modle
exports.User = mongolass.model('User',{
    //id,name,nikeName,password,mail,phone,idImg1,idImg2,userType(no,normal,vc,admin,forbid)
    name: {type:'string'},
    nikeName: {type:'string'},
    password: {type:'string'},
    mail: {type:'string'},
    phone: {type:'string'},
    idImg1: {type:'string'},
    idImg2: {type:'string'},
    userType: {type:'string', enum:['normal','vc','admin','forbid','wr']},//-1:wr,0:admin,1:normal,2:vc,3:wr
    isPassed:{type:'number',enum:[-1,0,1]},
    timestamp:{type:'string'}

});
exports.User.index({name:1},{unique:true}).exec();//设置name为索引，唯一


//定义公司的modle
exports.Company = mongolass.model('Company',{
    //longName,shortName,logo,address,field,regTime,legalEntity,regCapital,regAddress,isNeedCapital,companyDesc,productDesc,userDesc
    name: {type:'string'},
    password: {type:'string'},
    position: {type:'string'},
    info: {type:'string'},//file
    //CM汽车制作，CG汽车零部件，CS汽车销售与服务，NEC新能源汽车，NOC车联网，CC车用化工品，CE汽车金融，PT公共交通，MOC汽车媒体
    //CM:0 CG:1 CS:2 NEC:3 NOC:4 CC:5 CE:6 PT:7 MOC:8
    type: {type:'string', enum:['CM','CG','CS','NEC','NOC','CC','CE','PT','MOC']},
    longName: {type:'string'},
    shortName: {type:'string'},
    logo: {type:'string'},//file
    address: {type:'string'},
    field: {type:'string'},
    regTime: {type:'string'},
    legalEntity: {type:'string'},
    regCapital: {type:'string'},
    regAddress: {type:'string'},
    isNeedCapital: {type:'string'},
    companyDesc: {type:'string'},
    productDesc: {type:'string'},
    userDesc: {type:'string'},
    timestamp: {type:'string'},
    isPassed: {type:'number',enum:[-1,0,1]}
});
exports.Company.index({name:1},{unique:true}).exec();//name为索引，且唯一,


//定义资讯的modle
exports.News = mongolass.model('New',{
    //title,author,isFirst,isOnline,company,tag,desc,pic,wysiwyg
    title: {type:'string'},
    author: {type:'string'},
    isFirst: {type:'string'},
    isOnline: {type:'string'},//0:下线  1:上线
    company: {type:'string'},
    tag: {type:'string'},
    desc: {type:'string'},
    pic: {type:'string'},
    wysiwyg: {type:'string'}
});
// exports.News.index({_id:-1}).exec();//按日期降序


//定义财务信息的modl，companyName和year可唯一标示
exports.Finances = mongolass.model('Finance',{
    //companyName,year,ratio,input,increase,allCapital,realCapital,allRatio,realRatio,debtRatio,inputRatio
    companyName: {type:'string'},
    year: {type:'string'},
    ratio: {type:'string'},
    input: {type:'string'},
    increase: {type:'string'},
    allCapital: {type:'string'},
    realCapital: {type:'string'},
    allRatio: {type:'string'},
    realRatio: {type:'string'},
    debtRatio: {type:'string'},
    inputRatio: {type:'string'}
});
exports.Finances.index({year:-1}).exec();//按日期降序


//定义个人测评信息的modle
exports.privateReport = mongolass.model('privateReport',{
    companyName: {type:'string'},
    title: {type:'string'},
    product: {type:'string'},
    date: {type:'string'},
    type: {type:'string'},
    state: {type:'string'},//0:待审核  1:已发布  2:已结束  －1:已被拒
    maxUserNum: {type:'string'},
    signUserNum: {type:'string'},
    signUserName: {type:'string'},
    passUserNum: {type:'string'},
    passUserName: {type:'string'}
});
// exports.privateReport.index({_id:-1}).exec();//按日期降序


//定义专业测评信息的modle
exports.publicReport = mongolass.model('publicReport',{
    companyName: {type:'string'},
    productId: {type:'string'},
    productName: {type:'string'},
    date: {type:'string'},
    team: {type:'string'},
    site: {type:'string'},
    isOnline: {type:'string'}
});
// exports.publicReport.index({_id:-1}).exec();//按日期降序

//定义企业产品的modle
exports.product = mongolass.model('product',{
    companyName: {type:'string'},
    name: {type:'string'},
    tag: {type:'string'},
    state: {type:'number',enum:[0,1]},
    argc: {type:'string'},
    desc: {type:'string'},
    images: {type:'string'}
});
// exports.product.index({_id:-1}).exec();//按日期降序

// 定义图片存储model
exports.Image = mongolass.model('image',{
    timestamp : {type : 'string'},
    path : {type : 'string'},
    isDeleted : {type : 'boolean'}
});
