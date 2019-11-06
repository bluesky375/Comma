
var userAnalyticsClass = {
    isDataLoaded: false,
    isInvalidUser: function(){
        return (!isAccountMode || myUserId == undefined || myUserId == null || myUserId == '');
    },
    set_usr_app_open: function(){
        if (userAnalyticsClass.isInvalidUser()) return;
        var usr_app_openRef = firebase.database().ref('UserAnalytics').child(myUserId).child('usr_app_open');
        firebase.database().ref('.info/connected').on('value', function (snapshot) {
            if (snapshot.val() != undefined && snapshot.val() != null || snapshot.val() == true){
                usr_app_openRef.set(userAnalyticsClass.get_usr_app_open() + 1);
                currentUserAnalytics.usr_app_open = userAnalyticsClass.get_usr_app_open() + 1;
            }
        });
    },
    set_usr_app_open_days: function(){
        if (userAnalyticsClass.isInvalidUser()) return;
        userAnalyticsClass.getFirebaseServerTimeStamp(result => {
            today = userAnalyticsClass.get_usr_last_login();
            if (today != userAnalyticsClass.getDateFromTimestamp(result)){
                firebase.database().ref('UserAnalytics').child(myUserId).child('usr_app_open_days').set(userAnalyticsClass.get_usr_app_open_days() + 1);
                currentUserAnalytics.usr_app_open_days = userAnalyticsClass.get_usr_app_open_days() + 1;
            }
        });
    },
    set_usr_clicked_course: function(courseId){
        if (userAnalyticsClass.isInvalidUser()) return;
        if (!userAnalyticsClass.isDataLoaded) return;
        courseList = (currentUserAnalytics.usr_clicked_course != undefined && currentUserAnalytics.usr_clicked_course != null) ? currentUserAnalytics.usr_clicked_course : [];
        if (courseList.indexOf(courseId) == -1){
            courseList.push(courseId);
            firebase.database().ref('UserAnalytics').child(myUserId).child('usr_clicked_course').set(courseList);
            currentUserAnalytics.usr_clicked_course = courseList;
        }
    },
    set_usr_course_pageview: function(){
        if (userAnalyticsClass.isInvalidUser()) return;
        if (!userAnalyticsClass.isDataLoaded) return;
        firebase.database().ref('UserAnalytics').child(myUserId).child('usr_course_pageview').set(userAnalyticsClass.get_usr_course_pageview() + 1);
        currentUserAnalytics.usr_course_pageview = userAnalyticsClass.get_usr_course_pageview() + 1;
    },
    set_usr_last_login: function(){
        if (userAnalyticsClass.isInvalidUser()) return;
        userAnalyticsClass.getFirebaseServerTimeStamp(result => {
            today = userAnalyticsClass.get_usr_last_login();
            if (today != userAnalyticsClass.getDateFromTimestamp(result)){
                firebase.database().ref('UserAnalytics').child(myUserId).child('usr_last_login').set(userAnalyticsClass.getDateFromTimestamp(result));
                firebase.database().ref('UserAnalytics').child(myUserId).child('usr_app_open_days').set(userAnalyticsClass.get_usr_app_open_days() + 1);
            }
        });
    },
    set_usr_latest_listen_audio: function(audioName){
        if (userAnalyticsClass.isInvalidUser()) return;
        firebase.database().ref('UserAnalytics').child(myUserId).child('usr_latest_listen_audio').set(audioName);
    },
    set_usr_listen_duration: function(audioName, duration){
        if (userAnalyticsClass.isInvalidUser()) return;
        firebase.database().ref('UserAnalytics').child(myUserId).child('usr_listen_duration').child(audioName).set(duration);
        if (userAnalyticsClass.isDataLoaded){
            if (currentUserAnalytics['usr_listen_duration'] == undefined || currentUserAnalytics['usr_listen_duration'] == null){
                var obj = {};
                obj[audioName] = duration;
                currentUserAnalytics['usr_listen_duration'] = obj;
            } else {
                currentUserAnalytics['usr_listen_duration'][audioName] = duration;
            }
            listenDurationKeyList = Object.keys(currentUserAnalytics['usr_listen_duration']);
            total_duration = 0;
            for (listenDurationIndex in listenDurationKeyList){
                total_duration += currentUserAnalytics['usr_listen_duration'][listenDurationKeyList[listenDurationIndex]];
            }
            userAnalyticsClass.set_usr_total_listen_duration(total_duration);
        }
    },
    set_usr_total_discussion: function(){
        if (userAnalyticsClass.isInvalidUser()) return;
        if (userAnalyticsClass.isDataLoaded){
            console.log("Set user total discussion");
            firebase.database().ref('UserAnalytics').child(myUserId).child('usr_total_discussion').set(userAnalyticsClass.get_usr_total_discussion() + 1);
            currentUserAnalytics.usr_total_discussion = userAnalyticsClass.get_usr_total_discussion() + 1;
        }
    },
    set_usr_total_download: function(){
        if (userAnalyticsClass.isInvalidUser()) return;
        if (userAnalyticsClass.isDataLoaded){
            firebase.database().ref('UserAnalytics').child(myUserId).child('usr_total_download').set(userAnalyticsClass.get_usr_total_download() + 1);
            currentUserAnalytics.usr_total_discussion = userAnalyticsClass.get_usr_total_download() + 1;
        }

    },
    set_usr_total_listen_duration: function(duration){
        if (userAnalyticsClass.isInvalidUser()) return;
        if (!userAnalyticsClass.isDataLoaded) return;
        firebase.database().ref('UserAnalytics').child(myUserId).child('usr_total_listen_duration').set(duration);
        currentUserAnalytics.usr_total_listen_duration = duration;
    },
    set_usr_uniq_listen_audio: function(){
        if (userAnalyticsClass.isInvalidUser()) return;

    },
    set_usr_uniq_listen_course: function(courseId){
        if (userAnalyticsClass.isInvalidUser()) return;
        if (!userAnalyticsClass.isDataLoaded) return;

        userAnalyticsClass.set_usr_uniq_listen_courseAudioArray(courseId);

        listenDurationKeyList = (currentUserAnalytics['usr_listen_duration'] != null && currentUserAnalytics['usr_listen_duration'] != undefined) ? Object.keys(currentUserAnalytics['usr_listen_duration']) : [];

        exist = false;
        for (listenDurationIndex in listenDurationKeyList){
            audioName = listenDurationKeyList[listenDurationIndex];
            if (audioName.includes(courseId)){
                exist = true;
                break;
            }
        }
        if (!exist){
            firebase.database().ref('UserAnalytics').child(myUserId).child('usr_uniq_listen_course').set(userAnalyticsClass.get_usr_uniq_listen_course() + 1);
            currentUserAnalytics.usr_uniq_listen_course = userAnalyticsClass.get_usr_uniq_listen_course() + 1;
        }

    },
    set_usr_uniq_listen_courseAudioArray: function(courseId){
        if (userAnalyticsClass.isInvalidUser()) return;
        if (!userAnalyticsClass.isDataLoaded) return;
        listen_courseAudio = userAnalyticsClass.get_usr_uniq_listen_courseAudioArray();
        if (listen_courseAudio[courseId] == undefined || listen_courseAudio[courseId] == null){
            firebase.database().ref('UserAnalytics').child(myUserId).child('usr_uniq_listen_courseAudioArray').child(courseId).set(1);
            if (currentUserAnalytics.usr_uniq_listen_courseAudioArray == undefined || currentUserAnalytics.usr_uniq_listen_courseAudioArray == null){
                var obj = {};
                obj[courseId] = 1;
                currentUserAnalytics.usr_uniq_listen_courseAudioArray = obj;
            } else {
                currentUserAnalytics.usr_uniq_listen_courseAudioArray[courseId] = 1;
            }
        } else {
            firebase.database().ref('UserAnalytics').child(myUserId).child('usr_uniq_listen_courseAudioArray').child(courseId).set(currentUserAnalytics.usr_uniq_listen_courseAudioArray[courseId] + 1);
            currentUserAnalytics.usr_uniq_listen_courseAudioArray[courseId] = currentUserAnalytics.usr_uniq_listen_courseAudioArray[courseId] + 1;   
        }
        
    },
    get_usr_app_open: function(){
        return (currentUserAnalytics.usr_app_open != undefined && currentUserAnalytics.usr_app_open != null) ? currentUserAnalytics.usr_app_open : 0;
    },
    get_usr_app_open_days: function(){
        return (currentUserAnalytics.usr_app_open_days != undefined && currentUserAnalytics.usr_app_open_days != null) ? currentUserAnalytics.usr_app_open_days : 0;
    },
    get_usr_clicked_course: function(){
        return (currentUserAnalytics.usr_clicked_course != undefined && currentUserAnalytics.usr_clicked_course != null) ? currentUserAnalytics.usr_clicked_course : [];
    },
    get_usr_course_pageview: function(){
        return (currentUserAnalytics.usr_course_pageview != undefined && currentUserAnalytics.usr_course_pageview != null) ? currentUserAnalytics.usr_course_pageview : 0;
    },
    get_usr_last_login: function(){
        return (currentUserAnalytics.usr_last_login != undefined && currentUserAnalytics.usr_last_login != null) ? currentUserAnalytics.usr_last_login : "";
    },
    get_usr_total_discussion: function(){
        return (currentUserAnalytics.usr_total_discussion != undefined && currentUserAnalytics.usr_total_discussion != null) ? currentUserAnalytics.usr_total_discussion : 0;
    },
    get_usr_total_download: function(){
        return (currentUserAnalytics.usr_total_download != undefined && currentUserAnalytics.usr_total_download != null) ? currentUserAnalytics.usr_total_download : 0;
    },
    get_usr_total_listen_duration: function(){
        return (currentUserAnalytics.usr_total_listen_duration != undefined && currentUserAnalytics.usr_total_listen_duration != null) ? currentUserAnalytics.usr_total_listen_duration : 0;
    },
    get_usr_uniq_listen_audio: function(){
        return (currentUserAnalytics.usr_uniq_listen_audio != undefined && currentUserAnalytics.usr_uniq_listen_audio != null) ? currentUserAnalytics.usr_uniq_listen_audio : 0;
    },
    get_usr_uniq_listen_course: function(){
        return (currentUserAnalytics.usr_uniq_listen_course != undefined && currentUserAnalytics.usr_uniq_listen_course != null) ? currentUserAnalytics.usr_uniq_listen_course : 0;
    },
    get_usr_uniq_listen_courseAudioArray: function(){
        return (currentUserAnalytics.usr_uniq_listen_courseAudioArray != undefined && currentUserAnalytics.usr_uniq_listen_courseAudioArray != null) ? currentUserAnalytics.usr_uniq_listen_courseAudioArray : {};        
    },
    loadCurrentUserAnalytics: function(userAnalytics){
        if (userAnalyticsClass.isInvalidUser()) return;
        firebase.database().ref('UserAnalytics').child(myUserId).once('value').then(function(snapshot) {
            userAnalyticsClass.isDataLoaded = true;
            if (snapshot.val() != undefined && snapshot.val() != null){
                userAnalytics(snapshot.val());
            } else {
                userAnalytics({});
            }
        });
    },
    getFirebaseServerTimeStamp: function(result) {
        firebase.database().ref('/.info/serverTimeOffset')
            .once('value')
            .then(function stv(data) {
                result(data.val() + Date.now());
            }, function (err) {
                result(-1);
            });
    },
    getDateFromTimestamp: function(timestamp){
        var createdDate = new Date(timestamp);
        var year = createdDate.getFullYear();
        var month = '' + (createdDate.getMonth()+1);
        if (month.length < 2) month = '0' + month;
        var date = '' + createdDate.getDate();
        if (date.length < 2) date = '0' + date;
        var string = year + '-' + month + '-' + date;
        return string;
    }
}