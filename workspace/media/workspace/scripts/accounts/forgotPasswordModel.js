var ForgotPasswordModel = Backbone.Model.extend({   
  validation: {
    identification: {
      required: true,
      msg: gettext('VALIDATE-REQUIRED-TEXT')
    }
  }
});