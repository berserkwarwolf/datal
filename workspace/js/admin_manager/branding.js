$(document).ready(function(){
    
    function rgbToHex(rgb) {
      var rgbvals = /rgb\((.+),(.+),(.+)\)/i.exec(rgb);
      if (rgbvals == null) {
          return null;
      }
      var rval = parseInt(rgbvals[1]);
      var gval = parseInt(rgbvals[2]);
      var bval = parseInt(rgbvals[3]);
      return '#' + ( 
        rval.toString(16) +
        gval.toString(16) +
        bval.toString(16)
      ).toUpperCase();
    }
    
    $form = $('#id_adminBrandingForm');
    window.files = [];

    $form.fileupload({  
        
        done: function(event, data){

            // file uploaded complete
            var response = data.result;

            // Remove actual image and add another
            for(var i=0;i<data.fileInput.length;i++){
                if( !_.isUndefined( response.urls[data.fileInput[i].id] ) ){
                    var input = $("#"+data.fileInput[i].id)
                    input.parents('.imgContainer').find('img').remove();
                    input.parents('.imgContainer').find('.img').show().find('span').html('<img src="' + response.urls[data.fileInput[i].id] + '?updateCache=' + Math.random() + '" class="FL" />');
                }
            }

            // Set up notification
            var messages = '',
                status = response.status,
                title = gettext('APP-SETTINGS-SAVE-OK-TITLE'),
                imageURL = '/static/workspace/images/common/ic_validationOk32.png',
                sticky = false,
                time = 3500;

            if(window.FileReader === undefined) {
                messages = response.messages;                
            }else{
                messages = response.messages.join('. ');
            }                

            // If error
            if(status == 'error'){
                title = 'Error';
                imageURL = '/static/workspace/images/common/ic_validationError32.png';
                sticky = true;
                time = 2500;
            }

            // Notification
            $.gritter.add({
                title: title,
                text: messages,
                image: imageURL,
                sticky: sticky,
                time: time
            });
            
        },

        add: function(event, data){

            var found = false;

            if( window.files.length > 0 ){

                $.each(window.files, function( index, item ) {

                    //check the input whose image is going to be uploades is not already in the list
                    if(item.input[0].id == data.fileInput[0].id){

                        item.file = data.files
                        
                        found = true;
                        return false;           
                    }

                });

                if (!found) {
                    window.files.push({
                        "input":data.fileInput, 
                        "file": data.files
                    })
                }

            }else{
                window.files.push({
                    "input":data.fileInput, 
                    "file": data.files
                })
            }  

        },

        error: function(response){
            response = JSON.parse(response.responseText);
            // Notification
            $.gritter.add({
                title: 'Error',
                text: response.messages.join('. '),
                image: '/static/workspace/images/common/ic_validationError32.png',
                sticky: true,
                time: 2500
            });
        },

        replaceFileInput: false,
        singleFileUploads: false,
        acceptFileTypes: '/(\.|\/)(gif|jpe?g|png|ico)$/i',
        multipart: true

    });

    $form.validate({
        rules: {
                account_header_uri: { url: true },
                account_footer_uri: { url: true },
                account_header_height: { number: true },
                account_footer_height: { number: true }
        },
        submitHandler: save
    });

    $('input[type=hidden][name*=_color]').each(function(){
        var divId = $(this).attr('name');
        var divBGColor = $(this).val();
        $('#'+divId+' div').css('background-color', divBGColor);
    })

    $('.colorPicker').ColorPicker({
        
        onBeforeShow: function() {
            var bg_color = rgbToHex($(this).children(0).css('background-color'));
            if (bg_color != null) {
                $(this).ColorPickerSetColor(bg_color);
            }
        },
        
        onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: function (hsb, hex, rgb) {
            element = $(this).data('colorpicker').el
            $(element).find('div').css('background-color', '#' + hex);
            var elementId = $(element).attr('id');
            $('input[name='+elementId+']').val('#' + hex);
        }
    });

});

function save(){
    var $form = $('#id_adminBrandingForm'),
        files = [];

    for(var i=0;i<window.files.length;i++){
        if( !_.isUndefined( window.files[i].file[0] ) ){
            files.push( window.files[i].file[0] );
        }
    }

    // Set options
    $form.fileupload('option', {
        url: $form.attr('action'), 
        formData: getFormParameters()
    });

    // Send files and data
    if( files.length > 0 ){
        $form.fileupload('send', {
            files: files 
        });
    // if no file, send normal request
    }else{
        $.ajax({
            url: $form.attr('action'),
            type: 'POST',
            data: getFormParameters(),
            success: function(response){

                var messages = response.messages;
                    status = response.status,
                    title = gettext('APP-SETTINGS-SAVE-OK-TITLE'),
                    imageURL = '/static/workspace/images/common/ic_validationOk32.png',
                    sticky = false,
                    time = 3500;

                if( _.isArray(messages) ){
                    messages = messages.join('. ');
                }

                if(status == 'error'){
                    title = 'Error';
                    imageURL = '/static/workspace/images/common/ic_validationError32.png';
                    sticky = true;
                    time = 2500;
                }

                // Notification
                $.gritter.add({
                    title: title,
                    text: messages,
                    image: imageURL,
                    sticky: sticky,
                    time: time
                });

            },
            error: function(response){
                var response = JSON.parse(response.responseText),
                    messages = response.messages;

                if( _.isArray(messages) ){
                    messages = messages.join('. ');
                }

                // Notification
                $.gritter.add({
                    title: 'Error',
                    text: messages,
                    image: '/static/workspace/images/common/ic_validationError32.png',
                    sticky: true,
                    time: 2500
                });
            }
        });
    }

}

function getFormParameters(){
    var data = {};
    data.account_page_titles = $('#id_account_page_titles').val();
    data.account_header_uri = $('#id_account_header_uri').val();
    data.account_header_height = $('#id_account_header_height').val();
    data.account_footer_uri = $('#id_account_footer_uri').val();
    data.account_footer_height = $('#id_account_footer_height').val();
    data.account_language = $('#id_account_language').val();
    data.account_title_color = $('#id_account_title_color').val();
    data.account_button_bg_color = $('#id_account_button_bg_color').val();
    data.account_button_border_color = $('#id_account_button_border_color').val();
    data.account_button_font_color = $('#id_account_button_font_color').val();
    data.account_mouseover_bg_color = $('#id_account_mouseover_bg_color').val();
    data.account_mouseover_border_color = $('#id_account_mouseover_border_color').val();
    data.account_mouseover_title_color = $('#id_account_mouseover_title_color').val();
    data.account_mouseover_text_color = $('#id_account_mouseover_text_color').val();
    data.account_header_bg_color = $('#id_account_header_bg_color').val();
    data.account_header_border_color = $('#id_account_header_border_color').val();
    return data;
}