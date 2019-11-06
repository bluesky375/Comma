
var becomeLecturerClass = {
    initialize: function () {
        $('#input-name').keyup(function () {
            becomeLecturerClass.submitButtonState();
        });
        $('#input-email').keyup(function () {
            becomeLecturerClass.submitButtonState();
        });
        $('#input-course-title').keyup(function () {
            becomeLecturerClass.submitButtonState();
        });
        $('#text-course-content').keyup(function () {
            becomeLecturerClass.submitButtonState();
        });
        $('#submitfeedbackform').submit(function () {
            becomeLecturerClass.submitFeedback();
        });
        becomeLecturerClass.fixElementsStyle();
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
        var title = $('#input-course-title').val();
        var content = $('#text-course-content').val();

        isDisabled = true;
        if (name != undefined && name != "" && email != undefined && email != "" && content != undefined && content != "" && title != undefined && title != "") {
            isDisabled = false;
        } else {
            isDisabled = true;
        }
        $('#button-submit').attr('disabled', isDisabled);
    },
    submitFeedback: function () {
        showLoadingDialogWithText("發送中…");
        becomeLecturerClass.writeLecture(isAccountMode ? myUserId : "", success => {
            hideLoadingDialog();
            if (success) {
                showSuccessDialogWithText('發送成功');
                if(isDevice)
                window.cordova.plugins.firebase.analytics.logEvent("Lectureapply_submit_done","");
                setTimeout(() => {
                    hideSuccessDialog();
                    // onBackPage();
                }, 1200);
            } else {
                showErrorDialogWithText('請檢查網路連線');
                setTimeout(() => {
                    hideErrorDialog();
                }, 1200);
            }
        });

    },

    writeLecture: function (uid, success) {
        var name = $('#input-name').val();
        var email = $('#input-email').val();
        var title = $('#input-course-title').val();
        var content = $('#text-course-content').val();
        var lecture = {};

        if (!isAccountMode || uid == "") {
            lecture = {
                description: content,
                email: email,
                name: name,
                topic: title
            };
        } else {
            lecture = {
                description: content,
                email: email,
                name: name,
                topic: title,
                uid: uid
            };
        }


        // becomeLecturerClass.sendEmail(name, email, title, content, completion => {
        //     updateCnt--;
        //     if (!updateCnt){
        //         success(true);
        //     }
        // });

        var html = '<table align="center" width="698" style="margin: 0px auto; width: 100%; border-collapse: collapse; table-layout: fixed; max-width: 698px;" border="0" cellspacing="0" cellpadding="0">\
		<tbody><tr>\
		<td style="border: 1px solid rgb(210, 210, 210); border-image: none; line-height: 1.5; font-family: 微软雅黑, 宋体;">\
			<div style="font-size:18px;">\
			Name: ' + name +'<br>\
			Email: ' + email +'<br>\
			Subject: '+ title+'<br>\
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
            newPostKey = firebase.database().ref('BecomeLecturer').push().key;
            firebase.database().ref('BecomeLecturer').child(newPostKey).set(lecture, function (error) {
                updateCnt--;
                if (!updateCnt){
                    if (!error) {
                        success(true);
                    } else {
                        success(false);
                    }
                }
            });
        } else {
            var popup = window.open('','theWindow','height=400,width=600,left=100,top=100,resizable=no,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no, status=no');
            submitfeedbackform.submit();
            
            newPostKey = firebase.database().ref('BecomeLecturer').push().key;
            firebase.database().ref('BecomeLecturer').child(newPostKey).set(lecture, function (error) {
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
    sendEmail: function (name, email, title, content, completion) {
/*        $.ajax({
            method: "GET",
            url: "http://comma.ml-codesign.com/www/mail/smer.php",
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            data: {name: name, toid: email, subject: title, message: content },
            success: function(response){
                console.log("response: ", response);
                setTimeout(function(){
                    completion(true);

                }, 500);

            },
            error: function(xhr, status){
                console.log(xhr);
                setTimeout(function(){
                    completion(false);

                }, 500);

            }
        })
        .done(function (msg) {
            console.log("Get from sener: ", msg);
        });
*/
        // $.ajax({
        //     method: "GET",
        //     url: "https://bud.ml-codesign.com/www/mail/smer.php?" + "name=" + name + "&toid=" + email + "&subject=" + title + "&message=" + content,
        //     cors: true,
        //     secure: true,
        //     headers: {
        //         'Access-Control-Allow-Origin': '*',
        //     },
        //     data: null,
        //     success: function(response){
        //         console.log("response: ", response);
        //         setTimeout(function(){
        //             completion(true);

        //         }, 500);

        //     },
        //     error: function(xhr, status){
        //         console.log(xhr);
        //         setTimeout(function(){
        //             completion(false);
        //         }, 500);

        //     }
        // })
        // .done(function (msg) {
        //     console.log("Get from sener: ", msg);
        // });
    }

}
