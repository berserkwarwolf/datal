$(document).ready(function(){

    $form = $('#id_activateForm');

    $form.validate({
        rules: {
                password: {required: true},
                password_again: { equalTo: '#id_password'},
          },
        submitHandler: function(form){
            form.submit();
        }
    });

    $form.find('#id_password').passwordStrength({
        classes : Array('is10','is20','is30','is40','is50','is60','is70','is80','is90','is100'),
        targetDiv : '#id_passwordStrengthDiv',
        cache : {}
    });
});