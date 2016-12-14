var ResData = require("../models/res")

module.exports={
    checkUserLogin: function checkUserLogin(req, res, next) {
        if (!req.session.user) {
            resData = new ResData();
            resData.setIsSuccess(0);
            resData.setData("user not login");
            res.send(JSON.stringify(resData));
        }
        next();
    },

    checkCompanyLogin: function checkCompanyLogin(req, res, next) {
        if (!req.session.company) {
            resData = new ResData();
            resData.setIsSuccess(0);
            resData.setData("companyUser not login");
            res.send(JSON.stringify(resData));
        }
        next();
    },

    checkAdminLogin: function checkAdminLogin(req, res, next) {
        if (!req.session.admin) {
            resData = new ResData();
            resData.setIsSuccess(0);
            resData.setData("admin not login");
            res.send(JSON.stringify(resData));
        }
        next();
    }
};