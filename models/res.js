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

const callStatusEnum = {
    0 : 'FAILED',
    1 : 'SUCCEED'
};

const errorCodeEnum = {
    0 : 'NO_ERROR',
    101 : 'NOT_NULL_VALIDATION_FAILED',
    102 : 'USER_EXIST',
    103 : 'USER_NOT_EXIST',
    104 : 'COMPANY_EXIST',
    105 : 'COMPANY_NOT_EXIST',
    106 : 'USERNAME_PASSWORD_MISMATCH',
    107 : 'INVALID_ARGUMENT',
    108 : 'NOT_PASSED',
    109 : 'ALREADY_SIGNED',
    110 : 'ALREADY_PASSED',
    111 : 'NOT_SIGNED',
    112 : 'INVALID_DATA',
    201 : 'COMPANY_APPROVAL_NOT_CHANGED',
    701 : 'IMAGES_UPLOAD_FAILED',
    702 : 'MODIFY_APPROVAL_FAILED',
    703 : 'GET_COMPANY_DETAIL_FAILED',
    704 : 'MODIFY_PASSWORD_FAILED',
    705 : 'MODIFY_COMPANY_INFO_FAILED',
    706 : 'GET_NEWS_LIST_FAILED',
    707 : 'GET_COMPANY_LIST_FAILED',
    708 : 'COMPANY_FINANCE_EXIST',
    709 : 'GET_COMPANY_FINANCE_LIST_FAILED',
    710 : 'MODIFY_COMPANY_FINANCE_INFO_FAILED',
    711 : 'DELETE_COMPANY_FINANCE_INFO_FAILED',
    712 : 'GET_NEWS_DETAIL_FAILED',
    713 : 'MODIFY_NEWS_ONLINE_STATUS_FAILED',
    714 : 'MODIFY_NEWS_DETAIL_FAILED',
    715 : 'DELETE_NEWS_FAILED',
    716 : 'CREATE_PRODUCT_FAILED',
    717 : 'GET_PRODUCT_LIST_FAILED',
    718 : 'GET_PRODUCT_DETAIL_FAILED',
    719 : 'MODIFY_PRODUCT_DETAIL_FAILED',
    720 : 'DELETE_PRODUCT_FAILED',
    721 : 'GET_URL_FAILED_AFTER_UPLOAD_PICTURE',
    722 : 'CREATE_PUBLIC_REPORT_FAILED',
    723 : 'TRANSACTIONAL_OPERATION_FAILED',
    724 : 'GET_PUBLIC_REPORT_LIST_FAILED',
    725 : 'MODIFY_PUBLIC_REPORT_ONLINE_STATUS_FAILED',
    726 : 'MODIFY_PUBLIC_REPORT_DETAIL_FAILED',
    727 : 'DELETE_PUBLIC_REPORT_FAILED',
    728 : 'GET_PUBLIC_REPORT_DETAIL_FAILED',
    729 : 'CREATE_PRIVATE_REPORT_FAILED',
    730 : 'PRIVATE_REPORT_SIGN_FAILED',
    731 : 'CHECK_USER_SIGN_FAILED',
    732 : 'CHECK_USER_PASS_FAILED',
    733 : 'MAKE_COMMENT_FAILED',
    750 : 'MODIFY_USER_TYPE_FAILED',
    751 : 'MODIFY_USER_APPROVAL_FAILED',
    752 : 'GET_USER_DETAIL_FAILED',
    753 : 'MODIFY_USER_INFO_FAILED',
    754 : 'CREATE_NEWS_FAILED',
    801 : 'TOKEN_GENERATE_FAILED',
    802 : 'TOKEN_DELETE_FAILED',
    803 : 'INVALID_TOKEN',
    804 : 'FIND_USER_FAILED',
    901 : 'LOGIN_FAILED',
    999 : 'UNKNOWN_ERROR'
};

class resData {
    constructor(_callStatus,_errorCode,_data=null) {
        this.callStatus = callStatusEnum[_callStatus];
        this.errCode = errorCodeEnum[_errorCode];
        this.data = _data;
    }
}

module.exports=resData;
