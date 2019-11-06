
var addDiscussionClass = {
    courseId: '',
    selectedDiscuss: {},
    isModifyDiscuss: false,
    initialize: function(courseId, selectedDiscuss, isModifyDiscuss){
        addDiscussionClass.courseId = courseId;
        addDiscussionClass.selectedDiscuss = selectedDiscuss;
        addDiscussionClass.isModifyDiscuss = isModifyDiscuss;
        $('#textarea-discuss').keyup(function(){
            addDiscussionClass.submitButtonState();
        });
        if (addDiscussionClass.isModifyDiscuss){
            $('#back-name').text('取消編輯');
        } else {
            $('#back-name').text('討論');
        }
        if (addDiscussionClass.isModifyDiscuss){
            if (addDiscussionClass.selectedDiscuss.detail != undefined && addDiscussionClass.selectedDiscuss.detail != null){
                $('#textarea-discuss').text(addDiscussionClass.selectedDiscuss.detail);
            }
        }
        $('#submit-form').submit(function(){
            addDiscussionClass.addDiscuss();
        });
        addDiscussionClass.fixElementsStyle();
    },
    fixElementsStyle: function(){
        if (player.miniPlayerExist){
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '50px');
        }
    },
    submitButtonState: function(){
        var content = $('#textarea-discuss').val();
        if (content != undefined && content != ""){
            $('#submit-discuss').attr('disabled', false);
        } else {
            $('#submit-discuss').attr('disabled', true);
        }
    },
    addDiscuss: function(){
        if (!isAccountMode){
            showGotoLoginDialog();
            return;
        }
        showLoadingDialogWithText('新增討論中...');
        if (myUserId == undefined || myUserId == ""){
            console.log('Error occured while get user id!');
            hideLoadingDialog();
        } else {
            addDiscussionClass.loadMyProfileData(data => {
                var myUserName = "";
                var myProfileImageUrl = "";
                if (data != undefined && data != null){

                    if (data.profileImageUrl != undefined && data.profileImageUrl != null){
                        myProfileImageUrl = data.profileImageUrl;
                    }
                    if (data.name != undefined && data.name != null){
                        myUserName = data.name;
                    }
                }
                addDiscussionClass.submitDiscuss(myUserName, myProfileImageUrl);
            });
        }
    },
    submitDiscuss: function(myUserName, myProfileImageUrl){
        var content = $('#textarea-discuss').val();
        var now_timestamp = new Date().getTime();
    
        var newPostKey;
        if (addDiscussionClass.isModifyDiscuss){
            if (addDiscussionClass.selectedDiscuss.discussId != undefined && addDiscussionClass.selectedDiscuss.discussId != null){
                newPostKey = addDiscussionClass.selectedDiscuss.discussId;
            } else {
                newPostKey = firebase.database().ref().child('Discuss').child(addDiscussionClass.courseId).push().key;
            }
        } else {
            newPostKey = firebase.database().ref().child('Discuss').child(addDiscussionClass.courseId).push().key;
            userAnalyticsClass.set_usr_total_discussion();

        }
        var discuss = {};
        if (addDiscussionClass.isModifyDiscuss){
            discuss = {
                detail: content,
                userId: myUserId,
                userImage: myProfileImageUrl,
                userName: myUserName,
                isEdited: true
            };
        } else {
            discuss = {
                detail: content,
                timestamp: now_timestamp,
                userId: myUserId,
                userImage: myProfileImageUrl,
                userName: myUserName
            };
        }
    
        firebase.database().ref().child('Discuss').child(addDiscussionClass.courseId).child(newPostKey).update(discuss).then(function(){
            hideLoadingDialog();

            showSuccessDialogWithText('新增討論成功');
            setTimeout(function(){
                hideSuccessDialog();
                onBackPage();
            }, 1500);

        }).catch(function(error){
            hideLoadingDialog();
            alert('Error occurred while submit the discuss!');
            console.log(error);
        });
    },
    
    loadMyProfileData: function(data){
        if (myUserId == undefined || myUserId == null || myUserId == ''){
            data({});
            return;
        }
        firebase.database().ref('/Users/' + myUserId + '/').once('value').then(function(snapshot){
            if (snapshot != undefined && snapshot != null){
                data(snapshot.val());
            } else {
                data({});
            }
        });
    }
}
