

var storeValueCenterClass = {
    submit_available: false,
    pageName: '',
    pointType: [],
    initialize: function () {

        storeValueCenterClass.submit_available = false;
        storeValueCenterClass.pageName = routerPageHistory[routerPageHistory.length - 1];


        showLoadingDialogWithText("");
        downloadCnt = 2;
        storeValueCenterClass.loadPointsType(pointTypeList => {

            storeValueCenterClass.pointType = pointTypeList;
            if (pointTypeList == []){
                console.log("Point type is empty!");
            } else {
                storeValueCenterClass.showPointOption(pointTypeList);
            }

            downloadCnt--;
            if (!downloadCnt){
                hideLoadingDialog();
                storeValueCenterClass.setupUI();
            }
        });

        storeValueCenterClass.loadPointAdvice(isDevice ? 1 : 0, pointAdvice => {

            pointAdvice = pointAdvice.replace('「意見反饋」', '「<span style="color:#1fbfb3; cursor: pointer;" id="goto-feedback">意見反饋</span>」');
            var html = '';
            blocks = pointAdvice.split('\\n');
            if (blocks.length == 0){
                return;
            }
            html += '<p>' + blocks[0] + '</p>';
            html += '<ol>';
            for (i = 1; i < blocks.length; i++){
                html += '<li>' + blocks[i] + '</li>';
            }
            html += '</ol>';
            $('.store-value-content').append(html);
            downloadCnt--;
            if (!downloadCnt){
                hideLoadingDialog();
                storeValueCenterClass.setupUI();
            }
            $('#goto-feedback').click(function(evt){
                feedbackPage();
            });
        });

        storeValueCenterClass.showHtml();
        storeValueCenterClass.fixElementsStyle();
        
    },
    setupUI: function(){
        $('input[name=rr]').click(function (event) {
            id = event.target.id;
            index = parseInt(id.substring(1));
            cash = 0;
            if (isDevice){
                cash = (storeValueCenterClass.pointType[index].cashAndroid != undefined && storeValueCenterClass.pointType[index].cashAndroid != null) ? storeValueCenterClass.pointType[index].cashAndroid : 0;
                rwd=(storeValueCenterClass.pointType[index].rewardAndroid != undefined && storeValueCenterClass.pointType[index].rewardAndroid != null) ? storeValueCenterClass.pointType[index].rewardAndroid : 0;
                window.cordova.plugins.firebase.analytics.logEvent("pointcenter_"+rwd+"point_click","");

            } else {
                cash = (storeValueCenterClass.pointType[index].cashWeb != undefined && storeValueCenterClass.pointType[index].cashWeb != null) ? storeValueCenterClass.pointType[index].cashWeb : 0;
            }
            if (!cash){
                console.log("Cash is O");
                return;
            }
            $('#Amt').val(cash);

            storeValueCenterClass.submit_available = true;
            storeValueCenterClass.submitButtonState();
        });

        $('#button_submit').click(function (event) {
            if(isDevice)
            window.cordova.plugins.firebase.analytics.logEvent("Pointcenter_buynow_click","");
            storeValueCenterClass.submit();
        });
    },
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },
    submitButtonState: function () {
        if (storeValueCenterClass.submit_available){
            $('#button_submit').css({background: "rgb(31, 191, 179) none repeat scroll 0% 0%"});
        }
    },
    loadPointsType: function(completion){
        firebase.database().ref('PointsType').once('value').then(function(snapshot){
            if (snapshot.val() != undefined && snapshot.val() != null){
                completion(snapshot.val());
            } else {
                completion([]);
            }
        });
    },
    showPointOption: function(pointTypeList){

        var html = '';
        for (i = 0; i < pointTypeList.length; i++){
            pointType = pointTypeList[i];
            cash = 0;
            reward = 0;
            if (isDevice){
                cash = (pointType.cashAndroid != undefined && pointType.cashAndroid != null) ? pointType.cashAndroid : 0;
                reward = (pointType.rewardAndroid != undefined && pointType.rewardAndroid != null) ? pointType.rewardAndroid : 0;
            } else {
                cash = (pointType.cashWeb != undefined && pointType.cashWeb != null) ? pointType.cashWeb : 0;
                reward = (pointType.rewardWeb != undefined && pointType.rewardWeb != null) ? pointType.rewardWeb : 0;
            }
            html += '\
                <div class="col-6">\
                <input type="radio" id="r'+ i +'" name="rr" />\
                <label for="r' + i +'"><span class="point">' + reward + '點</span><span class="amount">$ ' + cash + '</span></label>\
            </div>';
        }

        $('.choose-plan .row').append(html);
    },
    submit: function () {
        console.log('Is Device: ', isDevice);
        timestamp = Math.floor(Date.now() / 1000);
        loginform["TimeStamp"].value = "" + timestamp;
        loginform["MerchantOrderNo"].value = "S_" + timestamp;

        storeValueCenterClass.aesEncrypt();
        merchantOrderNo = $('#MerchantOrderNo').val();
        var merchantInfo = {
            TimeStamp: $('#TimeStamp').val(),
            MerchantOrderNo: merchantOrderNo,
            Amt: $('#Amt').val(),
            ItemDesc: $('#ItemDesc').val(),
            userId: myUserId,
            DeviceType: isDevice ? 1 : 0
        }
        showLoadingDialogWithText("請稍等...");
        firebase.database().ref('MerchantInfo').child(merchantOrderNo).set(merchantInfo, function(err){
            hideLoadingDialog();
            if (err){
                showLogInErrorDialogWithText('請檢查網路連線');
                setTimeout(hideErrorDialog, 2000);        
            } else {
                if (isDevice){
                    $('#loginform').attr('action', 'javascript:void(0);');

                    var pageContent = '<html><head></head><body><form action="https://core.newebpay.com/MPG/mpg_gateway" id="loginForm" method="POST" target="theWindow">' + $('#loginform').html() +'</form><script type="text/javascript">document.getElementById("loginForm").submit();</script></body></html>'; // Demo
                    // var pageContent = '<html><head></head><body><form action="https://ccore.newebpay.com/MPG/mpg_gateway" id="loginForm" method="POST" target="theWindow">' + $('#loginform').html() +'</form><script type="text/javascript">document.getElementById("loginForm").submit();</script></body></html>'; // Release
                    var pageContentUrl = 'data:text/html;base64,' + btoa(unescape(encodeURIComponent(pageContent)));

                    var ref = window.cordova.InAppBrowser.open(
                        pageContentUrl ,
                        "_blank",
                        "hidden=no,location=no,clearsessioncache=yes,clearcache=yes"
                    );

                    ref.addEventListener( "loadstop", function(){
                        if(isDevice)
                        window.cordova.plugins.firebase.analytics.logEvent("Pointcenter_buynow_popup","");

                        var loop = window.setInterval(function(){
                            ref.executeScript({
                                    code: "window.shouldClose"
                                },
                                function(values){
                                    if(values[0]){
                                      ref.close();
                                      window.clearInterval(loop);
                                    }
                                }
                            );
                        },100);
                    });
                } else {
                    var popup = window.open('','theWindow','height=600,width=800,left=100,top=100,resizable=no,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no, status=yes');
                    loginform.submit();
                }
            }
        });


    },
    showHtml: function () {
        if (!isAccountMode) {
            return;
        }
        storeValueCenterClass.loadRewardPoint(myUserId, data => {
            $('.points').text('' + data + '點');
        });
    },
    loadRewardPoint: function(uid, result) {
        firebase.database().ref('CashFlow').child(uid).child('Total').child('RewardPoints').on('value', function (snapshot) {
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
    loadPointAdvice: function(deviceType ,result){
        var pointAdviceKey = '';
        switch (deviceType){
            case 0:
                pointAdviceKey = 'PointsAdviceWeb';
                break;
            case 1:
                pointAdviceKey = 'PointsAdviceAndroid';
                break;
            default:
                break;
        }
        if (pointAdviceKey == ''){
            result('');
            return;
        }
        firebase.database().ref(pointAdviceKey).once('value').then(function(snapshot){
            if (snapshot.val() != undefined && snapshot.val() != null){
                result(snapshot.val());
            } else {
                result('');
            }
        });
    },
    loadUserInfo: function (uid, data) {
        firebase.database().ref('/Users/' + uid + '/').on('value', function (snapshot) {
            if (snapshot != undefined && snapshot != null) {
                data(snapshot.val());
            } else {
                data({});
            }
        });
    },
    aesEncrypt: function(){
        var param = {
            MerchantID: $('#MerchantID').val(),
            RespondType: $('#RespondType').val(),
            TimeStamp: $('#TimeStamp').val(),
            Version: $('#Version').val(),
            MerchantOrderNo: $('#MerchantOrderNo').val(),
            Amt: $('#Amt').val(),
            ItemDesc: $('#ItemDesc').val()
        }
        buildQuery = storeValueCenterClass.getBuildQuery(param);
        paddingStr = storeValueCenterClass.addPadding(buildQuery, 32);
        key_str = "LTZFJ4rFjEww4SNO79zGaxXhurr6Xqtc";   // Release
        iv_str = "PPZy0BC9hX1ho9KC";                    // Release
        // key_str = "xi2ZfMKWX4PuYaUKmEYd7i1mk7tWOceA"; // Test
        // iv_str = "C8VojQNvMkLdKlXP";                 // Test
        var key = aesjs.utils.utf8.toBytes(key_str);
        var iv = aesjs.utils.utf8.toBytes(iv_str);
        var textBytes = aesjs.utils.utf8.toBytes(paddingStr);
    
    
        var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
        var encryptedBytes = aesCbc.encrypt(textBytes);
    
        var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    
        var TradeInfoTest = "" + encryptedHex;
        var TradeShaTest = "HashKey=" + key_str + "&" + TradeInfoTest + "&HashIV=" + iv_str;
    
        TradeSha = (sha256(TradeShaTest)).toUpperCase();
        $('#trade-info').val(TradeInfoTest);
        $('#trade-sha').val(TradeSha);
    },
    getBuildQuery: function(parameter){
        return jQuery.param(parameter);
    },    
    addPadding: function(data, blocksize){
        len = data.length;
        pad = blocksize - (len % blocksize);
        data = data + String.fromCharCode(pad).repeat(pad);
        return data;
    }
}
