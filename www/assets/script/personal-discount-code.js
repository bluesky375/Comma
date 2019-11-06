


var discountCodeClass = {
    submitAvailable: false,
    couponValue: -1,
    initialize: function () {

        discountCodeClass.submitAvailable = false;
        discountCodeClass.couponValue = -1;
        $('#coupon-text').keyup(function () {
            discountCodeClass.submitButtonState();
        });
        $('#coupon-text').bind('paste', function () {
            setTimeout(function(){
                discountCodeClass.submitButtonState();
            }, 100);
        });

        $('#submit-discount').submit(function () {
            discountCodeClass.submitCoupon();
        });
        discountCodeClass.fixElementsStyle();
    },
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },
    submitButtonState: function () {
        var content = $("#coupon-text").val();
        if (content != undefined && content != "") {
            discountCodeClass.submitAvailable = true;
        } else {
            discountCodeClass.submitAvailable = false;
        }
        if (discountCodeClass.submitAvailable) {
            $('#button-sumbit').css({background: '#1fbfb3'});
            $('#button-sumbit').removeAttr("disabled");
        } else {
            $('#button-sumbit').css({background: '#ADADAD'});
            $('#button-sumbit').attr("disabled", true);
        }
    },
    submitCoupon: function () {

        // discountCodeClass.getCouponCampaignValid('christmas18', validState => {
        //     console.log('Valid state: ', validState);
        // });
        // return;
        showLoadingDialogWithText('兌換中...');
        if (myUserId == undefined || myUserId == null || myUserId == ""){
            hideLoadingDialog();
            console.log("Valid user id");
            return;
        }
        var couponString = $("#coupon-text").val();

        discountCodeClass.isCourseCoupon(couponString, courseValue => {
            if (courseValue == null){
                if (discountCodeClass.isWacaCoupon(couponString, courseId => {
                    if (courseId == null){
                        discountCodeClass.couponProc(couponString, completion => {
                            hideLoadingDialog();
                            if (completion == "OK"){
                                if (discountCodeClass.couponValue != -1){
                                    showCouponSuccessDialogWithPoint(discountCodeClass.couponValue);
                                } else {
                                    showSendCouponFailedDialogWithText("FAILED");
                                    setTimeout(hideSendCouponFailedDialog, 3000);
                                }
                            } else if (completion == "FAILED"){
                                showSendCouponFailedDialogWithText("FAILED");
                                setTimeout(hideSendCouponFailedDialog, 3000);
                            } else {
                                showSendCouponFailedDialogWithText(completion);
                                setTimeout(hideSendCouponFailedDialog, 3000);
                            }
                        });
                    } else {
                        firebase.database().ref('AllCourses').child(courseId).once('value').then(function(courseSnapShot){
                            studentNumber = 0;
                            if (courseSnapShot.val() != undefined && courseSnapShot.val() != null){
                                onceCourseValue = courseSnapShot.val();
                                studentNumber = (onceCourseValue.studentNumber != undefined && onceCourseValue.studentNumber != null) ? onceCourseValue.studentNumber : 0;
                            }
                            firebase.database().ref('BoughtCourses').child(myUserId).once('value').then(function(snapshot){
                                if (snapshot.val() != undefined && snapshot.val() != null){
                                    boughtCourseList = snapshot.val();
                                    if (boughtCourseList.indexOf(courseId) == -1){
                                        boughtCourseList.push(courseId);
                                        firebase.database().ref('BoughtCourses').child(myUserId).set(boughtCourseList);
                                        firebase.database().ref('AllCourses').child(courseId).child('studentNumber').set(studentNumber + 1);
                                        discountCodeClass.addCashResult("購買課程(WACA)\(" + courseId +")", completion => {
                                            hideLoadingDialog();
                                            showCouponCourseSuccessDialog(courseId);
                                        });
                                    } else {
                                        hideLoadingDialog();
                                        showCouponCourseSuccessDialog(courseId);
                                    }
                                } else {
                                    boughtCourseList = [];
                                    boughtCourseList.push(courseId);
                                    firebase.database().ref('BoughtCourses').child(myUserId).set(boughtCourseList);
                                    firebase.database().ref('AllCourses').child(courseId).child('studentNumber').set(studentNumber + 1);
                                    discountCodeClass.addCashResult("購買課程(WACA)\(" + courseId +")", completion => {
                                        hideLoadingDialog();
                                        showCouponCourseSuccessDialog(courseId);
                                    });
                                }
                            });
                        });
                    }
                }));
            } else {
                if (courseValue.couponLimit == undefined || courseValue.couponLimit == null){
                    hideLoadingDialog();
                    showSendCouponFailedDialogWithText("兌換碼輸入無效");
                    setTimeout(hideSendCouponFailedDialog, 3000);
                    return;
                }
                couponString = couponString.substring(3);
                couponExchange = (courseValue.couponExchange != undefined && courseValue.couponExchange != null) ? courseValue.couponExchange : 0;
                studentNumber = (courseValue.studentNumber != undefined && courseValue.studentNumber != null) ? courseValue.studentNumber : 0;
                couponLimit = (courseValue.couponLimit != undefined && courseValue.couponLimit != null) ? courseValue.couponLimit : 0;
                if ((couponLimit - couponExchange) > 0){
                    firebase.database().ref('BoughtCourses').child(myUserId).once('value').then(function(snapshot){
                        if (snapshot.val() != undefined && snapshot.val() != null){
                            boughtCourseList = snapshot.val();
                            if (boughtCourseList.indexOf(couponString) == -1){
                                boughtCourseList.push(couponString);
                                couponExchangeRef = firebase.database().ref('AllCourses').child(couponString).child('couponExchange');
                                couponExchangeRef.transaction(function (transactionCouponExchange){
                                    if (transactionCouponExchange){
                                        transactionCouponExchange++;
                                    }
                                    return transactionCouponExchange;
                                });

                                firebase.database().ref('BoughtCourses').child(myUserId).set(boughtCourseList);
                                // firebase.database().ref('AllCourses').child(couponString).child('couponExchange').set(couponExchange + 1);
                                firebase.database().ref('AllCourses').child(couponString).child('studentNumber').set(studentNumber + 1);
                                discountCodeClass.addCashResult("兌換課程\(" + couponString +")", completion => {
                                    hideLoadingDialog();
                                    showCouponCourseSuccessDialog(couponString);
                                });
                            } else {
                                hideLoadingDialog();
                                showSendCouponFailedDialogWithText("您已購買此課程");
                                setTimeout(hideSendCouponFailedDialog, 3000);
                                // showCouponCourseSuccessDialog(couponString);
                            }
                        } else {
                            boughtCourseList = [];
                            boughtCourseList.push(couponString);
                            couponExchangeRef = firebase.database().ref('AllCourses').child(couponString).child('couponExchange');
                            couponExchangeRef.transaction(function (transactionCouponExchange){
                                if (transactionCouponExchange){
                                    transactionCouponExchange++;
                                }
                                return transactionCouponExchange;
                            });
                            firebase.database().ref('BoughtCourses').child(myUserId).set(boughtCourseList);
                            // firebase.database().ref('AllCourses').child(couponString).child('couponExchange').set(couponExchange + 1);
                            firebase.database().ref('AllCourses').child(couponString).child('studentNumber').set(studentNumber + 1);
                            discountCodeClass.addCashResult("兌換課程\(" + couponString +")", completion => {
                                hideLoadingDialog();
                                showCouponCourseSuccessDialog(couponString);
                            });
                        }
                    });

                } else {
                    hideLoadingDialog();
                    showSendCouponFailedDialogWithText("兌換已額滿");
                    setTimeout(hideSendCouponFailedDialog, 3000);
                }
            }
        });
    },
    addCashResult: function(cashType, completion){
        if (myUserId == undefined || myUserId == null || myUserId == ""){
            console.log("Valid user id");
            completion(false);
            return;
        }

        var cashHistoryKey = firebase.database().ref('CashFlow').child(myUserId).child('History').push().key;
        var serverCashFlowKey = firebase.database().ref('ServerCashFlow').push().key;
        getFirebaseServerTimeStamp(result => {
            var cashHistory = {};
            cashHistory = {
                CashType: cashType,
                Time: getDateStringFromTimestamp(result),
                Uid: myUserId,
                Unit: "點數",
                Value: 0
            } 
            firebase.database().ref('CashFlow').child(myUserId).child('History').child(cashHistoryKey).set(cashHistory);
            firebase.database().ref('ServerCashFlow').child(serverCashFlowKey).set(cashHistory);
            completion(true);
        });
    },
    getCurrentCouponEvent: function(couponEvent){
        firebase.database().ref('CouponTypes').once('value').then(function(snapshot){
            if (snapshot.val() != undefined && snapshot.val() != null){
                couponEvent(snapshot.val());
            } else{
                couponEvent("");
            }
        });
    },
    getCouponCampaignValid: function(couponEvent, validState){
        firebase.database().ref('Campaign').child(couponEvent).once('value').then(function(snapshot){
            if (snapshot.val() != undefined && snapshot.val() != null){
                campaignObj = snapshot.val();
                if (campaignObj.amount != undefined && campaignObj.amount != null && campaignObj.amount > 0 && campaignObj.expiry != undefined && campaignObj.expiry != null){
                    expiryTimeStamp = (new Date(campaignObj.expiry).getTime());
                    getFirebaseServerTimeStamp(serverTimestamp => {
                        if (serverTimestamp == -1){
                            validState("請檢查網路連線");
                        } else {
                            if (serverTimestamp > expiryTimeStamp){
                                validState("兌換期限已過");
                            } else {
                                validState("OK");
                            }
                        }
                    });
                } else {
                    validState("兌換碼輸入無效");
                }
            } else {
                validState("兌換碼輸入無效");
            }
        });
    },
    getUserCampaigns: function(userCampaigns){
        if (myUserId == undefined || myUserId == null || myUserId == ""){
            console.log("Valid user id");
            userCampaigns([]);
            return;
        }
        firebase.database().ref('Users').child(myUserId).child('Campaigns').once('value').then(function(snapshot){
            if (snapshot.val() != undefined && snapshot.val() != null){
                userCampaigns(snapshot.val());
            } else {
                userCampaigns([]);
            }
        });
    },
    getUserCampaignValid: function(couponEvent, completion){
        // TODO - User only campaign
        if (myUserId == undefined || myUserId == null || myUserId == ""){
            console.log("Valid user id");
            completion("Invalid user id");
            return;
        }
        discountCodeClass.getUserCampaigns(usrCampaigns => {
            if (usrCampaigns.indexOf(couponEvent) > -1){
                completion('您於該活動已兌換過');
            } else {
                completion('OK');
            }
        });
    },
    getCouponValue: function(couponEvent, couponString, couponValue){
        firebase.database().ref('CouponLists').child(couponEvent).child(couponString).once('value').then(function(snapshot){
            if (snapshot.val() != undefined && snapshot.val() != null){
                couponValue(snapshot.val());
            } else {
                couponValue(null);
            }
        });
    },
    couponProc: function(couponString, completion){
        discountCodeClass.getCurrentCouponEvent(couponEvent => {
            if (couponEvent == ""){
                completion("CouponTypes is not defined!");
                return;
            }
            discountCodeClass.getUserCampaignValid(couponEvent, returnString => {
                if (returnString == "OK"){
                    discountCodeClass.getCouponCampaignValid(couponEvent, validState => {
                        if (validState == "OK"){
                            discountCodeClass.getCouponValue(couponEvent, couponString, couponValue => {
                                if (couponValue == null){
                                    discountCodeClass.couponValue = -1;
                                    completion("兌換碼輸入無效");
                                } else {
                                    if (couponValue.valid == undefined || couponValue.valid == null || couponValue.valid == false){
                                        completion("該兌換碼已兌換");
                                    } else {
                                        discountCodeClass.couponValue = (couponValue.amount != undefined && couponValue.amount != null) ? couponValue.amount : 0;
                                        // TODO - Apply Coupon Proc
                                        discountCodeClass.applyCoupon(couponEvent, couponString, couponValue, result => {
                                            completion(result);
                                        });
                                    }
                                }
                            });
                        } else {
                            completion(validState);
                        }
                    });
                } else {
                    completion(returnString);
                }
            });
        });
    },
    isCourseCoupon: function(couponString, courseValue){
        // allCourseRef.once('value', function(snapshot){
        //     if (snapshot.val() == undefined || snapshot.val() == null){
        //         courseValue(null);
        //     } else {
        //         allCourses = snapshot.val();
        //         courseKeys = Object.keys(allCourses);
        //         isExist = false;
        //         for (i = 0; i < courseKeys.length; i++){
        //             course = allCourses[courseKeys[i]];
        //             if (course.couponId != undefined && course.couponId != null && course.couponId == couponString){
        //                 courseValue(course);
        //                 return;
        //             }
        //         }
        //         courseValue(null);
        //         return;
        //     }
        // });
        var realCouponString = '';
        if (couponString.substring(0, 3) != 'cId'){
            courseValue(null);
            return;
        } else {
            realCouponString = couponString.substring(3);
        }
        firebase.database().ref('AllCourses').child(realCouponString).once('value').then(function(snapshot){
            if (snapshot.val() == undefined || snapshot.val() == null){
                courseValue(null);
            } else {
                courseValue(snapshot.val());
            }
        });
    },
    isWacaCoupon: function(couponString, result){
        firebase.database().ref('WACA').child(couponString).once('value').then(function(snapshot){
            if (snapshot.val() == undefined || snapshot.val() == null){
                result(null);
            } else {
                result(snapshot.val());
            }
        });
    },
    applyCoupon: function(couponEvent, couponString, couponValue, completion){
        rewardAmount = (couponValue.amount != undefined && couponValue.amount != null) ? couponValue.amount : 0;
        discountCodeClass.changeRewardProc(couponEvent, couponString, rewardAmount, result => {
            if (result){
                firebase.database().ref('CouponLists').child(couponEvent).child(couponString).child('valid').set(false).then(function(){
                    completion("OK");
                });
            } else {
                completion("FAILED");
            }
        });
    },
    loadRewardPoint: function(uid, result) {
        firebase.database().ref('CashFlow').child(uid).child('Total').child('RewardPoints').once('value').then(function (snapshot) {
            if (snapshot == undefined || snapshot == null) {
                result(0);
            } else {
                if (snapshot.val() == undefined || snapshot.val() == null){
                    result(0);
                } else {
                    result(snapshot.val());
                }
            }
        });
    },
    changeRewardProc: function(couponEvent, couponString, rewardAmount, completion){
        if (myUserId == undefined || myUserId == null || myUserId == ""){
            console.log("Valid user id");
            completion(false);
            return;
        }
        discountCodeClass.loadRewardPoint(myUserId, currentPoint => {
            discountCodeClass.getUserCampaigns(usrCampaigns => {
                if (usrCampaigns.indexOf(couponEvent) == -1){
                    usrCampaigns.push(couponEvent);
                    firebase.database().ref('Users').child(myUserId).child('Campaigns').set(usrCampaigns);
                }
            });
            var cashHistoryKey = firebase.database().ref('CashFlow').child(myUserId).child('History').push().key;
            var serverCashFlowKey = firebase.database().ref('ServerCashFlow').push().key;
            newRewardPoint = currentPoint + rewardAmount;
            getFirebaseServerTimeStamp(result => {
                var cashHistory = {};
                var cashType = "Coupon: " + couponEvent + "-" + couponString;
                cashHistory = {
                    CashType: cashType,
                    Time: getDateStringFromTimestamp(result),
                    Uid: myUserId,
                    Unit: "點數",
                    Value: rewardAmount
                }
                firebase.database().ref('CashFlow').child(myUserId).child('History').child(cashHistoryKey).set(cashHistory);
                firebase.database().ref('ServerCashFlow').child(serverCashFlowKey).set(cashHistory);
                firebase.database().ref('CashFlow').child(myUserId).child('Total').child('RewardPoints').set(newRewardPoint);
                firebase.database().ref('Users').child(myUserId).child('RewardPoints').set(newRewardPoint);

                completion(true);
            });
        });
    }
}
