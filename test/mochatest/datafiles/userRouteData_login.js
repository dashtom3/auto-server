module.exports = [
    {
        des:'用户名密码正确',
        data:{
            "name": "nametest",
            "password": "aaabcccd",
        },
        exp:{
            status:200,
            body:{
                "isSuccess": 1
            }
        }
    },
    {
        des:'用户名密码错误',
        data:{
            "name": "nametest",
            "password": "aaac"
        },
        exp:{
            status:200,
            body:{
                "data": "password error",
                "isSuccess": 0
            }
        }
    },
    {
        des:'缺少用户名',
        data:{
            "password":'aaac'
        },
        exp:{
            status:200,
            body:{
                'data':'101',
                "isSuccess":0
            }
        }
    },
    {
        des:'缺少密码',
        data:{
            "name":'nametest'
        },
        exp:{
            status:200,
            body:{
                'data':'101',
                "isSuccess":0
            }
        }
    },
    {
        des:'空请求',
        data:{
        },
        exp:{
            status:200,
            body:{
                'data':'101',
                "isSuccess":0
            }
        }
    },
    {
        des:'没有用户名密码但是有其他数据',
        data:{
            "foo":'woo'
        },
        exp:{
            status:200,
            body:{
                'data':'101',
                "isSuccess":0
            }
        }
    },
    {
        des:'不存在的用户',
        data:{
            "name":'foo',
            "password":'aaa'
        },
        exp:{
            status:200,
            body:{
                'data':'user not exist',
                "isSuccess":0
            }
        }
    }
];
