'use_strict'
firebase.initializeApp(config);

var isDevice = false;
var isEmailPassword = false;

var isGoogleLogin = false;
var myUserData = {};

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


$(document).ready(function(){
    document.addEventListener('deviceready', onDeviceReady, false);

    $(".back").click(function(){
        if(isDevice)
        window.cordova.plugins.firebase.analytics.logEvent("back_signuppage_click","");
        window.history.back();
    });
    
    $("#name").keyup(function() {
        submitButtonState()
    });
    $("#email").keyup(function(){
        submitButtonState()
    });
    $("#password").keyup(function(){
        submitButtonState()
    })
    $("#password_confirm").keyup(function(){
        submitButtonState()
    });

    $("#google_login").click(function(){
        logInWithGmail();
    })
    if (sessionStorage.getItem('isDevice') != undefined && sessionStorage.getItem('isDevice') == "true"){
        isDevice = true;
    }
    if (isDevice) {
        console.log('This is device from register.');
    } else {
        console.log('This is web in register.');
        webFacebookInit();
    }
});
function onDeviceReady(){
    sessionStorage.setItem('isDevice', true);
    if(window.MobileAccessibility){
        window.MobileAccessibility.usePreferredTextZoom(false);
    }
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("back_signuppage_click","");
}

function submitButtonState(){
    var name = $("#name").val();
    var email = $("#email").val();
    var password = $("#password").val();
    var password_confirm = $("#password_confirm").val();

    var isAvailable = false;
    if (name == undefined || name == "" || 
        email == undefined || email == "" || 
        password == undefined || password == "" || 
        password_confirm == undefined || password_confirm == ""
        ){
        isAvailable = false;
    } else {
        isAvailable = true;
    }
    if (isAvailable){
        $("#button_submit").attr("disabled", false);
    } else {
        $("#button_submit").attr("disabled", true);
    }
}
function register(){
    var name = $("#name").val();
    var email = $("#email").val();
    var password = $("#password").val();
    var password_confirm = $("#password_confirm").val();
    isEmailPassword = true;

    if (password != password_confirm){
        showErrorDialogWithText("密碼輸入錯誤");
        setTimeout(hideErrorDialog, 2000);
        return;
    }
    if (password.length < 6 || password.length > 12){
        showErrorDialogWithText("密碼格式需包含6~12個字元");
        setTimeout(hideErrorDialog, 2000);
        return;
    }

    showLoadingDialogWithText('註冊中...');
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
        hideLoadingDialog();
        showSuccessDialogWithText('註冊成功.')
        setTimeout(hideLogInSuccessDialog, 2000);
    }).catch(function(error) {
        hideLoadingDialog();
        showErrorDialogWithError(error);
        setTimeout(hideErrorDialog, 2000);
    });
}

function saveProfile(user, success){
    var name = $("#name").val();
    var email = $("#email").val();
    var uid = user.uid;
    var created_time = user.metadata.creationTime;
    var created_date = getDateStringFromTimestamp(created_time);
    var user_ref = firebase.database().ref('Users/' + uid);
    user_ref.set({
        CreatedAt: created_date,
        account: email,
        UpdatedAt: created_date,
        name: name
    }).then(function(){
        success(true);
    }).catch(function(){
        success(false);
    });
}

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


firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if (user.isAnonymous){
            initSession();
            sessionStorage.setItem('isFromPersonal', false);
            sessionStorage.setItem('logged', true);
            document.cookie = "account=guest; expires=Thu, 18 Dec 2040 12:00:00 UTC";
            window.location.href = "router.html";
        } else {
            sessionStorage.setItem('logged', true);
            sessionStorage.setItem('isAccountMode', true);
            sessionStorage.setItem('isFromPersonal', false);
            sessionStorage.setItem('accountUid', user.uid);
            document.cookie = "account=account; expires=Thu, 18 Dec 2040 12:00:00 UTC";
            if (isEmailPassword){
                isAccountMode = true;
                saveProfile(user, success => {
                    if (success){
                        window.location = 'router.html';
                    } else {
                        console.log('While save the user data, error occured!');
                        window.location = 'router.html';
                    }
                });
            } else {
                console.log('sns login');
                isAccountMode = true;
                saveSnsProfile(user, success => {
                    if (success){
                        window.location = 'router.html';
                    } else {
                        console.log('While save the user data, error occured!');
                        window.location = 'router.html';
                    }
                });
            }
        }

    }
});
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
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("Glogin_landingpage_click","");
    isEmailPassword = false;
    isGoogleLogin = true;
    if (isDevice) {
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
function signInWithFacebook(){
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("FBlogin_landingpage_click","");
    isEmailPassword = false;
    isGoogleLogin = false;
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
            // console.log(success);
        })
        .catch((error) => {
            hideLoadingDialog();
            console.log("error0: " + JSON.stringify(error));
            showErrorDialogWithCloseAndText(error.message);
        });
    } else {
        console.log('error1: already sigend in firebase');
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