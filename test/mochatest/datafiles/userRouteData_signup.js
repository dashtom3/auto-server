module.exports = [
    {
        des:'不存在的用户',
        data:{
            "name": "nametest",
            "nikeName": "thisisnikname",
            "password": "aaabcccd",
            "mail": "123@qq.com",
            "phone": "12345"
        },
        exp:{
            status:200,
            body:{
                "isSuccess": 1
            }
        }
    },
    {
        des:'已经存在的用户',
        data:{
            "name": "nametest",
            "nikeName": "thisisnikname",
            "password": "aaabcccd",
            "mail": "123@qq.com",
            "phone": "12345"
        },
        exp:{
            status:200,
            body:{
                "data": "user exist",
                "isSuccess": 0
            }
        }
    },
    {
        des:'缺少nikename',
        data:{
        	"name":"nameest",
        	"password":"aaabcccd",
        	"mail":"123@qq.com",
        	"phone":"12345"
        },
        exp:{
            status:200,
            body:{
                "isSuccess": 0,
                "data": "101"
            }
        }
    },
    {
        des:'缺少name',
        data:{
        	"nikeName":"nameest",
        	"password":"aaabcccd",
        	"mail":"123@qq.com",
        	"phone":"12345"
        },
        exp:{
            status:200,
            body:{
                "isSuccess": 0,
                "data": "101"
            }
        }
    },
    {
        des:'缺少password',
        data:{
        	"name":"nameest",
            "nikeName": "thisisnikname",
        	"mail":"123@qq.com",
        	"phone":"12345"
        },
        exp:{
            status:200,
            body:{
                "isSuccess": 0,
                "data": "101"
            }
        }
    },
];
