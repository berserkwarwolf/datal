var SignInModel = Backbone.Model.extend({   
  validation: {
    username: {
      required: true,
      msg: gettext('VALIDATE-USERNAME-REQUIRED-TEXT')
    },
    password: {
      required: true,
      msg: gettext('VALIDATE-PASSWORD-REQUIRED-TEXT')
    }
  }
});