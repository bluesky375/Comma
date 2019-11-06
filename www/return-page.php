<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>


    <div id="result">
    </div>

    <!-- Firebase Module -->
    <script src="https://www.gstatic.com/firebasejs/6.0.2/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/6.0.2/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/6.0.2/firebase-database.js"></script>
    <script src="https://www.gstatic.com/firebasejs/6.0.2/firebase-functions.js"></script>


    <!-- AES Module -->
    <script src="aes.js"></script>
    <script src="sha256.js"></script>


    <script>
        var config = {
            apiKey: "AIzaSyCEhVXgDeIcTFPXHFLWKtsoLLdWYhQEu_Y",
            authDomain: "talktek-dev.firebaseio.com",
            databaseURL: "https://talktek-dev.firebaseio.com",
            projectId: "talktek-dev",
        };
        firebase.initializeApp(config);


        var status = '<?php echo $_POST["Status"];?>';

        var tradeInfo;
        var MerchantOrderNo;
        var PaymentMethod;
        var result;
        if (status != "SUCCESS"){
            document.getElementById("result").innerHTML = "<p>Payment failed!</p>";
            setTimeout(function(){
                window.shouldClose=true;
                window.close();
            }, 1500);
        } else {
            main_proc();
        }


        function main_proc(){
            result = '<?php echo $_POST["TradeInfo"];?>'; // TradeInfo

            tradeInfo = aesDecrypt(result);
            MerchantOrderNo = tradeInfo.Result.MerchantOrderNo;
            PaymentMethod = tradeInfo.Result.PaymentMethod;


            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    processFunc();
                } else {
                    firebase.auth().signInAnonymously().catch(function(error) {
                    });
                }
            });
        }

        function processFunc(){
            
            if (status != "SUCCESS"){
                document.getElementById("result").innerHTML = "<p>Payment failed!</p>";
                setTimeout(function(){
                    window.shouldClose=true;
                    window.close();
                }, 1500);
                return;
            }

            document.getElementById("result").innerHTML = "<p>Payment successed!</p><p>Please wait...</p>";


            getMerchantInfo(MerchantOrderNo, result => {

                if (result != null) {
                    firebase.database().ref('MerchantInfo').child(MerchantOrderNo).child('Status').set("SUCCESS");
                    uid = result.userId;
                    deviceType = (result.DeviceType != undefined && result.DeviceType != null) ? result.DeviceType : 0;
                    if (uid != undefined && uid != null){
                        addRewardPoint(uid, deviceType, tradeInfo.Result.Amt);
                    } else {
                        window.shouldClose=true;
                        window.close();

                    }
                }
            });
        }

        function loadPointType(result){
            firebase.database().ref('PointsType').once('value').then(function(snapshot){
                if (snapshot.val() != undefined && snapshot.val() != null){
                    result(snapshot.val());
                } else {
                    result([]);
                }
            });
        }

        function getMerchantInfo(merchantId, result) {
            firebase.database().ref('MerchantInfo').child(merchantId).once('value').then(function (snapshot) {
                result(snapshot.val());
            });
        }
        function addRewardPoint(uid, deviceType, cost) {

            firebase.database().ref('PointsType').once('value').then(function(snapshot){
                if (snapshot.val() != undefined && snapshot.val() != null){
                    pointTypeList = snapshot.val();
                    reward = 0;
                    for (i = 0; i < pointTypeList.length; i++){
                        pointType = pointTypeList[i];
                        if (deviceType == 0){
                            if (pointType.cashWeb != undefined && pointType.cashWeb != null && pointType.cashWeb == cost){
                                reward = pointType.rewardWeb;
                            }
                        } else {
                            if (pointType.cashAndroid != undefined && pointType.cashAndroid != null && pointType.cashAndroid == cost){
                                reward = pointType.rewardAndroid;
                            }
                        }
                    }
                    loadRewardPoint(uid, function(currentRewardPoint){
                        addRewardProgress(uid, reward, currentRewardPoint, PaymentMethod, function(completion){
                            window.shouldClose=true;
                            window.close();
                        });
                    });
                } else {
                    window.shouldClose=true;
                    window.close();
                }
            });
        }

        function loadRewardPoint(uid, result) {
            firebase.database().ref('CashFlow').child(uid).child('Total').child('RewardPoints').once('value').then(function (snapshot) {
                if (snapshot == undefined || snapshot == null) {
                    result(0);
                } else {
                    if (snapshot.val() == null){
                        result(0);
                    } else {
                        result(snapshot.val());
                    }
                }
            });
        }

        function addRewardProgress(uid, price, currentRewardPoint, paymentMethod, completion) {
            if (uid == '') {
                return;
            }
            var cashHistoryKey = firebase.database().ref('CashFlow').child(uid).child('History').push().key;
            var serverCashFlowKey = firebase.database().ref('ServerCashFlow').push().key;
            price = price;
            getFirebaseServerTimeStamp(time => {
                var cashHistory = {};
                var cashType = paymentMethod;
                cashHistory = {
                    CashType: cashType,
                    Time: getDateStringFromTimestamp(time),
                    Uid: uid,
                    Unit: "台幣",
                    Value: price
                }
                firebase.database().ref('CashFlow').child(uid).child('History').child(cashHistoryKey).set(cashHistory);
                firebase.database().ref('ServerCashFlow').child(serverCashFlowKey).set(cashHistory);

                newRewardPoint = currentRewardPoint + price;
                firebase.database().ref('CashFlow').child(uid).child('Total').child('RewardPoints').set(newRewardPoint);
                firebase.database().ref('Users').child(uid).child('RewardPoints').set(newRewardPoint);

                setTimeout(function(){
                    completion(true);
                }, 200);
            });
    
        }

        function getFirebaseServerTimeStamp(result) {
            firebase.database().ref('/.info/serverTimeOffset')
                .once('value')
                .then(function stv(data) {
                    result(data.val() + Date.now());
                }, function (err) {
                    result(-1);
                });
        }
        function getDateStringFromTimestamp(timestamp){
            if (timestamp == -1){
                return "0000-00-00 00:00:00";
            }
            var createdDate = new Date(timestamp);
            var year = createdDate.getFullYear();
            var month = '' + (createdDate.getMonth()+1);
            if (month.length < 2) month = '0' + month;
            var date = '' + createdDate.getDate();
            if (date.length < 2) date = '0' + date;
            var hour = '' + createdDate.getHours();
            if (hour.length < 2) hour = '0' + hour;
            var minute = '' + createdDate.getMinutes();
            if (minute.length < 2) minute = '0' + minute;
            var second = '' + createdDate.getSeconds();
            if (second.length < 2) second = '0' + second;
            var string = year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
            return string;
        }
        function aesDecrypt(text){
            key_str = "LTZFJ4rFjEww4SNO79zGaxXhurr6Xqtc";   // Release
            iv_str = "PPZy0BC9hX1ho9KC";                    // Release
            // key_str = "xi2ZfMKWX4PuYaUKmEYd7i1mk7tWOceA"; // Test
            // iv_str = "C8VojQNvMkLdKlXP";                 // Test

            var key = aesjs.utils.utf8.toBytes(key_str);
            var iv = aesjs.utils.utf8.toBytes(iv_str);

            // var text = "f150b00ff9f1b0aba7d07bb6c9a533952d1a1e28fb4ee833f287d2bc4cf61f6af96f78e2bff8f13fc39c6092722db8ae90fa6b90cb776193faba9e7be4c8d8b83435916200709e2de9beb5ffd1e3c0166b4922d21d86fc7e874fed0892b4336d5061aae2788db03185201abd4e1ee29313d864c57aff12ba5abfe1759732c0b15832ea609ad3a5ccf69d43e25678a72fd550f05e935dc570eb1c9990f9dfca898ae555d248d3de5bf68049ab0c5654afaf65bd5066d2728a27996e3f10e01090d236f05179f2c07e07fc1c7ae7982f333539bd040d7648215a307334e7e00a7189031ed2c4096f12b2023ef92a469a81296d4bdc3cf48edfab86950cccce484b382041a7617cf2c75535073a0b0a2a1ad0467d79d57b6166909a520a4149f9b34bdae70d6a1d8c39dbaffdd8e81838d201bd6bae9eaabc02167b52109025f5a116596fb19ba2815e609bb3158f158faa0cd7d62f9001ee537dfcb806cc3dae4c99f38421cdb8abb47f96a83a858e86536ebcb40b213e68c8a4e68facb84527d381ce63c67f8b9b554addc4b952b1419a18844087f1108932b77cec8e79fd8d659dffc3c115c89941bba33ad70f11ff0c179d77a17ad95e10bf5fa51fd402de06a5b3138674bc510adcac52541e010bebdc7179e9697d5581219c2d5eb2ed8989";

            encryptedBytes = aesjs.utils.hex.toBytes(text);
            var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
            var decryptedBytes = aesCbc.decrypt(encryptedBytes);

            var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
            response = JSON.parse(strippadding(decryptedText));
            return response;
        }

        function strippadding(data){
            var n = data.slice(-1).charCodeAt(0);
            data = data.substring(0, data.length - n);
            return data;
        }
    </script>
</body>


</html>