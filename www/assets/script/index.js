'use_strict'

app.initialize();
firebase.initializeApp(config);

const DB_NAME = "CommanIndexedDB";
const STORAGE = "AudioStorage";
const INDEX_NAME = "NameIndex";
$(document).ready(function () {
    if (getCookie('account') != 'none') {
        showLoadingDialogWithText('登入中...');
    }
    document.addEventListener('deviceready', onDeviceReady, false);
    initSession();
    if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
        webFCMModule();
    }
});
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if (user.isAnonymous) {
            initSession();
            sessionStorage.setItem('isAccountMode', false);
            sessionStorage.setItem('isFromPersonal', false);
            sessionStorage.setItem('logged', true);
            document.cookie = "account=guest; expires=Thu, 18 Dec 2040 12:00:00 UTC";
            window.location.href = "router.html";
        } else {
            isAccountMode = true;
            sessionStorage.setItem('logged', true);
            sessionStorage.setItem('isAccountMode', true);
            sessionStorage.setItem('isFromPersonal', false);
            sessionStorage.setItem('accountUid', user.uid);
            document.cookie = "account=account; expires=Thu, 18 Dec 2040 12:00:00 UTC";
            window.location.href = "router.html";
        }
    } else {
        initSession();
        document.cookie = "account=none; expires=Thu, 18 Dec 2040 12:00:00 UTC";
        hideLoadingDialog();
    }
});
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
function onDeviceReady() {
    isDevice = true;
    sessionStorage.setItem('isDevice', true);
    deviceFCMModule();
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("landingpage_open","");

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

function webFCMModule() {

    var messaging = firebase.messaging();

    messaging.usePublicVapidKey("BJ_Wboja328jIpFOFyrwuRQZCN6epqowgmtrytKgXekQwXepc3sKG4oYWYcqbGQaIzo0gKYFcdToU7CF-RmgWF4");
    messaging.onTokenRefresh(function () {
        messaging.getToken().then(function (refreshedToken) {
            console.log('Token refreshed.');
            setTokenSentToServer(false);
            sendTokenToServer(refreshedToken);
            resetUI();
        }).catch(function (err) {
            console.log('Unable to retrieve refreshed token ', err);
            // showToken('Unable to retrieve refreshed token ', err);
        });
    });
    messaging.requestPermission().then(function () {
        console.log('Have Permission');
        resetUI();
    }).catch(function (err) {
        console.log('Error Occured. ', JSON.stringify(err));
    });

    messaging.onMessage(function (payload) {
        console.log('Message received. ', payload);
    });
}

function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
        console.log('Sending token to server...');
        setTokenSentToServer(true);
    } else {
        console.log('Token already sent to server so won\'t send it again ' + 'unless it changes');
    }

}

function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function resetUI() {
    var messaging = firebase.messaging();

    messaging.getToken().then(function (currentToken) {
        if (currentToken) {
            sendTokenToServer(currentToken);
            // updateUIForPushEnabled(currentToken);
            console.log('Curren Token: ', currentToken);
        } else {
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
            // Show permission UI.
            updateUIForPushPermissionRequired();
            setTokenSentToServer(false);
        }
    }).catch(function (err) {
        console.log('An error occurred while retrieving token. ', err);
        setTokenSentToServer(false);
    });
}



function initSession() {
    if (sessionStorage.getItem('isFromPersonal') == undefined) sessionStorage.setItem('isFromPersonal', false);
    if (sessionStorage.getItem('isAccountMode') == undefined) sessionStorage.setItem('isAccountMode', false);
    if (sessionStorage.getItem('logged') != undefined) sessionStorage.removeItem('logged');
    if (sessionStorage.getItem('accountUid') != undefined) sessionStorage.removeItem('accountUid');
}
var doubleBackToExitPressedOnce = false;

function openIndexedDB(dbName, objectStoreName, indexName) {
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    if (!window.indexedDB) {
        console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
        return null;
    }
    var open = indexedDB.open(dbName);
    open.onupgradeneeded = function () {
        var db = open.result;
        var store = db.createObjectStore(objectStoreName, { keyPath: "id" });
        var index = store.createIndex(indexName, ["audio.courseId", "audio.audioId"]);
    };
    return open;
}




function onBackKeyDown() {
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
function gotoHome() {
    sessionStorage.setItem('isFromPersonal', false);
    sessionStorage.setItem('logged', true);
    window.location = 'router.html';
}

function anonymousLogin() {
    if(isDevice)
    window.cordova.plugins.firebase.analytics.logEvent("loginlater_landingpage_click","");
    showLoadingDialogWithText('登入中...');
    firebase.auth().signInAnonymously().catch(function (error) {
        hideLoadingDialog();
        console.log("Error occured: ", error);
    });
}

