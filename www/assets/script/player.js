

function convertElapsedTime(inputSeconds)
{
    var seconds=Math.floor(inputSeconds%60)
    if(seconds<10){
        seconds="0"+seconds;}
    var minutes = Math.floor(inputSeconds/60)
    return minutes+":"+seconds;
    
}

var player = {
    audioPlayer: {},
    selectedAudioKey: "",
    selectedAudio: {},
    audioKeyList: [],
    speedDialogState: false,
    downloadDialogState: false,
    isPlay: true,
    isEnded: false,
    playbackRate: 1.0,
    miniPlayerExist: false,
    isDragging: false,
    pageName: '',
    courseId: '',
    isBought: false,
    isDownloadButtonClickEnabled: false,
    listPage: '',
    mostListenedTime: -1000.0,
    startPosition: 0,
    isUpdateAvailable: true,
    isFirstCanPlay: true,
    initialize: function (audioPlayer, selectedAudioKey, courseId, isBought) {

        player.pageName = routerPageHistory[routerPageHistory.length - 1];
        player.audioPlayer = audioPlayer;
        player.selectedAudioKey = selectedAudioKey;

        player.isBought = isBought;

        player.isDownloadButtonClickEnabled = false;
        player.isUpdateAvailable = true;
        player.audioKeyList = player.getAudioKeyList();
        player.selectedAudio = (player.selectedAudioKey != "" && player.audioPlayer[player.selectedAudioKey] != undefined && player.audioPlayer[player.selectedAudioKey] != null) ? player.audioPlayer[player.selectedAudioKey] : {};

        if (player.selectedAudio["courseId"] != undefined && player.selectedAudio["courseId"] != null) {
            player.courseId = player.selectedAudio["courseId"];
        } else {
            player.courseId = courseId;
        }
        player.mostListenedTime = -1000.0;
        player.startPosition = 0;
        player.isFirstCanPlay = true;
        if (isAccountMode && myUserId != ''){
            initParamLoadCnt = 2;
            if (player.listPage == 'my-course-page'){
                player.loadMostListendProgress(myUserId, player.courseId, player.selectedAudioKey.split('_')[1], result => {
                    player.mostListenedTime = result;
                    initParamLoadCnt--;
                    if (!initParamLoadCnt){
                        player.audioInit();
                        player.playMusic();                
                    }
                });
                player.loadLastListenedProgress(myUserId, player.courseId, player.selectedAudioKey.split('_')[1], result => {
                    if (result == -1 ){
                        player.startPosition = 0;
                    } else {
                        player.startPosition = result;
                    }
                    initParamLoadCnt--;
                    if (!initParamLoadCnt){
                        player.audioInit();
                        player.playMusic();                
                    }
                });
            } else {
                player.loadMostListendProgress(myUserId, player.courseId, player.selectedAudioKey, result => {
                    player.mostListenedTime = result;
                    initParamLoadCnt--;
                    if (!initParamLoadCnt){
                        player.audioInit();
                        player.playMusic();                
                    }
                });    
                player.loadLastListenedProgress(myUserId, player.courseId, player.selectedAudioKey, result => {
                    if (result == -1 ){
                        player.startPosition = 0;
                    } else {
                        player.startPosition = result;
                    }
                    initParamLoadCnt--;
                    if (!initParamLoadCnt){
                        player.audioInit();
                        player.playMusic();                
                    }
                });
            }
        } else {
            player.audioInit();
            player.playMusic();                
        }

        player.isDragging = false;

        $('#select-play-speed').click(function (event) {
            if (player.speedDialogState) {
                player.hidePlaySpeedSelect();
            } else {
                player.showPlaySpeedSelect();
            }
            if (player.downloadDialogState) {
                player.hideDownloadOption();
            }
        });
        $('#select-download-option').click(function (event) {
            if (!isAccountMode) {
                showGotoLoginDialog();
                return;
            }
            if (!player.isBought) {
                showErrorDialogWithText("尚未購買課程");
                setTimeout(hideErrorDialog, 2000);
                return;
            }
            if (!player.isDownloadButtonClickEnabled) {
                return;
            }
            if ($('#img-download-state').hasClass('downloaded')) {
                if (player.downloadDialogState) {
                    player.hideDownloadOption();
                } else {
                    player.showDeleteDownloadedAudio();
                }
                if (player.speedDialogState) {
                    player.hidePlaySpeedSelect();
                }
            } else {
                if (player.downloadDialogState) {
                    player.hideDownloadOption();
                } else {
                    player.showDownloadOption();
                }
                if (player.speedDialogState) {
                    player.hidePlaySpeedSelect();
                }
            }
        });
        $('#show-contribution').click(function (event) {
            if (player.selectedAudio.Manuscript != undefined && player.selectedAudio.Manuscript != null) {
                showContribution(player.selectedAudio.Manuscript, (player.selectedAudio.Title != undefined && player.selectedAudio.Title != null) ? player.selectedAudio.Title : '');
            } else {
                showContribution('', (player.selectedAudio.Title != undefined && player.selectedAudio.Title != null) ? player.selectedAudio.Title : '');
            }
        });
        $('.backward').click(function (event) {
            event.stopPropagation();
            player.backwardAudio();
        });
        $('.forrward').click(function (event) {
            event.stopPropagation();
            player.forwardAudio();
        });
        $('.sec-back').click(function (event) {
            event.stopPropagation();
            player.secBack();
        });
        $('.sec-next').click(function (event) {
            event.stopPropagation();
            player.secNext();
        });
        $('div .progress').click(function (evt) {
            var x = evt.pageX - $(this).offset().left;
            var y = evt.pageY - $(this).offset().top;
            var width = $(this).width();
            positionPercent = x * 100 / width;
            player.gotoTimeWithPercent(positionPercent);
        });
        $('.dot').draggable({
            axis: 'x',
            containment: ".player-dragger"
        });
        $('.dot').draggable({
            start: function () {
                player.isDragging = true;
            },
            stop: function () {
                player.isDragging = false;
                var offset = $(this).offset();
                var percent = (100 * parseFloat($(this).css("left"))) / (parseFloat($(this).parent().css("width")));
                if (!isNaN(percent)) {
                    player.gotoTimeWithPercent(percent);
                }
            }
        });

    },
    getAudioKeyList: function () {
        if (player.audioPlayer == undefined || player.audioPlayer == null) {
            return [];
        }
        return Object.keys(player.audioPlayer);
    },
    getCurrentAudioIndex: function () {
        if (player.audioKeyList == undefined || player.audioKeyList == null || player.audioKeyList == []) {
            console.log('Audio key list is undefined or null!');
            return -1;
        }
        return player.audioKeyList.indexOf(player.selectedAudioKey);
    },
    setPlayPauseButton: function (isPlayButton) {
        if (isPlayButton) {
            $('.play-pause').attr('aria-pressed', 'false');
            if ($('.play-pause').hasClass('active')) {
                $('.play-pause').removeClass('active');
            }
        } else {
            $('.play-pause').attr('aria-pressed', 'true');
            $('.play-pause').addClass('active');
        }
    },
    audioInit: function () {

        if (audioElement == null) {
            audioElement = document.createElement('audio');
            audioElement.setAttribute('id', 'audio-player');
            audioElement.addEventListener('ended', function () {
                if (isAccountMode && myUserId != '' && audioElement.duration != undefined && audioElement != null && player.mostListenedTime != -1000){
                    if (player.listPage == 'my-course-page'){
                        player.setListenedProgress(myUserId, player.courseId, player.selectedAudioKey.split('_')[1], audioElement.duration, player.mostListenedTime);
                    } else {
                        player.setListenedProgress(myUserId, player.courseId, player.selectedAudioKey, audioElement.duration, player.mostListenedTime);
                    }
                }
                player.setPlayPauseButton(false);
                player.forwardAudio();
            }, false);
            audioElement.autoplay = true;

            audioElement.addEventListener("canplay", function () {
                if (player.isFirstCanPlay){
                    player.isFirstCanPlay = false;
                    if (audioElement.duration > (player.startPosition + 2)){
                        audioElement.currentTime = player.startPosition;
                    } else {
                        audioElement.currentTime = 0.1;
                    }
                }
                if (audioElement.playbackRate != player.playbackRate){
                    audioElement.playbackRate = player.playbackRate;
                }
            });

            audioElement.addEventListener("timeupdate", function () {
                currentPercent = audioElement.currentTime * 100 / audioElement.duration;
                player.setProgressBarValueByPercent(currentPercent);
                document.getElementById("end").innerHTML= convertElapsedTime(audioElement.duration);
                document.getElementById("current").innerHTML= convertElapsedTime(audioElement.currentTime);


                intTime = Math.round(audioElement.currentTime);
                if (intTime % 5 == 1 && player.isUpdateAvailable){
                    if (audioElement.currentTime > player.mostListenedTime){
                        player.mostListenedTime = audioElement.currentTime;
                    }
                    player.updateListenedData();
                }

            });
            player.setPlayPauseButton(!player.isPlay);
            $('.play-pause').click(function (event) {
                player.playPauseMusic(!player.isPlay);
                if (isDevice){
                    MusicControls.updateIsPlaying(player.isPlay);
                }
            });
        } else {

        }
    },
    playPauseMusic: function(isPlay){
        player.isPlay = isPlay;
        player.setPlayPauseButton(!player.isPlay);
        player.setMiniPlayerPlayPauseButton(!player.isPlay);
        if (player.isPlay) {
            var promise = audioElement.play();
            if (promise) {
                promise.catch(function (error) { console.error(error); });
            }
        } else {
            var promise = audioElement.pause();
            userAnalyticsClass.set_usr_uniq_listen_course(player.courseId);

            player.updateListenedData();

            if (promise) {
                promise.catch(function (error) { console.error(error); });
            }
        }
    },
    playMusic: function () {
        player.showPlayerTitle();
        if (isAccountMode){
            audioName = player.courseId + "(" + player.selectedAudioKey + ")";
            userAnalyticsClass.set_usr_latest_listen_audio(audioName);
        }
        if (isDevice) {
            fileName = '';
            if (player.selectedAudio["courseId"] != undefined && player.selectedAudio["courseId"] != null) {
                fileName = player.selectedAudioKey + ".mp3";
            } else {
                fileName = player.courseId + "_" + player.selectedAudioKey + ".mp3";
            }

            checkIfFileExists(fileName, path => {
                if (path == "null") {
                    if (player.selectedAudio.Audio != audioElement.currentSrc){
                        audioElement.setAttribute('src', player.selectedAudio.Audio);
                        player.isUpdateAvailable = true;
                    }
                    player.setNotDownloadedImg();
                } else {
                    if (path != audioElement.currentSrc){
                        audioElement.setAttribute('src', path);
                        player.isUpdateAvailable = true;
                    }
                    player.setDownloadedImg();
                }
            });

            player.createMusicController();

        } else {
            if (player.selectedAudio.Audio != audioElement.currentSrc){
                audioElement.setAttribute('src', player.selectedAudio.Audio);
                player.isUpdateAvailable = true;
            }
        }
        audioElement.playbackRate = player.playbackRate;
    },
    selectNewAudio: function (audioPlayer, selectedAudioKey, courseId, isBought) {
        player.isDownloadButtonClickEnabled = false;
        player.audioPlayer = audioPlayer;
        player.selectedAudioKey = selectedAudioKey;
        player.isBought = isBought;

        player.audioKeyList = player.getAudioKeyList();
        player.selectedAudio = (player.selectedAudioKey != "" && player.audioPlayer[player.selectedAudioKey] != undefined && player.audioPlayer[player.selectedAudioKey] != null) ? player.audioPlayer[player.selectedAudioKey] : {};
        if (player.selectedAudio["courseId"] != undefined && player.selectedAudio["courseId"] != null) {
            player.courseId = player.selectedAudio["courseId"];
        } else {
            player.courseId = courseId;
        }

        player.mostListenedTime = -1000.0;

        player.startPosition = 0;
        player.isFirstCanPlay = true;
        player.isUpdateAvailable = false;
        if (isAccountMode && myUserId != ''){
            initParamLoadCnt = 2;
            if (player.listPage == 'my-course-page'){
                player.loadMostListendProgress(myUserId, player.courseId, player.selectedAudioKey.split('_')[1], result => {
                    player.mostListenedTime = result;
                    initParamLoadCnt--;
                    if (!initParamLoadCnt){
                        player.isPlay = true;
                        player.isDragging = false;
                        player.showMiniPlayerInfo();
                        player.setPlayPauseButton(!player.isPlay);
                        player.setProgressBarValueByPercent(0);
                        player.playMusic();
                    }
                });
                player.loadLastListenedProgress(myUserId, player.courseId, player.selectedAudioKey.split('_')[1], result => {
                    if (result == -1 ){
                        player.startPosition = 0;
                    } else {
                        player.startPosition = result;
                    }
                    initParamLoadCnt--;
                    if (!initParamLoadCnt){
                        player.isPlay = true;
                        player.isDragging = false;
                        player.showMiniPlayerInfo();
                        player.setPlayPauseButton(!player.isPlay);
                        player.setProgressBarValueByPercent(0);
                        player.playMusic();
                    }
                });
            } else {
                player.loadMostListendProgress(myUserId, player.courseId, player.selectedAudioKey, result => {
                    player.mostListenedTime = result;
                    initParamLoadCnt--;
                    if (!initParamLoadCnt){
                        player.isPlay = true;
                        player.isDragging = false;
                        player.showMiniPlayerInfo();
                        player.setPlayPauseButton(!player.isPlay);
                        player.setProgressBarValueByPercent(0);
                        player.playMusic();
                    }
                });    
                player.loadLastListenedProgress(myUserId, player.courseId, player.selectedAudioKey, result => {
                    if (result == -1 ){
                        player.startPosition = 0;
                    } else {
                        player.startPosition = result;
                    }
                    initParamLoadCnt--;
                    if (!initParamLoadCnt){
                        player.isPlay = true;
                        player.isDragging = false;
                        player.showMiniPlayerInfo();
                        player.setPlayPauseButton(!player.isPlay);
                        player.setProgressBarValueByPercent(0);
                        player.playMusic();
                    }
                });
            }
        } else {
            player.isPlay = true;
            player.isDragging = false;
            player.showMiniPlayerInfo();
            player.setPlayPauseButton(!player.isPlay);
            player.setProgressBarValueByPercent(0);
            player.playMusic();
        }

    },
    showPlayerTitle: function () {
        if (player.selectedAudio == undefined || player.selectedAudio == null || player.selectedAudio.Title == undefined || player.selectedAudio.Topic == undefined) {
            console.log("Error title information");
            return;
        }
        $('.player-title').empty();
        $('.player-title').append(player.selectedAudio.Title + '<span>' + player.selectedAudio.Topic + '</span>');
    },
    showPlaySpeedSelect: function () {
        $('#select-play-speed').after('\
            <ol id="select-speed-dialog">\
                <li class="title">播放速度</li>\
                <li><a href="javascript:void(0);" class="speed-item">x1.0</a></li>\
                <li><a href="javascript:void(0);" class="speed-item">x1.25</a></li>\
                <li><a href="javascript:void(0);" class="speed-item">x1.5</a></li>\
                <li><a href="javascript:void(0);" class="speed-item">x2.0</a></li>\
            </ol>\
        ');
        player.speedDialogState = true;
        $('.speed-item').click(function (event) {
            event.stopPropagation();

            speedText = $(this).text().substring(1);
            player.playbackRate = parseFloat(speedText);
            if (audioElement != undefined && audioElement != null) {
                audioElement.playbackRate = player.playbackRate;
            }
            player.hidePlaySpeedSelect();
            rate_text = '';
            if (player.playbackRate == 1 || player.playbackRate == 2){
                rate_text = 'x' + player.playbackRate + '.0';
            } else {
                rate_text = 'x' + player.playbackRate;
            }
            $('#select-play-speed').text(rate_text);
        })
    },
    showDownloadOption: function () {
        $('#select-download-option').after('\
            <ol id="download-option-dialog">\
                <li><a href="javascript:void(0);" id="all-download">全部下載</a></li>\
                <li><a href="javascript:void(0);" id="one-download">單節下載</a></li>\
            </ol>\
        ');
        player.downloadDialogState = true;
        $('#all-download').click(function (event) {
            if (!isDevice) {
                return;
            }
            event.stopPropagation();
            player.hideDownloadOption();
            player.downloadAllAudio();
        });
        $('#one-download').click(function (event) {
            event.stopPropagation();
            player.hideDownloadOption();
            if (!isDevice) {
                return;
            }
            if (!isAccountMode) {
                showGotoLoginDialog();
                return;
            }
            url = player.selectedAudio.Audio;
            fileName = player.courseId + "_" + player.selectedAudioKey + ".mp3";
            player.downloadOneAudio(fileName, url);
        });
    },
    downloadOneAudio: function (fileName, url) {
        checkIfFileExists(fileName, path => {
            if (path != "null") {
                console.log('Exist path = ', path);
            } else {
                console.log('Download start.');
                player.setDownloadingImg();
                key_downloaded = courseDetailClass.getKeyFromPath(fileName);
                courseDetailClass.currentAudioDownloaded[key_downloaded] = 1;
                courseDetailClass.showDownloadIcons();

                fileDownload(url, fileName, completion => {
                    if (completion == "") {
                        console.log('Download error!');
                        player.setNotDownloadedImg();
                        showSafeErrorDialogWithCloseAndText("無法下載課程，請先確認您的網路後再試一次");
                    } else {
                        key_downloaded = courseDetailClass.getKeyFromPath(fileName);
                        courseDetailClass.currentAudioDownloaded[key_downloaded] = 2;
                        courseDetailClass.showDownloadIcons();
                        currentFileName = player.courseId + "_" + player.selectedAudioKey + ".mp3";
                        if (fileName == currentFileName) {
                            player.setDownloadedImg();
                        }
                        userAnalyticsClass.set_usr_total_download();
                    }
                });
            }
        });
    },
    downloadAllAudio: function () {
        fileNames = [];
        urls = [];
        downloadIndexes = [];
        for (i = player.audioKeyList.length - 1; i >= 0; i--){
            key = player.audioKeyList[i];
            downloadState = courseDetailClass.currentAudioDownloaded[key];
            if (downloadState == 0){
                audio = (key != "" && player.audioPlayer[key] != undefined && player.audioPlayer[key] != null) ? player.audioPlayer[key] : {};
                url = audio.Audio;
                fileName = courseDetailClass.courseId + "_" + key + ".mp3";
                downloadIndexes.push(i);
                fileNames.push(fileName);
                urls.push(url);
                courseDetailClass.currentAudioDownloaded[player.audioKeyList[i]] = 1;
            }
        }
        courseDetailClass.showDownloadIcons();
        if (downloadIndexes.length > 0){
            player.setDownloadingImg();
            courseDetailClass.downloadAllAudio(fileNames, urls, downloadIndexes, player.audioKeyList);
        }
    },
    downloadAllAudioFiles: function(fileNames, urls, downloadIndexes, audioKeyList){
        if (downloadIndexes.length == 0 || urls.length == 0 || fileNames.length == 0){
            return;
        }
        cordova.plugins.firebase.analytics.logEvent(courseId+"_alldownload");
        url = urls.pop();
        fileName = fileNames.pop();
        downloadIndex = downloadIndexes.pop();
        fileDownload(url, fileName, completion => {
            if (completion == ""){
                console.log('Download error!');
                showSafeErrorDialogWithCloseAndText("無法下載課程，請先確認您的網路後再試一次");
                courseDetailClass.currentAudioDownloaded[audioKeyList[downloadIndex]] = 0;
                courseDetailClass.showDownloadIcons();
                return;
            } else {
                console.log('Download finish!: ', downloadIndex);
                courseDetailClass.currentAudioDownloaded[audioKeyList[downloadIndex]] = 2;
                courseDetailClass.showDownloadIcons();
                courseDetailClass.downloadAllAudio(fileNames, urls, downloadIndexes, audioKeyList);
                userAnalyticsClass.set_usr_total_download();
            }
        });
    },
    hideDownloadOption: function () {
        $('#download-option-dialog').remove();
        player.downloadDialogState = false;
    },
    showDeleteDownloadedAudio: function () {
        $('#select-download-option').after('<ol id="download-option-dialog"><li class="red-link"><a href="javascript:void(0);" id="delete-audio">移除下載內容</a></li></ol>');
        player.downloadDialogState = true;
        $('#delete-audio').click(function (event) {
            fileName = '';
            if (player.listPage == 'my-course-page'){
                fileName = player.selectedAudioKey + ".mp3";
            } else {
                fileName = player.courseId + "_" + player.selectedAudioKey + ".mp3";
            }
            deleteFile(fileName, result => {
                if (result == "success") {

                    if (player.listPage == 'my-course-page'){
                        courseClass.allDownloadAudio[player.selectedAudioKey] = 0;
                        delete courseClass.downloadedAudioPlayer[player.selectedAudioKey];
                        courseClass.showData(courseClass.prevTabIndexCourse);
                        console.log('player.selectedAudioKey: ', player.selectedAudioKey);
                        console.log("Course Class All download Audio: ", courseClass.allDownloadAudio);
                        console.log('Course class downloaded Audio Player: ', courseClass.downloadedAudioPlayer);
                        if (audioElement != undefined && audioElement != null && audioElement.src == (cordova.file.externalDataDirectory + fileName)){
                            player.forwardAudio();
                        }
                    } else {

                        courseDetailClass.currentAudioDownloaded[player.selectedAudioKey] = 0;
                        courseDetailClass.showDownloadIcons();
                        player.selectNewAudio(player.audioPlayer, player.selectedAudioKey, player.courseId, player.isBought);
                    }
                } else if (result == "error") {
                    console.log("Error occured");
                } else if (result == "not_exist") {
                    console.log("File does not exist!");
                }
            });
            player.hideDownloadOption();
        });
    },
    setNotDownloadedImg: function () {
        $('#img-download-state').attr('src', 'assets/images/player-icons/ulj(light grey).png');
        if ($('#img-download-state').hasClass('downloaded')) {
            $('#img-download-state').removeClass('downloaded')
        }
        player.isDownloadButtonClickEnabled = true;
        $('#select-download-option').attr('disabled', 'false');
    },
    setDownloadedImg: function () {
        $('#img-download-state').attr('src', 'assets/images/player-icons/alj.png');
        $('#img-download-state').addClass('downloaded');
        player.isDownloadButtonClickEnabled = true;
        $('#select-download-option').attr('disabled', 'false');
    },
    setDownloadingImg: function () {
        $('#img-download-state').attr('src', 'assets/images/player-icons/ulj.png');
        $('#select-download-option').attr('disabled', 'true');
        player.isDownloadButtonClickEnabled = false;
    },
    showDeleteConfirmAlert: function () {
        player.hideDownloadOption();
        $('body').append('\
            <div class="custom-overlay" id="delete-confirm-dialog">\
                <div class="remove-popup">\
                    <div class="top">\
                        <h5>從「下載項目」中移除？</h5>\
                        <p>你將無法於離線時播放此課程。</p>\
                    </div>\
                    <ul>\
                        <li class="red"><a href="#">移除</a></li>\
                        <li class="red"><a href="#">移除且不再提醒</a></li>\
                        <li><a href="#">取消</a></li>\
                    </ul>\
                </div>\
            </div>');
    },
    hideDeleteConfirmAlert: function () {
        $('#delete-confirm-dialog').remove();
    },
    gotoTimeWithPercent: function (percent) {
        if (audioElement == undefined || audioElement == null) {
            console.log('audio element is undefined!');
            return;
        }
        if (audioElement.duration != undefined && audioElement.duration != null && !isNaN(audioElement.duration)){
            audioElement.currentTime = percent * audioElement.duration / 100;
        }
    },
    secBack: function () {
        if (audioElement == undefined || audioElement == null) {
            console.log('audio element is undefined!');
            return;
        }
        if (audioElement.currentTime > 15) {
            audioElement.currentTime = audioElement.currentTime - 15;
        } else {
            audioElement.currentTime = 0;
        }
    },
    secNext: function () {
        if (audioElement == undefined || audioElement == null) {
            console.log('audio element is undefined!');
            return;
        }
        if (audioElement.currentTime > (audioElement.duration - 15)) {
            audioElement.currentTime = audioElement.duration;
        } else {
            audioElement.currentTime = audioElement.currentTime + 15;
        }
    },

    backwardAudio: function () {

        // player.updateListenedData();
        userAnalyticsClass.set_usr_uniq_listen_course(player.courseId);
        // userAnalyticsClass.set_usr_listen_duration(player.courseId + "(" + player.selectedAudioKey + ")", audioElement.currentTime);
        currentAudioIndex = player.getCurrentAudioIndex();
        if (currentAudioIndex == -1 || currentAudioIndex == 0 || player.audioKeyList == undefined || player.audioKeyList == []) {
            console.log('It is first audio.');
            player.stopAudio();
            return;
        }
        player.selectNewAudio(player.audioPlayer, player.audioKeyList[currentAudioIndex - 1], player.courseId, player.isBought);    
    },
    forwardAudio: function () {
        
        // player.updateListenedData();
        userAnalyticsClass.set_usr_uniq_listen_course(player.courseId);
        // userAnalyticsClass.set_usr_listen_duration(player.courseId + "(" + player.selectedAudioKey + ")", audioElement.currentTime);
        currentAudioIndex = player.getCurrentAudioIndex();
        if (currentAudioIndex == -1 || player.audioKeyList == undefined || player.audioKeyList == []) {
            console.log('currentAudioIndex is undefined!', currentAudioIndex);
            player.stopAudio();
            return;
        }
        if (currentAudioIndex == (player.audioKeyList.length - 1)) {
            console.log('It is last audio.');
            player.stopAudio();
            return;
        }

        player.selectNewAudio(player.audioPlayer, player.audioKeyList[currentAudioIndex + 1], player.courseId, player.isBought);    
    },
    stopAudio: function () {
        player.isPlay = false;

        player.updateListenedData();
        
        audioElement.pause();
        userAnalyticsClass.set_usr_uniq_listen_course(player.courseId);
        // userAnalyticsClass.set_usr_listen_duration(player.courseId + "(" + player.selectedAudioKey + ")", audioElement.currentTime);
        audioElement.currentTime = 0;
        player.setPlayPauseButton(!player.isPlay);
        player.setMiniPlayerPlayPauseButton(!player.isPlay);
        if (isDevice){
            MusicControls.updateIsPlaying(false);
        }
    },
    hidePlaySpeedSelect: function () {
        $('#select-speed-dialog').remove();
        player.speedDialogState = false;
    },

    setProgressBarValueByPercent: function (percent) {
        progressBarPercent = percent + 1;
        if (!player.isDragging) {
            $('.dot').css("left", "" + percent + "%");
        }
        $('.progress-bar').css("width", "" + progressBarPercent + "%");
        player.setMiniPlayerProgressBarValueByPercent(percent);
    },

    initializeMiniPlayer: function () {
        player.showMiniPlayerInfo();
        $('#mini-player-play-btn').click(function (event) {
            event.stopPropagation();
            if (player.isPlay) {
                audioElement.pause();
                userAnalyticsClass.set_usr_uniq_listen_course(player.courseId);
                // userAnalyticsClass.set_usr_listen_duration(player.courseId + "(" + player.selectedAudioKey + ")", audioElement.currentTime);
                player.isPlay = false;
            } else {
                audioElement.play();
                player.isPlay = true;
            }
            player.setMiniPlayerPlayPauseButton(!player.isPlay);
            if (isDevice){
                MusicControls.updateIsPlaying(player.isPlay);
            }
            player.setPlayPauseButton(!player.isPlay);

        });
        player.miniPlayerExist = true;
    },
    showMiniPlayerInfo: function () {
        $('#mini-player-title').text(player.selectedAudio.Title);
        $('#mini-player-topic').text(player.selectedAudio.Topic);
        $('#mini-player-duration').text(player.selectedAudio.Time);
        player.setMiniPlayerPlayPauseButton(!player.isPlay);
    },
    setMiniPlayerProgressBarValueByPercent: function (percent) {
        $('#mini-player-progress-bar').css("width", "" + percent + "%");
    },
    setMiniPlayerPlayPauseButton: function (isPlay) {
        if (isPlay) {
            $('#mini-player-play-btn').attr("aria-pressed", "true");
            $('#mini-player-play-btn').addClass('active');
        } else {
            $('#mini-player-play-btn').attr('aria-pressed', 'false');
            if ($('#mini-player-play-btn').hasClass('active')) {
                $('#mini-player-play-btn').removeClass('active');
            }
        }
    },
    createMusicController: function(){
        let track = player.selectedAudio.Title;
        let isPlaying = player.isPlay;
        let ticker = 'Now playing ' + player.selectedAudio.Title;
        course = allCourses[player.courseId];
        cover = 'assets/images/music-control.png';
        album = course.courseTitle;
        artist = course.authorName;
        MusicControls.create({
            track: track,
            artist: artist,
            album: album,
            cover: cover,
            isPlaying: isPlaying,
            dismissable: true,
            hasPrev: true,
            hasNext: true,
            hasClose: false,
            ticker: ticker,
            playIcon: 'media_play',
            pauseIcon: 'media_pause',
            prevIcon: 'media_prev',
            nextIcon: 'media_next',
            closeIcon: 'media_close',
            notificationIcon: 'notification'
        }, onSuccess, onError);
        function onSuccess() {
        }
        function onError() {
        }
        MusicControls.subscribe(player.musicControllerEvent);
        MusicControls.listen();
    },
    deleteMusicController: function(){
        console.log("Delete music controller");
        MusicControls.destroy(onSuccess, onError);
        function onSuccess() {
            console.log("Delete music controller successed");
        }
        function onError() {
            console.log("Delete music controller failed");
        }
    },
    musicControllerEvent: function(action){

        const message = JSON.parse(action).message;
        switch (message) {
            case 'music-controls-media-button-play-pause':
                MusicControls.updateIsPlaying(!player.isPlay);
                player.playPauseMusic(!player.isPlay);
                break;
            case 'music-controls-media-button-previous':
                player.backwardAudio();
                break;
            case 'music-controls-media-button-next':
                player.forwardAudio();
                break;
            case 'music-controls-pause':
                MusicControls.updateIsPlaying(false);
                player.playPauseMusic(false);
                break;
            case 'music-controls-play':
                MusicControls.updateIsPlaying(true);
                player.playPauseMusic(true);
                break;
            case 'music-controls-next':
                player.forwardAudio();
                break;
            case 'music-controls-previous':
                player.backwardAudio();
                break;
            case 'music-controls-stop-listening':
                MusicControls.updateIsPlaying(false);
                break;
            default:
                console.log('message: ', message);
                break;
        }
    },
    setListenedProgress: function(uid, courseId, audioKey, time, mostListenedTime){
        if (!isOnline){
            return;
        }
        player.setMostListenedProgress(uid, courseId, audioKey, mostListenedTime);
        // if (time > mostListenedTime){
        // }
        firebase.database().ref('UserListened').child(uid).child(courseId).child('LastListened').child(audioKey)
        .set(time);
    },
    setValidListened: function(uid, courseId, data){
        if (!isOnline){
            return;
        }
        firebase.database().ref('UserListened').child(uid).child(courseId).child('ValidListened').set(data);
        firebase.database().ref('UserListened').child(uid).child(courseId).child('CourseListened').set(true);
    },
    loadMostListendProgress: function(uid, courseId, audioKey, result){
        if (!isOnline){
            result(-1.0);
            return;
        }
        firebase.database().ref('/UserListened/').child(uid).child(courseId).child('MostListened').child(audioKey).once('value')
        .then(function(snapshot){
            if (snapshot != undefined && snapshot != null){
                result(snapshot.val());
            } else {
                result(-1.0);
            }
        });
    },
    loadLastListenedProgress: function(uid, courseId, audioKey, result){
        if (!isOnline){
            result(-1.0);
            return;
        }
        firebase.database().ref('/UserListened/').child(uid).child(courseId).child('LastListened').child(audioKey).once('value')
        .then(function(snapshot){
            if (snapshot != undefined && snapshot != null){
                result(snapshot.val());
            } else {
                result(-1.0);
            }
        });
    },
    setMostListenedProgress: function(uid, courseId, audioKey, time){
        if (!isOnline){
            return;
        }
        userAnalyticsClass.set_usr_listen_duration(courseId + "(" + audioKey + ")", time);
        firebase.database().ref('UserListened').child(uid).child(courseId).child('MostListened').child(audioKey)
        .set(time);
    },
    setAudioExit: function(uid, courseId){
        if (!isOnline){
            return;
        }
        firebase.database().ref('UserListened').child(uid).child(courseId).child('Exit').set(true);
    },
    updateListenedData: function(){
        if (!isOnline){
            return;
        }
        if (isAccountMode && myUserId != '' && audioElement.duration != undefined && audioElement != null && player.mostListenedTime != -1000){
            if (player.listPage == 'my-course-page'){
                player.setListenedProgress(myUserId, player.courseId, player.selectedAudioKey.split('_')[1], audioElement.currentTime, player.mostListenedTime);
            } else {
                player.setListenedProgress(myUserId, player.courseId, player.selectedAudioKey, audioElement.currentTime, player.mostListenedTime);
            }
        }
    }


}

