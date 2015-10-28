_.extend(Backbone.Validation.validators, {
  ifAdminUrlExists: function(value, attr, customValue, model) {
    var url = '/accounts/check_admin_url';
    var customValidation = '';
    var data = { csrfmiddlewaretoken: csrfmiddlewaretoken }
    data[attr] = value;
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      dataType: 'json',
      async: false,
      success: function(response){
        // Set customValidation to true
        customValidation = (response === customValue);
      }
    });
    return customValidation;
  },
  ifUsernameExists: function(value, attr, customValue, model) {
    var url = '/admin/check_username';
    var customValidation = '';
    var data = { csrfmiddlewaretoken: csrfmiddlewaretoken }
    data[attr] = value;
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      dataType: 'json',
      async: false,
      success: function(response){
        // Set customValidation to true
        customValidation = (response === customValue);
      }
    });
    return customValidation;
  },
  ifEmailExists: function(value, attr, customValue, model) {
    var url = '/admin/check_email';
    var customValidation = '';
    var data = { csrfmiddlewaretoken: csrfmiddlewaretoken }
    data[attr] = value;
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      dataType: 'json',
      async: false,
      success: function(response){
        // Set customValidation to true
        customValidation = (response === customValue);
      }
    });
    return customValidation;
  }
});

var SignUpModel = Backbone.Model.extend({

  validation: {

    account_name: {
      required: true,
      msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
    },

    admin_url: [{
      required: true,
      msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
    },{
      pattern: /^[a-zA-Z0-9\-]+$/,
      msg: gettext( 'VALIDATE-REGEX' )
    },{
      maxLength: 30,
      msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 30 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
    },{
      ifAdminUrlExists: false,
      msg: gettext( 'VALIDATE-ADMIN-URL' )

    }],

    nick: [{
      required: true,
      msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
    },{
      pattern: /^[a-zA-Z0-9\_\.\-]+$/,
      msg: gettext( 'VALIDATE-REGEX' )
    },{
      maxLength: 30,
      msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 30 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
    },{
      ifUsernameExists: false,
      msg: gettext( 'VALIDATE-USERNAME' )
    }],

    name: [{
      required: true,
      msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
    },{
      maxLength: 30,
      msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 30 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
    }],

    password: {
      required: true,
      msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
    },

    password_again: {
      equalTo: 'password',
      msg: gettext('VALIDATE-PASSWORDMATCH-TEXT')
    },

    email: [{
      required: true,
      msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
    },{
      pattern: 'email',
      msg: gettext('VALIDATE-EMAILNOTVALID-TEXT')
    },{
      maxLength: 75,
      msg: gettext('VALIDATE-MAXLENGTH-TEXT-1') + ' 75 ' + gettext('VALIDATE-MAXLENGTH-TEXT-2')
    },{
      ifEmailExists: false,
      msg: gettext( 'VALIDATE-EMAIL' )
    }]

  }

});