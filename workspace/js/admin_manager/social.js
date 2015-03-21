$(document).ready(function(){
    $form = $('#id_adminSocialForm');
    $form.validate({
        submitHandler: function(form){
            $form = $(form);
            $('#ajax_loading_overlay').show();
            $.ajax({
                url: $form.attr('action'),
                data: $form.serialize(),
                type: $form.attr('method'),
                success: function(response){

                    var messages = response.messages;
                        status = response.status,
                        title = gettext('APP-SETTINGS-SAVE-OK-TITLE'),
                        imageURL = '/media_workspace/images/common/ic_validationOk32.png',
                        sticky = false,
                        time = 3500;

                    if( _.isArray(messages) ){
                        messages = messages.join('. ');
                    }

                    if(status == 'error'){
                        title = 'Error';
                        imageURL = '/media_workspace/images/common/ic_validationError32.png';
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
                        image: '/media_workspace/images/common/ic_validationError32.png',
                        sticky: true,
                        time: 2500
                    });
                }, 
                complete: function(){
                  $('#ajax_loading_overlay').hide();
                }
            });
            return false;
        }
    });
});