

var discussionInputClass = {
    courseId: '',
    courseData: {},
    selectedDiscuss: {},
    discussComments: {},
    commentKeyList: [],
    myCommentKeyList: [],
    myProfile: {},
    initialize: function(courseId, selectedDiscuss){
        discussionInputClass.courseId = courseId;
        discussionInputClass.courseData = allCourses[courseId];
        discussionInputClass.selectedDiscuss = selectedDiscuss;
        discussionInputClass.discussComments = {};
        discussionInputClass.commentKeyList = [];
        discussionInputClass.myCommentKeyList = [];
        discussionInputClass.myProfile = {};

        $('#input-reply').keyup(function(){
            discussionInputClass.submitButtonState();
        });
        $('#input-reply').focus(function(){
            if (!isAccountMode){
                showGotoLoginDialog();
                $(this).blur();
            }
        });
    
        $('#submit-comment').submit(function(){
            discussionInputClass.submitComment();
        });
        discussionInputClass.loadMyProfileData(data => {
            discussionInputClass.myProfile = data;
            discussionInputClass.showMyProfileImage();
        });
        discussionInputClass.showDiscussionOrigin();
        discussionInputClass.showDiscussComment();
    
        $('body').click(function(event){
            $('.modify-alert').remove();
        });
        discussionInputClass.fixElementsStyle();
    },
    fixElementsStyle: function(){
        if (player.miniPlayerExist){
            $('.home-player').css('bottom', '0px');
            $('.reply-form:visible').css({'bottom' : '50px'});
            $('.content-wrapper:visible').css('padding-bottom', '120px');
        } else {
            $('.home-player').remove();
            $('.reply-form:visible').css({'bottom' : '0px'});
            $('.content-wrapper:visible').css('padding-bottom', '70px');
        }
    },
    submitButtonState: function(){
        disabledState = true;
        if (!isAccountMode){
            disabledState = true;
        } else {
            replyText = $('#input-reply').val();
            if (replyText != undefined && replyText != "" && discussionInputClass.myProfile != undefined && discussionInputClass.myProfile != null){
                disabledState = false;
            } else {
                disabledState = true;
            }
        }
        if (disabledState){
            $('#button-submit').attr('src', 'assets/images/btn-send.png');
        } else {
            $('#button-submit').attr('src', 'assets/images/btn-send-hover.png');
        }
        // $('#button-submit').attr('disabled', disabledState);
    },

    submitComment: function(){
        commentText = $('#input-reply').val();
        var now_timestamp = new Date().getTime();
        if (!isAccountMode || myUserId == undefined || myUserId == '' ){
            return;
        }
        var newPostKey = firebase.database().ref().child('DiscussComments').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).push().key;
        var comment = {
            detail: commentText,
            timestamp: now_timestamp,
            userId: myUserId,
            userImage: (discussionInputClass.myProfile != undefined && discussionInputClass.myProfile.profileImageUrl != undefined) ? discussionInputClass.myProfile.profileImageUrl : "",
            userName: (discussionInputClass.myProfile != undefined && discussionInputClass.myProfile.name != undefined) ? discussionInputClass.myProfile.name : ""
        };
        var commentNumber = discussionInputClass.commentKeyList.length + 1;
        firebase.database().ref().child('Discuss').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).child('commentUsers').child(myUserId).set(true);
        firebase.database().ref().child('Discuss').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).child('commentNumber').set(commentNumber);
        discussionInputClass.selectedDiscuss.commentNumber = commentNumber;
        if (discussionInputClass.selectedDiscuss.commentUsers == undefined || discussionInputClass.selectedDiscuss.commentUsers == null){
            discussionInputClass.selectedDiscuss.commentUsers = {[myUserId] : true};
        } else {
            discussionInputClass.selectedDiscuss.commentUsers[myUserId] = true;
        }
        
        firebase.database().ref().child('DiscussComments').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).child(newPostKey).update(comment);
        $('#input-reply').val('');
        discussionInputClass.submitButtonState();
        $('#button-submit').blur();
        // $('#button-submit').attr('disabled', true);
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
    },
    showMyProfileImage: function(){
        if (discussionInputClass.myProfile == undefined || discussionInputClass.myProfile == null || discussionInputClass.myProfile.profileImageUrl == undefined || discussionInputClass.myProfile.profileImageUrl == null){
            return;
        }
        $('#profile-image').attr('src', discussionInputClass.myProfile.profileImageUrl);
    },
    
    showDiscussionOrigin: function(){
        if (discussionInputClass.selectedDiscuss == undefined || discussionInputClass.selectedDiscuss == null){
            return;
        }
        discuss = discussionInputClass.selectedDiscuss;
        likeUsers = discuss.likeUsers;
        likeCnt = (likeUsers != undefined && likeUsers != null) ? Object.keys(likeUsers).length : 0;
        isLikeState = false;
        if (isAccountMode && myUserId != undefined && myUserId != ''){
            if (likeUsers != undefined && likeUsers != null){
                if (likeUsers[myUserId] != undefined && likeUsers[myUserId] == true){
                    isLikeState = true;
                }
            }
        }
        likeBtn = isLikeState ? 'btn-secondary' : 'btn-info';
        postedTime = getDateFromTimestamp(discuss.timestamp);
        metaString = '';
        isMyComment = (myUserId != undefined && myUserId != null && myUserId == discuss.userId);
        if (isMyComment) {
            if (discuss.isEdited != undefined && discuss.isEdited == true){
                metaString = '\
                    <li><span>(已編輯)</span></li>\
                    <li><a href="javascript:void(0);" class="edit-discuss-detail"><img src="assets/images/pencil-red.png"></a></li>\
                ';
            } else {
                metaString = '\
                    <li><a href="javascript:void(0);" class="edit-discuss-detail"><img src="assets/images/pencil-red.png"></a></li>\
                ';
            }
        } else {
            metaString = '';
        }
        discussString = '\
            <div class="discussion-box">\
                <div class="content">\
                    <ul class="meta">' +
                        metaString +
                    '</ul>\
                    <div class="media">\
                        <img src="'+ discuss.userImage + '" class="">\
                        <div class="media-body">\
                            <div class="name">' + discuss.userName + '</div>\
                            <div class="date">' + postedTime + '</div>\
                        </div>\
                    </div>\
                    <div class="reply-content">\
                        <p style="word-break: break-word">' + discuss.detail + '</p>\
                    </div>\
                    <ul class="btns">\
                        <li><a href="javascript:void(0);" class="btn ' + likeBtn + ' btn-sm btn-like-discuss"><i class="far fa-thumbs-up"></i><span class="like-discuss-count">'+ likeCnt + '</span></a></li>\
                    </ul>\
                    <span class="reply" id="comment-count">0則回覆</span>\
                </div>\
            </div>';
        $('#discussion-origin').empty();
        $('#discussion-origin').append(discussString);
        
        $('.edit-discuss-detail').click(function(event){
            event.stopPropagation();
            if (!isAccountMode) return;
            $('.modify-alert').remove();
            $(this).after('\
                <ul class="modify-alert">\
                    <li><a href="javascript:void(0);" id="remove-discussion"><img src="assets/images/icon-delete.png">刪除</a></li>\
                    <li><a href="javascript:void(0);" id="goto-edit-discussion"><img src="assets/images/pencil.png">編輯</a></li>\
                </ul>\
            ');
            $('#remove-discussion').click(function(event){
                event.stopPropagation();
                discussionInputClass.removeDiscussion();
            });
            $('#goto-edit-discussion').click(function(event){
                event.stopPropagation();
                discussionInputClass.gotoEditDiscussion();
            });
        });
        $('.btn-like-discuss').click(function(event){
            event.stopPropagation();
            if (!isAccountMode){
                showGotoLoginDialog();
                return;
            }
            isLikedItem = false;
            likeCnt = parseInt($(this).children("span").text());
            if ($(this).hasClass('btn-secondary')){
                isLikedItem = true;
                $(this).removeClass('btn-secondary');
                $(this).addClass('btn-info');
                $(this).children("span").text("" + (likeCnt - 1));
                if (discussionInputClass.selectedDiscuss.likeUsers != undefined && discussionInputClass.selectedDiscuss.likeUsers != null && discussionInputClass.selectedDiscuss.likeUsers[myUserId] != undefined){
                    delete discussionInputClass.selectedDiscuss.likeUsers[myUserId];
                }
            } else if ($(this).hasClass('btn-info')){
                isLikedItem = false;
                $(this).removeClass('btn-info');
                $(this).addClass('btn-secondary');
                $(this).children("span").text("" + (likeCnt + 1));
                if (discussionInputClass.selectedDiscuss.likeUsers == undefined || discussionInputClass.selectedDiscuss.likeUsers == null){
                    discussionInputClass.selectedDiscuss.likeUsers = {[myUserId] : true};
                } else {
                    discussionInputClass.selectedDiscuss.likeUsers[myUserId] = true;
                }
            }
            discussionInputClass.likeDiscuss(isLikedItem);
        })
    },
    
    removeDiscussion: function(){
        if (discussionInputClass.courseId == undefined || discussionInputClass.courseId == null || discussionInputClass.selectedDiscuss.discussId == undefined || discussionInputClass.selectedDiscuss.discussId == null) {
            return;
        }
        removeCnt = 2;
        showLoadingDialogWithText("刪除中…");
        firebase.database().ref().child('DiscussComments').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).remove().then(function(){
            removeCnt--;
            if (removeCnt == 0){
                hideLoadingDialog();
                onBackPage();
            }
        });
        firebase.database().ref().child('Discuss').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).remove().then(function(){
            removeCnt--;
            if (removeCnt == 0){
                hideLoadingDialog();
                onBackPage();
            }
        });
    
    },
    gotoEditDiscussion: function(){
        // addDiscussionPage(discussionInputClass.courseId, discussionInputClass.selectedDiscuss, true);
        editCommentPage(discussionInputClass.courseId, discussionInputClass.selectedDiscuss, {}, true);
    },
    loadDiscussComments: function(data){
        if (discussionInputClass.courseId == undefined || discussionInputClass.courseId == null || discussionInputClass.selectedDiscuss.discussId == undefined || discussionInputClass.selectedDiscuss.discussId == null) {
            data({});
            return;
        }
        firebase.database().ref().child('DiscussComments').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).on('value', function(snapshot){
            if (snapshot != undefined && snapshot != null){
                data(snapshot.val());
            } else {
                data({});
            }
        });
    },
    showDiscussComment: function(){
        discussionInputClass.loadDiscussComments(data => {
            discussionInputClass.discussComments = data;
            discussionInputClass.showComments();
        });
    },
    
    showComments: function(){
        discussionInputClass.commentKeyList = [];
        result = '';
        discussionInputClass.myCommentKeyList = [];
        currentIndex = 0;
        for (key in discussionInputClass.discussComments){
            comment = discussionInputClass.discussComments[key];
            discussionInputClass.commentKeyList.push(key);
            likeUsers = comment.likeUsers;
            likeCnt = (likeUsers != undefined && likeUsers != null) ? Object.keys(likeUsers).length : 0;
            isLikeState = false;
            if (isAccountMode && myUserId != undefined && myUserId != ''){
                if (likeUsers != undefined && likeUsers != null){
                    if (likeUsers[myUserId] != undefined && likeUsers[myUserId] == true){
                        isLikeState = true;
                    }
                }
            }
            likeBtn = isLikeState ? 'btn-secondary' : 'btn-info';
            postedTime = getTimeAgoStringFromTimestamp(comment.timestamp);
            metaString = '';
            isMyComment = (myUserId != undefined && myUserId != null && myUserId == comment.userId);
            if (isMyComment) {
                discussionInputClass.myCommentKeyList.push(currentIndex);
                if (comment.isEdited != undefined && comment.isEdited == true){
                    metaString = '\
                        <li><span>(已編輯)</span></li>\
                        <li><span>' + postedTime + '</span></li>\
                        <li><a href="javascript:void(0);" class="edit-comment"><img src="assets/images/pencil-red.png"></a></li>\
                    ';
                } else {
                    metaString = '\
                        <li><span>' + postedTime + '</span></li>\
                        <li><a href="javascript:void(0);" class="edit-comment"><img src="assets/images/pencil-red.png"></a></li>\
                    ';
                }
            } else {
                metaString = '<li><span>'+ postedTime + '</span></li>';
            }
            commentString = '\
                <div class="discussion-box">\
                    <div class="content">\
                        <ul class="meta">' + 
                            metaString +
                        '</ul>\
                        <div class="media">\
                            <img src="' + comment.userImage + '" class="mr-2">\
                            <div class="media-body">\
                                <div class="name">' + comment.userName + '</div>\
                                <p style="word-break: break-word">' + comment.detail + '</p>\
                            </div>\
                        </div>\
                        <ul class="btns">\
                            <li><a href="javascript:void(0);" class="btn ' + likeBtn + ' btn-sm btn-like-comment"><i class="far fa-thumbs-up"></i><span>'+ likeCnt+ '</span></a></li>\
                        </ul>\
                    </div>\
                </div>';
            
            result += commentString;
            currentIndex++;
        }
        $('#discussion-comment').empty();
        $('#discussion-comment').append(result);
        $('#comment-count').text('' + currentIndex + '則回覆');
    
        $('.edit-comment').click(function(event){
            event.stopPropagation();
            if (!isAccountMode) return;
            $('.modify-alert').remove();
            index = $('.edit-comment').index(this);
            commentIndex = discussionInputClass.myCommentKeyList[index];

            $(this).after('\
                <ul class="modify-alert">\
                    <li><a href="javascript:void(0);" id="remove-comment"><img src="assets/images/icon-delete.png">刪除</a></li>\
                    <li><a href="javascript:void(0);" id="edit-comment"><img src="assets/images/pencil.png">編輯</a></li>\
                </ul>\
            ');

            $('#remove-comment').click(function(event){

                discussionInputClass.removeComment(commentIndex);
            });

            $('#edit-comment').click(function(event){
                discussionInputClass.gotoEditComment(commentIndex);
            });
        });
        $('.btn-like-comment').click(function(event){
            event.stopPropagation();
            if (!isAccountMode){
                showGotoLoginDialog();
                return;
            }
            index = $('.btn-like-comment').index(this);
            isLikedItem = false;
            likeCnt = parseInt($(this).children("span").text());
            if ($(this).hasClass('btn-secondary')){
                isLikedItem = true;
                // $(this).removeClass('btn-secondary');
                // $(this).addClass('btn-info');
                // $(this).children("span").text("" + (likeCnt - 1));
            } else if ($(this).hasClass('btn-info')){
                isLikedItem = false;
                // $(this).removeClass('btn-info');
                // $(this).addClass('btn-secondary');
                // $(this).children("span").text("" + (likeCnt + 1));
            }
            discussionInputClass.likeComment(index, isLikedItem);
    
        });
    },
    likeDiscuss: function(isLikedItem){
        if (discussionInputClass.courseId == undefined || discussionInputClass.courseId == null || discussionInputClass.selectedDiscuss == undefined || discussionInputClass.selectedDiscuss == null || 
            discussionInputClass.selectedDiscuss.discussId == undefined || discussionInputClass.selectedDiscuss.discussId == null ||
            myUserId == undefined || myUserId == null){
                return;
            }
    
        if (isLikedItem){
            firebase.database().ref('Discuss/' + discussionInputClass.courseId + '/' + discussionInputClass.selectedDiscuss.discussId + '/likeUsers/' + myUserId).set(null);
        } else {
            firebase.database().ref('Discuss/' + discussionInputClass.courseId + '/' + discussionInputClass.selectedDiscuss.discussId + '/likeUsers/' + myUserId).set(true);
        }
    },
    likeComment: function(index, isLikedItem){
        if (discussionInputClass.courseId == undefined || discussionInputClass.courseId == null || discussionInputClass.selectedDiscuss == undefined || discussionInputClass.selectedDiscuss == null || 
            discussionInputClass.selectedDiscuss.discussId == undefined || discussionInputClass.selectedDiscuss.discussId == null ||
            myUserId == undefined || myUserId == null || discussionInputClass.commentKeyList == undefined || discussionInputClass.commentKeyList == null){
                return;
            }
        if (isLikedItem){
            firebase.database().ref('DiscussComments')
                .child(discussionInputClass.courseId)
                .child(discussionInputClass.selectedDiscuss.discussId)
                .child(discussionInputClass.commentKeyList[index])
                .child('likeUsers')
                .child(myUserId)
                .set(null);
        } else {
            firebase.database().ref('DiscussComments')
                .child(discussionInputClass.courseId)
                .child(discussionInputClass.selectedDiscuss.discussId)
                .child(discussionInputClass.commentKeyList[index])
                .child('likeUsers')
                .child(myUserId)
                .set(true);
        }
        
    },
    removeComment: function(index){
        if (discussionInputClass.commentKeyList == undefined || discussionInputClass.commentKeyList == null || 
            discussionInputClass.courseId == undefined || discussionInputClass.courseId == "" || 
            discussionInputClass.selectedDiscuss.discussId == undefined || discussionInputClass.selectedDiscuss.discussId == ""){
                console.log('Some information needed.')
                return;
        }
        var commentNumber = discussionInputClass.commentKeyList.length - 1;
        firebase.database().ref().child('Discuss').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).child('commentNumber').set(commentNumber);
        discussionInputClass.selectedDiscuss.commentNumber = commentNumber;
    
        delete discussionInputClass.discussComments[discussionInputClass.commentKeyList[index]];
        isMyCommentExist = false;
        for (key in discussionInputClass.discussComments){
            comment = discussionInputClass.discussComments[key];
            isMyComment = (myUserId != undefined && myUserId != null && myUserId == comment.userId);
            if (isMyComment){
                isMyCommentExist = true;
                break;
            }
        }
        if (!isMyCommentExist){
            firebase.database().ref().child('Discuss').child(discussionInputClass.courseId).child(discussionInputClass.selectedDiscuss.discussId).child('commentUsers').child(myUserId).set(null);
            delete discussionInputClass.selectedDiscuss.commentUsers[myUserId];
        }

        firebase.database().ref()
        .child('DiscussComments')
        .child(discussionInputClass.courseId)
        .child(discussionInputClass.selectedDiscuss.discussId)
        .child(discussionInputClass.commentKeyList[index])
        .remove();
    },
    
    gotoEditComment: function(index){
        if (discussionInputClass.commentKeyList == undefined || discussionInputClass.commentKeyList == null || 
            discussionInputClass.courseId == undefined || discussionInputClass.courseId == "" || 
            discussionInputClass.selectedDiscuss.discussId == undefined || discussionInputClass.selectedDiscuss.discussId == ""){
                console.log('Some information needed.')
                return;
        }
        var selectedComment = discussionInputClass.discussComments[discussionInputClass.commentKeyList[index]];
        selectedComment["commentID"] = discussionInputClass.commentKeyList[index];
        editCommentPage(discussionInputClass.courseId, discussionInputClass.selectedDiscuss, selectedComment, false);
    }
}

