

var courseClass = {
    prevTabIndexCourse: 0,
    isClickEnabled: false,
    pageName: '',
    allDownloadAudio: {},
    allAudioPlayer: {},
    downloadedAudioPlayer: {},
    allListendProgress: {},
    initialize: function(){
        courseClass.pageName = routerPageHistory[routerPageHistory.length - 1];
        courseClass.allDownloadAudio = {};
        courseClass.allAudioPlayer = {};
        courseClass.downloadedAudioPlayer = {};
        $('#home-links' + courseClass.pageName +' ul li a.active').removeClass('active');
        $($('#home-links' + courseClass.pageName +' ul li a')[courseClass.prevTabIndexCourse]).addClass('active');


        if (isAccountMode){
            // showLoadingDialogWithText('載入中...');
            downloadCnt = isDevice ? 4 : 4;
            courseClass.loadAllCourses(data => {
                if (downloadCnt > 0) downloadCnt--;
                allCourses = data;
                if (!downloadCnt){
                    courseClass.showData(courseClass.prevTabIndexCourse);
                    courseClass.isClickEnabled = true;
                }
            });
            courseClass.loadMyBoughtCourseList(myBoughtCourseData => {
                if (myBoughtCourseData == null){
                    myBoughtCourseList = [];                    
                } else {
                    myBoughtCourseList = myBoughtCourseData;
                }
                if (isDevice){
                    courseClass.loadAllAudioPlayer(allAudio => {
                        courseClass.allAudioPlayer = allAudio;
                        if (allAudio == null){
                            if (downloadCnt > 0) downloadCnt--;
                            if (!downloadCnt){
                                courseClass.showData(courseClass.prevTabIndexCourse);
                                courseClass.isClickEnabled = true;
                            }
                        } else {
                            var allBoughtAudioKeyList = [];
                            l_cnt = 2;
                            courseClass.loadAllDownloadedAudio(allAudio, myBoughtCourseData, allDownloadAudio => {
                                courseClass.allDownloadAudio = allDownloadAudio;
                                if (l_cnt > 0) l_cnt--;
                                if (!l_cnt){
                                    if (downloadCnt > 0) downloadCnt--;

                                    if (!downloadCnt){
                                        courseClass.showData(courseClass.prevTabIndexCourse);
                                        courseClass.isClickEnabled = true;
                                    }
                                }
                            });
                            courseClass.loadAllListenedProgress(allListendProgress => {
                                courseClass.allListendProgress = allListendProgress;
                                if (l_cnt > 0) l_cnt--;
                                if (!l_cnt){
                                    if (downloadCnt > 0) downloadCnt--;

                                    if (!downloadCnt){
                                        courseClass.showData(courseClass.prevTabIndexCourse);
                                        courseClass.isClickEnabled = true;
                                    }
                                }
                            });
                        }
                    });
                } else {
                    if (downloadCnt > 0) downloadCnt--;
                    if (!downloadCnt){
                        courseClass.showData(courseClass.prevTabIndexCourse);
                        courseClass.isClickEnabled = true;
                    }    
                }
            });
            courseClass.loadMyHeartCourses(data => {
                if (downloadCnt > 0) downloadCnt--;
                if (data == null){
                    myHeartCourseList = [];                    
                } else {
                    myHeartCourseList = data;
                }
                if (!downloadCnt){
                    courseClass.showData(courseClass.prevTabIndexCourse);
                    courseClass.isClickEnabled = true;
                }
            });
            courseClass.loadAllTeacherCourses(data => {
                allTeacherCourses = data;
                if (downloadCnt > 0) downloadCnt--;
                if (downloadCnt == 0){
                    courseClass.showData(courseClass.prevTabIndexCourse);
                    courseClass.isClickEnabled = true;
                }
            });

        } else {
            courseClass.isClickEnabled = true;
            courseClass.showData(courseClass.prevTabIndexCourse);
        }
        $('#home-links' + courseClass.pageName +' ul li a').click(function(event){
            index = $('#home-links' + courseClass.pageName +' ul li a').index(this);
            if (courseClass.isClickEnabled){
                courseClass.showData(index);
            }
        });
        courseClass.fixElementsStyle();
    },
    fixElementsStyle: function() {
        if (player.miniPlayerExist){
            $('.home-player').css('bottom', '48px');
            $('.content-wrapper').css('padding-bottom', '120px');
        } else {
            $('.home-player').remove();
            $('.content-wrapper').css('padding-bottom', '50px');
        }
    },
    getNameFromPath: function(path){
        if (path == "" || path == "null"){
            return "";
        }
        pathFileName = path.replace(/^.*[\\\/]/, '');
        return pathFileName.split('.')[0];
    },
    showData: function(index){

        $('#home-links' + courseClass.pageName +' ul li a.active').removeClass('active');
        $($('#home-links' + courseClass.pageName +' ul li a')[index]).addClass('active');
        switch (index){
            case 0:
                courseClass.prevTabIndexCourse = 0;
                courseClass.showBoughtCourses();
                break;
            case 1:
                courseClass.prevTabIndexCourse = 1;
                courseClass.showFavCourses();
                break;
            case 2:
                courseClass.prevTabIndexCourse = 2;
                courseClass.showDownloadCourses();
                break;
            default:
                console.log('Empty tag!');
                break;
        }
    },
    
    showBoughtCourses: function(){
        $('#home-list'+ courseClass.pageName+' row').empty();
        $('#home-list'+ courseClass.pageName).hide();
        $('#download-list' + courseClass.pageName).hide();
        $('#purchased-list'+ courseClass.pageName).show();
        $('#purchased-list'+ courseClass.pageName).empty();

        if (isAccountMode){
        
            if (allCourses == undefined || allCourses == null){
                $('#purchased-list'+ courseClass.pageName).append(courseClass.getEmptyElement());
                return;
            }
            if (myBoughtCourseList == undefined || myBoughtCourseList == null || myBoughtCourseList.length == 0){
                $('#purchased-list'+ courseClass.pageName).append(courseClass.getEmptyElement());
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
    
                var fav_button = isFav  ? '<button type="button" class="btn button_fav' + courseClass.pageName +' active" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>'
                                        : '<button type="button" class="btn button_fav' + courseClass.pageName+ '" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>';
    
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
                            <div class="media-body" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ course.authorName + '</div>\
                        </div>\
                    </div>\
                    <div class="col-6">\
                    <p><a href="javascript:void(0);">' + course.courseTitle + '</a></p>\
                    </div>\
                </div>';
                result += courseString;
            }
            $('#purchased-list'+ courseClass.pageName).append(result);
            $('.button_fav'+ courseClass.pageName).click(function(event){
                event.stopPropagation();
                if (!isAccountMode){
                    showGotoLoginDialog();
                    return;
                }
                index = $('.button_fav' + courseClass.pageName).index(this);
                courseId = myBoughtCourseList[index];
    
                if (myHeartCourseList == undefined || myHeartCourseList == null){
                    myHeartCourseList = [];
                }
                if ($(this).hasClass('active')){
                    // $(this).removeClass('active');
                    // $(this).attr('aria-pressed', true);
                    let heartIndex = myHeartCourseList.indexOf(courseId);
                    if (heartIndex > -1){
                        myHeartCourseList.splice(heartIndex, 1);
                        courseClass.setMyHeartCourses(myHeartCourseList);
                    }
                } else {
                    // $(this).addClass('active');
                    // $(this).attr('aria-pressed', false);
                    let heartIndex = myHeartCourseList.indexOf(courseId);
                    if (heartIndex == -1){
                        if(isDevice)
                        window.cordova.plugins.firebase.analytics.logEvent("Course2wishlist_label_click","");
                        myHeartCourseList.push(courseId);

                        courseClass.setMyHeartCourses(myHeartCourseList);
                    }            
                }
            });
            $('.purchase-item').click(function(event){
                index = $('.purchase-item').index(this);
                courseId = myBoughtCourseList[index];
                courseClass.gotoDetailCourse(courseId);
            });
        } else {
            $('#purchased-list'+ courseClass.pageName).append(courseClass.getEmptyElement());
        }
    },
    setMyHeartCourses: function(data){
        if (myUserId == undefined || myUserId == ""){
            return;
        }
        firebase.database().ref('HeartCourses/' + myUserId).set(data);
    },
    showFavCourses: function(){

        $('#home-list'+ courseClass.pageName).show();
        $('#purchased-list'+ courseClass.pageName + ' .row').empty();
        $('#purchased-list'+ courseClass.pageName + ' .row').hide();
        $('#download-list' + courseClass.pageName).hide();
        $('#home-list'+ courseClass.pageName).empty();
        // $('#home-list'+ courseClass.pageName + ' .row').empty();

        isAccountMode = (sessionStorage.getItem('isAccountMode') != undefined && sessionStorage.getItem('isAccountMode') == 'true');
        if (isAccountMode){
            if (allCourses == undefined || allCourses == null){
                $('##home-list' + courseClass.pageName).append(courseClass.getEmptyElement());
                return;
            }
            if (myHeartCourseList == undefined || myHeartCourseList == undefined || myHeartCourseList.length == 0){
                $('#home-list' + courseClass.pageName).append(courseClass.getEmptyElement());
                return;
            }
            result = '';
            for (i = 0; i < myHeartCourseList.length; i++){
                key = myHeartCourseList[i];
                course = allCourses[key];
                if (course == undefined || course == null) continue;
                isFav = true;
    
                var fav_button = isFav  ? '<button type="button" class="btn button_fav_heart active" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>'
                : '<button type="button" class="btn button_fav_heart" aria-pressed="false" autocomplete="off"><span class="sr-only">Fav</span></button>';
    
                priceOnSales = (course.priceOnSales == undefined || course.priceOnSales == null) ? 0 : course.priceOnSales;
                priceOrigin = (course.priceOrigin == undefined || course.priceOrigin == null) ? 0 : course.priceOrigin;
        
                var currentItemIsBought = (myBoughtCourseList.indexOf(key) > -1);
                
                var priceString = '';
                if (currentItemIsBought){
                    priceString = '<span class="brought">已購買</span>';
                } else {
                    if (priceOnSales == -1) {
                        priceOnSales = priceOrigin;
                        priceString = '<span class="price d-block">' + priceOnSales + '點</span>';
                    } else {
                        priceString = '<span class="price d-block">' + priceOnSales + '點<del>' + course.priceOrigin + '點</del></span>';
                    }
                }
                courseString = '\
                <div class="purchase-item row fav-item">\
                    <div class="col-6">\
                        <div class="full-img">\
                            <div class="mark">' + 
                                fav_button + 
                            '</div>\
                            <img src="'+ course.overViewImage +'" alt="">\
                        </div>\
                        <div class="author media">\
                            <img src="'+  course.authorImage + '" class="mr-2" alt="">\
                            <div class="media-body" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ course.authorName + '</div>\
                        </div>\
                    </div>\
                    <div class="col-6">\
                    <p><a href="javascript:void(0);">' + course.courseTitle + '</a></p>' +
                        priceString +
                    '</div>\
                </div>';
                // courseString = '\
                // <div class="col-6 home-item">\
                //     <div class="full-img">\
                //         <div class="mark">' + 
                //         fav_button +
                //         '</div>\
                //         <img src="'+ course.overViewImage + '" alt="">\
                //     </div>\
                //     <div class="author media"><img src="'+ course.authorImage + '" class="mr-2" alt=""><div class="media-body" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ course.authorName + '</div></div>\
                //     <h6>' + course.courseTitle + '</h6>' +
                //         priceString + 
                //     '<span class="viewed">' + course.viewPeople + '</span>\
                // </div>\
                // ';
                result += courseString;
            }
            $('#home-list'+ courseClass.pageName).append(result);
            // $('#home-list'+ courseClass.pageName + ' .row').append(result);
            $('.button_fav_heart').click(function(event){
                event.stopPropagation();
                if (!isAccountMode){
                    showGotoLoginDialog();
                    return;
                }
                index = $('.button_fav_heart').index(this);
                courseId = myHeartCourseList[index];
    
                if (myHeartCourseList == undefined || myHeartCourseList == null){
                    myHeartCourseList = [];
                }
                if ($(this).hasClass('active')){
                    $(this).removeClass('active');
                    $(this).attr('aria-pressed', true);
                    let heartIndex = myHeartCourseList.indexOf(courseId);
                    if (heartIndex > -1){
                        myHeartCourseList.splice(heartIndex, 1);
                        courseClass.setMyHeartCourses(myHeartCourseList);
                    }
                } else {
                    $(this).addClass('active');
                    $(this).attr('aria-pressed', false);
                    let heartIndex = myHeartCourseList.indexOf(courseId);
                    if (heartIndex == -1){
                        myHeartCourseList.push(courseId);
                        courseClass.setMyHeartCourses(myHeartCourseList);
                    }            
                }
            });
            $('.fav-item').click(function(event){
                index = $('.fav-item').index(this);
                courseId = myHeartCourseList[index];
                courseClass.gotoDetailCourse(courseId);
            });
        } else {
            $('#purchased-list' + courseClass.pageName).empty();
            $('#purchased-list' + courseClass.pageName).append(courseClass.getEmptyElement());
        }
    },
    
    showDownloadCourses: function(){
        if (isAccountMode && isDevice){
            cnt = 0;
            html = '';
            for (downloadKey in courseClass.allDownloadAudio){
                if (courseClass.allDownloadAudio[downloadKey] == 2){
                    cnt++;
                    blocks = downloadKey.split('_');
                    courseId = blocks[0];
                    audioKey = blocks[1];
                    audioPlayer = ( courseClass.allAudioPlayer[courseId] != undefined && courseClass.allAudioPlayer[courseId] != null && 
                        courseClass.allAudioPlayer[courseId][audioKey] != undefined && courseClass.allAudioPlayer[courseId][audioKey] != null)
                        ? courseClass.allAudioPlayer[courseId][audioKey] : {};
                    audioPlayer["courseId"] = courseId;
                    course = (allCourses[courseId] != undefined && allCourses[courseId] != null) ? allCourses[courseId]: {};
                    courseTitle = (course.courseTitle != undefined && course.courseTitle != null)? course.courseTitle : "";

                    l_progress = 
                        (courseClass.allListendProgress[courseId] != undefined && courseClass.allListendProgress[courseId] != null &&
                        courseClass.allListendProgress[courseId]['MostListened'] != undefined && courseClass.allListendProgress[courseId]['MostListened'] != null &&
                        courseClass.allListendProgress[courseId]['MostListened'][audioKey] != undefined && courseClass.allListendProgress[courseId]['MostListened'][audioKey] != null)
                        ? courseClass.allListendProgress[courseId]['MostListened'][audioKey] : -1;
                    l_progress_str = '';
                    if (l_progress == -1){
                        l_progress_str = '<span class="not-listened download-courses-not-listend">未開始</span>';
                    } else {
                        l_percent = Math.ceil(l_progress * 100 / audioPlayer.Time.toSeconds());
                        if (l_percent > 100){
                            l_percent = 100;
                            l_progress_str = '<span class="listened download-courses-listend">已聽' + l_percent + '%</span>';
                        } else if (l_percent < 0){
                            l_progress_str = '<span class="not-listened download-courses-not-listend">未開始</span>';
                        } else {
                            l_progress_str = '<span class="listened download-courses-listend">已聽' + l_percent + '%</span>';
                        }
                    }
                    itemString = '\
                    <div class="item audio-title' + courseClass.pageName +'">\
                        <div class="row">\
                            <div class="col-9"><p>' + audioPlayer.Title + '</p></div>\
                            <div class="col-3">\
                                <ol>\
                                    <li><a href="javascript:void(0);" class="audio-note' + courseClass.pageName + '"><img src="assets/images/note.png"></a></li>\
                                    <li><a href="javascript:void(0);" class="audio-download' + courseClass.pageName + '"><img src="assets/images/mobile-active.png" alt=""></a></li>\
                                </ol>\
                            </div>\
                        </div>\
                        <div class="row" style="font-size: 12px; color: #adadad;">\
                            <div class="col-3">\
                                <span class="time download-courses-time">' + audioPlayer.Time + '</span>\
                            </div>\
                            <div class="col-6 ellipsis-text">' + courseTitle +'</div>\
                            <div class="col-3 ellipsis-text">' + l_progress_str + '</div>\
                        </div>\
                    </div>';
                    html += itemString;
                    
                    courseClass.downloadedAudioPlayer[downloadKey] = audioPlayer;
                }
            }
            if (cnt == 0){
                $('#download-list' + courseClass.pageName).hide();
                $('#purchased-list' + courseClass.pageName).show();
                $('#purchased-list' + courseClass.pageName).empty();
                $('#home-list' + courseClass.pageName).hide();
                $('#purchased-list' + courseClass.pageName).append(courseClass.getEmptyElement());
            } else {
                $('#home-list' + courseClass.pageName).hide();
                $('#purchased-list' + courseClass.pageName).hide();
                $('#download-list' + courseClass.pageName).empty();
                $('#download-list' + courseClass.pageName).show();
                $('#download-list' + courseClass.pageName).append(html);

                $('.audio-note' + courseClass.pageName).click(function(event){
                    event.stopPropagation();
                    index = $('.audio-note'+ courseClass.pageName).index(this);
                    audioPlayerKeyList = Object.keys(courseClass.downloadedAudioPlayer);
                    audioSect = courseClass.downloadedAudioPlayer[audioPlayerKeyList[index]];
                    if (audioSect.Manuscript != undefined && audioSect.Manuscript != null){
                        showContribution(audioSect.Manuscript, (audioSect.Title != undefined && audioSect.Title != null) ? audioSect.Title : '');
                    } else {
                        showContribution('', (audioSect.Title != undefined && audioSect.Title != null) ? audioSect.Title : '');
                    }
                });
                $('.audio-download' + courseClass.pageName).click(function(event){
                    event.stopPropagation();
                    index = $('.audio-download'+ courseClass.pageName).index(this);
                    audioPlayerKeyList = Object.keys(courseClass.downloadedAudioPlayer);
                    audioPlayerKey = audioPlayerKeyList[index];
                    if (isHideDeleteAudioDialog){
                        fileName = audioPlayerKey + ".mp3";
                        deleteFile(fileName, result => {
                            if (result == "success"){
                                if (audioElement != undefined && audioElement != null && audioElement.src == (cordova.file.externalDataDirectory + fileName) && player.isPlay){
                                    player.forwardAudio();
                                }
                                courseClass.allDownloadAudio[audioPlayerKey] = 0;
                                delete courseClass.downloadedAudioPlayer[audioPlayerKey];
                                courseClass.showData(courseClass.prevTabIndexCourse);
                            } else if (result == "error"){
                                console.log("Error occured");
                            } else if (result == "not_exist"){
                                console.log("File does not exist!");
                            }
                        });
                    } else {
                        courseClass.showDeleteConfirmAlert(audioPlayerKey);
                    }

                });
                $('.audio-title' + courseClass.pageName).click(function(event){
                    index = $('.audio-title'+ courseClass.pageName).index(this);
                    audioPlayerKeyList = Object.keys(courseClass.downloadedAudioPlayer);
                    selectedAudioKey = audioPlayerKeyList[index];
                    showPlayer();
                    if (audioElement == null){
                        player.initialize(courseClass.downloadedAudioPlayer, selectedAudioKey, "", true);
                    } else {
                        player.selectNewAudio(courseClass.downloadedAudioPlayer, selectedAudioKey, "", true);
                    }
                    player.listPage = courseClass.pageName;

                }); 
            }
        } else {
            $('#download-list' + courseClass.pageName).hide();
            $('#purchased-list' + courseClass.pageName).show();
            $('#purchased-list' + courseClass.pageName).empty();
            $('#purchased-list' + courseClass.pageName).append(courseClass.getEmptyElement());    
        }
    },
    showDeleteConfirmAlert: function(audioPlayerKey){
        $('body').append('\
            <div class="custom-overlay" id="delete-confirm-dialog">\
                <div class="remove-popup">\
                    <div class="top">\
                        <h5>從「下載項目」中移除？</h5>\
                        <p>你將無法於離線時播放此課程。</p>\
                    </div>\
                    <ul>\
                        <li class="red"><a href="javascript:void(0);" id="delete-button">移除</a></li>\
                        <li class="red"><a href="javascript:void(0);" id="do-not-show-button">移除且不再提醒</a></li>\
                        <li><a href="javasript:void(0);" id="cancel-button">取消</a></li>\
                    </ul>\
                </div>\
            </div>');
        $('#cancel-button').click(function(evt){
            courseClass.hideDeleteConfirmAlert();
        });
        $('#delete-button').click(function(evt){
            courseClass.hideDeleteConfirmAlert();
            fileName = audioPlayerKey + ".mp3";
            deleteFile(fileName, result => {
                if (result == "success"){
                    if (audioElement != undefined && audioElement != null && audioElement.src == (cordova.file.externalDataDirectory + fileName) && player.isPlay){
                        player.forwardAudio();
                    }
                    courseClass.allDownloadAudio[audioPlayerKey] = 0;
                    delete courseClass.downloadedAudioPlayer[audioPlayerKey];
                    courseClass.showData(courseClass.prevTabIndexCourse);
                } else if (result == "error"){
                    console.log("Error occured");
                } else if (result == "not_exist"){
                    console.log("File does not exist!");
                }
            });
        });
        $('#do-not-show-button').click(function(evt){
            localStorage.setItem('isHideDeleteAudioDialog', true);
            isHideDeleteAudioDialog = true;
            courseClass.hideDeleteConfirmAlert();
            fileName = audioPlayerKey + ".mp3";
            deleteFile(fileName, result => {
                if (result == "success"){
                    if (audioElement != undefined && audioElement != null && audioElement.src == (cordova.file.externalDataDirectory + fileName) && player.isPlay){
                        player.forwardAudio();
                    }
                    courseClass.allDownloadAudio[audioPlayerKey] = 0;
                    delete courseClass.downloadedAudioPlayer[audioPlayerKey];
                    courseClass.showData(courseClass.prevTabIndexCourse);
                } else if (result == "error"){
                    console.log("Error occured");
                } else if (result == "not_exist"){
                    console.log("File does not exist!");
                }
            });
        })
    },
    hideDeleteConfirmAlert: function(){
        $('#delete-confirm-dialog').remove();
    },
    getEmptyElement: function(){
        var element = '\
            <div class="empty-content">\
                <div class="row justify-content-center">\
                    <div class="col-8 text-center" style="margin-top: 0px;">\
                        <div class="robot-img mb-3 mt-5 pt-4">\
                            <img src="assets/images/robot.jpg" alt="" class="d-inline-block mb-3">\
                            <p style="color:#adadad">好想趕快學習呦TAT</p>\
                        </div>\
                        <a href="javascript:homePage(\'\');" class="btn btn-primary btn-block">馬上去逛</a>\
                    </div>\
                </div>\
            </div>';
        return element;
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
    loadMyBoughtCourseList: function(result){
        if (isDevice && !isOnline){
            fileLoadData("myBoughtCourses.txt", completion => {

                if (completion == null){
                    result([]);
                } else {
                    result(JSON.parse(completion));
                }
            })
        } else {
            firebase.database().ref('BoughtCourses').child(myUserId).once('value').then(function(snapshot){
                if (snapshot != undefined && snapshot != null){
                    if (isDevice){
                        fileSaveData("myBoughtCourses.txt", JSON.stringify(snapshot.val()));
                    }
                    result(snapshot.val());
                } else {
                    result([]);
                }
            });    
        }
    },
    loadMyHeartCourses: function(data){
        if (isDevice && !isOnline){
            fileLoadData("heartCourses.txt", completion => {
                if (completion == null){
                    data([]);
                } else {
                    data(JSON.parse(completion));
                }
            });
        } else {
            firebase.database().ref('HeartCourses').child(myUserId).on('value', function(snapshot){
                if (snapshot != undefined && snapshot != null){
                    if (isDevice){
                        fileSaveData("heartCourses.txt", JSON.stringify(snapshot.val()));
                    }
                    data(snapshot.val());
                } else {
                    data([]);
                }
            });
        }

    },
    loadAllCourses: function(data){
        if (isDevice && !isOnline){
            fileLoadData("allCourses.txt", completion => {
                if (completion == null){
                    data({});
                } else {
                    data(JSON.parse(completion));
                }
            });
        } else {
            firebase.database().ref('/AllCourses/').once('value').then(function(snapshot) {
                if (snapshot != undefined && snapshot != null){
                    if (isDevice){
                        fileSaveData("allCourses.txt", JSON.stringify(snapshot.val()));
                    }
                    data(snapshot.val());
                } else {
                    data({});
                }
            });
        }
    },
    loadAllTeacherCourses: function(result){
        if (isDevice && !isOnline){
            fileLoadData("teacherCourses.txt", completion => {
                if (completion == null){
                    result({});
                } else {
                    result(JSON.parse(completion));
                }
            })
        } else {
            firebase.database().ref('TeacherCourses').once('value').then((snapshot) => {
                if (snapshot != undefined && snapshot != null){
                    if (isDevice){
                        fileSaveData("teacherCourses.txt", JSON.stringify(snapshot.val()));
                    }
                    result(snapshot.val());
                } else {
                    result({});
                }
            });
        }
    },
    loadAllAudioPlayer: function(data){
        if (isDevice && !isOnline){
            fileLoadData("audioPlayer.txt", completion => {
                console.log("audioPlayer.txt: ", completion);
                if (completion == null){
                    data(null);
                } else {
                    data(JSON.parse(completion));
                }
            })
        } else {
            firebase.database().ref('AudioPlayer').once('value').then(function (snapshot) {
                if (snapshot != undefined && snapshot != null) {
                    if (isDevice){
                        fileSaveData("audioPlayer.txt", JSON.stringify(snapshot.val()));
                    }
                    data(snapshot.val());
                } else {
                    data(null);
                }
            });
        }
    },
    loadAllListenedProgress: function(data){
        if (!isAccountMode || myUserId == ''){
            data({});
            return;
        }
        if (isDevice && !isOnline){
            fileLoadData("allListenProgress.txt", completion => {

                if (completion == null){
                    data({});
                } else {
                    data(JSON.parse(completion));
                }
            });
        } else {
            firebase.database().ref('/UserListened/').child(myUserId).on('value', function(snapshot){
                if (snapshot != undefined && snapshot != null){
                    fileSaveData("allListenProgress.txt", snapshot.val());
                    data(snapshot.val());
                } else {
                    data({});
                }
            });
        }
    },
    loadAllDownloadedAudio: function(allAudioPlayer, boughtCourseList, data){

        result = {};
        var allBoughtAudioKeyList = [];
        if (boughtCourseList == undefined || boughtCourseList == null){
            data({});
            return;
        }
        for (i = 0; i < boughtCourseList.length; i++){
            courseId = boughtCourseList[i];

            audioPlayer = allAudioPlayer[courseId];
            if (audioPlayer == undefined || audioPlayer == null){
                continue;
            }
            audioKeyList = Object.keys(audioPlayer);
            for(j = 0; j < audioKeyList.length; j++){
                key = audioKeyList[j];
                allBoughtAudioKeyList.push(courseId + "_" + key);
            }
        }
        count = allBoughtAudioKeyList.length;
        dCnt = count;
        for (i = 0; i < count; i++){
            name = allBoughtAudioKeyList[i];
            fileName = name + ".mp3";
            path = cordova.file.externalDataDirectory + fileName;
            result[name] = 0;
            window.resolveLocalFileSystemURL(path, (fileEntry) => {
                key = courseClass.getNameFromPath(fileEntry.toURL());
                result[key] = 2;
                dCnt--;
                if (!dCnt){
                    data(result);
                }
            }, (evt) => {
                dCnt--;
                if (!dCnt){
                    data(result);
                }                
            });
        }
    },
    gotoDetailCourse: function(courseId){
        let isBoughtItem = false;
        let isFavItem = false;
        if (allCourses == undefined || allCourses == null){
            console.log('allCourses is empty!');
            return;
        }
        courseDetailPage(courseId);
    }
}
