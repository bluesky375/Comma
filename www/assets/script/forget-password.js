firebase.initializeApp(config);


$(document).ready(function () {
    document.addEventListener('deviceready', onDeviceReady, false);
    $("#email").keyup(function () {
        var email = $("#email").val();
    
        if (email != undefined && email != "") {
            $("#button_submit").attr("disabled", false);
        } else {
            $("#button_submit").attr("disabled", true);
        }
    });
    $("#password-reset-form").submit(function () {
        var email = $("#email").val();

        showLoadingDialogWithText('發送中...');
        firebase.auth().sendPasswordResetEmail(email).then(function () {
            // Email sent.
            hideLoadingDialog();
            showSuccessDialogWithText('驗證信已發送<br>請前往信箱查看');
            setTimeout(function(){
                hideSuccessDialog();
                window.history.back();
            }, 1500);
        }).catch(function (error) {
            hideLoadingDialog();
            showErrorDialogWithError(error);
            setTimeout(hideErrorDialog, 2000);
        });
    });
    $(".back").click(function () {
        window.history.back();
    });
});

function onDeviceReady(){
    if(window.MobileAccessibility){
        window.MobileAccessibility.usePreferredTextZoom(false);
    }
}
