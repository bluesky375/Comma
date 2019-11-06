firebase.initializeApp(config);
var database = firebase.database();
// var analytics = firebase.analytics();


var isAccountMode = false;
var isDevice = false;
var routerPageHistory = [];

var isAudioPlaying = false;
var audioElement;
var doubleBackToExitPressedOnce = false;

var allCourses;
var myHeartCourseList;
var myBoughtCourseList;
var allTeacherCourses;
var myUserId = '';
var myUserData;

var isHideDeleteAudioDialog = false;

var isOnline = false;

var currentUserAnalytics = {};
$(document).ready(function () {
    document.addEventListener('deviceready', onDeviceReady, false);

    // var urlParameter = window.location.search;
    // if (urlParameter == undefined || urlParameter == ' '){
    //     urlParameter = urlParameter.substring(1);
    //     console.log("urlParameter: ", urlParameter);
    // }
    getConnectionState();

    var islogged = (sessionStorage.getItem('logged') != undefined && sessionStorage.getItem('logged') != null) ? sessionStorage.getItem('logged') : false;
    isDevice = (sessionStorage.getItem('isDevice') != undefined && sessionStorage.getItem('isDevice') == 'true');
    
    var cookie_state = getCookie('account');
    if (cookie_state == 'none'){
        // window.history.go(-(window.history.length));
        // window.location.href = "index.html";
        if (sessionStorage.getItem('isFromPersonal') == undefined) sessionStorage.setItem('isFromPersonal', false);
        if (sessionStorage.getItem('isAccountMode') == undefined) sessionStorage.setItem('isAccountMode', false);
        if (sessionStorage.getItem('accountUid') != undefined) sessionStorage.removeItem('accountUid');    
        firebase.auth().signInAnonymously().then(function(){
            sessionStorage.setItem('isFromPersonal', false);
            sessionStorage.setItem('logged', true);  
            var urlParameter = getUrlParameter('courseId');
            if (urlParameter != undefined && urlParameter != ''){
                homePage(urlParameter);
            } else {
                homePage('');
            }          
        }).catch(function(error) {
            console.log("Error occured: ", error);
        });    
    } else {
        if (cookie_state == 'guest'){
            isAccountMode = false;
        }
        if (cookie_state == 'account'){
            isAccountMode = true;
        }
        // isAccountMode = (sessionStorage.getItem('isAccountMode') != undefined && sessionStorage.getItem('isAccountMode') == 'true');
        isHideDeleteAudioDialog = (localStorage.getItem('isHideDeleteAudioDialog') == undefined) ? false : localStorage.getItem('isHideDeleteAudioDialog');
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                sessionStorage.setItem('isFromPersonal', false);
                sessionStorage.setItem('logged', true);  
                if (isAccountMode){
                    myUserId = user.uid;
                    isAccountMode = true;
                    sessionStorage.setItem('isAccountMode', true);
                    sessionStorage.setItem('accountUid', myUserId);
        
                    var userStatusRef = firebase.database().ref('Users').child(myUserId).child('Online-Status');
                    firebase.database().ref('.info/connected').on('value', function (snapshot) {
                        if (snapshot.val() == false) {
                            return;
                        };
                        userStatusRef.onDisconnect().set('Off').then(function () {
                            userStatusRef.set('On');
                        });
                    });

                    userAnalyticsClass.loadCurrentUserAnalytics(result => {
                        currentUserAnalytics = result;
                        userAnalyticsClass.set_usr_app_open();
                        userAnalyticsClass.set_usr_last_login();
                    });
        
                } else {
                    isAccountMode = false;
                    sessionStorage.setItem('isAccountMode', false);
                }
                var urlParameter = getUrlParameter('courseId');
                if (urlParameter != undefined && urlParameter != ''){
                    homePage(urlParameter);
                } else {
                    homePage('');
                }
            }
        });
        // setOnlineStatus();
        // if (isAccountMode){
        //     userAnalyticsClass.loadCurrentUserAnalytics(result => {
        //         currentUserAnalytics = result;
        //         userAnalyticsClass.set_usr_app_open();
        //         userAnalyticsClass.set_usr_last_login();
        //     });
        // }
    }
    if (!isDevice) {
        window.fbLoaded = (new Deferred());
        // webFacebookInit();
        FB.init({
            appId: '401403393670118',
            autoLogAppEvents: true,
            xfbml: true,
            status: true,
            cookie: true,
            version: 'v3.3'
        });
        fbLoaded.resolve();
    }
    // storeValueCenterPage();
});
function onDeviceReady() {
    isDevice = true;
    sessionStorage.setItem('isDevice', true);
    document.addEventListener("backbutton", onBackKeyDown, false);
    deviceFCMModule();
    if (window.MobileAccessibility) {
        window.MobileAccessibility.usePreferredTextZoom(false);
    }
    cordova.plugins.backgroundMode.setEnabled(true);
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "none";
}
function getConnectionState(){
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function(snap) {
        if (snap.val() === true) {
            isOnline = true;
        } else {
            isOnline = false;
        }
    });
}
function deviceFCMModule() {
    if (window.MobileAccessibility) {
        window.MobileAccessibility.usePreferredTextZoom(false);
    }

    cordova.plugins.firebase.messaging.onMessage(function (payload) {
        console.log("New foreground FCM message: ", payload);
    });
    cordova.plugins.firebase.messaging.onBackgroundMessage(function (payload) {
        console.log("New background FCM message: ", payload);
        var courseId = payload["courseId"];
        window.location = "router.html?courseId=" + courseId;

    });
    cordova.plugins.firebase.messaging.requestPermission({ forceShow: true }).then(function () {
        console.log("You'll get foreground notifications when a push message arrives");
    }).catch(function (err) {
        console.log('Error: ', err);
    });
    cordova.plugins.firebase.messaging.getToken().then(function (token) {
        console.log("Got device token: ", token);
    });
    cordova.plugins.firebase.messaging.onTokenRefresh(function () {
        console.log("Device token updated");
    });
}
function onBackKeyDown() {
    if (routerPageHistory.length > 1) {
        currentPage = routerPageHistory[routerPageHistory.length - 1];
        if (currentPage == 'personal-edit-information-page' && $('.custom-overlay').length > 0){
            $('.custom-overlay').remove();
            $('.choose-option').remove();
            $('.choose-date').remove();
            return;
        }
        if (currentPage == 'player-page') {
            hidePlayer();
        } else {
            onBackPage();
        }
    } else {
        if (doubleBackToExitPressedOnce) {
            navigator.app.exitApp();
        }
        window.plugins.toast.showShortBottom("Please click BACK again to exit", function (success) {
            console.log('toast success: ' + success);
        }, function (error) {
            console.log('toast error: ' + error);
        });
        doubleBackToExitPressedOnce = true;
        setTimeout(function () {
            doubleBackToExitPressedOnce = false;
        }, 2000);
    }
}
function firebaseSignOut() {
    firebase.auth().signOut().then(function () {
        gotoWelcomeAndInitialize();
    }).catch(function (error) {
        console.log(error);
        gotoWelcomeAndInitialize();
    });
}

function googleBind() {
    if (isDevice) {
        window.plugins.googleplus.login(
            {
                'webClientId': '591618737856-03iljt0iemgqiquag6pcpijdncvjlijr.apps.googleusercontent.com',
                'offline': true
            },
            function (obj) {
                logoutDeviceWithGoogle();
                firebaseLinkWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.idToken), true);
            },
            function (msg) {
                console.log("error2: " + msg);
            }
        );
    } else {
        loginWebWithGoogle();
    }
}
function googleUnBind(){
    if (myAccountClass.currentFirebaseUser == undefined || myAccountClass.currentFirebaseUser == null){
        console.log('Error current firebase user.');
        return;
    }
    authSource =  myAccountClass.getAuthInfomation();
    keys = Object.keys(authSource);
    if (keys.length == 1){
        showErrorDialogWithText("請先綁定電子信箱<br>再取消連結");
        setTimeout(hideErrorDialog, 2000);
        return;
    }
    showLoadingDialogWithText("取消帳號連結中...");
    myAccountClass.currentFirebaseUser.unlink('google.com').then(function() {
        hideLoadingDialog();
        myAccountClass.getCurrentUser();
    }).catch(function(error) {
        hideLoadingDialog();
    });
}
function facebookUnBind(){
    if (myAccountClass.currentFirebaseUser == undefined || myAccountClass.currentFirebaseUser == null){
        console.log('Error current firebase user.');
        return;
    }
    authSource =  myAccountClass.getAuthInfomation();
    keys = Object.keys(authSource);
    if (keys.length == 1){
        showErrorDialogWithText("請先綁定電子信箱<br>再取消連結");
        setTimeout(hideErrorDialog, 2000);
        return;
    }
    showLoadingDialogWithText("取消帳號連結中...");
    myAccountClass.currentFirebaseUser.unlink('facebook.com').then(function() {
        hideLoadingDialog();
        myAccountClass.getCurrentUser();
    }).catch(function(error) {
        hideLoadingDialog();
        console.log(error);
    });
}
function setOnlineStatus() {
    if (!isAccountMode) {
        return;
    }
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            if (!user.isAnonymous){
                // uid = user.uid;
                var userStatusRef = firebase.database().ref('Users').child(uid).child('Online-Status');
                firebase.database().ref('.info/connected').on('value', function (snapshot) {
                    if (snapshot.val() == false) {
                        return;
                    };
                    userStatusRef.onDisconnect().set('Off').then(function () {
                        userStatusRef.set('On');
                    });
                });
            }
        }
    });

}
function webIsSignedInListenerWithGoogle(isSigendIn) {
    if (isSigendIn) {
        gapi.load('auth2', function () {
            google_auth = gapi.auth2.init({
                client_id: "591618737856-03iljt0iemgqiquag6pcpijdncvjlijr",
                prompt: "select_account"
            });
            google_auth.then(function (auth2) {
                obj = auth2.currentUser.get().getAuthResponse();
                logoutWebWithGoogle();
                firebaseLinkWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.id_token), true);
            })
        });
    }
}
function loginWebWithGoogle() {
    gapi.load('auth2', function () {
        google_auth = gapi.auth2.init({
            client_id: "591618737856-03iljt0iemgqiquag6pcpijdncvjlijr",
            prompt: "select_account"
        });
        google_auth.then(function (auth2) {
            if (auth2.isSignedIn.get()) {
                console.log("Already web google logged in");
                obj = auth2.currentUser.get().getAuthResponse();
                logoutWebWithGoogle();
                firebaseLinkWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.id_token), true);
            } else {
                auth2.isSignedIn.listen(webIsSignedInListenerWithGoogle);
                auth2.signIn();
            }

        }, function (onError) {
            console.log("Error occured!");
        });
    });
}
function logoutWebWithGoogle() {
    gapi.load('auth2', function () {
        google_auth = gapi.auth2.init({
            client_id: "591618737856-03iljt0iemgqiquag6pcpijdncvjlijr",
            prompt: "select_account"
        });
        google_auth.then(function (auth2) {
            if (auth2.isSignedIn.get()) {
                console.log('web google sign out successful');
                auth2.signOut();
            } else {
                console.log('web google already sign out');
            }
        }, function (onError) {
            console.log("Error occured!");
        });
    });
}

function logoutDeviceWithGoogle() {
    if (isDevice) {
        window.plugins.googleplus.logout(
            function (msg) {
            },
            function (error) {
            }
        );
    }
}

function facebookBind() {
    if (!isReady) return;
    if (isDevice) {
        facebookConnectPlugin.getLoginStatus(function (obj) {
            if (obj.status == "connected") {
                deviceFacebookLogOut();
                firebaseLinkWithCredential(firebase.auth.FacebookAuthProvider.credential(obj.authResponse.accessToken), false);
            } else {
                deviceFacebookLogIn();
            }
        }, function (failure) {
            console.log(failure);
        });
    } else {
        webFacebookLogin();
    }
}
function deviceFacebookLogIn() {
    facebookConnectPlugin.login(["public_profile", "email"], function (obj) {
        deviceFacebookLogOut();
        firebaseLinkWithCredential(firebase.auth.FacebookAuthProvider.credential(obj.authResponse.accessToken), false);
    }, function (error) {
        console.log(error);
    });
}
function deviceFacebookLogOut() {
    facebookConnectPlugin.logout(function (success) {
        console.log("Device Facebook logged out");
    }, function (failure) {
        console.log("Device Facebook logged out failure");
    });
}

function Deferred() {
    var self = this;
    this.promise = new Promise(function(resolve, reject) {
      self.reject = reject
      self.resolve = resolve
    })
  }
function webFacebookInit() {

    window.fbAsyncInit = function () {
        FB.init({
            appId: '401403393670118',
            autoLogAppEvents: true,
            xfbml: true,
            status: true,
            cookie: true,
            version: 'v3.3'
        });
        fbLoaded.resolve()
        FB.getLoginStatus(function(response){
            console.log("FB login status: ", response);
        });
    };
    // window.fbAsyncInit();
}
function webFacebookLogin() {
    console.log("facebook login");
    // window.fbAsyncInit = function () {
    //     FB.init({
    //         appId: '401403393670118',
    //         autoLogAppEvents: true,
    //         xfbml: true,
    //         version: 'v3.3'
    //     });
    // };
    fbLoaded.promise.then(() => {
        FB.login(function (response) {
            console.log("FB login response: ", response);
            if (response.status == "connected") {
                webFacebookLogout();
                firebaseLinkWithCredential(firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken), false);
            }
        }, { scope: 'public_profile,email' });
    });


}
function webFacebookLogout() {
    FB.logout(function (response) {
        console.log("Web Facebook logged out");
    });
}

function firebaseLinkWithCredential(credential, isGoogleLogin) {
    if (myAccountClass.currentFirebaseUser == undefined || myAccountClass.currentFirebaseUser == null) {
        return;
    }
    showLoadingDialogWithText('連結中...');
    myAccountClass.currentFirebaseUser.linkWithCredential(credential).then(function (usercred) {
        hideLoadingDialog();
        myAccountClass.getCurrentUser();
        return; // Save Profile after binding the user.
        var user = usercred.user;
        providerData = user.providerData;
        for (i = 0; i < providerData.length; i++) {
            provider = providerData[i];
            providerId = provider.providerId;
            var user_ref = firebase.database().ref('Users/' + uid);
            var now = new Date().getTime();
            UpdatedAt = getDateStringFromTimestamp(now);
            if (isGoogleLogin) {
                if (providerId == 'google.com') {
                    profileImageUrl = (provider.photoURL == undefined || provider.photoURL == null) ? "" : (provider.photoURL + '?sz=150');
                    var name = (provider.displayName == undefined || provider.displayName == null) ? "" : provider.displayName;
                    var email = (provider.email = undefined || provider.email == null) ? "" : provider.email;
                    user = {
                        UpdatedAt: UpdatedAt,
                        name: name,
                        account: email,
                        profileImageUrl: profileImageUrl
                    };
                    updateProfileData(user);
                    break;
                }
            } else {
                if (providerId == 'facebook.com') {
                    profileImageUrl = (provider.photoURL == undefined || provider.photoURL == null) ? "" : (provider.photoURL + '?width=150&height=150');
                    var name = (provider.displayName == undefined || provider.displayName == null) ? "" : provider.displayName;
                    var email = (provider.email = undefined || provider.email == null) ? "" : provider.email;
                    user = {
                        UpdatedAt: UpdatedAt,
                        name: name,
                        account: email,
                        profileImageUrl: profileImageUrl
                    };
                    updateProfileData(user);
                    break;
                }
            }
        }
    }, function (error) {
        console.log("Account linking error", error);
        hideLoadingDialog();
        showErrorDialogWithError(error);

    });
}

function updateProfileData(user) {
    picUrl = user.profileImageUrl;
    if (picUrl == undefined || picUrl == null) {
        picUrl = "";
    }
    if ((picUrl != "" && picUrl != myUserData.profileImageUrl) || user.name != myUserData.name) {
        personalEditInformationClass.updateDiscussUserData(user, completion => {
        });
        personalEditInformationClass.updateDiscussCommentUserData(user, completion => {
        });
    }
    firebase.database().ref().child('Users').child(uid).update(user).then(() => {
    });
}
function hidePage(element) {
    $(element).hide();
}
function showPage(element) {
    $(element).show();
}
function slideUpPage(element) {
    $(element).slideUp();
}
function slideDownPage(element, completion) {
    $(element).slideDown('slow', function () {
        completion(true);
    });
}
function removePage(element) {
    $(element).remove();
}
function emptyAllPages() {
    for (i = 0; i < routerPageHistory.length; i++) {
        $('.' + routerPageHistory[i]).remove();
    }
    routerPageHistory = [];
}
function onBackPage() {
    if (routerPageHistory.length) {
        currentPage = routerPageHistory.pop();
        removePage('.' + currentPage);
        beforePage = routerPageHistory[routerPageHistory.length - 1];
        showPage('.' + beforePage);
        fixElementsStyle();

        if (beforePage.includes("course-detail-page")) {
            courseDetailClass.reloadData();
        }
        if (beforePage.includes("instructor-page")) {
            instructorClass.reloadData();
        }
        if (beforePage.includes("opened-course-page")) {
            allOpenedCourseClass.reloadData();
        }
    } else {
    }
}
function fixElementsStyle() {
    currentPage = routerPageHistory[routerPageHistory.length - 1];
    if (currentPage == 'home-page') {
        homeClass.fixElementsStyle();
    }
    if (currentPage.includes('course-detail-page')) {
        courseDetailClass.fixElementsStyle();
    }
    if (currentPage.includes('all-discussions')) {
        allDiscussionsClass.fixElementsStyle();
    }
    if (currentPage.includes('discussion-input')) {
        discussionInputClass.fixElementsStyle();
    }
    if (currentPage.includes('add-discussion')) {
        addDiscussionClass.fixElementsStyle();
    }
    if (currentPage.includes('edit-comment')) {
        editCommentClass.fixElementsStyle();
    }
    if (currentPage.includes('instructor-page')) {
        instructorClass.fixElementsStyle();
    }
    if (currentPage.includes('opened-course-page')) {
        allOpenedCourseClass.fixElementsStyle();
    }
    if (currentPage == 'my-course-page') {
        courseClass.fixElementsStyle();
    }
    if (currentPage == 'personal-page') {
        personalClass.fixElementsStyle();
    }
    if (currentPage == 'my-account-page') {
        myAccountClass.fixElementsStyle();
    }
}

function getCourseIdFromPageName(pageName) {
    blocks = pageName.split('_');
    if (blocks.length == 1) {
        return '';
    }
    return blocks[1].split('-')[0];
}
function hidePageWithSlideDown() {
    if (routerPageHistory.length) {
        currentPage = routerPageHistory.pop();
        beforePage = routerPageHistory[routerPageHistory.length - 1];

        slideDownPage('.' + beforePage, completion => {
            removePage('.' + currentPage);
        });

    } else {
    }
}

function fileSaveData(fileName, data){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

        console.log('file system open: ' + fs.name);
        fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
    
            console.log("fileEntry is file?" + fileEntry.isFile.toString());
            // fileEntry.name == 'someFile.txt'
            // fileEntry.fullPath == '/someFile.txt'
            writeFile(fileEntry, data);
    
        }, function(){
            console.log("On error occured while write file");
        });
    
    }, function(){
        console.log("On error occured while request file system");
    });
    
}
function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            // console.log("Successful file write...");
            // readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}
function readFile(fileEntry, completion) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            // console.log("Successful file read: " + this.result);
            completion(this.result);
            // displayFileData(fileEntry.fullPath + ": " + this.result);
        };

        reader.readAsText(file);

    }, function(){
        completion(null);
        console.log("On error occured while Read File");
    });
}
function fileLoadData(fileName, loadCompletion){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

        // console.log('file system open: ' + fs.name);
        fs.root.getFile(fileName, { create: false, exclusive: false }, function (fileEntry) {
    
            // console.log("fileEntry is file?" + fileEntry.isFile.toString());
            // fileEntry.name == 'someFile.txt'
            // fileEntry.fullPath == '/someFile.txt'
            readFile(fileEntry, completion => {
                loadCompletion(completion);
            });
        }, function(){
            loadCompletion(null);
            console.log("On error occured while write file");
        });
    
    }, function(){
        console.log("On error occured while request file system");
        loadCompletion(null);
    });
}
function fileDownload(url, fileName, completion) {
    var fileTransfer = new FileTransfer();
    fileTransfer.download(
        url,
        cordova.file.externalDataDirectory + fileName,
        function (entry) {
            completion(entry.toURL());
        },
        function (error) {
            console.log("download error source " + error.source);
            completion("");
        },
        false,
        {
            headers: {
                "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
            }
        }
    );
}

function checkIfFileExists(fileName, result) {
    path = cordova.file.externalDataDirectory + fileName;
    window.resolveLocalFileSystemURL(path, (fileEntry) => {
        result(fileEntry.toURL());
    }, (evt) => {
        result("null");
    });
}
function deleteFile(fileName, result) {
    path = cordova.file.externalDataDirectory + fileName;
    window.resolveLocalFileSystemURL(path, (fileEntry) => {
        fileEntry.remove(function (file) {
            result("success");
        }, function (error) {
            result("error");
        }, function () {
            result("not_exist");
        });
    });
}
function onFileSystemSuccess(fileSystem) {
    console.log(fileSystem.name);
}

function onResolveSuccess(fileEntry) {
    console.log(fileEntry.name);
}

function fail(evt) {
    console.log(evt.target.error.code);
}
function fileExists(fileEntry) {
    console.log("File " + fileEntry.fullPath + " exists!")
}
function fileDoesNotExist() {
    console.log("file does not exist");
}
function getFSFail(evt) {
    console.log(evt.target.error.code);
}

function getFirebaseServerTimeStamp(result) {
    firebase.database().ref('/.info/serverTimeOffset')
        .once('value')
        .then(function stv(data) {
            result(data.val() + Date.now());
        }, function (err) {
            result(-1);
        });
}
function loadRewardPoint(uid, result) {
    // firebase.database().ref('Users').child(uid).child('RewardPoints').once('value').then(function (snapshot) {
    //     if (snapshot == undefined || snapshot == null) {
    //         result(0);
    //     } else {
    //         result(snapshot.val());
    //     }
    // });
    firebase.database().ref('CashFlow').child(uid).child('Total').child('RewardPoints').once('value').then(function (snapshot) {
        if (snapshot == undefined || snapshot == null) {
            result(0);
        } else {
            result(snapshot.val());
        }
    });
}

function boughtCourseProgress(uid, courseId, price, currentRewardPoint, result) {
    if (uid == '' || courseId == '') {
        return;
    }
    if (myBoughtCourseList == null) myBoughtCourseList = [];
    if (myBoughtCourseList != null && myBoughtCourseList.indexOf(courseId) == -1) {
        myBoughtCourseList.push(courseId);
        firebase.database().ref('BoughtCourses').child(uid).set(myBoughtCourseList);
    }
    var cashHistoryKey = firebase.database().ref('CashFlow').child(uid).child('History').push().key;
    var serverCashFlowKey = firebase.database().ref('ServerCashFlow').push().key;
    price = 0 - price;
    getFirebaseServerTimeStamp(result => {
        var cashHistory = {};
        var cashType = (price == 0) ? ("兌換課程" + courseId) : ("購買課程" + courseId)
        cashHistory = {
            CashType: cashType,
            Time: getDateStringFromTimestamp(result),
            Uid: uid,
            Unit: "點數",
            Value: price
        } 
        firebase.database().ref('CashFlow').child(uid).child('History').child(cashHistoryKey).set(cashHistory);
        firebase.database().ref('ServerCashFlow').child(serverCashFlowKey).set(cashHistory);
    });
    newRewardPoint = currentRewardPoint + price;
    firebase.database().ref('CashFlow').child(uid).child('Total').child('RewardPoints').set(newRewardPoint);
    firebase.database().ref('Users').child(uid).child('RewardPoints').set(newRewardPoint);

}
function homePage(courseId) {
    emptyAllPages();
    pageName = 'home-page';
    routerPageHistory.push(pageName);
    html = '\
        <div class="container ' + pageName + '">\
            <div class="content-wrapper">\
                <div class="title-bar"><h1>首頁</h1></div>\
                <div class="home-links" id="home-links' + pageName + '"><ul></ul></div>\
                <div class="home-list"><div class="row"></div></div>\
            </div>\
        </div>\
        <div class="float-nav home-page">\
            <ul class="three-btn">\
                <li><a href="javascript:void(0);" class="active"><i class="fas fa-home"></i><br><span>首頁</span></a></li>\
                <li><a href="javascript:myCoursePage();"><i class="fas fa-headphones-alt"></i><br><span>課程</span></a></li>\
                <li><a href="javascript:personalPage();"><i class="fas fa-user-alt"></i><br><span>設定</span></a></li>\
            </ul>\
        </div>\
    ';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    homeClass.initialize(courseId);
}
function getAvailablePageName(pageName) {
    index = 0;
    result = '';
    i = 1;
    do {
        result = pageName + '-' + i;
        i++;
    } while (routerPageHistory.indexOf(result) != -1)
    return result;
}
function courseDetailPage(courseId) {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = getAvailablePageName('course-detail-page_' + courseId);

    courseDetailTxt = '\
        <div class="container ' + pageName + '">\
            <div class="content-wrapper padding-bottom" id="course-page-container'+ pageName + '">\
                <div class="title-bar">\
                    <a href="javascript:onBackPage();" class="back" id="back'+ pageName + '"><span class="arrow"></span><span id="back-name"></span></a>\
                    <h1 style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;" id="course-title' + pageName + '">dd</h1>\
                </div>\
                <div class="course-intro" id="course-intro'+ pageName + '"></div>\
                <div class="instructor-info">\
                    <h6>課程資訊</h6>\
                    <div class="content" id="course-description' + pageName + '">\
                        <div class="collapse card-body card" id="collapseInfo" style="display: block;"></div>\
                        <a class="collapse-arrow" data-toggle="collapse" href="#collapseInfo" role="button" aria-expanded="false" aria-controls="collapseInfo">\
                            <span class="sr-only">Collapse</span>\
                        </a>\
                    </div>\
                </div>\
                <div class="instructor-info">\
                    <h6>講師資訊</h6>\
                    <div class="content">\
                        <div class="media" id="instructor-info'+ pageName + '">\
                            <img src="assets/images/user-silhouette.png" alt="" class="mr-3" id="author-img">\
                            <div class="media-body" id="author-data"></div>\
                        </div>\
                        <div class="text-center mt-4"><a href="javascript:void(0);" id="goto-instructor'+ pageName + '">查看全部</a></div>\
                    </div>\
                </div>\
                <div class="curriculum-schedule" style="height: auto;" id="audio-list'+ pageName + '">\
                    <h6>課程列表</h6>\
                    <div class="content"></div>\
                </div>\
                <div class="course-content-o">\
                    <h6>討論<small id="discussion-count">0則</small></h6>\
                    <div class="content">\
                        <div class=""></div>\
                        <div class="discussion-list"></div>\
                        <div class="mb-4" id="no-content"><p class="no-content-msg">目前還沒有任何討論喔！</p></div>\
                        <div class="all-link" id="all-link'+ pageName +'"><a href="javascript:gotoCreateNewDiscuss();">新增討論</a></div>\
                    </div>\
                </div>\
                <div class="bottom-wrap clearfix" id="not-purchased-bar' + pageName + '">\
                    <div class="bottom-wrap-content clearfix">\
                        <div class="total-price">\
                            <span class="sell-price" id="sell-price'+ pageName + '"></span><span class="regular-price" id="regular-price' + pageName + '"></span>\
                        </div>\
                        <ul><li><a href="javascript:void(0);" class="btn btn-warning" id="audio-test'+ pageName + '">試聽<i class="fas fa-caret-right ml-2"></i></a></li>\
                            <li><a href="javascript:void(0);" class="btn btn-danger" id="bought-course'+ pageName + '">立刻購買</a></li>\
                        </ul>\
                    </div>\
                </div>\
            </div>\
        </div>';

    if (player.miniPlayerExist) {
        $('.player-page').before(courseDetailTxt);
    } else {
        $('body').append(courseDetailTxt);
    }
    routerPageHistory.push(pageName);
    courseDetailClass.initialize(courseId);
}
function instructorPage(courseId) {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = getAvailablePageName('instructor-page_' + courseId);
    html = '\
        <div class="container '+ pageName + '">\
            <div class="content-wrapper">\
                <div class="title-bar"><a href="javascript:onBackPage();" class="back"><span class="arrow"></span></a><h1 class="user-name"></h1></div>\
                <div class="instructor-intro">\
                    <div class="image full-img"><img src="assets/images/user-silhouette.png" class="user-img"></div>\
                    <h4 class="user-name"></h4>\
                    <ul><li><i class="fas fa-user-friends"></i><span id="all-view-people'+ pageName + '">0</span>閱聽人次</li><li><i class="fas fa-stopwatch"></i><span id="all-course-cnt' + pageName + '">0</span>總開課數</li></ul>\
                </div>\
                <div class="instructor-info">\
                    <h6>講師資訊</h6>\
                    <div class="content">\
                        <div class="collapse card-body card author-collapse-info" id="collapseInfo" style="display:block;"></div>\
                        <a class="collapse-arrow" data-toggle="collapse" href="#collapseInfo" role="button" aria-expanded="false" aria-controls="collapseInfo"><span class="sr-only">Collapse</span></a>\
                    </div>\
                </div>\
                <div class="opened-course'+ pageName + '"><h6>已開課程</h6><div class="content"></div></div>\
            </div>\
        </div>';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    instructorClass.initialize(courseId);
}
function showContribution(content, title) {
    var pageName = 'contribution';
    $('body').append('\
        <div class="container contribution" id="contribution">\
        <div class="content-wrapper">\
            <div class="title-bar">\
                <a href="javascript:hideContribution();" class="close-icon">\
                    <span class="sr-only">Close</span>\
                </a>\
                <h1>文稿</h1>\
            </div>\
            <div class="page-content-block page-content-block-l" id="contribution-content">' +
        '</div>\
        </div>\
    </div>');

    content = getFullWidthSpaceString(content);

    title_html = '<p class="font-xl"><strong>' + title +'</strong></p>';

    content_blocks = content.split('\n');

    content_html = '';
    for (i = 0; i < content_blocks.length; i++){
        if (/<image=.*>/i.test(content_blocks[i])){
            content_html += content_blocks[i].getImgSrcFromImage();
        } else {
            content_html += '<p>' + content_blocks[i] + '</p>';
        }
        // content_html += '<p>' + content_blocks[i] + '</p>';
    }
    $('#contribution-content').append(title_html + '<hr>' + content_html);
    hidePage('.home-player');
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    slideUpPage('.' + currentPageName);
    routerPageHistory.push(pageName);
}
function hideContribution() {
    if (routerPageHistory.length) {
        currentPage = routerPageHistory.pop();
        beforePage = routerPageHistory[routerPageHistory.length - 1];

        slideDownPage('.' + beforePage, completion => {
            removePage('.' + currentPage);
            if (beforePage != 'player-page') {
                showPage('.home-player');
            }
        });

    } else {
    }
}
function showPlayer() {
    var pageName = 'player-page';
    $('.home-player').hide();

    var bottom_tabs = '';

    rate_text = 'x1.0';
    if (audioElement != null) {
        if (player.playbackRate == 1 || player.playbackRate == 2) {
            rate_text = 'x' + player.playbackRate + '.0';
        } else {
            rate_text = 'x' + player.playbackRate;
        }
        $('#select-play-speed').text(rate_text);
    }
    if (isDevice) {
        bottom_tabs = '<ul>\
                <li><a href="javascript:void(0);" id="select-play-speed">' + rate_text + '</a></li>\
                <li><a href="javascript:void(0);" id="show-contribution"><img src="assets/images/player-icons/rr(white).png" alt=""></a></li>\
                <li><a href="javascript:void(0);" id="select-download-option"><img src="assets/images/player-icons/ulj(light grey).png" alt="" id="img-download-state"></a></li>\
            </ul>\
        ';
    } else {
        bottom_tabs = '<ul>\
                <li style="width: 50%;"><a href="javascript:void(0);" id="select-play-speed">'+ rate_text + '</a></li>\
                <li style="width: 50%;"><a href="javascript:void(0);" id="show-contribution"><img src="assets/images/player-icons/rr(white).png" alt=""></a></li>\
            </ul>\
        ';
    }
    if (audioElement == null) {
        $('body').append('\
            <div class="container body-player ' + pageName + '" id="body-player">\
            <div class="player-top clearfix">\
                <a href="javascript:hidePlayer();" class="down-arrow"><span class="sr-only">Down</span></a>\
                <a href="javascript:hidePlayer();" class="list-icon"><span class="sr-only">List</span></a>\
            </div>\
            <div class="player-logo"><img src="assets/images/player-logo.jpg" alt=""></div>\
            <div class="player-title">\
            </div>\
            <div class="player-controls">\
                <ul class="control-ui">\
                    <li><a href="javascript:void(0);" class="sec-back"><span class="sr-only">Back</span></a></li>\
                    <li><a href="javascript:void(0);" class="backward"><span class="sr-only">Backward</span></a></li>\
                    <li><a href="javascript:void(0);" aria-pressed="false" autocomplete="off" class="btn play-pause"><span class="sr-only">Play</span></a></li>\
                    <li><a href="javascript:void(0);" class="forrward"><span class="sr-only">Forward</span></a></li>\
                    <li><a href="javascript:void(0);" class="sec-next"><span class="sr-only">Next</span></a></li>\
                </ul>\
                <div class="player-dragger" style="margin-top:5%;" >\
                    <span class="dot" style="left: 0%;"><span class="sr-only">Dragger</span></span>\
                    <div class="progress">\
                        <div class="progress-bar" role="progressbar" aria-valuenow="50" aria-valuemin="0"\
                            aria-valuemax="100"></div>\
                    </div>\
                </div>\
                <div  align="left" style=" margin-top:1%;" \
                ><text id="current" style="color:white;float:left;">0:00</text>\
                <text id="end" style="color:white; float:right;">0:00</text>\
            </div>\
            </div>\
            <div class="player-option">' +
            bottom_tabs +
            '</div>\
        </div>');
        currentPageName = routerPageHistory[routerPageHistory.length - 1];
        slideUpPage('.' + currentPageName);
    } else {
        currentPageName = routerPageHistory[routerPageHistory.length - 1];
        slideUpPage('.' + currentPageName);
        showPage('.' + pageName);
    }
    routerPageHistory.push(pageName);
}
function gotoPlayList() {
    listPage = player.listPage;
    if (listPage == 'my-course-page') {
        hidePlayerWithCompletion(completion => {
            courseClass.prevTabIndexCourse = 2;
            myCoursePage();

        });
    } else {
        c_id = getCourseIdFromPageName(listPage);
        c_ind = routerPageHistory.indexOf(listPage);
        hidePlayerWithCompletion(completion => {
            if (c_ind == -1) {
                courseDetailPage(c_id);
            } else {
                for (i = c_ind + 1; i < routerPageHistory.length; i++) {
                    $('.' + routerPageHistory[i]).remove();
                    routerPageHistory.pop();
                }
                showPage('.' + listPage);
            }
        });

        window.location.href = "router.html#audio-list" + listPage;
    }


}
function hidePlayer() {
    if (routerPageHistory.length) {
        currentPage = routerPageHistory.pop();
        beforePage = routerPageHistory[routerPageHistory.length - 1];

        player.hidePlaySpeedSelect();

        slideDownPage('.' + beforePage, isComplete => {
            hidePage('.' + currentPage);
            showPage('.' + beforePage);
            showMiniAudioPlayerBar();
            fixElementsStyle();
        });

    } else {
    }
}
function hidePlayerWithCompletion(completion) {
    if (routerPageHistory.length) {
        currentPage = routerPageHistory.pop();
        beforePage = routerPageHistory[routerPageHistory.length - 1];

        player.hidePlaySpeedSelect();


        hidePage('.' + currentPage);
        showPage('.' + beforePage);
        showMiniAudioPlayerBar();
        fixElementsStyle();
        completion(true);

    } else {
    }
}
function showMiniAudioPlayerBar() {
    if (!player.miniPlayerExist) {
        $('body').append('\
            <div class="home-player" style="bottom:0px">\
                <div class="home-player-inner">\
                    <div class="progress">\
                        <div class="progress-bar" role="progressbar" style="width: 0%" id="mini-player-progress-bar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>\
                    </div>\
                    <a href="javascript:hideMiniPlayerBar();" class="close-player"><span class="sr-only">close</span></a>\
                    <div class="playerinfo">\
                        <button type="button" class="btn" aria-pressed="false" autocomplete="off" id="mini-player-play-btn"><span class="sr-only">Play</span></button><div id="mini-player-title" style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;"></div>\
                        <ul><li><span id="mini-player-duration">00:00</span></li><li><p id="mini-player-topic" style="max-width:11em;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;"></p></li></ul>\
                    </div>\
                </div>\
            </div>\
        ');
        player.initializeMiniPlayer();
        $('.playerinfo').click(function (evt) {
            showPlayerFomeBar();
        });
    } else {
        $('.home-player').show();
    }

}

function showPlayerFomeBar() {
    showPlayer();
}
function hideMiniPlayerBar() {
    $('.home-player').remove();
    player.updateListenedData();

    audioElement.pause();
    player.miniPlayerExist = false;
    player.playbackRate = 1;
    if (isDevice) {
        player.deleteMusicController();
    }
    fixElementsStyle();
}

function allDiscussionsPage(courseId) {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'all-discussions-' + courseId;
    html = '\
        <div class="container '+ pageName + '">\
            <div class="content-wrapper">\
                <div class="title-bar">\
                    <a href="javascript:onBackPage();" class="back"><span class="arrow"></span></a>\
                    <h1>討論</h1>\
                    <a href="javascript:void(0);" class="right-link" id="button-add-discuss">新增問題</a>\
                </div>\
                <div class="divider mt-15"></div>\
                <div id="discuss-lists"></div>\
            </div>\
        </div>';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    allDiscussionsClass.initialize(courseId);
}

function discussInputPage(courseId, selectedDiscuss) {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'discussion-input-' + courseId;
    html = '\
        <div class="container '+ pageName + '">\
            <div class="content-wrapper padding-bottom">\
                <div class="title-bar"><a href="javascript:onBackPage();" class="back"><span class="arrow"></span></a><h1>&nbsp;</h1></div>\
                <div id="discussion-origin"></div>\
                <div id="discussion-comment"></div>\
                <div class="reply-form">\
                    <form action="javascript:void(0);" id="submit-comment"><div class="media">\
                            <img src="assets/images/user.png" class="mr-2" alt="" id="profile-image">\
                            <div class="media-body"><input type="text" class="form-control" placeholder="回覆…" id="input-reply">\
                            <input type="image" src="assets/images/btn-send.png" id="button-submit">\
                            </div>\
                    </div></form>\
                </div>\
            </div>\
        </div>';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    discussionInputClass.initialize(courseId, selectedDiscuss);
}

function addDiscussionPage(courseId, selectedDiscuss, isModifyDiscuss) {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'add-discussion-' + courseId;
    html = '\
        <div class="container '+ pageName + '">\
            <div class="content-wrapper">\
                <div class="title-bar"><a href="javascript:onBackPage();" class="back"><span class="arrow"></span><span id="back-name"></span></a><h1>新增討論</h1></div>\
                <div class="inner-form-wrapper">\
                    <form action="javascript:void(0);" id="submit-form">\
                        <div class="form-group"><label>課程問題：</label><textarea class="form-control" placeholder="輸入課程問題" id="textarea-discuss"></textarea></div>\
                        <input type="submit" class="btn btn-primary btn-block" disabled id="submit-discuss" value="提交">\
                    </form>\
                </div>\
            </div>\
        </div>';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    addDiscussionClass.initialize(courseId, selectedDiscuss, isModifyDiscuss);
}

function editCommentPage(courseId, selectedDiscuss, selectedComment, isDiscuss) {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'edit-comment-' + courseId;
    html = '\
        <div class="container '+ pageName + ' discussion-content-edit">\
            <div class="content-wrapper">\
                <div class="title-bar"><a href="javascript:onBackPage();" class="back"><span class="arrow"></span>取消編輯</a><h1>編輯回覆</h1></div>\
                <div class="inner-form-wrapper">\
                    <form action="javascript:void(0);" id="submit-change">\
                        <div class="form-group"><label>課程問題：</label><textarea class="form-control" placeholder="要交上pdf嗎？" id="textarea-discuss"></textarea></div>\
                        <input type="submit" class="btn btn-primary btn-block" disabled="" value="提交" id="submit-discuss">\
                    </form>\
                </div>\
            </div>\
        </div>';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    editCommentClass.initialize(courseId, selectedDiscuss, selectedComment, isDiscuss);
}

function allOpenedCourse(courseId) {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = getAvailablePageName('opened-course-page_' + courseId);
    html = '\
    <div class="container '+ pageName + '">\
        <div class="content-wrapper">\
            <div class="title-bar">\
                <a href="javascript:onBackPage();" class="back"><span class="arrow"></span><span id="author-name'+ pageName + '"></span></a>\
                <h1>已開課程</h1>\
            </div>\
            <div id="course-list'+ pageName + '"></div>\
        </div>\
    </div>\
    ';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    allOpenedCourseClass.initialize(courseId);
}

function myCoursePage() {
    emptyAllPages();
    var pageName = 'my-course-page';
    var top_tabs = '';
    if (isDevice) {
        top_tabs = '\
        <ul class="three-link">\
            <li><a href="javascript:void(0);" class="active">已購</a></li>\
            <li><a href="javascript:void(0);">心願</a></li>\
            <li><a href="javascript:void(0);">下載</a></li>\
        </ul>';
    } else {
        top_tabs = '\
        <ul class="three-link">\
            <li style="width: 50%"><a href="javascript:void(0);" class="active">已購</a></li>\
            <li style="width: 50%"><a href="javascript:void(0);">心願</a></li>\
        </ul>';
    }
    html = '\
    <div class="container '+ pageName + '">\
        <div class="content-wrapper padding-bottom">\
            <div class="title-bar"><h1>課程</h1></div>\
            <div class="home-links" id="home-links'+ pageName + '">' +
        top_tabs +
        '</div>\
            <div class="purchased-list" id="purchased-list'+ pageName + '"></div>\
            <div class="purchased-list" id="home-list'+ pageName + '"><div class="row"></div></div>\
            <div class="course-dwld" id="download-list' + pageName + '"></div>\
        </div>\
    </div>\
    <div class="float-nav my-course-page">\
        <ul class="three-btn">\
            <li><a href="javascript:homePage(\'\');"><i class="fas fa-home"></i><br><span>首頁</span></a></li>\
            <li><a href="javascript:void(0);" class="active"><i class="fas fa-headphones-alt"></i><br><span>課程</span></a></li>\
            <li><a href="javascript:personalPage();"><i class="fas fa-user-alt"></i><br><span>設定</span></a></li>\
        </ul>\
    </div>';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    courseClass.initialize();
}

function personalPage() {

    emptyAllPages();
    var pageName = 'personal-page';
    html = '\
    <div class="container '+ pageName + '">\
        <div class="content-wrapper">\
            <h1 class="page-title">個人頁面</h1>\
            <div class="content-box personal-info-box mb-3">\
                <div class="media" id="personal-data"></div>\
            </div>\
            <div class="content-box personal-info-links" id="personal-info"></div>\
            <div class="float-nav">\
                <ul class="three-btn">\
                    <li><a href="javascript:homePage(\'\');"><i class="fas fa-home"></i><br><span>首頁</span></a></li>\
                    <li><a href="javascript:myCoursePage();"><i class="fas fa-headphones-alt"></i><br><span>課程</span></a></li>\
                    <li><a href="javascript:void(0);" class="active"><i class="fas fa-user-alt"></i><br><span>設定</span></a></li>\
                </ul>\
            </div>\
        </div>\
    </div>';

    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    personalClass.initialize();
}
function personalEditInformationPage() {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'personal-edit-information-page';
    html = '\
    <div class="container '+ pageName + '">\
        <div class="content-wrapper">\
            <div class="title-bar"><a href="javascript:onBackPage();" class="back"><span class="arrow"></span></a><h1>編輯個人資訊</h1><a href="javascript:void(0);" class="right-link" id="save-profile">完成</a></div>\
            <div class="center-user-img">\
                <img src="assets/images/user-silhouette.png" alt="" id="img-avatar">\
                <a href="javascript:void(0);" class="upload-btn"><i class="fas fa-camera"></i></a>\
                <input type="file" style="display: none;" id="open-file"/>\
            </div>\
            <div class="content-box personal-edit-info">\
                <ul>\
                    <li><div class="row no-gutters"><div class="col-4">姓名/暱稱</div><input class="col-8" id="user-name'+ pageName + '" type="text" style="background-color:transparent;border-radius: 5px; border:1px solid #adadad;"></input></div></li>\
                    <li><div class="row no-gutters"><div class="col-4">性別</div><div class="col-8" id="div-gender"></div></div>\
                        <a href="javascript:void(0)" class="edit-link" id="select-gender"><span class="sr-only">Edit</span></a>\
                    </li>\
                    <li><div class="row no-gutters"><div class="col-4">生日</div><div class="col-8"><span id="div-birthday">尚未設定</span></div></div>\
                        <a href="javascript:void(0)" class="edit-link" id="select-birthday"><span class="sr-only">Edit</span></a>\
                    </li>\
                </ul>\
            </div>\
        </div>\
    </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    personalEditInformationClass.initialize();
}
function myAccountPage() {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'my-account-page';
    html = '\
    <div class="container '+ pageName + '">\
        <div class="page-back"><a href="javascript:onBackPage();" class="back"><span class="sr-only">Previous Page</span></a><span>帳號設定</span></div>\
        <div class="content-wrapper">\
            <div class="content-box email-bound">\
                <a href="javascript:bindEmailPage();">電子信箱<span>尚未綁定</span></a>\
            </div>\
            <div class="content-box">\
                <ul class="acc-social-links">\
                    <li><img src="assets/images/facebook.svg" class="mr-3">連結Facebook帳號 <span id="facebook-bind"><a href="javascript:facebookBind();">連結</a></span></li>\
                    <li><img src="assets/images/google-plus.svg" alt="" class="mr-3">連結Google帳號<span id="google-bind"><a href="javascript:googleBind();">連結</a></span></li>\
                </ul>\
            </div>\
            <a href="javascript:void(0);" class="red-link-btn" id="button-signout">登出此帳號</a>\
        </div>\
    </div>';
    if ($('.player-page').length) {
        $('.player-page').before(html);
    } else {
        $('body').append(html);
    }
    routerPageHistory.push(pageName);
    myAccountClass.initialize();
}

function coursePurchaseRecordPage() {
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("Setting_puchased_click","");
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'course-purchase-record-page';
    html = '\
    <div class="container '+ pageName + '">\
        <div class="content-wrapper" style="padding-left: 5px; padding-right: 5px;">\
            <div class="title-bar">\
                <a href="javascript:onBackPage();" class="back"><span class="arrow"></span></a>\
                <h1>課程購買記錄</h1>\
            </div>\
            <div class="purchased-list" id="purchased-list' + pageName + '"></div>\
        </div>\
    </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    coursePurchaseRecordClass.initialize();
}

function discountCodePage() {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'discount-code-page';
    html = '\
    <div class="container '+ pageName + ' personal-discount">\
        <div class="content-wrapper">\
            <div class="title-bar">\
                <a href="javascript:onBackPage();" class="back"><span class="arrow"></span></a>\
                <h1>兌換碼</h1>\
            </div>\
            <div class="inner-form-wrapper">\
                <form action="javascript:void(0);" id="submit-discount">\
                    <div class="form-group"><label>已有兌換碼嗎？</label><input type="text" class="form-control" placeholder="在此輸入兌換碼" id="coupon-text"></div>\
                    <input type="submit" disabled class="btn btn-primary btn-block" value="兌換" id="button-sumbit">\
                </form>\
            </div>\
        </div>\
    </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    discountCodeClass.initialize();
}

function becomeLecturerPage() {
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("Setting_lecturerapply_click","");
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'become-a-lecturer-page';

    formElement = '';
    if (isDevice){
        formElement = '<form action="javascript:void(0);" id="submitfeedbackform">';
    } else {
        formElement = '<form action="http://comma.ml-codesign.com/www/mail/sendmailandexit.php" id="submitfeedbackform" method="GET" target="theWindow" onsubmit="javascript:void(0); return;">';
    }
    html = '\
    <div class="container '+ pageName + ' become-a-lecture">\
        <div class="content-wrapper">\
            <div class="title-bar"><a href="javascript:onBackPage();" class="back"><span class="arrow"></span></a><h1>成為講師</h1></div>\
            <div class="inner-form-wrapper">'
                + formElement +
                    '<div class="form-group"><label>你的姓名/暱稱：</label><input type="text" name="name" class="form-control" placeholder="你的姓名/暱稱" id="input-name"></div>\
                    <div class="form-group"><label>聯絡信箱：</label><input type="email" name="email" class="form-control" placeholder="輸入信箱讓我們聯絡你" id="input-email"></div>\
                    <div class="form-group"><label>課程主題：</label><input type="text" name="subject" class="form-control" placeholder="輸入你想要開設的課程主題" id="input-course-title"></div>\
                    <div class="form-group"><label>課程內容說明：</label><textarea name="message" class="form-control" placeholder="說明你想開設的課程內容" id="text-course-content"></textarea></div>\
                    <input type="submit" class="btn btn-primary btn-block" disabled value="提交" id="button-submit">\
                </form>\
            </div>\
        </div>\
    </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    becomeLecturerClass.initialize();
}

function feedbackPage() {
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("Setting_lecturerapply_click","");
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'feed-back-page';
    formElement = '';
    if (isDevice){
        formElement = '<form action="javascript:void(0);" id="submitfeedbackform">';
    } else {
        formElement = '<form action="http://comma.ml-codesign.com/www/mail/sendmailandexit.php" id="submitfeedbackform" method="GET" target="theWindow" onsubmit="javascript:void(0); return;">';
    }

    html = '\
    <div class="container '+ pageName + ' personal-feedback">\
        <div class="content-wrapper">\
            <div class="title-bar"><a href="javascript:onBackPage();;" class="back"><span class="arrow"></span></a><h1>意見反饋</h1></div>\
            <div class="inner-form-wrapper">' 
                + formElement +
                    '<div class="form-group"><label>你的姓名/暱稱：</label><input type="text" name="name" class="form-control" placeholder="輸入姓名/暱稱" id="input-name"></div>\
                    <div class="form-group"><label>聯絡信箱：</label><input type="email" name="email" class="form-control" placeholder="輸入信箱讓我們聯絡你" id="input-email"></div>\
                    <div class="form-group"><label>內容說明：</label><textarea name="message" class="form-control" placeholder="輸入你對於Comma的任何意見與反饋" id="text-content"></textarea></div>\
                    <input type="hidden" name="subject" id="input-subject" value="Feedback">\
                    <input type="submit" class="btn btn-primary btn-block" disabled value="提交" id="button-submit">\
                </form>\
            </div>\
        </div>\
    </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    feedbackClass.initialize();
}

function personalAboutCommaPage() {
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("Setting_about_click","");
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'personal-about-comma-page';
    html = '\
    <div class="container '+ pageName + '">\
        <div class="content-wrapper">\
            <div class="title-bar">\
                <a href="javascript:onBackPage();" class="back"><span class="arrow"></span></a>\
                <h1>關於 Comma</h1>\
            </div>\
            <div class="content-box email-bound">\
                <div class="loin-info clearfix">\
                    使用版本<span>1.1.306</span>\
                </div>\
                <a href="javascript:aboutCommaPage();">用戶協議與條款<span>&nbsp;</span></a>\
            </div>\
        </div>\
    </div>\
    ';
    if (player.miniPlayerExist) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    personalAboutCommaClass.fixElementsStyle();

}

function aboutCommaPage() {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'about-comma-page';
    html = '\
    <div class="container '+ pageName + '">\
        <div class="content-wrapper">\
            <div class="title-bar"><a href="javascript:onBackPage();" class="back has-text"><span class="arrow"></span>關於 Co...</a><h1>用戶協議與條款</h1></div>\
            <div class="page-content-block" id="terms-content">\
                <p style="white-space: pre-line; word-break: break-word; line-height: 22px;">\
                </p>\
            </div>\
        </div>\
    </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    aboutCommaClass.initialize();
}

function storeValueCenterPage() {
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("Setting_pointcenter_click","");
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'store-value-center-page';
    html = '\
    <div class="container '+ pageName + ' stored-value-center">\
        <div class="page-back"><a href="javascript:onBackPage();" class="back"><span class="sr-only">Previous Page</span></a><span>儲值</span></div>\
        <div class="content-wrapper">\
            <div class="store-value-info">\
                <div class="store-current-point"><h6>目前點數</h6><div class="points">0點</div></div>\
                <div class="choose-plan">\
                    <p>請選擇加值方案</p>\
                    <div class="row">\
                    </div>\
                    <form action="https://core.newebpay.com/MPG/mpg_gateway" id="loginform" method="POST" target="theWindow">\
                        <input type="hidden" name="MerchantID" value="MS3249501848" id="MerchantID">\
                        <input type="hidden" name="RespondType" value="JSON" id="RespondType">\
                        <input type="hidden" name="TimeStamp" id="TimeStamp">\
                        <input type="hidden" name="Version" value="1.5" id="Version">\
                        <input type="hidden" name="MerchantOrderNo" id="MerchantOrderNo">\
                        <input type="hidden" name="Amt" value="100" id="Amt">\
                        <input type="hidden" name="ItemDesc" value="課程點數" id="ItemDesc">\
                        <input type="hidden" name="TradeInfo" id="trade-info">\
                        <input type="hidden" name="TradeSha" id="trade-sha">\
                    </form>\
                    <button type="button" class="btn btn-primary btn-block" id="button_submit">立即購買</button>\
                </div>\
                <div class="store-value-content">\
                </div>\
            </div>\
        </div>\
    </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    storeValueCenterClass.initialize();
}


function changePasswordPage() {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'change-password-page';
    html = '\
        <div class="container screen-1 ' + pageName + '">\
            <div class="page-back"><a href="javascript:onBackPage();" class="back">帳號設定</a><span>更改密碼</span></div>\
            <div class="content-wrapper">\
                <div class="row text-center">\
                    <div class="col-12 screen-1-content">\
                        <div class="screen-container">\
                            <div class="logo logo-inner"><a href="#"><img src="assets/images/logo.png" alt=""></a></div>\
                            <div class="rl-form password-form">\
                                <form action="javascript:void(0);" id="submit-email">\
                                    <p class="mb-4 font-xl"><span style="color:#5c5c5c;">哎呀！<br>忘記密碼了嗎?</span></p>\
                                    <p class="mb-5"><span style="color:#adadad;">別擔心，請輸入您的信箱以重置密碼！</span></p>\
                                    <div class="form-group">\
                                        <div class="input-group mb-2">\
                                            <div class="input-group-prepend"><div class="input-group-text radius-xl"><img src="assets/images/form-icon/mailbox.png" alt=""></div></div>\
                                            <input type="email" class="form-control radius-xl" id="email" placeholder="輸入註冊時使用的電子信箱">\
                                        </div>\
                                    </div>\
                                    <div class="mt-6"><input type="submit" class="btn btn-primary btn-block" disabled="" value="發送驗證信" id="button_submit"></div>\
                                </form>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    changePasswordClass.initialize();
}

function bindEmailPage() {
    currentPageName = routerPageHistory[routerPageHistory.length - 1];
    hidePage('.' + currentPageName);
    var pageName = 'bind-email-page';
    html = '\
    <div class="container screen-1 '+ pageName + ' bind-email">\
        <div class="page-back"><a href="javascript:onBackPage();" class="back">帳號設定</a><span>綁定信箱</span></div>\
        <div class="content-wrapper">\
            <div class="row text-center">\
                <div class="col-12 screen-1-content">\
                    <div class="screen-container">\
                        <div class="logo logo-inner"><a href="#"><img src="assets/images/logo.png" alt=""></a></div>\
                        <div class="rl-form">\
                            <div class="pb-4"><p class="font-xl" style="color:#5c5c5c;">電子信箱綁定後不可更改</p></div>\
                            <form action="javascript:void(0);" id="submit-bind">\
                                <div class="form-group">\
                                    <div class="input-group mb-2">\
                                        <div class="input-group-prepend"><div class="input-group-text"><img src="assets/images/form-icon/mailbox.png" alt=""></div></div>\
                                        <input type="email" class="form-control" id="email" placeholder="電子信箱即為登入帳號"></div>\
                                </div>\
                                <div class="form-group">\
                                    <div class="input-group mb-2">\
                                        <div class="input-group-prepend">\
                                            <div class="input-group-text"><img src="assets/images/form-icon/key.png" alt=""></div>\
                                        </div>\
                                        <input type="password" class="form-control" id="password" placeholder="密碼請填寫 6~12 字元"></div>\
                                </div>\
                                <div class="form-group">\
                                    <div class="input-group mb-2">\
                                        <div class="input-group-prepend">\
                                            <div class="input-group-text"><img src="assets/images/form-icon/key.png" alt=""></div>\
                                        </div>\
                                        <input type="password" class="form-control" id="password-confirm" placeholder="再次確認密碼"></div>\
                                </div>\
                                <div class="pt-0"><input type="submit" class="btn btn-primary btn-block" disabled value="綁定電子信箱" id="button-submit"></div>\
                            </form>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>';
    if ($('.player-page').length) $('.player-page').before(html); else $('body').append(html);
    routerPageHistory.push(pageName);
    bindEmailClass.initialize();
}