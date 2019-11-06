
var changePasswordClass = {
    initialize: function () {
        $("#email").keyup(function () {
            var email = $("#email").val();

            if (email != undefined && email != "") {
                $("#button_submit").attr("disabled", false);
            } else {
                $("#button_submit").attr("disabled", true);
            }
        });
        $('#submit-email').submit(function () {
            changePasswordClass.submit();
        });
        changePasswordClass.fixElementsStyle();
    },
    
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },

    submit: function () {
        var email = $("#email").val();

        showLoadingDialogWithText('發送中...');
        firebase.auth().sendPasswordResetEmail(email).then(function () {
            // Email sent.
            hideLoadingDialog();
            showSuccessDialogWithText('驗證信已發送<br>請前往信箱查看');
            setTimeout(function () {
                hideSuccessDialog();
                onBackPage();
            }, 1500);
        }).catch(function (error) {
            // An error happened.
            hideLoadingDialog();
            showErrorDialogWithError(error);
            setTimeout(hideErrorDialog, 2000);
        });
    }


}
