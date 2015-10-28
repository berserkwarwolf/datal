var ForgotPasswordView = Backbone.View.extend({

  el: "#id_forgotPassword",

  events: {
    'click #id_submitButton': 'onSubmitButtonClicked'
  },

  formContainer: null, 
  loaderContainer : null, 
  accountBoxContainer: null, 

  initialize: function(){
    this.formContainer = this.$el.find('form');
    this.loaderContainer = $('#ajax_loading_overlay');
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

    return this;
  },

  onSubmitButtonClicked: function(event){
    event.preventDefault();
    this.removeOldMessages();

    var identification = this.formContainer.find('#id_user_identification').val();

    this.model.set('identification', identification);

    if(this.model.isValid(true)){
      this.onSubmit();
    }
  },

  onSubmit: function(){
    var url = this.formContainer.attr('action');
    var data = {identification: this.formContainer.find('#id_user_identification').val(), csrfmiddlewaretoken: csrfmiddlewaretoken };
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      dataType: 'json',
      beforeSend: _.bind(this.onBeforeSend, this),
      success: _.bind(this.onSuccess, this),
      error: _.bind(this.onError, this),
      complete: _.bind(this.onComplete, this)
    });
  }, 

  onSuccess: function(response){
    this.removeOldMessages();
    if(response.ok == 'True'){
      this.setMessage(this, response.p_message, 'ok');
      this.formContainer[0].reset();
    }else{
      this.setMessage(this, response.p_message, 'error');
    }
  }, 

  onError: function(){
    this.removeOldMessages();
    this.setMessage(this, gettext('APP-REQUEST-ERROR'), 'error');
  }, 

  onBeforeSend: function(xhr, settings){

    // Prevent override of global beforeSend
    $.ajaxSettings.beforeSend(xhr, settings);
    
    this.formContainer.find('#id_submitButton').attr('disabled','disabled');
    this.loaderContainer.fadeIn(375);
  },

  onComplete: function(){
    this.formContainer.find('#id_submitButton').removeAttr('disabled');
    this.loaderContainer.fadeOut(375);
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