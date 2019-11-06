


var myUserId;
var myProfileImageUrl = "";
var myUserName = "";



var selectedComment;

var editCommentClass = {
    courseId: '',
    isDiscuss: false,
    selectedDiscuss: {},
    selectedComment: {},
    initialize: function(courseId, selectedDiscuss, selectedComment, isDiscuss){
        if (!isAccountMode){
            onBackPage();
        }
        editCommentClass.courseId = courseId;
        editCommentClass.selectedDiscuss = selectedDiscuss;
        editCommentClass.selectedComment = selectedComment;
        editCommentClass.isDiscuss = isDiscuss;
        $('#textarea-discuss').keyup(function(){
            editCommentClass.submitButtonState();
        });

        if (editCommentClass.isDiscuss){
            if (selectedDiscuss.detail != undefined && selectedDiscuss.detail != null){
                $('#textarea-discuss').text(selectedDiscuss.detail);
            }
        } else {
            if (selectedComment.detail != undefined && selectedComment.detail != null){
                $('#textarea-discuss').text(selectedComment.detail);
            }
        }
        $('#submit-change').submit(function(){
            console.log('Submit comment');
            editCommentClass.submitContent();
        });
        editCommentClass.fixElementsStyle();
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
    submitContent: function(){
        if (!isAccountMode){
            showGotoLoginDialog();
            return;
        }
        showLoadingDialogWithText('新增討論中...');
        var content = $('#textarea-discuss').val();
        var now_timestamp = new Date().getTime();
    
        discuss = {
            detail: content,
            isEdited: true
        };
        if (editCommentClass.isDiscuss){
            firebase.database().ref('Discuss').child(editCommentClass.courseId).child(editCommentClass.selectedDiscuss.discussId).update(discuss).then(function(){
                hideLoadingDialog();
                showSuccessDialogWithText('成功');
                editCommentClass.selectedDiscuss.detail = content;
                editCommentClass.selectedDiscuss.isEdited = true;
                setTimeout(function(){
                    hideSuccessDialog();
                    $('#discussion-origin .discussion-box .content .reply-content p').text(content);
                    onBackPage();
                }, 1000);
            }).catch(function(error){
                hideLoadingDialog();
                console.log(error);
            });
        } else {
            firebase.database().ref('DiscussComments')
            .child(editCommentClass.courseId)
            .child(editCommentClass.selectedDiscuss.discussId)
            .child(editCommentClass.selectedComment.commentID)
            .update(discuss).then(function(){
                hideLoadingDialog();
                showSuccessDialogWithText('成功');
                setTimeout(function(){
                    hideSuccessDialog();
                    onBackPage();
                }, 1000);
            }).catch(function(error){
                hideLoadingDialog();
                console.log(error);
            });
        }
    }
    
}
