

var allDiscussionsClass = {
    courseId: '',
    courseData: {},
    allDiscusses: {},
    myDiscussIndexList: [],
    myDiscussKeys: [],
    discussionIndex: -1,
    initialize: function(courseId){
        allDiscussionsClass.courseId = courseId;
        allDiscussionsClass.courseData = (allCourses == undefined || allCourses == null || allCourses[courseId] == undefined || allCourses[courseId] == null) ? {} : allCourses[courseId];
        allDiscussionsClass.allDiscusses = {};
        allDiscussionsClass.myDiscussIndexList = [];
        allDiscussionsClass.myDiscussKeys = [];
        allDiscussionsClass.discussionIndex = -1;

        showLoadingDialogWithText('載入中...');
        allDiscussionsClass.loadAllDiscusses(allDiscussionsClass.courseId, data => {
            allDiscussionsClass.allDiscusses = data;
            hideLoadingDialog();
            allDiscussionsClass.showDiscuss();
        });
    
        allDiscussionsClass.fixElementsStyle();
        $('body').click(function(event){
            $('.modify-alert').remove();
        });

        $('#button-add-discuss').click(function(event){
            allDiscussionsClass.gotoAddDiscussion();
        });
    
    },
    fixElementsStyle: function(){
        if (player.miniPlayerExist){
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '50px');
        }
    },
    loadAllDiscusses: function(courseId, data){
        if (courseId == undefined || courseId == null || courseId == ""){
            data({});
        }
        firebase.database().ref('/Discuss/' + courseId + '/').on('value', function(snapshot){
            if (snapshot != undefined && snapshot != null){
                data(snapshot.val());
            } else {
                data({});
            }
        });
    },
    showDiscuss: function(){
        var result = '';
        allDiscussionsClass.myDiscussKeys = [];
        var discussRow = 0;
        allDiscussionsClass.myDiscussIndexList = [];
        var currentIndex = 0;
        for (key in allDiscussionsClass.allDiscusses){
            discuss = allDiscussionsClass.allDiscusses[key];
            allDiscussionsClass.myDiscussKeys.push(key);
            commentUsers = discuss.commentUsers;
            commentCnt = (discuss.commentNumber != undefined && discuss.commentNumber != null) ? discuss.commentNumber : 0;
            // commentCnt = (commentUsers != undefined && commentUsers != null) ?  Object.keys(commentUsers).length : 0;
            isCommentState = false;
            if (isAccountMode && myUserId != undefined && myUserId != ''){
                if (commentUsers != undefined && commentUsers != null){
                    if (commentUsers[myUserId] != undefined && commentUsers[myUserId] == true){
                        isCommentState = true;
                    }
                }
            }
            commentBtn = isCommentState ? 'btn-secondary' : 'btn-info';
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
            postedTime = getTimeAgoStringFromTimestamp(discuss.timestamp);
            metaString = '';
            isMyComment = (myUserId != undefined && myUserId != null && myUserId == discuss.userId);
            if (isMyComment) {
                allDiscussionsClass.myDiscussIndexList.push(currentIndex);
                if (discuss.isEdited != undefined && discuss.isEdited == true){
                    metaString = '\
                        <li><span>(已編輯)</span></li>\
                        <li><span>' + postedTime + '</span></li>\
                        <li><a href="javascript:void(0);" class="edit-discuss"><img src="assets/images/pencil-red.png"></i></a></li>\
                    ';
                } else {
                    metaString = '\
                        <li><span>' + postedTime + '</span></li>\
                        <li><a href="javascript:void(0);" class="edit-discuss"><img src="assets/images/pencil-red.png"></i></a></li>\
                    ';
                }
            } else {
                metaString = '<li><span>'+ postedTime + '</span></li>';
            }
            discussString = '\
            <div class="discussion-box box-all-discussion">\
                <div class="content">\
                    <ul class="meta">' + 
                        metaString +
                    '</ul>\
                    <div class="media">\
                        <img src="' + discuss.userImage + '" class="mr-2">\
                        <div class="media-body">\
                            <div class="name">' + discuss.userName + '</div>\
                            <p>' + discuss.detail + '</p>\
                        </div>\
                    </div>\
                    <ul class="btns">\
                        <li><a href="javascript:void(0);" class="btn '+ likeBtn + ' btn-sm btn-like-all-discussions"><i class="far fa-thumbs-up"></i><span class="like-count">'+ likeCnt + '</span></a></li>\
                        <li><a href="javascript:void(0);" class="btn '+ commentBtn + ' btn-sm btn-comment-all-discussions"><i class="far fa-comment"></i><span class="comment-count">' + commentCnt + '</span></a></li>\
                    </ul>\
                </div>\
            </div>'
            result += discussString;
            currentIndex++;
        }
        $('#discuss-lists').empty();
        $('#discuss-lists').append(result);
        $('.edit-discuss').click(function(event){
            event.stopPropagation();
            if (!isAccountMode) return;
            $('.modify-alert').remove();
            index = $('.edit-discuss').index(this);
            discussionIndex = allDiscussionsClass.myDiscussIndexList[index];
            $(this).after('\
                <ul class="modify-alert">\
                    <li><a href="javascript:void(0);" class="remove-discussion"><i class="far fa-trash-alt mr-3"></i>刪除</a></li>\
                    <li><a href="javascript:void(0);" class="edit-discussion"><i class="fas fa-pencil-alt mr-3"></i>編輯</a></li>\
                </ul>\
            ');
            $(".remove-discussion").click(function(event){
                event.stopPropagation();
                allDiscussionsClass.removeDiscussion(discussionIndex);
            });
            $(".edit-discussion").click(function(event){
                event.stopPropagation();
                allDiscussionsClass.gotoEditDiscussion(discussionIndex);
            });
        });
        $('.btn-like-all-discussions').click(function(event){
            event.stopPropagation();
            if (!isAccountMode){
                showGotoLoginDialog();
                return;
            }
            index = $('.btn-like-all-discussions').index(this);
            isLikedItem = false;
            likeCnt = parseInt($(this).children("span").text());
            if ($(this).hasClass('btn-secondary')){
                isLikedItem = true;
            } else if ($(this).hasClass('btn-info')){
                isLikedItem = false;
            }
            allDiscussionsClass.likeComment(index, isLikedItem);
        });
        $('.btn-comment-all-discussions').click(function(event){
            event.stopPropagation();
            index = $('.btn-comment-all-discussions').index(this);
            allDiscussionsClass.gotoDiscussionDetail(index);
        });
        $('.box-all-discussion').click(function(event){
            index = $('.box-all-discussion').index(this);
            allDiscussionsClass.gotoDiscussionDetail(index);
        });
    },
    gotoEditDiscussion: function(index){
        if (allDiscussionsClass.allDiscusses == undefined || allDiscussionsClass.allDiscusses == null || allDiscussionsClass.myDiscussKeys == undefined || allDiscussionsClass.myDiscussKeys == null) return;
        discuss = allDiscussionsClass.allDiscusses[allDiscussionsClass.myDiscussKeys[index]];
        discuss['discussId'] = allDiscussionsClass.myDiscussKeys[index];
        addDiscussionPage(allDiscussionsClass.courseId, discuss, true);
    },
    removeDiscussion: function(index){
        if (allDiscussionsClass.allDiscusses == undefined || allDiscussionsClass.allDiscusses == null || allDiscussionsClass.myDiscussKeys == undefined || allDiscussionsClass.myDiscussKeys == null) return;
        firebase.database().ref().child('DiscussComments').child(allDiscussionsClass.courseId).child(allDiscussionsClass.myDiscussKeys[index]).remove();
        firebase.database().ref().child('Discuss').child(allDiscussionsClass.courseId).child(allDiscussionsClass.myDiscussKeys[index]).remove();
    },
    likeComment: function(index, isLikedItem){
        console.log('index:', index, ', is Liked:', isLikedItem);
        if (allDiscussionsClass.allDiscusses == undefined || allDiscussionsClass.allDiscusses == null || allDiscussionsClass.myDiscussKeys == undefined || allDiscussionsClass.myDiscussKeys == null) return;
    
        if (isLikedItem){
            firebase.database().ref('Discuss/' + allDiscussionsClass.courseId + '/' + allDiscussionsClass.myDiscussKeys[index] + '/likeUsers/' + myUserId).set(null);
        } else {
            firebase.database().ref('Discuss/' + allDiscussionsClass.courseId + '/' + allDiscussionsClass.myDiscussKeys[index] + '/likeUsers/' + myUserId).set(true);
        }
    },
    
    gotoAddDiscussion: function(){
        if (!isAccountMode){
            showGotoLoginDialog();
            return;
        }
        addDiscussionPage(allDiscussionsClass.courseId, {}, false);
    },
    
    gotoDiscussionDetail: function(index){
        if (allDiscussionsClass.allDiscusses == undefined || allDiscussionsClass.allDiscusses == null || allDiscussionsClass.myDiscussKeys == undefined || allDiscussionsClass.myDiscussKeys == null) return;
    
        discuss = allDiscussionsClass.allDiscusses[allDiscussionsClass.myDiscussKeys[index]];
        discuss['discussId'] = allDiscussionsClass.myDiscussKeys[index];
        if (isAccountMode && myUserId != undefined){
            discuss['myUserId'] = myUserId;
        }
        discussInputPage(allDiscussionsClass.courseId, discuss);
    }
}
