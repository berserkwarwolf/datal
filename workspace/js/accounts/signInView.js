var SignInView = Backbone.View.extend({

  el: '#id_signIn',

  events: {
    'click #id_submitButton': 'onSubmitButtonClicked'
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
      valid: function(view, attr) {
        // Nothing
      },
      invalid: function(view, attr, error) {
        self.setMessage(self, error, 'error');
      }
    });

    // Show server side error messages
    this.serverSideValidationMessages();

    return this;
  },

  serverSideValidationMessages: function(){
    var self = this;
    $.each(signInMessages, function(i, error) {
      self.setMessage(self, error, 'error');
    });
  }, 

  onSubmitButtonClicked: function(event){
    event.preventDefault();
    this.removeOldMessages();

    var username = this.formContainer.find('#id_username').val();
    var password = this.formContainer.find('#id_password').val();

    this.model.set('username', username);
    this.model.set('password', password);

    if(this.model.isValid(true)){
      this.formContainer[0].submit();
    }
  }, 

  removeOldMessages: function(){
    this.$el.find('.account-box-error, .account-box-ok').remove();
  },

  setMessage: function(self, message, className){
    if( self.$el.find('.account-box-message').length > 0 ){
      self.$el.find('.account-box-message').append('<p>'+message+'</p>');
    }else{
      self.accountBoxContainer.before('<div class="account-box-message account-box-'+className+'"><p>'+message+'</p></div>');
    }
  }

});