
var aboutCommaClass = {
    initialize: function(){

        aboutCommaClass.loadTerms(terms => {
            result = '';

            terms = terms.replaceAll('|||', '&ensp;');
            terms = terms.replaceAll('\t\t', '&ensp;');
            terms = terms.replaceAll('&ensp;|', '&ensp;');
            terms = terms.replaceAll('&ensp;\t', '&ensp;');
            
            blocks = terms.split('\\n');
            for (i = 0; i < blocks.length; i++){
                result += '<p style="white-space: pre-line; word-break: break-word; line-height: 22px;">' + blocks[i] + '</p>';
            }
            $('#terms-content').append(result);
        });
        aboutCommaClass.fixElementsStyle();
    },
    fixElementsStyle: function () {
        if (player.miniPlayerExist) {
            $('.home-player').css('bottom', '0px');
            $('.content-wrapper').css('padding-bottom', '70px');
        }
    },
    loadTerms: function(terms){
        firebase.database().ref('Terms').once('value').then(function(snapshot){
            if (snapshot.val() != undefined && snapshot.val() != null){
                terms(snapshot.val());
            } else {
                terms('');
            }
        });
    }

}