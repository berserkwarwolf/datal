var ActivateView = Backbone.View.extend({

  el: '#id_activate',

  events: {
    'click #id_activateButton': 'onActivateButtonClicked'
  },

  formContainer: null,

  initialize: function(){
    this.formContainer = this.$el.find('form');

    // Bind model validation to view
    Backbone.Validation.bind(this);

  	this.render();
  },

  render: function(){
    // Bind custom model validation callbacks
    var self = this;
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

  onActivateButtonClicked: function(event){
    event.preventDefault();

    var password = this.formContainer.find('#id_password').val();
    var password_again = this.formContainer.find('#id_password_again').val();

    this.model.set('password', password);
    this.model.set('password_again', password_again);

    if(this.model.isValid(true)){
      this.formContainer[0].submit();
    }

  },

  setIndividualError: function(element, name, error){

    var field = element;

    // If not valid
    if( error != ''){
      field.addClass('has-error');
      element.next('div.has-error').remove();
      element.after('<div class="has-error">'+error+'</div>');

    // If valid
    }else{
      field.removeClass('has-error');
      element.next('div.has-error').remove();
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