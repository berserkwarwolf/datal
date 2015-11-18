var AddSourceView = Backbone.View.extend({

  el: '#addNewSource',

  sources: null,
  template: null,

  events: {
    'click #id_addNewSourceButton': 'onAddNewSourceButtonClicked'
  },

  initialize: function(options){
    this.template = _.template( $("#id_AddNewSourceTemplate").html() );
    this.sources = options.sources;

    // Bind model validation to view
    Backbone.Validation.bind(this);

    this.render();
  },

  render: function(){
    this.$el.html( this.template() );
    this.$el.show();

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

    return this;
  },

  setIndividualError: function(element, name, error){
    // If not valid
    if( error != ''){
      element.addClass('has-error');
      element.next('p.has-error').remove();
      element.after('<p class="has-error">'+error+'</p>');

    // If valid
    }else{
      element.removeClass('has-error');
      element.next('p.has-error').remove();
    }
  },

  onAddNewSourceButtonClicked:function(){
    var name = $('#id_name').val(),
      url_source = $('#id_url_source').val();

    this.model.set('name', name);
    this.model.set('url', url_source);
    
    if(this.model.isValid(true)){
      this.sources.add(this.model.toJSON());
      this.$el.hide();
      this.undelegateEvents();
    }
  }

});