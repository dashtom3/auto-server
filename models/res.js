/**
 * Created by joseph on 16/12/8.
 */
function resData() {
    var isSuccess=0;
    var data="";
    this.setIsSuccess=function (code) {
        this.isSuccess=code;
    };
    this.setData=function (data) {
        this.data=data;
    }
};

module.exports=resData;