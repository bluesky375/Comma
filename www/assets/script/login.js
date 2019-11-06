'use_strict'

firebase.initializeApp(config);

var isFromPersonal = false;

var isDevice = false;
var isGoogleLogin = false;
var isEmailPassword = false;
var myUserData = {};

$(".back").click(function(){
    // window.history.back();
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("back_loginpage_click","");
    isFromPersonal = sessionStorage.getItem('isFromPersonal');
    if (isFromPersonal){
        window.location.href = "index.html";
    } else {
        window.history.go(-(window.history.length - 1));
    }
});

$(document).ready(function(){
    // showLoadingDialog();
    document.addEventListener('deviceready', onDeviceReady, false);

    isDevice = (sessionStorage.getItem('isDevice') != undefined) ? sessionStorage.getItem('isDevice') : false;
    initSessionStorage();

    submitState();

    if (!isDevice){
        webFacebookInit();
    }

    $('#input_email').keyup(function(){
        submitState()
    });
    $('#input_password').keyup(function(){
        submitState()
    })
    $('#login-form').submit(function(){
        var email = $("#input_email").val();
        var password = $('#input_password').val();
        isEmailPassword = true;
    
        if (password.length < 6 || password.length > 12){
            showErrorDialogWithText("密碼格式需包含6~12個字元");
            setTimeout(hideErrorDialog, 2000);
            return;
        }
        showLoginLoadingDialog();
        firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
            hideLoadingDialog();
            showLogInSuccessDialog();
    
        }).catch(function(error) {
            hideLoadingDialog();
            showErrorDialogWithError(error);
            setTimeout(hideErrorDialog, 2000);
        });
    });
});
function onDeviceReady(){
    sessionStorage.setItem('isDevice', true);

    if(window.MobileAccessibility){
        window.MobileAccessibility.usePreferredTextZoom(false);
    }
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("login_landingpage_click","");
}
function initSessionStorage(){
    if (sessionStorage.getItem('logged') != undefined) sessionStorage.removeItem('logged');
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if (user.isAnonymous){
            initSession();
            sessionStorage.setItem('isFromPersonal', false);
            sessionStorage.setItem('logged', true);
            document.cookie = "account=guest; expires=Thu, 18 Dec 2040 12:00:00 UTC";
            window.location.href = "router.html";
        } else {
            isAccountMode = true;
            sessionStorage.setItem('logged', true);
            sessionStorage.setItem('isAccountMode', true);
            sessionStorage.setItem('accountUid', user.uid);
            sessionStorage.setItem('isFromPersonal', false);
            document.cookie = "account=account; expires=Thu, 18 Dec 2040 12:00:00 UTC";
            saveSnsProfile(user, success => {
                // window.location = 'home.html';
                window.location = 'router.html';
            });
        }

    } else {
        hideLoadingDialog();
    }
});

function saveSnsProfile(user, success){
    var uid = user.uid;
    loadMyProfileData(uid, data => {
        if (data == undefined || data == {}){
            var uid = user.uid;
            var created_time = user.metadata.creationTime;
            var created_date = getDateStringFromTimestamp(created_time);
            var user_ref = firebase.database().ref('Users/' + uid);
            var profileImageUrl = '';
            if (!isEmailPassword){
                if (isGoogleLogin){
                    profileImageUrl = (user.photoURL == undefined || user.photoURL == null) ? "" : (user.photoURL + '?sz=150');
                } else {
                    profileImageUrl = (user.photoURL == undefined || user.photoURL == null) ? "" : (user.photoURL + '?width=150&height=150');
                }
            }
            var name = (user.displayName == undefined || user.displayName == null) ? "" : user.displayName;
            var email = (user.email = undefined || user.email == null) ? "" : user.email;
            user_ref.set({
                CreatedAt: created_date,
                account: email,
                UpdatedAt: created_date,
                name: name,
                profileImageUrl: profileImageUrl
            }).then(function(){
                success(true);
            }).catch(function(){
                success(false);
            });
        } else {
            var uid = user.uid;
            myUserData = data;
            myUserData['uid'] = uid;
            success(true);
            return;
            if (data.profileImageUrl != undefined && data.profileImageUrl != null && data.profileImageUrl != '' && data.profileImageUrl.includes('firebasestorage')){
                success(true);
                return;
            }
            if (isEmailPassword){
                success(true);
            } else {
                var profileImageUrl = '';
                providerData = user.providerData;
                var user_ref = firebase.database().ref('Users/' + uid);
                var now = new Date().getTime();
                UpdatedAt = getDateStringFromTimestamp(now);
                for (i = 0; i < providerData.length; i++){
                    provider = providerData[i];
                    providerId = provider.providerId;
                    if (isGoogleLogin){
                        if (providerId == 'google.com'){
                            profileImageUrl = (provider.photoURL == undefined || provider.photoURL == null) ? "" : (provider.photoURL + '?sz=150');
                            var name = (provider.displayName == undefined || provider.displayName == null) ? "" : provider.displayName;
                            var email = (provider.email = undefined || provider.email == null) ? "" : provider.email;
                            user_data = {
                                UpdatedAt: UpdatedAt,
                                name: name,
                                account: email,
                                profileImageUrl: profileImageUrl
                            }
                            updateProfileData(user_data, uid, completion => {
                                success(true);
                            });
                            break;
                        }
                    } else {
                        if (providerId == 'facebook.com'){
                            console.log('Facebook login change name');
                            profileImageUrl = (provider.photoURL == undefined || provider.photoURL == null) ? "" : (provider.photoURL + '?width=150&height=150');
                            var name = (provider.displayName == undefined || provider.displayName == null) ? "" : provider.displayName;
                            var email = (provider.email = undefined || provider.email == null) ? "" : provider.email;
                            user_data = {
                                UpdatedAt: UpdatedAt,
                                name: name,
                                account: email,
                                profileImageUrl: profileImageUrl
                            }
                            updateProfileData(user_data, uid, completion => {
                                success(true);
                            });
                            break;
                        }
                    }
                }
            }
        }
    });
}

function loadMyProfileData(uid, data){
    if (uid == undefined || uid == null || uid == ''){
        data({});
        return;
    }
    firebase.database().ref('/Users/' + uid + '/').once('value').then(function(snapshot){
        if (snapshot != undefined && snapshot != null){
            data(snapshot.val());
        } else {
            data({});
        }
    });
}


function firebaseSignOut(result){
    firebase.auth().signOut().then(function() {
        result(true);
    }).catch(function(error) {
        result(false);
    });
}
function submitState(){
    var email = $("#input_email").val();
    var password = $('#input_password').val();
    isDisabled = true;
    if (email != "" && password != ""){
        isDisabled = false;
    } else {
        isDisabled = true;
    }
    $("#btn_submit").attr("disabled", isDisabled);
}


function webIsSignedInListenerWithGoogle(isSigendIn) {
    if (isSigendIn) {
        gapi.load('auth2', function(){
            google_auth = gapi.auth2.init({
                client_id: "591618737856-03iljt0iemgqiquag6pcpijdncvjlijr",
                prompt: "select_account"
            });
            google_auth.then(function(auth2){
                obj = auth2.currentUser.get().getAuthResponse();
                logoutWebWithGoogle();
                firebaseLoginWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.id_token));
            })
        });
    }
};
function loginWebWithGoogle(){
    gapi.load('auth2', function(){
        google_auth = gapi.auth2.init({
            client_id: "591618737856-03iljt0iemgqiquag6pcpijdncvjlijr",
            prompt: "select_account"
        });
        google_auth.then(function(auth2){
            if (auth2.isSignedIn.get()){
                console.log("Already logged in");
                obj = auth2.currentUser.get().getAuthResponse();
                logoutWebWithGoogle();
                firebaseLoginWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.id_token));
            } else {
                auth2.isSignedIn.listen(webIsSignedInListenerWithGoogle);
                auth2.signIn();
            }

        }, function(onError){
            console.log("Error occured!");
        });
    });
}
function logoutWebWithGoogle(){
    gapi.load('auth2', function(){
        google_auth = gapi.auth2.init({
            client_id: "591618737856-03iljt0iemgqiquag6pcpijdncvjlijr",
            prompt: "select_account"
        });
        google_auth.then(function(auth2){
            if (auth2.isSignedIn.get()){
                console.log('web google sign out successful');
                auth2.signOut();
            } else {
                console.log('web google already sign out');
            }
        }, function(onError){
            console.log("Error occured!");
        });
    });
}
function logInWithGmail(){
    isGoogleLogin = true;
    isEmailPassword = false;
    if (isDevice){
        console.log('Device Google login');
        window.plugins.googleplus.login(
            {
                'webClientId' : '591618737856-03iljt0iemgqiquag6pcpijdncvjlijr.apps.googleusercontent.com',
                'offline': true
            },
            function (obj) {
                logoutDeviceWithGoogle();                
                firebaseLoginWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.idToken));
            },
            function (msg) {
                console.log("error2: " + msg);
            }
        );
    } else {
        loginWebWithGoogle();
        // logoutWebWithGoogle();
    }
}
function logoutDeviceWithGoogle() {
    if (isDevice){
        window.plugins.googleplus.logout(
            function (msg) {

            },
            function (error) {

            }
        );
    }
}
firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
        var token = result.credential.accessToken;
    }
    var user = result.user;
}).catch(function(error) {
});

function signInWithFacebook(){
    isGoogleLogin = false;
    isEmailPassword = false;
    if (isDevice){
        facebookConnectPlugin.getLoginStatus(function(obj){
            if (obj.status == "connected"){
                deviceFacebookLogOut();
                firebaseLoginWithCredential(firebase.auth.FacebookAuthProvider.credential(obj.authResponse.accessToken));
            } else {
                deviceFacebookLogIn();
            }
        }, function(failure){
            console.log(failure);
        });
    } else {
        webFacebookLogin();
    }
}
// FB.getLoginStatus(function(response) {
//     statusChangeCallback(response);
// });
function webFacebookInit(){
    window.fbAsyncInit = function() {
        FB.init({
        appId            : '401403393670118',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v3.3',
        cookie           : true,
        });
    };
}
function webFacebookLogin(){
    console.log("facebook login");
    FB.login(function(response) {
    // handle the response
        console.log(response);
        if (response.status == "connected"){
            webFacebookLogout();
            firebaseLoginWithCredential(firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken));
        }
    }, {scope: 'public_profile,email'});
}
function webFacebookLogout(){
    FB.logout(function(response) {
        console.log("Web Facebook logged out");
    });
}
function deviceFacebookLogIn(){
    facebookConnectPlugin.login(["public_profile", "email"], function(obj){
        deviceFacebookLogOut();
        firebaseLoginWithCredential(firebase.auth.FacebookAuthProvider.credential(obj.authResponse.accessToken));
    }, function(error){
        console.log(error);
    });        
}
function deviceFacebookLogOut(){
    facebookConnectPlugin.logout(function(success){
            console.log("Device Facebook logged out");
        }, function(failure){
            console.log("Device Facebook logged out failure");
    });
}
function firebaseLoginWithCredential(token){
    if (!firebase.auth().currentUser) {
        showLoadingDialogWithText('登入中...');
        firebase.auth().signInWithCredential(token)
        .then((success) => {
            // console.log("success: " + JSON.stringify(success)); // to long json to put it in #feedback
        })
        .catch((error) => {
            hideLoadingDialog();
            console.log("error0: " + JSON.stringify(error));
            showErrorDialogWithCloseAndText(error.code);
        });
    }else{
        console.log('error1: already sigend in firebase');
        document.cookie = "account=account; expires=Thu, 18 Dec 2040 12:00:00 UTC";
        window.location = "router.html";
    }
}
function updateProfileData(user, uid, completion){
    picUrl = user.profileImageUrl;
    if (picUrl == undefined || picUrl == null){
        picUrl = "";
    }
    var updateCnt = ((picUrl != "" && picUrl != myUserData.profileImageUrl) || user.name != myUserData.name) ? 3 : 1;
    if ((picUrl != "" && picUrl != myUserData.profileImageUrl) || user.name != myUserData.name) {
        updateDiscussUserData(user, completion => {
            updateCnt--;
            if (!updateCnt){
                completion(true);
            }
        });
        updateDiscussCommentUserData(user, completion => {
            updateCnt--;
            if (!updateCnt){
                completion(true);
            }
        });
    }
    firebase.database().ref().child('Users').child(uid).update(user).then(() => {
        updateCnt--;
        if (!updateCnt){
            completion(true);
        }
    });
}
function updateDiscussUserData(userData, completion) {
    var disucssRef = firebase.database().ref('Discuss');
    disucssRef.once('value').then(function (snapshot) {
        discussData = snapshot.val();
        if (discussData == undefined || discussData == null) {
            completion(true);
            return;
        }

        courseKeyList = Object.keys(discussData);

        for (i = 0; i < courseKeyList.length; i++) {
            courseKey = courseKeyList[i];
            discussObject = discussData[courseKey];
            discussKeyList = Object.keys(discussObject);
            for (j = 0; j < discussKeyList.length; j++) {
                discussKey = discussKeyList[j];
                discuss = discussObject[discussKey];
                if (discuss.userId != undefined && discuss.userId != null &&
                    myUserData.uid != undefined && myUserData.uid != null &&
                    discuss.userId == myUserData.uid) {
                    if (userData.profileImageUrl != undefined && userData.profileImageUrl != null) {
                        disucssRef.child(courseKey).child(discussKey).child('userImage').set(userData.profileImageUrl);
                    }
                    if (userData.name != undefined && userData.name != null) {
                        disucssRef.child(courseKey).child(discussKey).child('userName').set(userData.name);
                    }
                }
            }
        }
        completion(true);
    });
}

function updateDiscussCommentUserData(userData, completion){

    var disucssCommentRef = firebase.database().ref('DiscussComments');
    disucssCommentRef.once('value').then(function (snapshot) {
        discussCommentData = snapshot.val();
        if (discussCommentData == undefined || discussCommentData == null) {
            completion(true);
            return;
        }
        courseKeyList = Object.keys(discussCommentData);
        for (i =0; i < courseKeyList.length; i++){
            courseKey = courseKeyList[i];
            discusses = discussCommentData[courseKey];
            discussKeyList = Object.keys(discusses);
            for (j = 0; j < discussKeyList.length; j++){
                discussKey = discussKeyList[j];
                discuss = discusses[discussKey];
                commentKeyList = Object.keys(discuss);
                for (k = 0; k < commentKeyList.length; k++){
                    commentKey = commentKeyList[k];
                    comment = discuss[commentKey];
                    if (comment.userId != undefined && comment.userId != null &&
                        myUserData.uid != undefined && myUserData.uid != null &&
                        comment.userId == myUserData.uid){
                        if (userData.profileImageUrl != undefined && userData.profileImageUrl != null) {
                            disucssCommentRef.child(courseKey).child(discussKey).child(commentKey).child('userImage').set(userData.profileImageUrl);
                        }
                        if (userData.name != undefined && userData.name != null) {
                            disucssCommentRef.child(courseKey).child(discussKey).child(commentKey).child('userName').set(userData.name);
                        }
                    }
                }
            }
        }
        completion(true);
    });
}