/**
 * Created by joseph on 16/12/8.
 */
// function resData() {
//     var isSuccess=0;
//     var data="";
//     this.setIsSuccess=function (code) {
//         this.isSuccess=code;
//     };
//     this.setData=function (data) {
//         this.data=data;
//     }
// };

//resData(callStatus,errCode,data)

var callStatusEnum = {
    0 : 'FAILED',
    1 : 'SUCCEED'
};

var errorCodeEnum = {
    0 : 'NO_ERROR',
    101 : 'NOT_NULL_VALIDATION_FAILED',
    102 : 'USER_EXIST',
    103 : 'USER_NOT_EXIST',
    104 : 'COMPANY_EXIST',
    105 : 'COMPANY_NOT_EXIST',
    106 : 'USERNAME_PASSWORD_MISMATCH',
    701 : 'IMAGES_UPLOAD_FAILED',
    901 : 'UNKNOWN_LOGIN_ERROR',
    801 : 'TOKEN_GENERATE_FAILED',
    802 : 'TOKEN_DELETE_FAILED',
    999 : 'UNKNOWN_ERROR'
};

class resData {
    constructor(_callStatus,_errorCode,_data) {
        this.callStatus = callStatusEnum[_callStatus];
        this.errCode = errorCodeEnum[_errorCode];
        this.data = _data;
    }
}

module.exports=resData;
