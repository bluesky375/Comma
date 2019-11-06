// JavaScript Document
jQuery(document).ready(function ($) {

    // if ($('body').hasClass('personal-discount') || $('body').hasClass('stored-value-center')) {
    //     /**
    //      * Disabled submit by default. active after user input
    //      */
    //     $('input[type="submit"], input[type="button"]').attr("disabled", true);

    //     $('form').on('change keyup', 'input, textare', function () {

    //         var inputSubmit = $(this).closest('form').find('input[type="submit"], input[type="button"], button[type="button"]');
    //         if (this.value.length > 0) {
    //             inputSubmit.css({background: '#1fbfb3'});
    //             inputSubmit.removeAttr("disabled");
    //         }
    //         else {
    //             inputSubmit.css({background: '#ADADAD'});
    //             inputSubmit.attr("disabled", true);
    //         }
    //     })
    // }

    $('.reply-form input[type="text"]').keyup(function () {
        console.log("Reply form changed");
        var submitBtn = $(this).closest('form').find('input[type="image"]');
        if (this.value.length > 0) {
            submitBtn.attr('src', 'assets/images/btn-send-hover.png');
        }
        else {
            submitBtn.attr('src', 'assets/images/btn-send.png');
        }
    })

});