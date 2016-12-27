const config = require('config-lite');
const Mongolass = require('mongolass');
const mongolass = new Mongolass();
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
    name: {type:'string'}, //*
    nikeName: {type:'string'},// *
    password: {type:'string'},// *
    mail: {type:'string'},//
    phone: {type:'string'},//
    idImg1: {type:'string'},//身份证正反面 *
    idImg2: {type:'string'},// *
    userType: {type:'string', enum:['normal','vc','admin','forbid','wr']},//-1:wr,0:admin,1:normal,2:vc,3:wr *
    isPassed:{type:'number',enum:[-1,0,1]},// *
    timestamp:{type:'string'}// *
});
exports.User.index({name:1},{unique:true}).exec();//设置name为索引，唯一


//定义公司的modle
exports.Company = mongolass.model('Company',{
    //longName,shortName,logo,address,field,regTime,legalEntity,regCapital,regAddress,isNeedCapital,companyDesc,productDesc,userDesc
    name: {type:'string'},//登录的用户名 *
    password: {type:'string'},// *
    position: {type:'string'},//注册人职位 *
    info: {type:'string'},//file //审核认证信息 *
    //CM汽车制作，CG汽车零部件，CS汽车销售与服务，NEC新能源汽车，NOC车联网，CC车用化工品，CE汽车金融，PT公共交通，MOC汽车媒体
    //CM:0 CG:1 CS:2 NEC:3 NOC:4 CC:5 CE:6 PT:7 MOC:8
    type: {type:'string', enum:['CM','CG','CS','NEC','NOC','CC','CE','PT','MOC']},//*
    longName: {type:'string'},//公司名称 *
    shortName: {type:'string'},//简称 *
    logo: {type:'string'},//file
    address: {type:'string'},//省市 *
    field: {type:'string'},//业务简述
    regTime: {type:'string'},//成立时间 * 格式：YYYY/MM/DD
    regTimeUnix: {type:'number'},//成立时间的Unix时间偏移量
    legalEntity: {type:'string'},//法人代表
    regCapital: {type:'string'},//注册资本
    regAddress: {type:'string'},//详细地址 *
    isNeedCapital: {type:'boolean'},//有无投融资需求 *
    companyDesc: {type:'string'},//公司简介
    productDesc: {type:'string'},//产品简介
    userDesc: {type:'string'},//目标用户简介
    phone: {type:'string'},//联系方式 *
    timestamp: {type:'string'},//注册账号的时间戳 *
    isPassed: {type:'number',enum:[-1,0,1]}//是否审核 *
});
exports.Company.index({name:1},{unique:true}).exec();//name为索引，且唯一,


//定义资讯的modle
exports.News = mongolass.model('New',{
    //title,author,isFirst,isOnline,company,tag,desc,pic,wysiwyg
    title: {type:'string'}, //标题 *
    author: {type:'string'}, //作者
    isFirst: {type:'boolean'}, //是否原创 *
    isOnline: {type:'boolean'},//0:下线  1:上线 默认上线 *
    companyId: {type:Mongolass.Types.ObjectId},// companyId *
    tag: {type:'string'},//标签
    desc: {type:'string'},//简述 *
    pic: {type:'string'},//缩略图 file *
    wysiwyg: {type:'string'},//文件内容*
    timestamp:{type:'number'}//发布时间 *
});
// exports.News.index({_id:-1}).exec();//按日期降序


//定义财务信息的modl，companyName和year可唯一标示
exports.Finances = mongolass.model('Finance',{
    //companyName,year,ratio,input,increase,allCapital,realCapital,allRatio,realRatio,debtRatio,inputRatio
    companyId: {type:Mongolass.Types.ObjectId},//companyID *
    year: {type:'number'},//哪个年度 *
    ratio: {type:'string'},//市盈率？
    input: {type:'string'},//营业收入 *
    increase: {type:'string'},//收入增长率
    allCapital: {type:'string'},//总资产
    realCapital: {type:'string'},//净资产
    allRatio: {type:'string'},//毛利率
    realRatio: {type:'string'},//净利率
    debtRatio: {type:'string'},//资产负债率
    inputRatio: {type:'string'},//资产收益率
    token: {type:'string'}//token
});
exports.Finances.index({year:-1}).exec();//按日期降序


//定义个人测评信息的modle
exports.privateReport = mongolass.model('privateReport',{
    companyName: {type:'string'},//ID *
    title: {type:'string'},// 测评名称 *
    product: {type:'string'},// ID *
    dateStart: {type:'string'},//起止日期*
    dateEnd:{type:'string'},//起止日期*
    type: {type:'string'},//测评类型enum{'实地'，'邮寄'}
    address:{type:'string'},//如果是实地 *
    state: {type:'string'},//0:待审核  1:已发布  2:已结束  －1:已被拒 默认0 *
    maxUserNum: {type:'string'},//报名人数上限 *
    signUserNum: {type:'string'},//实际报名人数 def 0
    signUserName: {type:'string'},//userId[] def [] 人里面包含：是否通过、评论——评论包裹是否通过、时间戳
    passUserNum: {type:'string'},//
    passUserName: {type:'string'},
    argc:{type:'string'},//评分参数[]结束之后有个平均分、打分人数
    images:{type:'string'},//File[] def []
    timestamp:{type:'string'},//发布评测时间
    isOnline:{type:'boolean'}//上下线

});
// exports.privateReport.index({_id:-1}).exec();//按日期降序

/**
 * 评论的model：
 * signUserName:
 * {
 *      {
 *          userid,
 *          username,
 *          ispassed,//zhuangtai
 *          phonenum,*
 *          address如果邮寄*，
 *          评论的内容:{
 *              neirong:
 *              shijian:
 *              shifoutongguo:
 *              对参数的打分0~5
 *          }
 *      }
 * }
 * */
//定义专业测评信息的modle
exports.publicReport = mongolass.model('publicReport',{
    companyName: {type:'string'},//TODO:ID *
    productId: {type:'string'},//产品id *
    // productName: {type:'string'},//产品名称
    testDesc:{type:'string'},//测评简述
    date: {type:'string'},//测评时间
    team: {type:'string'},//测评团队 *
    site: {type:'string'},//测评地址
    isOnline: {type:'string'},//测评上下线enum{0,1} def:1 *
    report:{type:'string'}//file 报告 *
});
// exports.publicReport.index({_id:-1}).exec();//按日期降序

//定义企业产品的modle
exports.product = mongolass.model('product',{
    companyId: {type:Mongolass.Types.ObjectId},//
    name: {type:'string'},//产品名称 *
    tag: {type:'string'},//标签 同企业type *
    state: {type:'boolean'},//上下线 默认1

    argc: {type:'string'},//参数
    desc: {type:'string'},//介绍
    images: [{type:'string'}],//File[] *
    releaseDate:{type:'string'},//预计发布日期
    timestamp:{type:'number'}//创建时间戳
});
// exports.product.index({_id:-1}).exec();//按日期降序

// 定义图片存储model
exports.Image = mongolass.model('image',{
    timestamp : {type : 'string'},
    path : {type : 'string'},
    isDeleted : {type : 'boolean'}
});
