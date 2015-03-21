var ActivateModel = Backbone.Model.extend({   

  defaults: {
    password: null,
    password_again: null
  },

  validation: {
    password: {
      required: true,
      msg: gettext('VALIDATE-REQUIREDFIELD-TEXT')
    },
    password_again: {
      required: true,
      equalTo: 'password',
      msg: gettext('VALIDATE-SAME-PASS-TEXT')
    }
  }

});