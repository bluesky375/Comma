

var allOpenedCourseClass = {
    courseId: '',
    courseData: {},
    currentTeacherCourseList: [],
    pageName: '',
    initialize:  function(courseId){
        allOpenedCourseClass.reloadData();

        $('#author-name'+allOpenedCourseClass.pageName).text(allOpenedCourseClass.courseData.authorName);
        authorId = allOpenedCourseClass.courseData.authorId;
        if (authorId != undefined && authorId != null || authorId != ""){
            allOpenedCourseClass.currentTeacherCourseList = allTeacherCourses[authorId];
        }
        allOpenedCourseClass.showTeacherCourseList();
        allOpenedCourseClass.fixElementsStyle();
    },
    reloadData: function(){
        allOpenedCourseClass.pageName = routerPageHistory[routerPageHistory.length - 1];
        allOpenedCourseClass.courseId = getCourseIdFromPageName(instructorClass.pageName);
        allOpenedCourseClass.courseData = allCourses[allOpenedCourseClass.courseId];
    },
    fixElementsStyle: function(){
        if (player.miniPlayerExist){
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },
    showTeacherCourseList: function(){
        if (allOpenedCourseClass.currentTeacherCourseList == undefined || allOpenedCourseClass.currentTeacherCourseList == null){
            return;
        }
        var openedCourse = '';
    
        for (i = 0; i < allOpenedCourseClass.currentTeacherCourseList.length; i++){
            key = allOpenedCourseClass.currentTeacherCourseList[i];
            course = allCourses[key];
    
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
            var fav_button = isFav  ? '<button type="button" class="btn button_fav'+allOpenedCourseClass.pageName+' active" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>'
                                    : '<button type="button" class="btn button_fav'+allOpenedCourseClass.pageName+'" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>';
    
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
    
            open = '\
            <a href="javascript:void(0);" class="course-title'+allOpenedCourseClass.pageName+'">\
            <div class="purchase-item row">\
                <div class="col-6">\
                    <div class="full-img">\
                        <div class="mark">' +
                            fav_button +
                        '</div>\
                        <img src="'+ course.overViewImage + '" alt="">\
                    </div>\
                    <div class="author media">\
                        <img src="' + course.authorImage + '" class="mr-2" alt="">\
                        <div class="media-body">'+ course.authorName + '</div>\
                    </div>\
                </div>\
                <div class="col-6">\
                    <p>' + course.courseTitle + '</p>\
                    <ul class="rating tmp_hide">\
                        <li><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></li>\
                        <li><small>(340)</small></li>\
                    </ul>' +
                    bought_span +
                '</div>\
            </div>' + '</a>';
    
            openedCourse += open;
        }
        $('#course-list'+allOpenedCourseClass.pageName).empty();
        $('#course-list'+allOpenedCourseClass.pageName).append(openedCourse);
    
        $('.course-title'+allOpenedCourseClass.pageName).click(function(event){
            event.stopPropagation();
            index = $('.course-title'+allOpenedCourseClass.pageName).index(this);
            key = allOpenedCourseClass.currentTeacherCourseList[index];
            courseDetailPage(key);
        });
    
        $('.button_fav'+allOpenedCourseClass.pageName).click(function(event){
            event.stopPropagation();
            if (!isAccountMode){
                showGotoLoginDialog();
                return;
            }
            let index = $('.button_fav'+allOpenedCourseClass.pageName).index(this);
            c_id = allOpenedCourseClass.currentTeacherCourseList[index];
            heartCourseList = myHeartCourseList;
            if (heartCourseList == null){
                heartCourseList = [];
            }
            if ($(this).hasClass('active')){
                $(this).removeClass('active');
                $(this).attr('aria-pressed', true);
                let heartIndex = heartCourseList.indexOf(c_id);
                if (heartIndex > -1){
                    heartCourseList.splice(heartIndex, 1);
                    allOpenedCourseClass.setMyHeartCourses(heartCourseList);
                }
            } else {
                $(this).addClass('active');
                $(this).attr('aria-pressed', false);
                let heartIndex = heartCourseList.indexOf(c_id);
                if (heartIndex == -1){
                    heartCourseList.push(c_id);
                    allOpenedCourseClass.setMyHeartCourses(heartCourseList);
                }
            }
        });
    },
    
    setMyHeartCourses: function(data){

        firebase.database().ref('HeartCourses/' + myUserId).set(data);
    }
    
}


