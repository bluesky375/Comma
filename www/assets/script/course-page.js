
var courseDetailClass = {
    courseId: '',
    isBought: false,
    isFav: false,
    courseData: {},
    myAudioPlayerSection: {},
    myAudioPlayer: {},
    myDiscuss: {},
    myDiscussKeys: [],
    audioKeyList: [],
    preventDoubleClick: false,
    pageName: '',
    currentAudioDownloaded: {},
    validListenedData: [],
    listenedProgress: {},
    initialize: function(courseId){

        courseDetailClass.reloadData();
        $('#goto-instructor' + courseDetailClass.pageName).click(function(event){
            courseDetailClass.gotoInstructorPage();
        });
        courseDetailClass.fixElementsStyle();
        courseDetailClass.showData(courseDetailClass.courseData);
        courseDetailClass.setViewPeopleCount();

        if (userAnalyticsClass.isDataLoaded){
            userAnalyticsClass.set_usr_clicked_course(courseId);
            userAnalyticsClass.set_usr_course_pageview();
        }

    },
    reloadData: function(){

        courseDetailClass.pageName = routerPageHistory[routerPageHistory.length - 1];
        courseDetailClass.courseId = getCourseIdFromPageName(courseDetailClass.pageName);
        courseDetailClass.courseData = allCourses[courseDetailClass.courseId];
        courseDetailClass.isFav = false;
        courseDetailClass.isBought = false;
        courseDetailClass.preventDoubleClick = false;
        courseDetailClass.myAudioPlayer = {};
        courseDetailClass.myAudioPlayerSection = {};
        courseDetailClass.myDiscuss = {};
        courseDetailClass.myDiscussKeys = [];
        courseDetailClass.audioKeyList = [];
        courseDetailClass.currentAudioDownloaded = {};
        courseDetailClass.validListenedData = [];
        courseDetailClass.listenedProgress = {};
        if (myBoughtCourseList != null) {
            for (i = 0; i < myBoughtCourseList.length; i++) {
                if (courseDetailClass.courseId == myBoughtCourseList[i]) {
                    courseDetailClass.isBought  = true;
                    break;
                }
            }
        }
        if (myHeartCourseList != null) {
            if (myHeartCourseList.indexOf(courseDetailClass.courseId) > -1) {
                courseDetailClass.isFav = true;
            }
        }
        courseDetailClass.loadAudioData();
        courseDetailClass.loadDiscuss();

    },
    fixElementsStyle: function(){

        if (player.miniPlayerExist){
            if (courseDetailClass.isBought){
                $('.home-player').css('bottom', '0px');
                $('.content-wrapper').css('padding-bottom', '50px');
            } else {
                $('.content-wrapper').css('padding-bottom', '114px');
                $('.home-player').css('bottom', '64px');
            }
        } else {
            $('.home-player').remove();
        }
    },
    getCurrentUserId: function(result) {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                result(user.uid);
            } else {
                result("");
            }
        });
    },
    setViewPeopleCount: function() {
        beforeViewedTime = (sessionStorage.getItem('time_' + courseDetailClass.courseId ) != undefined && sessionStorage.getItem('time_' + courseDetailClass.courseId ) != null) ? sessionStorage.getItem('time_' + courseDetailClass.courseId ) : 0;
        var now_timestamp = new Date().getTime();
        diff_timestamp = now_timestamp - beforeViewedTime;
        var tm = Math.round(diff_timestamp / 1000);
        if (tm > 60 * 2) {
            viewPeople = (courseDetailClass.courseData.viewPeople == undefined || courseDetailClass.courseData.viewPeople == null) ? 1 : courseDetailClass.courseData.viewPeople + 1;
            firebase.database().ref('AllCourses').child(courseDetailClass.courseId ).child('viewPeople').set(viewPeople);
            sessionStorage.setItem('time_' + courseDetailClass.courseId , now_timestamp);
        }
    },
    loadDiscussData: function(data) {
        if (courseDetailClass.courseId  == undefined || courseDetailClass.courseId  == null || courseDetailClass.courseId  == "") {
            data(null);
        }
        firebase.database().ref('/Discuss/' + courseDetailClass.courseId  + '/').on('value', function (snapshot) {
            if (snapshot != undefined && snapshot != null) {
                data(snapshot.val());
            } else {
                data(null);
            }
        });
    },
    loadDiscuss: function() {
        if (isAccountMode) {
            courseDetailClass.setAllCoursesViewPeople(myUserId);
        }
        courseDetailClass.loadDiscussData(data => {
            courseDetailClass.myDiscuss = data;
            courseDetailClass.showDiscuss();
        });
    },
    showDiscuss: function() {
        if (courseDetailClass.myDiscuss == undefined || courseDetailClass.myDiscuss == null) {
            return;
        }
        var allDiscusses = courseDetailClass.myDiscuss;
        if (allDiscusses == null || allDiscusses.length == 0) {
            return;
        }
    
        $('#all-link' + courseDetailClass.pageName).empty();
        $('#no-content').remove();
        $('#all-link' + courseDetailClass.pageName).append('<a href="javascript:void(0);" id="goto-all-discusses'+ courseDetailClass.pageName +'">查看全部</a>');
        var result = '';
        courseDetailClass.myDiscussKeys = [];
        var discussRow = 0;
        for (key in allDiscusses) {
            discuss = allDiscusses[key];
            courseDetailClass.myDiscussKeys.push(key);
            discussRow++;
            if (discussRow > 2) {
                continue;
            }
            commentUsers = discuss.commentUsers;
            commentCnt = (discuss.commentNumber != undefined && discuss.commentNumber != null) ? discuss.commentNumber : 0;
            isCommentState = false;
            if (isAccountMode && myUserId != undefined && myUserId != '') {
                if (commentUsers != undefined && commentUsers != null) {
                    if (commentUsers[myUserId] != undefined && commentUsers[myUserId] == true) {
                        isCommentState = true;
                    }
                }
            }
            commentBtn = isCommentState ? 'btn-secondary' : 'btn-info';
            likeUsers = discuss.likeUsers;
            likeCnt = (likeUsers != undefined && likeUsers != null) ? Object.keys(likeUsers).length : 0;
            isLikeState = false;
            if (isAccountMode && myUserId != undefined && myUserId != '') {
                if (likeUsers != undefined && likeUsers != null) {
                    if (likeUsers[myUserId] != undefined && likeUsers[myUserId] == true) {
                        isLikeState = true;
                    }
                }
            }
            likeBtn = isLikeState ? 'btn-secondary' : 'btn-info';
            postedTime = getTimeAgoStringFromTimestamp(discuss.timestamp);
            discussString = '\
            <div class="discussion-box">\
                <div class="content">\
                    <ul class="meta">\
                        <li><span>'+ postedTime + '</span></li>\
                    </ul>\
                    <div class="media">\
                        <img src="' + discuss.userImage + '" class="mr-2">\
                        <div class="media-body">\
                            <div class="name">' + discuss.userName + '</div>\
                            <p>' + discuss.detail + '</p>\
                        </div>\
                    </div>\
                    <ul class="btns">\
                        <li><a href="javascript:void(0);" class="btn '+ likeBtn + ' btn-sm btn-like"><i class="far fa-thumbs-up"></i><span class="like-count">' + likeCnt + '</span></a></li>\
                        <li><a href="javascript:void(0);" class="btn '+ commentBtn + ' btn-sm btn-comment"><i class="far fa-comment"></i><span class="comment-count">' + commentCnt + '</span></a></li>\
                    </ul>\
                </div>\
            </div>'
            result += discussString;
        }
        $('#discussion-count').text('' + discussRow + '則');
        $('.discussion-list').empty();
        $('.discussion-list').append(result);
        $('.btn-like').click(function (event) {
            if (!isAccountMode) {
                showGotoLoginDialog();
                return;
            }
            index = $('.btn-like').index(this);
            isLikedItem = false;
            likeCnt = parseInt($(this).children("span").text());
            if ($(this).hasClass('btn-secondary')) {
                isLikedItem = true;
            } else if ($(this).hasClass('btn-info')) {
                isLikedItem = false;
            }
    
            courseDetailClass.likeComment(index, isLikedItem);
        });
        $('.btn-comment').click(function (event) {
            index = $('.btn-comment').index(this);
            if ($(this).hasClass('btn-secondary')) {
            } else if ($(this).hasClass('btn-info')) {
            }
            courseDetailClass.gotoDiscussionInput(index);
        });
        $('#goto-all-discusses' + courseDetailClass.pageName).click(function(event){
            courseDetailClass.gotoAllDiscusses();
        });
    },
    gotoAllDiscusses: function() {
        allDiscussionsPage(courseDetailClass.courseId);
    },
    gotoCreateNewDiscuss: function() {
        if (!isAccountMode){
            showGotoLoginDialog();
            return;
        }
        addDiscussionPage(courseDetailClass.courseId);
    },
    gotoDiscussionInput: function(index) {
        if (courseDetailClass.myDiscuss == undefined || courseDetailClass.myDiscuss == null) {
            return;
        }
        allDiscusses = courseDetailClass.myDiscuss;
        discuss = allDiscusses[courseDetailClass.myDiscussKeys[index]];
        discuss['discussId'] = courseDetailClass.myDiscussKeys[index];
        if (isAccountMode && myUserId != undefined) {
            discuss['myUserId'] = myUserId;
        }
        discussInputPage(courseDetailClass.courseId, discuss);
    },
    likeComment: function(index, isLikedItem) {
        if (courseDetailClass.myDiscuss == undefined || courseDetailClass.myDiscuss == null || courseDetailClass.myDiscussKeys == undefined || courseDetailClass.myDiscussKeys == null) return;
    
        if (isLikedItem) {
            firebase.database().ref('Discuss/' + courseDetailClass.courseId  + '/' + courseDetailClass.myDiscussKeys[index] + '/likeUsers/' + myUserId).set(null);
        } else {
            firebase.database().ref('Discuss/' + courseDetailClass.courseId  + '/' + courseDetailClass.myDiscussKeys[index] + '/likeUsers/' + myUserId).set(true);
        }
    },
    loadAudioData: function() {
        var downloadCount = courseDetailClass.isBought ? 3 : 2;
    
        courseDetailClass.loadAudioPlayerSection(data => {
            downloadCount--;
            courseDetailClass.myAudioPlayerSection = data;
            if (downloadCount == 0) {
                courseDetailClass.showAudioSection();
            }
        });

        courseDetailClass.loadAudioPlayer(data => {
            courseDetailClass.myAudioPlayer = data;
            if (isDevice){
                courseDetailClass.loadDownloadedAudio(data, result=>{
                    courseDetailClass.currentAudioDownloaded = result;
                    downloadCount--;
                    if (downloadCount == 0) {
                        courseDetailClass.showAudioSection();
                    }    
                });
            } else {
                downloadCount--;
                if (downloadCount == 0) {
                    courseDetailClass.showAudioSection();
                }    
            }
        });
        if (courseDetailClass.isBought){
            courseDetailClass.loadListenedProgress(courseDetailClass.courseId, data => {
                if (downloadCount > 0){
                    downloadCount--;
                }
                if (data == null) data = {};
                courseDetailClass.listenedProgress = data;
                if (!downloadCount){
                    courseDetailClass.showAudioSection();
                }
            });
        }

    },
    loadAudioPlayerSection: function(data) {
        if (courseDetailClass.courseId  == undefined || courseDetailClass.courseId  == "") {
            data(null);
            return;
        }
        firebase.database().ref('/AudioPlayerSection/' + courseDetailClass.courseId  + '/').on('value', function (snapshot) {
            if (snapshot != undefined && snapshot != null) {
                data(snapshot.val());
            } else {
                data(null);
            }
        });
    },
    loadAudioPlayer: function(data) {
        if (courseDetailClass.courseId  == undefined || courseDetailClass.courseId  == "") {
            data(null);
            return;
        }
        firebase.database().ref('/AudioPlayer/' + courseDetailClass.courseId  + '/').on('value', function (snapshot) {
            if (snapshot != undefined && snapshot != null) {
                data(snapshot.val());
            } else {
                data(null);
            }
        });
    },
    loadListenedProgress: function(courseId, data){
        if (!isAccountMode || myUserId == ''){
            data({});
            return;
        }
        firebase.database().ref('/UserListened/').child(myUserId).child(courseId).child('MostListened').on('value', function(snapshot){
            if (snapshot != undefined && snapshot != null){
                data(snapshot.val());
            } else {
                data({});
            }
        });
    },
    loadDownloadedAudio: function(audioPlayer, data){
        var audioKeyList = Object.keys(audioPlayer);
        count = audioKeyList.length;
        downloadCnt = count;
        result = {};
        for (i = 0; i < count; i++){
            key = audioKeyList[i];
            fileName = courseDetailClass.courseId + "_" + key + ".mp3";
            path = cordova.file.externalDataDirectory + fileName;
            result[key] = 0;
            window.resolveLocalFileSystemURL(path, (fileEntry) => {
                key = courseDetailClass.getKeyFromPath(fileEntry.toURL());
                result[key] = 2;
                downloadCnt--;
                if (!downloadCnt){
                    data(result);
                }
            }, (evt) => {
                downloadCnt--;
                if (!downloadCnt){
                    data(result);
                }                
            });        
        }
    },
    getKeyFromPath(path){
        if (path == "" || path == "null"){
            return "";
        }
        pathFileName = path.replace(/^.*[\\\/]/, '');
        fileNameWithoutExt = pathFileName.split('.')[0];
        blocks = fileNameWithoutExt.split("_");
        if (blocks.length > 1){
            return blocks[1];
        } else {
            return "";
        }
    },
    showAudioSection: function() {
        if (courseDetailClass.myAudioPlayerSection == undefined || courseDetailClass.myAudioPlayerSection == null) {
            return;
        }
        courseDetailClass.audioKeyList  = [];
        var audioPlayerSection = courseDetailClass.myAudioPlayerSection;
        var sectionLength = audioPlayerSection.length;
    
        var audioPlayer = (courseDetailClass.myAudioPlayer == null) ? {} : courseDetailClass.myAudioPlayer;
        var result = '';
        for (i = 0; i < sectionLength; i++) {
            var sectionString = '<div class="curriculum-item">' + '<h5>' + audioPlayerSection[i] + '</h5>';
            sectionString += '<ul>';
            for (audio in audioPlayer) {
                if (audio.substring(0, i.toString().length) == i.toString()) {
                    courseDetailClass.audioKeyList.push(audio);
                    var audio_section_player = audioPlayer[audio];
                    var audio_test = '';
                    var audioString = '';
                    if (courseDetailClass.isBought) {
                        if (courseDetailClass.validListenedData.indexOf(audio) == -1){
                            courseDetailClass.validListenedData.push(audio);
                        }
                        l_progress = (courseDetailClass.listenedProgress[audio] != undefined && courseDetailClass.listenedProgress[audio] != null) ? courseDetailClass.listenedProgress[audio] : -1;
                        l_progress_str = '';
                        if (isDevice){
                            if (l_progress == -1){
                                l_progress_str = '<span class="not-listened">未開始</span>';
                            } else {
                                l_percent = Math.ceil(l_progress * 100 / audio_section_player.Time.toSeconds());
                                if (l_percent > 100){
                                    l_percent = 100;
                                    l_progress_str = '<span class="listened">已聽' + l_percent + '%</span>';
                                } else if (l_percent < 0){
                                    l_progress_str = '<span class="not-listened">未開始</span>';
                                } else {
                                    l_progress_str = '<span class="listened">已聽' + l_percent + '%</span>';
                                }
                            }
                            audio_test = '\
                            <ol>\
                                <li><a href="javascript:void(0);" class="audio-note'+ courseDetailClass.pageName+'"><img src="assets/images/note.png"></a></li>\
                                <li><a href="javascript:void(0);" class="audio-download' + courseDetailClass.pageName +'"><img src="assets/images/mobile-inactive.png" alt="" class="audio-download-img"></a></li>\
                            </ol>' + l_progress_str;
                            audioString = '\
                                <li class="audio-title' + courseDetailClass.pageName + '">\
                                    <div class="row">\
                                        <div class="col-8">\
                                            <p>'+ audio_section_player.Title + '</p>\
                                            <small>'+ audio_section_player.Time + '</small>\
                                        </div>\
                                        <div class="col-4 align-self-center">'+
                                audio_test +
                                '</div>\
                                    </div>\
                                </li>';
                        } else {
                            if (l_progress == -1){
                                l_progress_str = '<span class="not-listened" style="text-align: center;">未開始</span>';
                            } else {
                                l_percent = Math.ceil(l_progress * 100 / audio_section_player.Time.toSeconds());
                                if (l_percent > 100){
                                    l_percent = 100;
                                    l_progress_str = '<span class="listened" style="text-align: center;">已聽' + l_percent + '%</span>';
                                } else if (l_percent < 0){
                                    l_progress_str = '<span class="not-listened" style="text-align: center;">未開始</span>';
                                } else {
                                    l_progress_str = '<span class="listened" style="text-align: center;">已聽' + l_percent + '%</span>';
                                }

                            }
                            audio_test = '\
                            <ol>\
                                <li style="width:100%;"><a href="javascript:void(0);" class="audio-note'+ courseDetailClass.pageName+'"><img src="assets/images/note.png"></a></li>\
                            </ol>' + l_progress_str;                            
                            audioString = '\
                                <li class="audio-title' + courseDetailClass.pageName + '">\
                                    <div class="row">\
                                        <div class="col-9">\
                                            <p>'+ audio_section_player.Title + '</p>\
                                            <small>'+ audio_section_player.Time + '</small>\
                                        </div>\
                                        <div class="col-3 align-self-center">'+
                                audio_test +
                                '</div>\
                                    </div>\
                                </li>';
                        }
                    } else {
                        if (audio_section_player.TryOutEnable != undefined && audio_section_player.TryOutEnable != null && audio_section_player.TryOutEnable == 1) {
                            if (courseDetailClass.validListenedData.indexOf(audio) == -1) {
                                courseDetailClass.validListenedData.push(audio);
                            }
                            audio_test = '\
                            <ol>\
                                <li><a href="javascript:void(0);" class="audio-note'+courseDetailClass.pageName+'"><img src="assets/images/note.png"></a></li>\
                                <li><a href="javascript:void(0);" class="link">試聽</a></li>\
                            </ol>';
                        } else {
                            audio_test = '\
                            <ol>\
                            </ol>';
                        }
                        audioString = '\
                            <li class="audio-title' + courseDetailClass.pageName + '">\
                                <div class="row">\
                                    <div class="col-8">\
                                        <p>'+ audio_section_player.Title + '</p>\
                                        <small>'+ audio_section_player.Time + '</small>\
                                    </div>\
                                    <div class="col-4 align-self-center">'+
                            audio_test +
                            '</div>\
                                </div>\
                            </li>';
                    }
                    sectionString += audioString;
                }
            };
            sectionString += '</ul>' + '</div>';
            result += sectionString;
        }
        $('#audio-list' + courseDetailClass.pageName +' .content').empty();
        $('#audio-list' + courseDetailClass.pageName +' .content').append(result);

        if (isAccountMode && myUserId != ''){
            player.setValidListened(myUserId, courseDetailClass.courseId, courseDetailClass.validListenedData);
        }
        if (courseDetailClass.isBought && isDevice){
            courseDetailClass.showDownloadIcons();
        }
        $('.audio-download' + courseDetailClass.pageName).click(function(event){
            event.stopPropagation();
            index = $('.audio-download'+ courseDetailClass.pageName).index(this);
            audioPlayerKeyList = Object.keys(audioPlayer);
            key = audioPlayerKeyList[index];
            isDownloaded = courseDetailClass.currentAudioDownloaded[key];
            audioSect = audioPlayer[audioPlayerKeyList[index]];
            if (isDownloaded == 2){
                if (isHideDeleteAudioDialog){
                    fileName = courseDetailClass.courseId + "_" + key + ".mp3";
                    deleteFile(fileName, result => {
                        if (result == "success"){
                            courseDetailClass.currentAudioDownloaded[key] = 0;
                            courseDetailClass.showDownloadIcons();
                            if (audioElement.src == (cordova.file.externalDataDirectory + fileName)){
                                audioElement.src = audioSect.Audio;
                            }
                        } else if (result == "error"){
                            console.log("Error occured");
                        } else if (result == "not_exist"){
                            console.log("File does not exist!");
                        }
                    });
                } else {
                    courseDetailClass.showAlreadyDownloadDialog(audioSect, key);
                }
            } else if (isDownloaded == 0) {
                courseDetailClass.showDownloadDialog(audioSect, key, audioPlayerKeyList);
            } else {
                return;
            }
        });
        $('#audio-test' + courseDetailClass.pageName).click(function (event) {
            if(isDevice)
            window.cordova.plugins.firebase.analytics.logEvent("\("+courseDetailClass.courseId+")_freetrial_click","");
            var selectedIndex = 0;
            audioPlayerKeyList = Object.keys(audioPlayer);
    
            courseDetailClass.playAudio(audioPlayer, selectedIndex);
        });
    
        $('.audio-note'+ courseDetailClass.pageName).click(function (event) {
            event.stopPropagation();
            index = $('.audio-note'+ courseDetailClass.pageName).index(this);
            audioPlayerKeyList = Object.keys(audioPlayer);
            audioSect = audioPlayer[audioPlayerKeyList[index]];
            if (audioSect.Manuscript != undefined && audioSect.Manuscript != null){
                showContribution(audioSect.Manuscript, (audioSect.Title != undefined && audioSect.Title != null) ? audioSect.Title : '');
            } else {
                showContribution('', (audioSect.Title != undefined && audioSect.Title != null) ? audioSect.Title : '');
            }
        });
        $('.audio-title' + courseDetailClass.pageName).click(function (event) {
            if (courseDetailClass.preventDoubleClick){
                return;
            }
            var selectedIndex;
            selectedIndex = $('.audio-title' + courseDetailClass.pageName).index(this);
            courseDetailClass.playAudio(audioPlayer, selectedIndex);
        });

        setTimeout(function(){
            $('#lesson-count' + courseDetailClass.pageName).text("" + Object.keys(audioPlayer).length);
        }, 200);

    },
    showDownloadIcons: function(){
        audioPlayerKeyList = Object.keys(courseDetailClass.myAudioPlayer);
        for (i = 0; i < audioPlayerKeyList.length; i++){
            key = audioPlayerKeyList[i];
            downloadState = courseDetailClass.currentAudioDownloaded[key];
            switch (downloadState){
                case 0:
                    $($('.audio-download-img')[i]).attr('src', 'assets/images/mobile-inactive.png');
                    break;
                case 1:
                    $($('.audio-download-img')[i]).attr('src', 'assets/images/mobile-downloading.png');
                    break;
                case 2:
                    $($('.audio-download-img')[i]).attr('src', 'assets/images/mobile-active.png');
                    break;
                default:
                    break;
            }
        }
    },
    playAudio: function(audioPlayer, selectedIndex){
        audioPlayerKeyList = Object.keys(audioPlayer);
    
        var selectedAudioKey;
        availableAudio = courseDetailClass.getAvailableAudio(courseDetailClass.isBought , audioPlayer);

        if (courseDetailClass.isBought ) {
            selectedAudioKey = audioPlayerKeyList[selectedIndex];
        } else {
            selectedKey = audioPlayerKeyList[selectedIndex];
            if (availableAudio[selectedKey] == undefined || availableAudio[selectedKey] == null) {
                selectedAudioKey = null;
            } else {
                selectedAudioKey = selectedKey;
            }
        }

        if (selectedAudioKey != undefined && selectedAudioKey != null) {
            showPlayer();
            if (audioElement == null){
                player.initialize(availableAudio, selectedAudioKey, courseDetailClass.courseId, courseDetailClass.isBought);
            } else {
                player.selectNewAudio(availableAudio, selectedAudioKey, courseDetailClass.courseId, courseDetailClass.isBought);
            }
            player.listPage = courseDetailClass.pageName;
            courseDetailClass.preventDoubleClick = true;
            setTimeout(function(){
                courseDetailClass.preventDoubleClick = false;
            }, 1000);
        } else {
            showErrorDialogWithText("尚未購買");
            setTimeout(hideErrorDialog, 1000);
        }
    },
    getAvailableAudio: function(isBought , audioPlayer) {
        if (audioPlayer == undefined || audioPlayer == null) {
            return {};
        }
        if (isBought) {
            return audioPlayer;
        }
        result = {};
        for (audio in audioPlayer) {
            var audio_section_player = audioPlayer[audio];
            if (audio_section_player.TryOutEnable != undefined && audio_section_player.TryOutEnable != null && audio_section_player.TryOutEnable == 1) {
                result[audio] = audio_section_player;
            }
        }
        return result;
    },
    boughtCourse: function() {
        if (!isAccountMode) {
            showGotoLoginDialog();
            return;
        }
        if (myUserId == ''){
            return;
        }
        priceOnSales = (courseDetailClass.courseData.priceOnSales == undefined || courseDetailClass.courseData.priceOnSales == null) ? 0 : courseDetailClass.courseData.priceOnSales;
        priceOrigin = (courseDetailClass.courseData.priceOrigin == undefined || courseDetailClass.courseData.priceOrigin == null) ? 0 : courseDetailClass.courseData.priceOrigin;
        price = 0;
        if (priceOnSales == -1) {
            price = priceOrigin;
        } else {
            price = priceOnSales;
        }
        loadRewardPoint(myUserId, currentRewardPoint => {
            if (price == 0){

                boughtCourseProgress(myUserId, courseDetailClass.courseId, price, currentRewardPoint);
                courseDetailClass.isBought = true;
                courseDetailClass.fixElementsStyle();
                courseDetailClass.reloadData();
                courseDetailClass.hideNotPurchasedBar();
            } else {
                if (currentRewardPoint < price){
                    showGotoValueCenterDialog();
                } else {
                    if(isDevice)
                    window.cordova.plugins.firebase.analytics.logEvent("\("+courseDetailClass.courseId+")_buynow_deposit","");
                    boughtCourseProgress(myUserId, courseDetailClass.courseId, price, currentRewardPoint);
                    courseDetailClass.isBought = true;
                    courseDetailClass.fixElementsStyle();
                    courseDetailClass.reloadData();
                    courseDetailClass.hideNotPurchasedBar();
                }
            }
        });
    },
    loadUserInfo: function(uid, data) {
        getCurrentUserId(uid => {
            if (uid == undefined || uid == null || uid == "") {
                data({});
                return;
            }
            firebase.database().ref('/Users/' + uid + '/').on('value', function (snapshot) {
                if (snapshot != undefined && snapshot != null) {
                    data(snapshot.val());
                } else {
                    data({});
                }
            });
        });
    },
    showDownloadDialog: function(audioSect, audioKey, audioKeyList){
        $('body').append('\
        <div class="custom-overlay" id="download-option-dialog">\
            <div class="choose-option">\
                <ul>\
                    <li><small>' + audioSect.Title +'</small></li>\
                    <li><a href="javascript:void(0);" id="play-current-audio">播放</a></li>\
                    <li><a href="javascript:void(0);" id="download-current-audio">單節下載</a></li>\
                    <li><a href="javascript:void(0);" id="download-all-audio">全部下載</a></li>\
                </ul>\
                <ul class="single">\
                    <li><a href="javascript:void(0);" id="cancel-button">取消</a></li>\
                </ul>\
            </div>\
        </div>');
        $('#cancel-button').click(function(evt){
            courseDetailClass.hideDownloadDialog();
        });
        $('#play-current-audio').click(function(evt){
            selectedIndex = audioKeyList.indexOf(audioKey);
            courseDetailClass.hideDownloadDialog();
            courseDetailClass.playAudio(courseDetailClass.myAudioPlayer, selectedIndex);            
        });
        $('#download-current-audio').click(function(evt){
            courseDetailClass.hideDownloadDialog();
            url = audioSect.Audio;
            fileName = courseDetailClass.courseId + "_" + audioKey + ".mp3";
            courseDetailClass.downloadOneAudio(fileName, url, audioKey);
        });
        $('#download-all-audio').click(function(evt){
            if(isDevice)
            window.cordova.plugins.firebase.analytics.logEvent("\("+courseDetailClass.courseId+")_alldownload","");
            courseDetailClass.hideDownloadDialog();
            fileNames = [];
            urls = [];
            downloadIndexes = [];
            for (i = audioKeyList.length - 1; i >= 0; i--){
                key = audioKeyList[i];
                downloadState = courseDetailClass.currentAudioDownloaded[key];
                if (downloadState == 0){
                    audio = courseDetailClass.myAudioPlayer[key];
                    url = audio.Audio;
                    fileName = courseDetailClass.courseId + "_" + key + ".mp3";
                    downloadIndexes.push(i);
                    fileNames.push(fileName);
                    urls.push(url);
                    courseDetailClass.currentAudioDownloaded[audioKeyList[i]] = 1;
                }
            }
            courseDetailClass.showDownloadIcons();
            if (downloadIndexes.length > 0){
                courseDetailClass.downloadAllAudio(fileNames, urls, downloadIndexes, audioKeyList);
            }
        });
    },
    downloadOneAudio: function(fileName, url, audioKey){
        courseDetailClass.currentAudioDownloaded[audioKey] = 1;
        courseDetailClass.showDownloadIcons();
        fileDownload(url, fileName, completion => {
            if (completion == ""){
                showSafeErrorDialogWithCloseAndText("無法下載課程，請先確認您的網路後再試一次");
                courseDetailClass.currentAudioDownloaded[audioKey] = 0;
                courseDetailClass.showDownloadIcons();
            } else {
                courseDetailClass.currentAudioDownloaded[audioKey] = 2;
                courseDetailClass.showDownloadIcons();
                userAnalyticsClass.set_usr_total_download();
            }
        });
    },
    downloadAllAudio: function(fileNames, urls, downloadIndexes, audioKeyList){
        if (downloadIndexes.length == 0 || urls.length == 0 || fileNames.length == 0){
            return;
        }
        url = urls.pop();
        fileName = fileNames.pop();
        downloadIndex = downloadIndexes.pop();
        fileDownload(url, fileName, completion => {
            if (completion == ""){
                showSafeErrorDialogWithCloseAndText("無法下載課程，請先確認您的網路後再試一次");
                courseDetailClass.currentAudioDownloaded[audioKeyList[downloadIndex]] = 0;
                courseDetailClass.showDownloadIcons();
                return;
            } else {
                courseDetailClass.currentAudioDownloaded[audioKeyList[downloadIndex]] = 2;
                courseDetailClass.showDownloadIcons();
                courseDetailClass.downloadAllAudio(fileNames, urls, downloadIndexes, audioKeyList);
                userAnalyticsClass.set_usr_total_download();
            }
        });
    },
    showAlreadyDownloadDialog: function(audioSect, audioKey){
        $('body').append('\
            <div class="custom-overlay" id="download-option-dialog">\
                <div class="remove-popup">\
                    <div class="top">\
                        <h5>從「下載項目」中移除？</h5>\
                        <p>你將無法於離線時播放此課程。</p>\
                    </div>\
                    <ul>\
                        <li class="red"><a href="javascript:void(0);" id="delete-current-audio">移除</a></li>\
                        <li class="red"><a href="javascript:void(0);" id="delete-not-show">移除且不再提醒</a></li>\
                        <li><a href="javascript:void(0);" id="cancel-button">取消</a></li>\
                    </ul>\
                </div>\
            </div>'
        );
        $('#cancel-button').click(function(evt){
            courseDetailClass.hideDownloadDialog();
        });
        $('#delete-current-audio').click(function(evt){
            fileName = courseDetailClass.courseId + "_" + audioKey + ".mp3";
            deleteFile(fileName, result => {
                if (result == "success"){
                    courseDetailClass.currentAudioDownloaded[audioKey] = 0;
                    courseDetailClass.showDownloadIcons();
                    if (audioElement.src == (cordova.file.externalDataDirectory + fileName)){
                        audioElement.src = audioSect.Audio;
                    }
                } else if (result == "error"){
                    console.log("Error occured");
                } else if (result == "not_exist"){
                    console.log("File does not exist!");
                }
            });
            courseDetailClass.hideDownloadDialog();
        });
        $('#delete-not-show').click(function(evt){
            localStorage.setItem('isHideDeleteAudioDialog', true);
            isHideDeleteAudioDialog = true;
            fileName = courseDetailClass.courseId + "_" + audioKey + ".mp3";
            deleteFile(fileName, result => {
                if (result == "success"){
                    courseDetailClass.currentAudioDownloaded[audioKey] = 0;
                    courseDetailClass.showDownloadIcons();
                    if (audioElement.src == (cordova.file.externalDataDirectory + fileName)){
                        audioElement.src = audioSect.Audio;
                    }

                } else if (result == "error"){
                    console.log("Error occured");
                } else if (result == "not_exist"){
                    console.log("File does not exist!");
                }
            });
            courseDetailClass.hideDownloadDialog();
        });
    },
    hideDownloadDialog: function(){
        $('#download-option-dialog').remove();
    },
    hideNotPurchasedBar: function(){
        $('#course-page-container' + courseDetailClass.pageName).removeClass('padding-bottom');
        $('#not-purchased-bar' + courseDetailClass.pageName).remove();
    },
    showData: function(courseData) {


        if (courseDetailClass.isBought ) {
            $('#course-page-container' + courseDetailClass.pageName).removeClass('padding-bottom');
            $('#not-purchased-bar' + courseDetailClass.pageName).remove();
        } else {

            $('#bought-course' + courseDetailClass.pageName).click(function(evt){
                if(isDevice)
                window.cordova.plugins.firebase.analytics.logEvent("\("+courseDetailClass.courseId+")_buynow_click","");
                courseDetailClass.boughtCourse();
            });
            priceOnSales = (courseData.priceOnSales == undefined || courseData.priceOnSales == null) ? 0 : courseData.priceOnSales;
            priceOrigin = (courseData.priceOrigin == undefined || courseData.priceOrigin == null) ? 0 : courseData.priceOrigin;
            if (priceOnSales == -1) {
                priceOnSales = priceOrigin;
                $('#sell-price'+ courseDetailClass.pageName).text('' + priceOnSales + '點');
                $('#regular-price' + courseDetailClass.pageName).remove();
            } else {
                $('#sell-price' + courseDetailClass.pageName).text('' + priceOnSales + '點');
                $('#regular-price' + courseDetailClass.pageName).text('' + priceOrigin + '點');
            }
        }

        if (courseData == undefined || courseData == null) {
            return;
        }
        favStr = '';
        if (courseDetailClass.isFav) {
            favStr = '<button type="button" class="btn active" aria-pressed="false" autocomplete="off">Single toggle</button>';
        } else {
            favStr = '<button type="button" class="btn" aria-pressed="true" autocomplete="off">Single toggle</button>'
        }
        $('#course-title' + courseDetailClass.pageName).text(courseDetailClass.courseData.courseTitle);
        $('#course-intro' + courseDetailClass.pageName).append('\
            <div class="full-img">\
                <div class="single-heart-btn">' +
            favStr +
            '</div>\
                <img src="' + courseData.overViewImage + '"></div>\
            <div class="content">\
                <h4>' + courseData.courseTitle + '</h4>\
                <ul>\
                    <li><i class="fas fa-user-friends"></i><span>' + courseData.viewPeople + '</span>閱聽人次</li>\
                    <li class="tmp_hide"><i class="far fa-star"></i><span>'+ courseData.scoreTotal + '</span>評分</li>\
                    <li><i class="fas fa-stopwatch"></i><span id="lesson-count' + courseDetailClass.pageName + '">0</span>課程節數</li>\
                </ul>\
            </div>\
        ');
    
        $('.single-heart-btn button').click(function (event) {
            if (!isAccountMode) {
                showGotoLoginDialog();
                return;
            }
            if (myHeartCourseList == null) {
                myHeartCourseList = [];
            }
            if ($(this).hasClass('active')) {
                let heartIndex = myHeartCourseList.indexOf(courseDetailClass.courseId );
                if (heartIndex > -1) {
                    myHeartCourseList.splice(heartIndex, 1);
                    courseDetailClass.setMyHeartCourses(myHeartCourseList);
                }
                $(this).removeClass('active');
                $(this).attr('aria-pressed', 'true');
            } else {
                let heartIndex = myHeartCourseList.indexOf(courseDetailClass.courseId );
                if (heartIndex == -1) {
                    myHeartCourseList.push(courseDetailClass.courseId);
                    courseDetailClass.setMyHeartCourses(myHeartCourseList);
                }
                $(this).addClass('active');
                $(this).attr('aria-pressed', 'false');
            }
        });
        if (courseData.courseDescription != undefined) {
            courseDescriptionTxt = getFullWidthSpaceString(courseData.courseDescription);

            blocks = courseDescriptionTxt.split('\n');
            courseDescriptionHtml = '';
            for (i = 0; i < blocks.length; i++){
                courseDescriptionHtml += blocks[i]+ '<br>';
            }
            $('#course-description' + courseDetailClass.pageName + ' #collapseInfo').append(courseDescriptionHtml);
        }
    
        if (courseData.authorImage != undefined) {
            $('#instructor-info' + courseDetailClass.pageName + ' #author-img').attr('src', courseData.authorImage);
        }
    
        var auth_info = "";
        if (courseData.authorName != undefined) {
            auth_info += '<p>' + courseData.authorName + '</p>';
        }
        if (courseData.authorDescription != undefined) {

            authorDescriptionTxt = getFullWidthSpaceString(courseData.authorDescription);

            auth_info += '<p>';
            blocks = authorDescriptionTxt.split('\n');
            for (i = 0; i < blocks.length; i++){
                auth_info += blocks[i]+ '<br>';
            }
            auth_info += '</p>';
            // auth_info += '<p>' + authorDescriptionTxt + '</p>';
        }
        $('#instructor-info' + courseDetailClass.pageName + ' #author-data').append(auth_info);

        // var a_Player = (courseDetailClass.myAudioPlayer == null) ? {} : courseDetailClass.myAudioPlayer;
        // $('#lesson-count' + courseDetailClass.pageName).text("" + Object.keys(a_Player).length);

    },
    setMyHeartCourses: function(data) {
        if (myUserId == undefined || myUserId == "") {
            return;
        }
        firebase.database().ref('HeartCourses/' + myUserId).set(data);
    },
    gotoInstructorPage: function() {
        instructorPage(courseDetailClass.courseId);
    },
    setAllCoursesViewPeople: function(uid) {
        if (!isAccountMode) {
            return;
        }
        if (courseDetailClass.courseId  == undefined || courseDetailClass.courseId  == null || courseDetailClass.courseId  == "" || courseDetailClass.courseData == undefined || courseDetailClass.courseData == null) {
            return;
        }
        courseDetailClass.isAlreadyViewedCourse(uid, result => {
            if (result != null) {
                ind = result.indexOf(uid);
                if (ind == -1){
                    result.push(courseDetailClass.courseId);
                    firebase.database().ref('AllCoursesViewPeople').child(uid).set(result);
                }
            }
        });
    },
    isAlreadyViewedCourse: function(uid, viewedCourse) {
        if (courseDetailClass.courseId  == undefined || courseDetailClass.courseId  == null || courseDetailClass.courseId  == "" || courseDetailClass.courseData == undefined || courseDetailClass.courseData == null) {
            viewedCourse(null);
            return;
        }
        firebase.database().ref('AllCoursesViewPeople').child(uid).once('value').then(function (snapshot) {
            viewedCourseList = snapshot.val();
            if (viewedCourseList == undefined || viewedCourseList == null) {
                viewedCourse([]);
                return;
            }
            if (viewedCourseList.indexOf(courseDetailClass.courseId ) == -1) {
                viewedCourse(viewedCourseList);
            } else {
                viewedCourse(null);
            }
            return;
        });
    }
}
