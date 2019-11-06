
var myAccountClass = {
    currentFirebaseUser: {},
    initialize: function(){
        myAccountClass.currentFirebaseUser = {};
        $('#button-signout').click(function(event){
            if(isDevice)
            window.cordova.plugins.firebase.analytics.logEvent("Setting_logout_done","");
            firebaseSignOut();
        });
        myAccountClass.getCurrentUser();
        myAccountClass.fixElementsStyle();
    },
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },
    getCurrentUser: function(){
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              // User is signed in.
                myAccountClass.currentFirebaseUser = user;

                myAccountClass.showHtml();
                // user.unlink('password').then(function() {
                //     // Auth provider unlinked from account
                //     console.log('password success unlink');
                //     }).catch(function(error) {
                //     // An error happened
                //     console.log(error);
                // });
                // user.unlink('google.com').then(function() {
                //     // Auth provider unlinked from account
                //     console.log('google success unlink');
                //     }).catch(function(error) {
                //     // An error happened
                //     console.log(error);
                // });
                // user.unlink('facebook.com').then(function() {
                //     // Auth provider unlinked from account
                //     console.log('facebook success unlink');
                //     }).catch(function(error) {
                //     // An error happened
                //     console.log(error);
                // });
                isReady = true;

            } else {
              // No user is signed in.
            }
          });
    },
    showHtml: function(){
        if (myAccountClass.currentFirebaseUser == undefined || myAccountClass.currentFirebaseUser == null){
            console.log('Error current firebase user.');
            return;
        }
        authSource =  myAccountClass.getAuthInfomation();
        keys = Object.keys(authSource);

        $('#google-bind').empty();
        $('#google-bind').append('<a href="javascript:googleBind();" style="color:#3db1af;">連結</a>');
        $('#facebook-bind').empty();
        $('#facebook-bind').append('<a href="javascript:facebookBind();" style="color:#3db1af;">連結</a>');        

        for (i = 0; i < keys.length; i++){
            providerId = keys[i];
            if (providerId == 'password'){
                email = myAccountClass.getEmailAnonymousString(authSource[providerId]);
                $('.email-bound').empty();
                $('.email-bound').append('\
                    <div class="loin-info clearfix">\
                        電子信箱<span>' + email + '</span>\
                    </div>\
                    <a href="javascript:changePasswordPage();">密碼<span>更改密碼</span></a>\
                ');
            }
            if (providerId == 'google'){
                // $('.email-bound').empty();
                // $('.email-bound').append('<a href="#">電子信箱<span>尚未綁定</span></a>');
                $('#google-bind').empty();
                $('#google-bind').append('<a href="javascript:googleUnBind();" style="color:#adadad;">取消連結</a>');
            }
            if (providerId == 'facebook'){
                // $('.email-bound').empty();
                // $('.email-bound').append('<a href="#">電子信箱<span>尚未綁定</span></a>');
                $('#facebook-bind').empty();
                $('#facebook-bind').append('<a href="javascript:facebookUnBind();" style="color:#adadad;">取消連結</a>');        
            }
        }
    },
    getAuthInfomation: function(){
        if (myAccountClass.currentFirebaseUser == undefined || myAccountClass.currentFirebaseUser == null){
            console.log('Error current firebase user.');
            $('.email-bound').append('<a href="#">電子信箱<span>尚未綁定</span></a>');
            return {};
        }
        providerData = myAccountClass.currentFirebaseUser.providerData;
        result = {};
        for (i = 0; i < providerData.length; i++){
            provider = providerData[i];
            providerId = provider.providerId;
            if (providerId == 'google.com'){
                if (result['google'] == undefined && provider.email != null){
                    result['google'] = provider.email;
                }
            }
            if (providerId == 'facebook.com'){
                if (result['facebook'] == undefined && provider.email != null){
                    result['facebook'] = provider.email;
                }
            }
            if (providerId == 'password'){
                if (result['password'] == undefined && provider.email != null){
                    result['password'] = provider.email;
                }
            }
        }
        return result;
    },
    getEmailAnonymousString: function(email){
        block = email.split('@');
        id = block[0];
        result = '';
        if (block.length == 1){
            result = id.substr(0, 2) + '****' + id.substr(2 + 4);
        } else {
            result = id.substr(0, 2) + '****' + id.substr(2 + 4) + '@' + block[1];
        }
        return result;
    },
    showRecentLoginRequestDialog: function(){
        $('body').append('\
            <div class="custom-overlay" id="goto-login-dialog">\
                <div class="custom-popup">\
                    <a href="javascript:hideGotoLoginDialog();" class="close"><span class="sr-only">Close</span></a>\
                    <div class="table-div"><div class="table-cell">\
                        <img src="assets/images/error.svg" alt="">\
                        <p>Notice<br>\
                        Please login again</p>\
                        <a href="javascript:firebaseSignOut();" class="btn btn-primary">馬上登入</a>\
                    </div></div>\
                </div>\
            </div>\
        ');
    },
    hideRecentLoginRequestDialog: function(){
        $('#goto-login-dialog').remove();
    }
}