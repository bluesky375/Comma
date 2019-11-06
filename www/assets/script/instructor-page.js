

var instructorClass = {
    courseId: '',
    courseData: {},
    currentTeacherCourseList: [],
    pageName: '',
    initialize: function(courseId){

        instructorClass.reloadData();
        instructorClass.showInstructorInfo();
        if (instructorClass.currentTeacherCourseList != undefined && instructorClass.currentTeacherCourseList != null){
            instructorClass.showLoadingDataInfo();
        }
        instructorClass.fixElementsStyle();
    },
    reloadData: function(){
        instructorClass.pageName = routerPageHistory[routerPageHistory.length - 1];
        instructorClass.courseId = getCourseIdFromPageName(instructorClass.pageName);
        instructorClass.courseData = allCourses[instructorClass.courseId];

        authorId = instructorClass.courseData.authorId;
        if (authorId != undefined && authorId != null || authorId != ""){
            instructorClass.currentTeacherCourseList = allTeacherCourses[authorId];
        }
    },

    fixElementsStyle: function(){
        if (player.miniPlayerExist){
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },

    loadTeacherCourses: function(result){
        authorId = instructorClass.courseData.authorId;
        if (authorId == undefined || authorId == null || authorId == ""){
            result([]);
            return;
        }
        firebase.database().ref('TeacherCourses').child(authorId).once('value').then((snapshot) => {
            if (snapshot != undefined && snapshot != null){
                result(snapshot.val());
            } else {
                result([]);
            }
        });
    },
    
    showInstructorInfo: function(){
        if (instructorClass.courseData.authorName != undefined && instructorClass.courseData.authorName != null){
            $('.user-name').text(instructorClass.courseData.authorName);
        }
        if (instructorClass.courseData.authorImage != undefined && instructorClass.courseData.authorImage != null){
            $('.user-img').attr('src', instructorClass.courseData.authorImage);
        }
        if (instructorClass.courseData.authorDescription != undefined){

            authorDescriptionTxt = getFullWidthSpaceString(instructorClass.courseData.authorDescription);

            blocks = authorDescriptionTxt.split('\n');
            auth_info = '';
            for (i = 0; i < blocks.length; i++){
                auth_info += blocks[i]+ '<br>';
            }

            $('.author-collapse-info').append('<strong>關於我<br></strong>' + auth_info);
        } else {
            $('.author-collapse-info').append('<strong>關於我<br></strong>');
        }
    },
    
    showLoadingDataInfo: function(){
        var allViewPeople = 0;
        var allLessons = 0;
        var openedCourse = '';
        if (instructorClass.currentTeacherCourseList == undefined || instructorClass.currentTeacherCourseList == null){
            $('.opened-course'+instructorClass.pageName+' .content').append('<div class="all-link"><a href="javascript:void(0);">查看全部</a></div>');
            return;
        }
        for (i = 0; i < instructorClass.currentTeacherCourseList.length; i++){
            key = instructorClass.currentTeacherCourseList[i];
            course = allCourses[key];
            allLessons++;
            if (course.viewPeople != undefined && course.viewPeople != null){
                allViewPeople += course.viewPeople;
            }
            if (allLessons > 2){
                continue;
            }
            priceOnSales = (course.priceOnSales == undefined || course.priceOnSales == null) ? 0 : course.priceOnSales;
            priceOrigin = (course.priceOrigin == undefined || course.priceOrigin == null) ? 0 : course.priceOrigin;
    
            var isFav = false;
            if (isAccountMode && myHeartCourseList != undefined && myHeartCourseList != null){
                for (ii = 0; ii < myHeartCourseList.length; ii++){
                    if (key == myHeartCourseList[ii]){
                        isFav = true;
                        break;
                    }
                }
            }
            
            var fav_button = isFav  ? '<button type="button" class="btn button-fav-author'+instructorClass.pageName+' active" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>'
                                    : '<button type="button" class="btn button-fav-author'+instructorClass.pageName+'" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>';
    
            var isBought = false;
            if (isAccountMode && myBoughtCourseList != undefined && myBoughtCourseList != null){
                for (ii = 0; ii < myBoughtCourseList.length; ii++){
                    if (key == myBoughtCourseList[ii]){
                        isBought = true;
                        break;
                    }
                }            
            }
    
            var bought_span = '';
            if (isBought){
                bought_span = '<span class="brought">已購買</span>';
            } else {
                if (priceOnSales == -1) {
                    priceOnSales = priceOrigin;
                    bought_span = '<span class="price d-block">' + priceOnSales + '點</span>';
                } else {
                    bought_span = '<span class="price d-block">' + priceOnSales + '點<del>' + course.priceOrigin + '點</del></span>';
                }    
            }
                                
            open =  
            '<div class="purchase-item row">\
                <div class="col-6">\
                    <div class="full-img">\
                        <div class="mark">' +
                            fav_button +
                        '</div>\
                        <a href="javascript:void(0);" class="course-title'+instructorClass.pageName+'"><img src="'+ course.overViewImage + '" alt=""/></a>\
                    </div>\
                    <div class="author media">\
                    <a href="javascript:void(0);" class="course-title'+instructorClass.pageName+'"><img src="' + course.authorImage + '" class="mr-2" alt=""/><a>\
                        <div class="media-body">'+ course.authorName + '</div>\
                    </div>\
                </div>\
                <div class="col-6">\
                    <p><a href="javascript:void(0);" class="course-title'+instructorClass.pageName+'">' + course.courseTitle + '</a></p>\
                    <ul class="rating tmp_hide">\
                        <li><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></li>\
                        <li><small>(340)</small></li>\
                    </ul>' +
                    bought_span +
                '</div>\
            </div>';
            
            openedCourse += open;
        }
    
        $('#all-view-people' + instructorClass.pageName).text('' + allViewPeople);
        $('#all-course-cnt' + instructorClass.pageName).text('' + allLessons);
        openedCourse += '<div class="all-link"><a href="javascript:void(0);" id="all-opened-course'+ instructorClass.pageName +'">查看全部</a></div>';
        $('.opened-course'+ instructorClass.pageName+' .content').append(openedCourse);
    
        $('#all-opened-course' + instructorClass.pageName).click(function(event){
            instructorClass.gotoAllOpenedCourse();
        });
        $('.course-title' + instructorClass.pageName).click(function(event){
            event.stopPropagation();
            index = parseInt($('.course-title' + instructorClass.pageName).index(this) / 3);
            key = instructorClass.currentTeacherCourseList[index];
            courseDetailPage(key);
            // window.location = "course-page.html?courseId=" + key;
        });
    
        $('.button-fav-author' + instructorClass.pageName).click(function(event){
            event.stopPropagation();
            if (!isAccountMode){
                showGotoLoginDialog();
                return;
            }
            let index = $('.button-fav-author'+ instructorClass.pageName).index(this);
            c_id = instructorClass.currentTeacherCourseList[index];
            if (myHeartCourseList == null){
                myHeartCourseList = [];
            }
            if ($(this).hasClass('active')){
                $(this).removeClass('active');
                $(this).attr('aria-pressed', true);
                let heartIndex = myHeartCourseList.indexOf(c_id);
                if (heartIndex > -1){
                    myHeartCourseList.splice(heartIndex, 1);
                    instructorClass.setMyHeartCourses(myHeartCourseList);
                }
            } else {
                $(this).addClass('active');
                $(this).attr('aria-pressed', false);
                let heartIndex = myHeartCourseList.indexOf(c_id);
                if (heartIndex == -1){
                    myHeartCourseList.push(c_id);
                    instructorClass.setMyHeartCourses(myHeartCourseList);
                }            
            }
        });
    },
    
    setMyHeartCourses: function(data){
        if (myUserId == undefined || myUserId == ""){
            return;
        }
        firebase.database().ref('HeartCourses/' + myUserId).set(data);
    },
    gotoAllOpenedCourse: function(){
        allOpenedCourse(instructorClass.courseId);
    }
}


