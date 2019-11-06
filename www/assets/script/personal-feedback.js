
var feedbackClass = {
    initialize: function () {
        $('#input-name').keyup(function () {
            feedbackClass.submitButtonState();
        });

        $('#input-email').keyup(function () {
            feedbackClass.submitButtonState();
        });

        $('#text-content').keyup(function () {
            feedbackClass.submitButtonState();
        });
        $('#submitfeedbackform').submit(function(){
            feedbackClass.submitFeedback();
        });
        feedbackClass.fixElementsStyle();
    },
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },
    submitButtonState: function () {
        var name = $('#input-name').val();
        var email = $('#input-email').val();
        var content = $('#text-content').val();

        isDisabled = true;
        if (name != undefined && name != "" && email != undefined && email != "" && content != undefined && content != "") {
            isDisabled = false;
        } else {
            isDisabled = true;
        }
        $('#button-submit').attr('disabled', isDisabled);
    },
    submitFeedback: function () {
        showLoadingDialogWithText("提交中…");
        feedbackClass.writeFeedback(isAccountMode ? myUserId : "", success => {
            hideLoadingDialog();
            if (success) {
                showSuccessDialogWithText('提交成功');
                if(isDevice)
                window.cordova.plugins.firebase.analytics.logEvent("feedback_submit_done","");
                setTimeout(() => {
                    hideSuccessDialog();
                    // onBackPage();
                }, 2000);
            } else {
                showErrorDialogWithText('請檢查網路連線');
                setTimeout(() => {
                    hideErrorDialog();
                }, 2000);
            }
        });
    },

    writeFeedback: function (uid, success) {
        var name = $('#input-name').val();
        var email = $('#input-email').val();
        var content = $('#text-content').val();
        var now_timestamp = new Date().getTime();
        var time = getDateStringFromTimestamp(now_timestamp);

        var feedback = {};
        if (!isAccountMode || uid == "") {
            feedback = {
                description: content,
                email: email,
                name: name,
                time: time
            };
        } else {
            feedback = {
                description: content,
                email: email,
                name: name,
                time: time,
                uid: uid
            };
        }

        title = "Feedback";
        var html = '<table align="center" width="698" style="margin: 0px auto; width: 100%; border-collapse: collapse; table-layout: fixed; max-width: 698px;" border="0" cellspacing="0" cellpadding="0">\
		<tbody><tr>\
		<td style="border: 1px solid rgb(210, 210, 210); border-image: none; line-height: 1.5; font-family: 微软雅黑, 宋体;">\
			<div style="font-size:18px;">\
			Name: ' + name +'<br>\
			Email: ' + email +'<br>\
			Subject: '+ title +'<br>\
			message: '+ content+ '<br>\
			</div>\
        </td></tr>\
        </tbody>';
        if (isDevice){

            updateCnt = 2;

            becomeLecturerClass.sendMailInDevice(name, email, title, html, completion => {
                updateCnt--;
                if (!updateCnt){
                    success(true);
                }
            });
            newPostKey = firebase.database().ref('Suggestion').push().key;
            firebase.database().ref('Suggestion').child(newPostKey).set(feedback, function (error) {
                if (!error) {
                    success(true);
                } else {
                    success(false);
                }
            });
        } else {
            var popup = window.open('','theWindow','height=400,width=600,left=100,top=100,resizable=no,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no, status=no');
            submitfeedbackform.submit();    
            newPostKey = firebase.database().ref('Suggestion').push().key;
            firebase.database().ref('Suggestion').child(newPostKey).set(feedback, function (error) {
                if (!error) {
                    success(true);
                } else {
                    success(false);
                }
            });
        }

    },
    sendMailInDevice: function(name, email, title, content, completion){
        var mailSettings = {
            emailFrom: email,
            emailTo: "ml.codesign3@gmail.com",
            smtp: "smtp.gmail.com",
            smtpUserName: "ml.codesign3@gmail.com",
            smtpPassword: "ASDFvcx2z!!!za",
            subject: title,
            attachments: [],
            textBody: content
        };
        var mailSettings1 = {
            emailFrom: email,
            emailTo: "contact@talktek.co",
            smtp: "smtp.gmail.com",
            smtpUserName: "ml.codesign3@gmail.com",
            smtpPassword: "ASDFvcx2z!!!za",
            subject: title,
            attachments: [],
            textBody: content
        };

        sendMailCnt = 2;
        smtpClient.sendMail(mailSettings, function(success){
            console.log("Email sent: ", success);
            sendMailCnt--;
            if (!sendMailCnt){
                completion(true);
            }
        }, function(failure){
            console.log("Email sent failed: ", failure);
            sendMailCnt--;
            if (!sendMailCnt){
                completion(false);
            }
        });
        smtpClient.sendMail(mailSettings1, function(success){
            console.log("Email sent: ", success);
            sendMailCnt--;
            if (!sendMailCnt){
                completion(true);
            }
        }, function(failure){
            console.log("Email sent failed: ", failure);
            sendMailCnt--;
            if (!sendMailCnt){
                completion(false);
            }
        });
    },
}