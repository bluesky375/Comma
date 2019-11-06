firebase.initializeApp(config);


var functions = firebase.functions();

$(document).ready(function(){

    aesEncrypt();
    // $('input').keyup(function(){
    //     aesEncrypt();
    // });

    // aesDecryptTest();
    // timestamp = Math.floor(Date.now() / 1000);
    // $("#TimeStamp").val("" + timestamp).trigger("input");;
    // $("#MerchantOrderNo").val("S_" + timestamp).trigger("input");;

    // console.log(loginform);

    // loginform["TimeStamp"].trigger();
    // loginform["MerchantOrderNo"].trigger();
    $('#btn-buy').click(function(evt){

        timestamp = Math.floor(Date.now() / 1000);
        loginform["TimeStamp"].value = "" + timestamp;
        loginform["MerchantOrderNo"].value = "S_" + timestamp;
        aesEncrypt();
    
        // console.log(loginform);
        // loginform["TimeStamp"].value = "" + timestamp;
        // loginform["MerchantOrderNo"].value = "S_" + timestamp;

        merchantOrderNo = $('#MerchantOrderNo').val();
    
        var merchantInfo = {
            TimeStamp: $('#TimeStamp').val(),
            MerchantOrderNo: merchantOrderNo,
            Amt: $('#Amt').val(),
            ItemDesc: $('#ItemDesc').val(),
            userId: "yOQkAWz9vMXaVmtsMG1m8wOJQFt1"
        }
        showLoadingDialogWithText("請稍等...");
        firebase.database().ref('MerchantInfo').child(merchantOrderNo).set(merchantInfo, function(err){
            hideLoadingDialog();
            if (err){
                showLogInErrorDialogWithText('請檢查網路連線');
                setTimeout(hideErrorDialog, 2000);        
            } else {
                console.log(merchantOrderNo);

                var popup = window.open('','theWindow','height=600,width=800,left=100,top=100,resizable=no,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no, status=yes');
                // $('#loginform').submit();   
                loginform.submit();     
            }
        });

    });
    // function DoSubmit(){
    //     $('#login-form').MerchantOrderNo.val('S_' + Math.floor(Date.now() / 1000));
    //     return true;
    // }
    $('#btn_submit').click(function(evt){
        window.open('http://comma.ml-codesign.com/www/mail/return-page.php','popUpWindow','height=600,width=800,left=100,top=100,resizable=no,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no, status=yes');
        // window.open('https://ccore.newebpay.com/MPG/mpg_gateway','popUpWindow','height=600,width=800,left=100,top=100,resizable=no,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no, status=yes');
        $('#login-form').submit();
    });

});

function aesEncrypt(){
    var param = {
        MerchantID: $('#MerchantID').val(),
        RespondType: $('#RespondType').val(),
        TimeStamp: $('#TimeStamp').val(),
        Version: $('#Version').val(),
        MerchantOrderNo: $('#MerchantOrderNo').val(),
        Amt: $('#Amt').val(),
        ItemDesc: $('#ItemDesc').val()
    }
    buildQuery = getBuildQuery(param);
    paddingStr = addPadding(buildQuery, 32);

    key_str = "LTZFJ4rFjEww4SNO79zGaxXhurr6Xqtc"; // Release
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
}

function getBuildQuery(parameter){
    return jQuery.param(parameter);
}

function addPadding(data, blocksize){
    len = data.length;
    pad = blocksize - (len % blocksize);
    data = data + String.fromCharCode(pad).repeat(pad);

    return data;
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };


function aesDecryptTest(){
    key_str = "xi2ZfMKWX4PuYaUKmEYd7i1mk7tWOceA";
    iv_str = "C8VojQNvMkLdKlXP";
    var key = aesjs.utils.utf8.toBytes(key_str);
    var iv = aesjs.utils.utf8.toBytes(iv_str);

    var text = "f150b00ff9f1b0aba7d07bb6c9a533952d1a1e28fb4ee833f287d2bc4cf61f6af96f78e2bff8f13fc39c6092722db8ae90fa6b90cb776193faba9e7be4c8d8b83435916200709e2de9beb5ffd1e3c0166b4922d21d86fc7e874fed0892b4336d5061aae2788db03185201abd4e1ee29313d864c57aff12ba5abfe1759732c0b15832ea609ad3a5ccf69d43e25678a72fd550f05e935dc570eb1c9990f9dfca898ae555d248d3de5bf68049ab0c5654afaf65bd5066d2728a27996e3f10e01090d236f05179f2c07e07fc1c7ae7982f333539bd040d7648215a307334e7e00a7189031ed2c4096f12b2023ef92a469a81296d4bdc3cf48edfab86950cccce484b382041a7617cf2c75535073a0b0a2a1ad0467d79d57b6166909a520a4149f9b34bdae70d6a1d8c39dbaffdd8e81838d201bd6bae9eaabc02167b52109025f5a116596fb19ba2815e609bb3158f158faa0cd7d62f9001ee537dfcb806cc3dae4c99f38421cdb8abb47f96a83a858e86536ebcb40b213e68c8a4e68facb84527d381ce63c67f8b9b554addc4b952b1419a18844087f1108932b77cec8e79fd8d659dffc3c115c89941bba33ad70f11ff0c179d77a17ad95e10bf5fa51fd402de06a5b3138674bc510adcac52541e010bebdc7179e9697d5581219c2d5eb2ed8989";

    encryptedBytes = aesjs.utils.hex.toBytes(text);
    var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    var decryptedBytes = aesCbc.decrypt(encryptedBytes);

    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    console.log(decryptedText);
    response = JSON.parse(strippadding(decryptedText));
    console.log(response);
}

function strippadding(data){
    var n = data.slice(-1).charCodeAt(0);
    data = data.substring(0, data.length - n);
    return data;
}

// function strippadding($string) {

//     $slast = ord(substr($string, -1));
// $slastc = chr($slast);
// $pcheck = substr($string, -$slast);
// if (preg_match("/$slastc{" . $slast . "}/", $string)) {
// $string = substr($string, 0, strlen($string) - $slast);
// return $string; } else {
// return false; }
// }