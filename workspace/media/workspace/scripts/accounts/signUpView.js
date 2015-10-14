var SignUpView = Backbone.View.extend({

  el: '#id_signUp',

  events: {
    'click #id_submitButton': 'onSubmitButtonClicked',
    'blur #id_signUpForm input[type=text], #id_signUpForm input[type=password]': 'onFieldsBlur',
  },

  formContainer: null,
  accountBoxContainer: null, 

  initialize: function(){
    this.formContainer = this.$el.find('form');
    this.accountBoxContainer = this.$el.find('.account-box-content');

    // Bind model validation to view
    Backbone.Validation.bind(this);

    this.render();
  },

  render: function(){

    var self = this;

    // Bind custom model validation callbacks
    Backbone.Validation.bind(this, {
      valid: function (view, attr, selector) {
        self.setIndividualError(view.$('[name=' + attr + ']'), attr, '');
      },
      invalid: function (view, attr, error, selector) {
        self.setIndividualError(view.$('[name=' + attr + ']'), attr, error);
      }
    });

    this.passwordStrength();

    return this;
  },

  onSubmitButtonClicked: function(event){
    event.preventDefault();
    this.removeMessage();

    var account_name = this.formContainer.find('#id_account_name').val();
    var admin_url = this.formContainer.find('#id_admin_url').val();
    var name = this.formContainer.find('#id_name').val();
    var nick = this.formContainer.find('#id_nick').val();
    var password = this.formContainer.find('#id_password').val();
    var password_again = this.formContainer.find('#id_password_again').val();
    var email = this.formContainer.find('#id_email').val();
    var language = this.formContainer.find('#id_language').val();

    this.model.set('account_name', account_name);
    this.model.set('admin_url', admin_url);
    this.model.set('name', name);
    this.model.set('nick', nick);
    this.model.set('password', password);
    this.model.set('password_again', password_again);
    this.model.set('email', email);
    this.model.set('language', language);

    if(this.model.isValid(true)){
      //console.log('model valid');
      this.formContainer[0].submit();
    }
  }, 

  removeMessage: function(){
    this.$el.find('.account-box-error').remove();
  },

  setMessage: function(){
    this.removeMessage();
    var message = gettext('SIGNUP-ERRORS-MESSAGE');
    this.accountBoxContainer.before('<div class="account-box-message account-box-error"><p>'+message+'</p></div>');
  },

  onFieldsBlur: function(event){
    var element = $(event.currentTarget);
    var value = element.val();
    var name = element.attr('name');

    this.model.set(name, value);

    // Pre-validate field on Blur
    var error = this.model.preValidate(name, value);

    this.setIndividualError(element, name, error);

  },

  setIndividualError: function(element, name, error){

    var field = element;

    if( name == 'admin_url' ){
      element = element.parents('.fakeField');
    }

    // If not valid
    if( error != ''){
      field.addClass('has-error');
      element.next('div.has-error').remove();
      element.after('<div class="has-error">'+error+'</div>');
      this.setMessage();

    // If valid
    }else{
      field.removeClass('has-error');
      element.next('div.has-error').remove();
      if( this.$el.find('.has-error').length < 1 ){
        this.removeMessage();
      }
    }

  },

  passwordStrength: function(){
    this.formContainer.find('#id_password').passwordStrength({
      classes : Array('is10','is20','is30','is40','is50','is60','is70','is80','is90','is100'),
      targetDiv : '#id_passwordStrength',
      cache : {}
    });
  }

});