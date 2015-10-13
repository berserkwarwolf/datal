$(document).ready(function(){
    $.each(my_account_messages, function(i, message) {
        $.gritter.add({
            title: gettext('APP-CHANGES-SAVED-TEXT'),
            text: message,
            image: '/static/workspace/images/common/ic_validationOk32.png',
            sticky: false,
            time: 8000
        });
    })
    $.each(my_form_error_messages, function(i, message) {
        $.gritter.add({
            title: gettext('APP-ERROR-TEXT'),
            text: message,
            image: '/static/workspace/images/common/ic_validationError32.png',
            sticky: false,
            time: 8000
        });
    })
    
    $form = $('#id_myAccountForm');

    $form.validate({
          rules: {
            'name'              : {'required':true, 'maxlength': 30},
            'email'             : {'required':true, 'maxlength': 75, 'email' : true},
            'new_password'      : {'minlength': 8},
            'new_password_again': {equalTo: "#id_new_password"}
          }
    });

    $('#id_changePasswordButton').click(function(event){
        event.preventDefault();
        $('#id_old_password').val('');
        $('#id_new_password').val('');
        $('#id_new_password_again').val('');
        
        $(this.rel).show('slow');
        $(this).hide();

        $form.find('#id_new_password').passwordStrength({
            classes : Array('is10','is20','is30','is40','is50','is60','is70','is80','is90','is100'),
            targetDiv : '#id_passwordStrengthDiv',
            cache : {}
        });
    });
});