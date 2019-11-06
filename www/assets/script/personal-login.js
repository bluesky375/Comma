


var personalClass = {
    isProfileReady: false,

    initialize: function () {

        if (!isDevice) {
            // webFacebookInit();
        }
    
        if (isAccountMode) {
            personalClass.showAccountMode();
            personalClass.loadUserInfo(data => {
                myUserData = data;
                personalClass.isProfileReady = true;
                $('#edit-data').removeClass('disabled');
                if (data.profileImageUrl != undefined && data.profileImageUrl != "") {
                    $("#avatar-img").attr("src", data.profileImageUrl);
                }
                if (data.name != undefined && data.name != "") {
                    $("#user-name").text(data.name);
                }
                if (data.RewardPoints != undefined) {
                    $("#reward-point").text("" + data.RewardPoints + "點");
                }
            });
        } else {
            personalClass.showGuestMode();
        }

        personalClass.fixElementsStyle();
    },
    fixElementsStyle: function(){
        if (player.miniPlayerExist){
            $('.home-player').css('bottom', '48px');
            $('.content-wrapper').css('padding-bottom', '100px');
        } else {
            $('.home-player').remove();
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },
    loadUserInfo: function (data) {
        personalClass.getCurrentUserUID(result => {
            if (result != undefined && result != "") {
                myUserId = result;
                firebase.database().ref('/Users/' + result + '/').on('value', function (snapshot) {
                    userData = snapshot.val();
                    userData['uid'] = result;
                    data(userData);
                });
            } else {
                data({});
            }
        });
    },
    getCurrentUserUID: function (result) {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                result(user.uid);
            } else {
                result("");
            }
        });
    },

    showAccountMode: function () {
        $('#personal-data').append('\
            <div class="user-image"><img src="assets/images/user-silhouette.png" alt="" id="avatar-img"></div>\
            <div class="media-body">\
                <h4 id="user-name"></h4>\
                <div class="clearfix">\
                    <div class="coins float-left"><img src="assets/images/dollar-coin-money.svg" alt=""><span id="reward-point">0點</span></div>\
                    <a href="javascript:storeValueCenterPage();" class="btn btn-primary btn-sm float-right">儲值</a>\
                </div>\
                <a href="javascript:void(0);" class="btn btn-light btn-block btn-sm disabled" id="edit-data">編輯個人資訊</a>\
            </div>\
        ');

        $('#personal-info').append('\
            <ul>\
                <li><a href="javascript:myAccountPage();">帳號設定</a></li>\
                <li><a href="javascript:coursePurchaseRecordPage();">課程購買記錄</a></li>\
                <li><a href="javascript:discountCodePage();">兌換碼</a></li>\
                <li><a href="javascript:becomeLecturerPage();">成為講師</a></li>\
                <li><a href="javascript:feedbackPage();">意見反饋</a></li>\
                <li><a href="javascript:personalAboutCommaPage();">關於 Comma</a></li>\
            </ul>\
        ');
        $('#edit-data').click(function (event) {
            if (personalClass.isProfileReady) {
                if(isDevice)
                window.cordova.plugins.firebase.analytics.logEvent("Setting_editprofile_click","");
                personalClass.gotoEditPersonalInformation();
            }
        });
    },
    showGuestMode: function () {
        $('#personal-data').append('\
            <div class="user-image"><img src="assets/images/user-silhouette.png" alt=""></div>\
            <div class="media-body">\
                <h4>尚未登入</h4>\
                <div class="coins"><img src="assets/images/dollar-coin-money.svg" alt="">0點</div>\
                <a href="javascript:gotoWelcome();" class="btn btn-primary btn-block btn-sm">我要登入</a>\
            </div>\
        ');
        $('#personal-info').append('\
            <ul>\
                <li><a href="javascript:becomeLecturerPage();">成為講師</a></li>\
                <li><a href="javascript:feedbackPage();">意見反饋</a></li>\
                <li><a href="javascript:personalAboutCommaPage();">關於 Comma</a></li>\
            </ul>\
        ');
    },

    gotoEditPersonalInformation: function () {
        personalEditInformationPage();
    }
}