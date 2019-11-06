function showLoginLoadingDialog(){
    $('body').append('<div class="custom-overlay" id="loading_dialog">\
        <div class="custom-popup">\
            <div class="table-div">\
                <div class="table-cell">\
                <div id="loading-animation"></div>\
                    <p>登入中...</p>\
                </div>\
            </div>\
        </div>\
    </div>');
    lottie.loadAnimation({
        container: document.getElementById('loading-animation'),
        renderer: 'svg',
        path: 'loading.json',
        loop: true,
        autoplay: true,
    });
}
function showLoadingDialogWithText(text){

    $('body').append('<div class="custom-overlay" id="loading_dialog">\
        <div class="custom-popup">\
            <div class="table-div">\
                <div class="table-cell">\
                    <div id="loading-animation"></div>' 
                    + ((text != '') ? '<p>' + text + '</p>' : '') + 
                '</div>\
            </div>\
        </div>\
    </div>');
    lottie.loadAnimation({
        container: document.getElementById('loading-animation'),
        renderer: 'svg',
        path: 'loading.json',
        loop: true,
        autoplay: true,
    });
}
function hideLoadingDialog(){
    $('#loading_dialog').remove();
}

function showLogInErrorDialog(){
    $('body').append('\
                        <div class="custom-overlay" id="error_dialog">\
                            <div class="custom-popup">\
                                <div class="table-div"><div class="table-cell">\
                                <img src="assets/images/error.svg" alt="">\
                                <p>電子信箱輸入錯誤</p>\
                                </div></div>\
                            </div>\
                        </div>'
                    );
}
function showLogInErrorDialogWithText(text){
    $('body').append('\
                        <div class="custom-overlay" id="error_dialog">\
                            <div class="custom-popup">\
                                <div class="table-div"><div class="table-cell">\
                                <img src="assets/images/error.svg" alt="">\
                                <p>' + text + '</p>\
                                </div></div>\
                            </div>\
                        </div>'
                    );
}
function showErrorDialogWithError(error){
    if (error == undefined || error == null){
        return;
    }
    if (error.code == 'auth/user-not-found'){
        showLogInErrorDialogWithText('電子信箱輸入錯誤');
        setTimeout(hideErrorDialog, 2000);
    } else if (error.code == 'auth/wrong-password'){
        showLogInErrorDialogWithText('密碼不正確');
        setTimeout(hideErrorDialog, 2000);
    } else if (error.code == 'auth/network-request-failed'){
        showLogInErrorDialogWithText('請檢查網路連線');
        setTimeout(hideErrorDialog, 2000);
    } else if (error.code == 'auth/email-already-in-use') {
        showLogInErrorDialogWithText('此電子信箱已經有人使用');
        setTimeout(hideErrorDialog, 2000);
    } else if (error.code == 'auth/invalid-email'){
        showLogInErrorDialog('電子信箱輸入錯誤');
        setTimeout(hideErrorDialog, 2000);
    } else if (error.code == 'auth/credential-already-in-use'){
        showErrorDialogWithText('此帳號已連接至其他帳號');
        setTimeout(hideErrorDialog, 2000);
    } else if (error.code == 'auth/email-already-in-use'){
        showErrorDialogWithText('此電子信箱已經有人使用');
        setTimeout(hideErrorDialog, 2000);
    } else if (error.code == 'auth/requires-recent-login'){
        showRecentLoginRequestDialog();
    } else  if (error.code == 'auth/operation-not-allowed'){
        showErrorDialogWithText('Operation not allowed');
        setTimeout(hideErrorDialog, 2000);
    } else if (error.code == 'auth/provider-already-linked'){
        showErrorDialogWithError(error.message);
        setTimeout(hideErrorDialog, 2000);
    }
    else{
        console.log('Error code: ', error.code);
        showLogInErrorDialogWithText(error.message);
        setTimeout(hideErrorDialog, 2000);
    }
}
function hideLogInErrorDialog(){
    $('#error_dialog').remove();
}

function showLogInSuccessDialog(){
    $('body').append('<div class="custom-overlay" id="success_dialog">\
                        <div class="custom-popup">\
                            <div class="table-div"><div class="table-cell">\
                            <img src="assets/images/checked.svg" alt="">\
                            <p>登入成功</p>\
                            </div></div>\
                        </div>\
                    </div>'
    );
}

function hideLogInSuccessDialog(){
    $("#success_dialog").remove();
}

function showSuccessDialogWithText(text){
    $('body').append('\
                    <div class="custom-overlay" id="success_dialog">\
                        <div class="custom-popup">\
                            <div class="table-div"><div class="table-cell">\
                            <img src="assets/images/checked.svg" alt="">\
                            <p>' +  text + '</p>\
                            </div></div>\
                        </div>\
                    </div>'
    );
}
function hideSuccessDialog(){
    $("#success_dialog").remove();
}

function showErrorDialogWithText(text){
    $('body').append('\
        <div class="custom-overlay" id="error_dialog">\
            <div class="custom-popup">\
                <div class="table-div"><div class="table-cell">\
                <img src="assets/images/error.svg" alt="">\
                <p>' +  text + '</p>\
                </div></div>\
            </div>\
        </div>'
    );
}
function showErrorDialogWithCloseAndText(text){
    $('body').append('\
        <div class="custom-overlay" id="error_dialog">\
            <div class="custom-popup">\
                <a href="javascript:hideErrorDialog();" class="close"><span class="sr-only">Close</span></a>\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/error.svg" alt="">\
                    <p>' + text + '</p>\
                </div></div>\
            </div>\
        </div>\
    ');
}
function showSafeErrorDialogWithCloseAndText(text){
    if ($('#error_dialog').length == ''){
        showErrorDialogWithCloseAndText(text);
    }
}
function hideErrorDialog(){
    $('#error_dialog').remove();
}

function showGotoLoginDialog(){
    $('body').append('\
        <div class="custom-overlay" id="goto-login-dialog">\
            <div class="custom-popup">\
                <a href="javascript:hideGotoLoginDialog();" class="close"><span class="sr-only">Close</span></a>\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/error.svg" alt="">\
                    <p>請先登入<br>\
                    以使用此功能</p>\
                    <a href="javascript:gotoWelcome();" class="btn btn-primary">馬上登入</a>\
                </div></div>\
            </div>\
        </div>\
    ');
}
function hideGotoLoginDialog(){
    $('#goto-login-dialog').remove();
}

function showCouponCourseSuccessDialog(courseId){
    $('.custom-overlay').remove();
    $('body').append('\
        <div class="custom-overlay" id="coupon-send-success-dialog">\
            <div class="custom-popup">\
                <a href="javascript:hideSendCouponSuccessDialog();" class="close"><span class="sr-only">Close</span></a>\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/checked.svg" alt="">\
                    <p>' + courseId +'課程<br>兌換成功</p>\
                    <a href="javascript:hideSendCouponSuccessDialog();courseDetailPage(\'' + courseId +'\');" class="btn btn-primary popup-btn">前往課程</a>\
                </div></div>\
            </div>\
        </div>\
    ');
}
function showSendCouponSuccessDialog(){
    $('.custom-overlay').remove();
    $('body').append('\
        <div class="custom-overlay" id="coupon-send-success-dialog">\
            <div class="custom-popup">\
                <a href="javascript:hideSendCouponSuccessDialog();" class="close"><span class="sr-only">Close</span></a>\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/checked.svg" alt="">\
                    <p>onfoto課程<br>兌換成功</p>\
                    <a href="javascript:hideSendCouponSuccessDialog();" class="btn btn-primary popup-btn">前往課程</a>\
                </div></div>\
            </div>\
        </div>\
    ');
}
function hideSendCouponSuccessDialog(){
    $('#coupon-send-success-dialog').remove();
}

function showSendCouponFailedDialog(){
    $('.custom-overlay').remove();
    $('body').append('\
        <div class="custom-overlay" id="coupon-send-failed-dialog">\
            <div class="custom-popup">\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/error.svg" alt="">\
                    <p>兌換失敗<br>查無此優惠碼</p>\
                </div></div>\
            </div>\
        </div>\
    ');
}
function showSendCouponFailedDialogWithText(message){
    $('.custom-overlay').remove();
    $('body').append('\
        <div class="custom-overlay" id="coupon-send-failed-dialog">\
            <div class="custom-popup">\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/error.svg" alt="">\
                    <p>兌換失敗<br>' + message + '</p>\
                </div></div>\
            </div>\
        </div>\
    ');
}
function hideSendCouponFailedDialog(){
    $('#coupon-send-failed-dialog').remove();
}
function showCouponSuccessDialogWithPoint(point){
    $('.custom-overlay').remove();
    $('body').append('\
        <div class="custom-overlay" id="coupon-send-success-dialog">\
            <div class="custom-popup">\
                <a href="javascript:hideSendCouponSuccessDialog();" class="close"><span class="sr-only">Close</span></a>\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/checked.svg" alt="">\
                    <p>' + point + '點點數<br>兌換成功</p>\
                    <a href="javascript:hideSendCouponSuccessDialog();onBackPage();" class="btn btn-primary popup-btn">查看點數</a>\
                </div></div>\
            </div>\
        </div>\
    ');
}

function showRecentLoginRequestDialog(){
    $('body').append('\
        <div class="custom-overlay" id="goto-login-dialog">\
            <div class="custom-popup">\
                <a href="javascript:hideGotoLoginDialog();" class="close"><span class="sr-only">Close</span></a>\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/error.svg" alt="">\
                    <p>請重新登入</p>\
                    <a href="javascript:firebaseSignOut();" class="btn btn-primary">馬上登入</a>\
                </div></div>\
            </div>\
        </div>\
    ');
}
function showGotoValueCenterDialog(){
    $('body').append('\
        <div class="custom-overlay" id="goto-value-center-dialog">\
            <div class="custom-popup">\
                <a href="javascript:hideGotoValueCenterDialog();" class="close"><span class="sr-only">Close</span></a>\
                <div class="table-div"><div class="table-cell">\
                    <img src="assets/images/error.svg" alt="">\
                    <p>點數不足</p>\
                    <a href="javascript:hideGotoValueCenterDialog(); storeValueCenterPage();" class="btn btn-primary">立即儲值</a>\
                </div></div>\
            </div>\
        </div>\
    ');
}
function hideGotoValueCenterDialog(){
    $("#goto-value-center-dialog").remove();
}
function gotoLogin(){
    sessionStorage.setItem('isAccountMode', false);
    sessionStorage.setItem('logged', false);
    sessionStorage.setItem('isFromPersonal', true);
    window.history.go(-(window.history.length));
    window.location.href = "login.html";
}
function gotoWelcomeAndInitialize(){
    sessionStorage.setItem('isAccountMode', false);
    sessionStorage.setItem('logged', false);
    sessionStorage.setItem('isFromPersonal', true);
    window.location.href = "index.html";
}

function gotoWelcome(){
    firebase.auth().signOut();
    window.location.href = "index.html";
}
function gotoIndexPage(){
    sessionStorage.removeItem('isAccountMode');
    sessionStorage.removeItem('logged');
    sessionStorage.removeItem('isFromPersonal');
    window.history.go(-(window.history.length));
    window.location.href = "index.html";    
}
function getDateStringFromTimestamp(timestamp){
    if (timestamp == -1){
        return "0000-00-00 00:00:00";
    }
    var createdDate = new Date(timestamp);
    var year = createdDate.getFullYear();
    var month = '' + (createdDate.getMonth()+1);
    if (month.length < 2) month = '0' + month;
    var date = '' + createdDate.getDate();
    if (date.length < 2) date = '0' + date;
    var hour = '' + createdDate.getHours();
    if (hour.length < 2) hour = '0' + hour;
    var minute = '' + createdDate.getMinutes();
    if (minute.length < 2) minute = '0' + minute;
    var second = '' + createdDate.getSeconds();
    if (second.length < 2) second = '0' + second;
    var string = year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
    return string;
}
function getDateFromTimestamp(timestamp){
    var createdDate = new Date(timestamp);
    var year = createdDate.getFullYear();
    var month = '' + (createdDate.getMonth()+1);
    if (month.length < 2) month = '0' + month;
    var date = '' + createdDate.getDate();
    if (date.length < 2) date = '0' + date;
    var string = year + '-' + month + '-' + date;
    return string;
}
function getTimeAgoStringFromTimestamp(timestamp){
    if (timestamp == undefined || timestamp == 0){
        return 'None';
    }
    var now_timestamp = new Date().getTime();
    var secondsBetween = now_timestamp - timestamp;
    var tm =  Math.round(secondsBetween / 1000);
    var result = '';
    if ( tm < 0 ) {
        result = "1秒前";
    }
    else if ( tm < 60 ) {
        result = "" + tm + "秒前";
    }
    else if( tm < 60*60) {
        result = "" + Math.round(tm / 60) + "分鐘前";
    }
    else if( tm < 60*60*24) {
        result = "" + Math.round(tm/60/60) + "小時前";
    }
    else if( tm < 60*60*24*30){
        result = "" + Math.round(tm/60/60/24) + "天前";
    }
    else if( tm < 60*60*24*365){
        result = "" + Math.round(tm/60/60/24/30) + "個月前";
    }
    else {
        result = "" + Math.round(tm/60/60/24/365) + "年前";
    }
    return result;
}

function getFullWidthSpaceString(srcString){

    var data = srcString;
    data = data.replaceAll('||', ':;');
    data = data.replaceAll('\t\t', ':;');
    data = data.replaceAll(':;|', ':;');
    data = data.replaceAll(':;\t', ':;');

    data = data.replaceAll(':;:;', ',,');
    data = data.replaceAll(',,:;', ',,');
    data = data.replaceAll(':;', '');

    data = data.replaceAll(',,', '<span style="color:transparent;">想</span>');
    return data;
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};



Date.prototype.toShortFormat = function() {

    var month_names =["Jan","Feb","Mar",
                      "Apr","May","Jun",
                      "Jul","Aug","Sep",
                      "Oct","Nov","Dec"];
    
    var day = this.getDate();
    var month_index = this.getMonth();
    var year = this.getFullYear();
    
    return "" + month_names[month_index] + " " +  day + ", " + year;
}
String.prototype.toDate = function() {
    var month_names =["Jan","Feb","Mar",
                      "Apr","May","Jun",
                      "Jul","Aug","Sep",
                      "Oct","Nov","Dec"];
    blocks = this.split(/,\s|\s/);
    month = parseInt(month_names.indexOf(blocks[0]));
    day = parseInt(blocks[1]);
    year = parseInt(blocks[2]);
    return [month + 1, day, year];
}

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

String.prototype.toSeconds = function() {
    blocks = this.split(':');
    switch (blocks.length){
        case 1:
            return parseInt(blocks[0]);
        case 2:
            return parseInt(blocks[0]) * 60 + parseInt(blocks[1]);
        case 3:
            return parseInt(blocks[0]) * 3600 + parseInt(blocks[1]) * 60 + parseInt(blocks[2]);
        default:
            return -1;
    }
}
String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

String.prototype.getImgSrcFromImage = function(){
    var result = this.replace("<image=", "<img src='");
    result = result.replace(">", "'/>");
    return result;
}
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function isAlphaBet(charCode){
    return (charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123);
}
function getDecryptedCourseId(encryptedCourseId){
    var result = '';
    for (i = 0; i < encryptedCourseId.length; i++){
        charCode = encryptedCourseId.charCodeAt(i);
        if (isAlphaBet(charCode)){
            if (charCode == 65 || charCode == 97){
                charCode += 25;
            } else {
                charCode --;
            }    
        }
        result += String.fromCharCode(charCode);
    }
    return result;
}

function getEncryptedCourseId(decryptedCourseId){
    var result = '';
    for (i = 0; i < decryptedCourseId.length; i++){
        charCode = decryptedCourseId.charCodeAt(i);
        if (isAlphaBet(charCode)){
            if (charCode == 90 || charCode == 122){
                charCode -= 25;
            } else {
                charCode ++;
            }
        }
        result += String.fromCharCode(charCode);
    }
    return result;
}