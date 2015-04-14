$(document).ready(function(){
    $form = $('#id_adminInfoForm');

    $form.validate({
        rules: {
                account_name: { required: true },
                account_link: { uri: true },
                account_contact_person_email: { email: true },
                account_contact_dataperson_email: { email: true }
          },
        submitHandler: save
    });
});

function save(){
    $form = $('#id_adminInfoForm');
    $('#ajax_loading_overlay').show();
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
        }, 
        complete: function(){
            $('#ajax_loading_overlay').hide();
        }
    });


}

function getFormParameters(){
    var data = {};

    data.account_name = $('#id_account_name').val();
    data.account_link = $('#id_account_link').val();
    data.account_contact_person_name = $('#id_account_contact_person_name').val();
    data.account_contact_person_email = $('#id_account_contact_person_email').val();
    data.account_contact_dataperson_email = $('#id_account_contact_dataperson_email').val();
    data.account_contact_person_country = $('#id_account_contact_person_country').val();
    data.account_contact_person_phone = $('#id_account_contact_person_phone').val();

    return data;
}