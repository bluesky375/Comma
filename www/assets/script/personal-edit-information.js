

var personalEditInformationClass = {
    dataUrl: '',
    pageName: '',
    initialize: function () {
        personalEditInformationClass.dataUrl = '';
        personalEditInformationClass.pageName = routerPageHistory[routerPageHistory.length - 1];
        personalEditInformationClass.showUserData();
        $('#select-gender').click(function (event) {
            event.stopPropagation()
            personalEditInformationClass.showGenderDialog();
        });
        $('#select-birthday').click(function (event) {
            event.stopPropagation()
            personalEditInformationClass.showBirthdayDialog();
        })
        $('.custom-overlay').click((event) => {
            personalEditInformationClass.hideBirthdayDialog();
            personalEditInformationClass.hideGenderDialog();
        });
        $('#save-profile').click(function (event) {
            personalEditInformationClass.saveProfile();
        });
        if (isDevice) {
            $('.upload-btn').click(function (event) {
                if(isDevice)
                window.cordova.plugins.firebase.analytics.logEvent("Setting_uploadphoto_click","");
                personalEditInformationClass.showSelectSourceDialog();
            });
        } else {
            $('.upload-btn').click(function (event) {
                console.log('Web open file');
                $('#open-file').trigger('click');
            });
            $('#open-file').click(function () {
                this.value = null;
            });
            $('#open-file').change(function (event) {
                personalEditInformationClass.handleFileRead(event);
            });
        }

        

        personalEditInformationClass.fixElementsStyle();
    },
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.confirm-btn').css('bottom', '70px');
        } else {
            $('.confirm-btn').css('bottom', '20px');
        }
    },
    showSelectSourceDialog: function () {
        $('body').append('\
        <div class="custom-overlay" id="select-source-dialog">\
            <div class="remove-popup">\
                <div class="top">\
                    <h5>請選擇</h5>\
                </div>\
                <ul>\
                    <li class="red"><a href="javascript:void(0);" id="gallary-button">照片圖庫</a></li>\
                    <li class="red"><a href="javascript:void(0);" id="capture-button">相機</a></li>\
                    <li><a href="javascript:void(0);" id="close-button">取消</a></li>\
                </ul>\
            </div>\
        </div>'
        );

        $('#gallary-button').click(function (event) {
            personalEditInformationClass.deviceOpenImageFromGallery();
        });
        $('#capture-button').click(function (event) {
            personalEditInformationClass.deviceCaptureImageFromCamera();
        });
        $('#close-button').click(function (event) {
            personalEditInformationClass.hideSelectSourceDialog();
        })
    },
    hideSelectSourceDialog: function () {
        $('#select-source-dialog').remove();
    },
    deviceOpenImageFromGallery: function () {
        $('#select-source-dialog').remove();
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true
        });
        function onSuccess(imageData) {
            imgSrc = "data:image/jpeg;base64," + imageData;
            console.log('Img src', imgSrc);
            personalEditInformationClass.croppieFromBase64(imgSrc);
        }
        function onFail(message) {
            console.log('Failed because: ' + message);
        }
    },
    deviceCaptureImageFromCamera: function () {
        $('#select-source-dialog').remove();
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            correctOrientation: true
        });
        function onSuccess(imageData) {
            imgSrc = "data:image/jpeg;base64," + imageData;
            personalEditInformationClass.croppieFromBase64(imgSrc);

        }
        function onFail(message) {
            console.log('Failed because: ' + message);
        }
    },
    croppieFromBase64: function (imgSrc) {
        // $('.container').append('\
        //     <div class="all-container">\
        //         <div class="img-container">\
        //             <img id="img-crop" style="width:100px; height: 100px;">\
        //         </div>\
        //     </div>\
        //     <div class="confirm-btn">\
        //         <div class="btn btn-primary btn-sm float-right" id="result-btn">Crop</button>\
        //     </div>\
        // ');
        $('.' + personalEditInformationClass.pageName).append('\
            <div class="all-container">\
                <div class="img-container">\
                    <img id="img-crop" style="width:100px; height: 100px;">\
                </div>\
            </div>\
            <div class="confirm-btn">\
                <div class="btn btn-primary btn-sm float-right" id="result-btn">Crop</button>\
            </div>\
        ');
        if (audioElement != null) {
            $('.confirm-btn').css('bottom', '70px');
        } else {
            $('.confirm-btn').css('bottom', '20px');
        }

        var basic = $('#img-crop').croppie({
            viewport: { width: 150, height: 150 },
            boundary: { width: 100, height: 400 }
        });
        basic.croppie('bind', { url: imgSrc });
        $("#result-btn").click(function (event) {
            basic.croppie('result', {
                type: 'rawcanvas',
                // size: { width: 300, height: 300 },
                format: 'jpeg'
            }).then(function (canvas) {
                personalEditInformationClass.imageCrop({ src: canvas.toDataURL() });
            });
        });
    },
    handleFileRead: function (event) {
        f = event.target.files[0];
        if (!f.type.match('image.*')) {
            console.log('This is not image file!');
            return;
        }

        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                $('.' + personalEditInformationClass.pageName).append('\
                    <div class="all-container">\
                        <div class="img-container">\
                            <img id="img-crop" style="width:100px; height: 100px;">\
                        </div>\
                    </div>\
                    <div class="confirm-btn">\
                        <div class="btn btn-primary btn-sm float-right" id="result-btn">Crop</button>\
                    </div>\
                ');
                var basic = $('#img-crop').croppie({
                    viewport: { width: 150, height: 150 },
                    boundary: { width: 100, height: 400 }
                });
                basic.croppie('bind', {
                    url: e.target.result
                });
                $("#result-btn").click(function (event) {
                    basic.croppie('result', {
                        type: 'rawcanvas',
                        // size: { width: 300, height: 300 },
                        format: 'jpeg'
                    }).then(function (canvas) {
                        personalEditInformationClass.imageCrop({ src: canvas.toDataURL() });
                    });
                });
            };
        })(f);
        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    },

    imageCrop: function (result) {
        var html;
        if (result.html) {
            html = result.html;
        }
        if (result.src) {
            html = result.src;
        }
        $('.all-container').remove();
        $('.confirm-btn').remove();
        $('#img-avatar').attr('src', html);
        personalEditInformationClass.dataUrl = html;

    },

    b64toBlob: function (b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    },
    appendFile: function () {
        if (base64Img == undefined || base64Img == null) {
            return;
        }
        ImageURL = base64Img;
        var block = ImageURL.split(";");
        var contentType = block[0].split(":")[1];
        var realData = block[1].split(",")[1];
        var blob = personalEditInformationClass.b64toBlob(realData, contentType);

    },

    showUserData: function () {

        if (myUserData.profileImageUrl != undefined && myUserData.profileImageUrl != null) {
            $('#img-avatar').attr('src', myUserData.profileImageUrl);
        }
        if (myUserData.name != undefined && myUserData.name != null) {
            $('#user-name' + personalEditInformationClass.pageName).val(myUserData.name);
        }
        if (myUserData.gender != undefined && myUserData.gender != null && myUserData.gender != "") {
            $('#div-gender').text(myUserData.gender);
        }
        if (myUserData.birthday != undefined && myUserData.birthday != null && myUserData.birthday != "") {
            $('#div-birthday').text(myUserData.birthday);
        }
    },

    hideCustomOverlayDialog: function () {
        $('.custom-overlay').remove();
    },
    showGenderDialog: function () {
        $('body').append('\
                <div class="choose-option">\
                    <ul>\
                    <li><a href="javascript:void(0);" id="select-male">男</a></li>\
                    <li><a href="javascript:void(0);" id="select-female">女</a></li>\
                    </ul>\
                    <ul class="single">\
                    <li><a href="javascript:void(0);" id="select-cancel">取消</a></li>\
                    </ul>\
                </div>\
                <div class="custom-overlay">\
                </div>'
        );
        $('#select-male').click(function (event) {
            $('#div-gender').text('男');
            personalEditInformationClass.hideGenderDialog();
        });
        $('#select-female').click(function (event) {
            $('#div-gender').text('女');
            personalEditInformationClass.hideGenderDialog();
        });
        $('#select-cancel').click(function (event) {
            personalEditInformationClass.hideGenderDialog();
        });
    },
    hideGenderDialog: function () {
        $('.custom-overlay').remove();
        $('.choose-option').remove();
    },

    showBirthdayDialog: function () {
        currentBirthdayText = $('#div-birthday').text();
        if (currentBirthdayText == "尚未設定") {
            currentBirthdayText = "";
        }
        currentValues = (currentBirthdayText != "") ? currentBirthdayText.toDate() : [];
        $('body').append('\
                <div class="choose-date">\
                    <button type="button" class="cancle" id="btn-cancel">取消</button>\
                    <button type="button" class="accepx" id="btn-accept">確定</button>\
                    <div class="row no-gutters">\
                        <div class="col-4">\
                            <select class="custom-select" id="select-date"><option value="0">Day</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30" selected="1">30</option><option value="31">31</option></select>\
                        </div>\
                            <div class="col-4">\
                        <select class="custom-select" id="select-month"><option value="0">Month</option><option value="1">Jan</option><option value="2">Feb</option><option value="3">Mar</option><option value="4" selected="1">Apr</option><option value="5">May</option><option value="6">Jun</option><option value="7">Jul</option><option value="8">Aug</option><option value="9">Sep</option><option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option></select>\
                            </div>\
                        <div class="col-4">\
                            <select class="custom-select" id="select-year"><option value="0">Year</option><option value="2019">2019</option><option value="2018">2018</option><option value="2017">2017</option><option value="2016">2016</option><option value="2015">2015</option><option value="2014">2014</option><option value="2013">2013</option><option value="2012">2012</option><option value="2011">2011</option><option value="2010">2010</option><option value="2009">2009</option><option value="2008">2008</option><option value="2007">2007</option><option value="2006">2006</option><option value="2005">2005</option><option value="2004">2004</option><option value="2003">2003</option><option value="2002">2002</option><option value="2001">2001</option><option value="2000">2000</option><option value="1999">1999</option><option value="1998">1998</option><option value="1997">1997</option><option value="1996">1996</option><option value="1995">1995</option><option value="1994" selected="1">1994</option><option value="1993">1993</option><option value="1992">1992</option><option value="1991">1991</option><option value="1990">1990</option><option value="1989">1989</option><option value="1988">1988</option><option value="1987">1987</option><option value="1986">1986</option><option value="1985">1985</option><option value="1984">1984</option><option value="1983">1983</option><option value="1982">1982</option><option value="1981">1981</option><option value="1980">1980</option><option value="1979">1979</option><option value="1978">1978</option><option value="1977">1977</option><option value="1976">1976</option><option value="1975">1975</option><option value="1974">1974</option><option value="1973">1973</option><option value="1972">1972</option><option value="1971">1971</option><option value="1970">1970</option><option value="1969">1969</option><option value="1968">1968</option><option value="1967">1967</option><option value="1966">1966</option><option value="1965">1965</option><option value="1964">1964</option><option value="1963">1963</option><option value="1962">1962</option><option value="1961">1961</option><option value="1960">1960</option><option value="1959">1959</option><option value="1958">1958</option><option value="1957">1957</option><option value="1956">1956</option><option value="1955">1955</option><option value="1954">1954</option><option value="1953">1953</option><option value="1952">1952</option><option value="1951">1951</option><option value="1950">1950</option><option value="1949">1949</option><option value="1948">1948</option><option value="1947">1947</option><option value="1946">1946</option><option value="1945">1945</option><option value="1944">1944</option><option value="1943">1943</option><option value="1942">1942</option><option value="1941">1941</option><option value="1940">1940</option><option value="1939">1939</option><option value="1938">1938</option><option value="1937">1937</option><option value="1936">1936</option><option value="1935">1935</option><option value="1934">1934</option><option value="1933">1933</option><option value="1932">1932</option><option value="1931">1931</option><option value="1930">1930</option><option value="1929">1929</option><option value="1928">1928</option><option value="1927">1927</option><option value="1926">1926</option><option value="1925">1925</option><option value="1924">1924</option><option value="1923">1923</option><option value="1922">1922</option><option value="1921">1921</option><option value="1920">1920</option><option value="1919">1919</option><option value="1918">1918</option><option value="1917">1917</option><option value="1916">1916</option><option value="1915">1915</option><option value="1914">1914</option><option value="1913">1913</option><option value="1912">1912</option><option value="1911">1911</option><option value="1910">1910</option><option value="1909">1909</option><option value="1908">1908</option><option value="1907">1907</option><option value="1906">1906</option><option value="1905">1905</option></select>\
                        </div>\
                    </div>\
                </div>\
                <div class="custom-overlay">\
                </div>'
        );
        if (currentValues.length > 0) {
            $('#select-month').val("" + currentValues[0]);
            $('#select-date').val("" + currentValues[1]);
            $('#select-year').val("" + currentValues[2]);
        } else {
            $('#select-month').val("1");
            $('#select-date').val("1");
            $('#select-year').val("1980");
        }
        $('#btn-cancel').click(function (event) {
            personalEditInformationClass.hideBirthdayDialog();
        });
        $('#btn-accept').click(function (event) {
            year = $('#select-year').val();
            month = $('#select-month').val();
            date = $('#select-date').val();
            if (year == 0 || month == 0 || date == 0) {
                personalEditInformationClass.hideBirthdayDialog();
                return;
            }
            var d = new Date(year + "-" + month + "-" + date);
            $('#div-birthday').text(d.toShortFormat());
            personalEditInformationClass.hideBirthdayDialog();
        });
    },
    hideBirthdayDialog: function () {
        $('.custom-overlay').remove();
        $('.choose-date').remove();
    },

    saveProfile: function () {

        showLoadingDialogWithText('更新中...');

        if (personalEditInformationClass.dataUrl == undefined || personalEditInformationClass.dataUrl == null || personalEditInformationClass.dataUrl == '') {
            personalEditInformationClass.updateProfileData("");
        } else {
            personalEditInformationClass.uploadImageFile(result => {
                personalEditInformationClass.updateProfileData(result);
            });
        }
    },

    uploadImageFile: function (result) {
        uid = myUserData.uid;
        firebase.storage().ref('profileImages').child(uid).putString(personalEditInformationClass.dataUrl, 'data_url').then(function (snapshot) {
            if (snapshot.state == 'success') {
                snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    result(downloadURL);
                }).catch(function (error) {
                    result("");
                });
            }
        }).catch(function (error) {
            console.log(error);
            result("");
        });
    },

    updateProfileData: function (picUrl) {
        var uid = myUserData.uid;
        if (uid == undefined || uid == null || uid == "") {
            console.log("Uid is empty!");
            hideLoadingDialog();
            return;
        }
        name = $('#user-name' + personalEditInformationClass.pageName).val();
        var now = new Date().getTime();
        UpdatedAt = getDateStringFromTimestamp(now);
        gender = $('#div-gender').text();
        birthday = $('#div-birthday').text();
        if (birthday == '尚未設定') birthday = "";

        var user;
        if (picUrl == "") {
            user = {
                UpdatedAt: UpdatedAt,
                name: name,
                birthday: birthday,
                gender: gender
            }
        } else {
            user = {
                UpdatedAt: UpdatedAt,
                name: name,
                birthday: birthday,
                gender: gender,
                profileImageUrl: picUrl
            }
        }
        uploadCnt = ((picUrl != "" && picUrl != myUserData.profileImageUrl) || name != myUserData.name) ? 3 : 1;
        if ((picUrl != "" && picUrl != myUserData.profileImageUrl) || name != myUserData.name) {
            personalEditInformationClass.updateDiscussUserData(user, completion => {
                uploadCnt--;
                if (!uploadCnt) {
                    hideLoadingDialog();
                    onBackPage();
                }
            });
            personalEditInformationClass.updateDiscussCommentUserData(user, completion => {
                uploadCnt--;
                if (!uploadCnt) {
                    hideLoadingDialog();
                    onBackPage();
                }
            });
        }
        firebase.database().ref().child('Users').child(uid).update(user).then(() => {
            uploadCnt--;
            if (!uploadCnt) {
                hideLoadingDialog();
                onBackPage();
            }
        }).catch((error) => {
            console.log(error);
        });

    },

    updateDiscussUserData: function (userData, completion) {
        var disucssRef = firebase.database().ref('Discuss');
        disucssRef.once('value').then(function (snapshot) {
            discussData = snapshot.val();
            if (discussData == undefined || discussData == null) {
                completion(true);
                return;
            }

            courseKeyList = Object.keys(discussData);

            for (i = 0; i < courseKeyList.length; i++) {
                courseKey = courseKeyList[i];
                discussObject = discussData[courseKey];
                discussKeyList = Object.keys(discussObject);
                for (j = 0; j < discussKeyList.length; j++) {
                    discussKey = discussKeyList[j];
                    discuss = discussObject[discussKey];
                    if (discuss.userId != undefined && discuss.userId != null &&
                        myUserData.uid != undefined && myUserData.uid != null &&
                        discuss.userId == myUserData.uid) {
                        if (userData.profileImageUrl != undefined && userData.profileImageUrl != null) {
                            disucssRef.child(courseKey).child(discussKey).child('userImage').set(userData.profileImageUrl);
                        }
                        if (userData.name != undefined && userData.name != null) {
                            disucssRef.child(courseKey).child(discussKey).child('userName').set(userData.name);
                        }
                    }
                }
            }
            completion(true);
        });
    },

    updateDiscussCommentUserData: function (userData, completion) {

        var disucssCommentRef = firebase.database().ref('DiscussComments');
        disucssCommentRef.once('value').then(function (snapshot) {
            discussCommentData = snapshot.val();
            if (discussCommentData == undefined || discussCommentData == null) {
                completion(true);
                return;
            }
            courseKeyList = Object.keys(discussCommentData);
            for (i = 0; i < courseKeyList.length; i++) {
                courseKey = courseKeyList[i];
                discusses = discussCommentData[courseKey];
                discussKeyList = Object.keys(discusses);
                for (j = 0; j < discussKeyList.length; j++) {
                    discussKey = discussKeyList[j];
                    discuss = discusses[discussKey];
                    commentKeyList = Object.keys(discuss);
                    for (k = 0; k < commentKeyList.length; k++) {
                        commentKey = commentKeyList[k];
                        comment = discuss[commentKey];
                        if (comment.userId != undefined && comment.userId != null &&
                            myUserData.uid != undefined && myUserData.uid != null &&
                            comment.userId == myUserData.uid) {
                            if (userData.profileImageUrl != undefined && userData.profileImageUrl != null) {
                                disucssCommentRef.child(courseKey).child(discussKey).child(commentKey).child('userImage').set(userData.profileImageUrl);
                            }
                            if (userData.name != undefined && userData.name != null) {
                                disucssCommentRef.child(courseKey).child(discussKey).child(commentKey).child('userName').set(userData.name);
                            }
                        }
                    }
                }
            }
            completion(true);
        });
    }
}

