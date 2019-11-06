
var bindEmailClass = {
    initialize: function () {
        $('#email').keyup(function (event) {
            bindEmailClass.submitButtonState();
        });
        $('#password').keyup(function (event) {
            bindEmailClass.submitButtonState();
        });
        $('#password-confirm').keyup(function (event) {
            bindEmailClass.submitButtonState();
        });
        $('#submit-bind').submit(function () {
            bindEmailClass.bind();
        });
        bindEmailClass.fixElementsStyle();
    },
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },

    submitButtonState: function () {
        var email = $("#email").val();
        var password = $("#password").val();
        var password_confirm = $("#password-confirm").val();

        var isDisabled = false;
        if (email == undefined || email == "" ||
            password == undefined || password == "" ||
            password_confirm == undefined || password_confirm == "") {
            isDisabled = true;
        } else {
            isDisabled = false;
        }
        $("#button-submit").attr("disabled", isDisabled);
    },
    bind: function () {
        var email = $("#email").val();
        var password = $("#password").val();
        var password_confirm = $("#password-confirm").val();

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

        var credential = firebase.auth.EmailAuthProvider.credential(email, password);
        showLoadingDialogWithText('連接中…');
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // User is signed in.
                currentFirebaseUser = user;
                user.linkWithCredential(credential).then(function (usercred) {
                    var user = usercred.user;
                    hideLoadingDialog();
                    console.log("Account linking success", user);
                    myAccountClass.getCurrentUser();
                    onBackPage();
                }, function (error) {
                    console.log("Account linking error", error);
                    hideLoadingDialog();
                    showErrorDialogWithError(error);
                });
            } else {
                // No user is signed in.
                hideLoadingDialog();
                console.log('No user signed in');
            }
        });
    }
}

