
var coursePurchaseRecordClass = {
    pageName: '',
    initialize: function(){
        coursePurchaseRecordClass.pageName = routerPageHistory[routerPageHistory.length - 1];
        showLoadingDialogWithText('載入中...');
        downloadCnt = 4;
        coursePurchaseRecordClass.loadAllCourses(data => {
            allCourses = data;
            if (downloadCnt > 0) downloadCnt--;
            if (!downloadCnt){
                coursePurchaseRecordClass.showBoughtCourses();
            }
        });
        coursePurchaseRecordClass.loadmyBoughtCourseList(myUserId, data => {
            myBoughtCourseList = data;
            if (downloadCnt > 0) downloadCnt--;
            if (!downloadCnt){
                coursePurchaseRecordClass.showBoughtCourses();
            }
        });

        coursePurchaseRecordClass.loadMyHeartCourseList(myUserId, data => {
            myHeartCourseList = data;
            if (downloadCnt > 0) downloadCnt--;
            if (!downloadCnt){
                coursePurchaseRecordClass.showBoughtCourses();
            }
        });
        coursePurchaseRecordClass.loadAllTeacherCourses(data => {
            allTeacherCourses = data;
            if (downloadCnt > 0) downloadCnt--;
            if (!downloadCnt){
                coursePurchaseRecordClass.showBoughtCourses();
            }
        });
        coursePurchaseRecordClass.fixElementsStyle();
    },
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },

    loadAllCourses: function(data){
        firebase.database().ref('/AllCourses/').once('value').then(function(snapshot) {
            if (snapshot != undefined && snapshot != null){
                data(snapshot.val());
            } else {
                data({});
            }
        }).catch(function(error){
            console.log(error);
            data({});
        });
    },
    
    loadmyBoughtCourseList: function(uid, data){
    
        if (uid == undefined || uid == null || uid == ""){
            console.log('Uid is not exist!');
            data([]);
            return;
        }
        firebase.database().ref('/BoughtCourses/' + uid + '/').once('value').then(function(snapshot) {
            data(snapshot.val());
        }).catch(function(error){
            console.log(error);
            data([]);
        });
    },
    loadMyHeartCourseList: function(uid, data){
        if (uid == undefined || uid == null || uid == ""){
            console.log('Uid is not exist!');
            data([]);
            return;
        }
        firebase.database().ref('/HeartCourses/' + uid + '/').on('value', function(snapshot) {
            data(snapshot.val());
        });
    
    },
    loadAllTeacherCourses: function(result){
        firebase.database().ref('TeacherCourses').once('value').then((snapshot) => {
            if (snapshot != undefined && snapshot != null){
                result(snapshot.val());
            } else {
                result({});
            }
        });
    },
    showBoughtCourses: function(){
    
        hideLoadingDialog();
        if (isAccountMode){
            $('.purchased-list').empty();
            if (allCourses == undefined || allCourses == null){
                return;
            }
            if (myBoughtCourseList == undefined || myBoughtCourseList == null){
                return;
            }
            result = '';
            for (i = 0; i < myBoughtCourseList.length; i++){
                key = myBoughtCourseList[i];
                course = allCourses[key];
                if (course == undefined || course == null) continue;
                var isFav = false;
                if (myHeartCourseList != undefined && myHeartCourseList != null){
                    for (kk = 0; kk < myHeartCourseList.length; kk++){
                        if (myHeartCourseList[kk] == key){
                            isFav = true;
                            break;
                        }
                    }
                }
    
                var fav_button = isFav  ? '<button type="button" class="btn button_fav' + coursePurchaseRecordClass.pageName+ ' active" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>'
                                        : '<button type="button" class="btn button_fav' + coursePurchaseRecordClass.pageName+ '" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>';
    
                courseString = '\
                <div class="purchase-item row">\
                    <div class="col-6">\
                        <div class="full-img">\
                            <div class="mark">' + 
                                fav_button + 
                            '</div>\
                            <img src="'+ course.overViewImage +'" alt="">\
                        </div>\
                        <div class="author media">\
                            <img src="'+  course.authorImage + '" class="mr-2" alt="">\
                            <div class="media-body">'+ course.authorName + '</div>\
                        </div>\
                    </div>\
                    <div class="col-6">\
                    <p><a href="javascript:void(0);">' + course.courseTitle + '</a></p>\
                    </div>\
                </div>';
                result += courseString;
            }
            $('#purchased-list' + coursePurchaseRecordClass.pageName).empty();
            $('#purchased-list' + coursePurchaseRecordClass.pageName).append(result);
            $('.button_fav' + coursePurchaseRecordClass.pageName).click(function(event){
                event.stopPropagation();
                if (!isAccountMode){
                    showGotoLoginDialog();
                    return;
                }
                index = $('.button_fav' + coursePurchaseRecordClass.pageName).index(this);
                courseId = myBoughtCourseList[index];
                console.log('Course id: ' + courseId);
    
                if (myHeartCourseList == undefined || myHeartCourseList == null){
                    myHeartCourseList = [];
                }
                if ($(this).hasClass('active')){
                    // $(this).removeClass('active');
                    // $(this).attr('aria-pressed', true);
                    let heartIndex = myHeartCourseList.indexOf(courseId);
                    if (heartIndex > -1){
                        myHeartCourseList.splice(heartIndex, 1);
                        coursePurchaseRecordClass.setMyHeartCourses(myHeartCourseList);
                    }
                } else {
                    // $(this).addClass('active');
                    // $(this).attr('aria-pressed', false);
                    let heartIndex = myHeartCourseList.indexOf(courseId);
                    if (heartIndex == -1){
                        myHeartCourseList.push(courseId);
                        coursePurchaseRecordClass.setMyHeartCourses(myHeartCourseList);
                    }            
                }
            });
            $('.purchase-item').click(function(event){
                index = $('.purchase-item').index(this);
                courseId = myBoughtCourseList[index];
                coursePurchaseRecordClass.gotoDetailCourse(courseId);
            });
        } else {
            $('.purchased-list' + coursePurchaseRecordClass.pageName).empty();
            $('.purchased-list' + coursePurchaseRecordClass.pageName).append(getEmptyElement());
        }
    },
    
    setMyHeartCourses: function(data){
        if (myUserId == undefined || myUserId == ""){
            return;
        }
        firebase.database().ref('HeartCourses/' + myUserId).set(data);
    },
    
    gotoDetailCourse: function(courseId){
        let isBoughtItem = false;
        let isFavItem = false;
        if (allCourses == undefined || allCourses == null){
            console.log('allCourses is empty!');
            return;
        }
        courseDetailPage(courseId);
        // sessionStorage.setItem('myHeartCourseList', JSON.stringify(myHeartCourseList));
        // sessionStorage.setItem('myBoughtCourseList', JSON.stringify(myBoughtCourseList));
        // sessionStorage.setItem('allCourses', JSON.stringify(allCourses));
        // window.location.href = "course-page.html?courseId=" + courseId;
    }
}
