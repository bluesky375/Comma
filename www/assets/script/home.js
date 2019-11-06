

var homeClass = {
    courseSnapshot: {},
    tagSnapshot: {},
    currentTabCourseData: [],
    prevTabIndexHome: 0,
    pageName: '',
    urlCourseId: '',
    initialize: function(courseId){

        homeClass.pageName = routerPageHistory[routerPageHistory.length - 1];
        homeClass.loadSubTags();

        if (courseId != ''){
            homeClass.urlCourseId = getDecryptedCourseId(courseId);
            // homeClass.urlCourseId = courseId;
        }


        var downloadCnt = 5;
        homeClass.loadTags(snapshot => {
            tagSnapshot = snapshot;
            if (downloadCnt > 0) downloadCnt--;
            if (downloadCnt == 0){
                homeClass.loadData(courseSnapshot, homeClass.prevTabIndexHome);
            }
        });
        homeClass.loadAllCourses(snapshot => {
            courseSnapshot = snapshot;
            allCourses = snapshot.val();
            if (downloadCnt > 0) downloadCnt--;
            if (downloadCnt == 0){
                homeClass.loadData(courseSnapshot, homeClass.prevTabIndexHome);
            }
        });
        homeClass.loadMyHeartCourses(data => {
            myHeartCourseList = data;
            if (downloadCnt > 0) downloadCnt--;
            if (downloadCnt == 0){
                homeClass.loadData(courseSnapshot, homeClass.prevTabIndexHome);
            }
        });
        homeClass.loadmyBoughtCourseList(data => {
            myBoughtCourseList = data;
            if (downloadCnt > 0) downloadCnt--;
            if (downloadCnt == 0){
                homeClass.loadData(courseSnapshot, homeClass.prevTabIndexHome);
            }
        });
        homeClass.loadAllTeacherCourses(data => {
            allTeacherCourses = data;
            if (downloadCnt > 0) downloadCnt--;
            if (downloadCnt == 0){
                homeClass.loadData(courseSnapshot, homeClass.prevTabIndexHome);
            }
        });

        homeClass.fixElementsStyle();
    },
    fixElementsStyle: function() {
        if (player.miniPlayerExist){
            $('.home-player').css('bottom', '48px');
            $('.content-wrapper').css('padding-bottom', '70px');
        } else {
            $('.home-player').remove();
            $('.content-wrapper').css('padding-bottom', '20px');
        }
    },
    initSessionStorage: function(){
    },
    gotoIndexPage: function(){
        window.location.href = "index.html";
    },

    getTagByIndex: function(index){
        return tagSnapshot.val()[index].key;
    },
    gotoPersonalInfo: function(){
        window.location = "personal-login.html";
    },

    loadData: function(snapshot, tabIndex){

        var tagName = homeClass.getTagByIndex(tabIndex);
        currentTabCourseData = [];
        $('.home-list .row').empty();
        if (snapshot == null || snapshot == undefined) return;
        snapshot.forEach(function(child) {
    
            var data = child.val();
            var tags = data.tags;
    
            priceOnSales = (data.priceOnSales == undefined || data.priceOnSales == null) ? 0 : data.priceOnSales;
            priceOrigin = (data.priceOrigin == undefined || data.priceOrigin == null) ? 0 : data.priceOrigin;
    
            var priceString = '';
            if (priceOnSales == -1) {
                priceOnSales = priceOrigin;
                priceString = '<span class="price d-block">' + priceOnSales + '點</span>';
            } else {
                priceString = '<span class="price d-block">' + priceOnSales + '點<del>' + data.priceOrigin + '點</del></span>';
            }
    
            var isFav = false;
            if (myHeartCourseList != undefined && myHeartCourseList != null){
                for (i = 0; i < myHeartCourseList.length; i++){
                    if (data.courseId == myHeartCourseList[i]){
                        isFav = true;
                        break;
                    }
                }
            }
            
            var fav_button = isFav  ? '<button type="button" class="btn button_fav active" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>'
                                    : '<button type="button" class="btn button_fav" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>';
    
            if (tags != null && tags != undefined){
                tags.forEach(element => {
                    if (element == tagName){
                        currentTabCourseData.push(data);
                        $('.home-list .row').append('\
                        <div class="col-6 home-item">\
                            <div class="full-img">\
                                <div class="mark">' + 
                                fav_button +
                                '</div>\
                                <img src="'+ data.overViewImage + '" alt="">\
                            </div>\
                            <div class="author media"><img src="'+ data.authorImage + '" class="mr-2" alt=""><div class="media-body" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ data.authorName + '</div></div>\
                            <h6>' + data.courseTitle + '</h6>' +
                                priceString + 
                            '<span class="viewed">' + data.viewPeople + '</span>\
                        </div>\
                        ');
                    }
                });
            }
        });
        
        if (homeClass.urlCourseId != ''){
            allCourseKeys = Object.keys(allCourses);
            // for (i = 0; i < allCourseKeys.length; i++){
            //     currentCourse = allCourses[allCourseKeys[i]];

            //     if (currentCourse.courseLink != undefined && currentCourse.courseLink != null && currentCourse.courseLink == homeClass.urlCourseId){
            //         homeClass.gotoDetailCourse(allCourseKeys[i]);
            //         homeClass.urlCourseId = '';    
            //         break;
            //     }
            // }
            if (snapshot.val()[homeClass.urlCourseId] != undefined && snapshot.val()[homeClass.urlCourseId] != null){
                homeClass.gotoDetailCourse(homeClass.urlCourseId);
                homeClass.urlCourseId = '';    
            }
        }

        $('.button_fav').click(function(event){
            event.stopPropagation();
            if (!isAccountMode){
                showGotoLoginDialog();
                return;
            }
            let index = $('.button_fav').index(this);
            let courseId = currentTabCourseData[index].courseId;
            if (myHeartCourseList == null){
                myHeartCourseList = [];
            }
            if ($(this).hasClass('active')){
                // $(this).removeClass('active');
                // $(this).attr('aria-pressed', true);
                let heartIndex = myHeartCourseList.indexOf(courseId);
                if (heartIndex > -1){
                    myHeartCourseList.splice(heartIndex, 1);
                    homeClass.setMyHeartCourses(myHeartCourseList);
                }
            } else {
                // $(this).addClass('active');
                // $(this).attr('aria-pressed', false);
                let heartIndex = myHeartCourseList.indexOf(courseId);
                if (heartIndex == -1){
                    myHeartCourseList.push(courseId);
                    homeClass.setMyHeartCourses(myHeartCourseList);
                }            
            }
        });
    
        $('.home-item').click(function(event) {
            let index = $('.home-item').index(this);
            let courseId = currentTabCourseData[index].courseId;
            homeClass.gotoDetailCourse(courseId);
        });
    },

    loadSubTags: function(){
        firebase.database().ref('/TagTitle/').once('value').then(function(snapshot) {
            $('#home-links' + homeClass.pageName +' ul').empty();
            if (snapshot != undefined && snapshot != null){
                var tagTitles = snapshot.val();
                tagTitles.forEach(tag => {
                    $('#home-links' + homeClass.pageName +' ul').append('<li><a href="javascript:void(0);" class="sub_tag">'+ tag + '</a></li>')
                });
                $('#home-links' + homeClass.pageName +' ul li a.active').removeClass('active');
                $($('#home-links' + homeClass.pageName +' ul li a')[homeClass.prevTabIndexHome]).addClass('active');
            
                $('#home-links' + homeClass.pageName +' ul li a').click(function(){
                    $('#home-links' + homeClass.pageName +' ul li a.active').removeClass('active')
                    $(this).addClass('active');
                    homeClass.prevTabIndexHome = $('#home-links' + homeClass.pageName +' ul li a').index(this);
                    if (courseSnapshot != null && courseSnapshot != undefined){
                        homeClass.loadData(courseSnapshot, homeClass.prevTabIndexHome);
                    }
                });
                
            }
        });    
    },
    loadAllCourses: function(data){
        firebase.database().ref('/AllCourses/').once('value').then(function(snapshot) {
            data(snapshot);
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

    loadTags: function(data){
        firebase.database().ref('/Tags/').once('value').then(function(snapshot) {
            data(snapshot);
        });        
    },

    loadMyHeartCourses: function(data){
        homeClass.getCurrentUserId(result => {
            if (result != undefined && result != ""){
                myUserId = result;
                firebase.database().ref('/HeartCourses/' + result + '/').on('value', function(snapshot) {
                    data(snapshot.val());
                });
            } else {
                data([]);
            }
        })
    },

    loadmyBoughtCourseList: function(data){
        homeClass.getCurrentUserId(result => {
            if (result != undefined && result != ""){
                firebase.database().ref('/BoughtCourses/' + result + '/').on('value', function(snapshot) {
                    data(snapshot.val());
                });                    
            } else {
                data([]);
            }
        })    
    },

    setMyHeartCourses: function(data){
        if (myUserId == undefined || myUserId == ""){
            return;
        }
        firebase.database().ref('HeartCourses/' + myUserId).set(data);
    },
    getCurrentUserId: function(result){
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                result(user.uid);
            } else {
                result("");
            }
        });        
    },

    signInState: function(result){
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                result(true);
            } else {
                result(false);
            }
        });
    },

    gotoDetailCourse: function(courseId){
        let isBoughtItem = false;
        let isFavItem = false;
        if (courseSnapshot == undefined || courseSnapshot == null){
            console.log('Coursesnapshot is empty!');
            return;
        }
        courseDetailPage(courseId);
    },

    showCourseData: function(snapshot){
        snapshot.forEach(function(child) {
            var data = child.val();
            $('.row').append('<div class="col-6 home-item">\
                    <div class="full-img">\
                        <div class="mark">\
                            <button type="button" class="btn" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>\
                        </div>\
                        <img src="'+ data.overViewImage + '" alt="">\
                    </div>\
                    <div class="author media"><img src="'+ data.authorImage + '" class="mr-2" alt=""><div class="media-body" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ data.authorName + '</div></div>\
                    <h6>' + data.courseTitle + '</h6> \
                    <span class="price d-block">' + data.priceOnSales + '點<del>' + data.priceOrigin + '點</del></span>\
                    <span class="viewed">' + data.viewPeople + '</span>\
                </div>');
        });
    },

}


