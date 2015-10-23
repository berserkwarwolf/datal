var SourcesView = Backbone.View.extend({

	el: '#sourceForm',

	parentView: null,

	template: null,

	templateNew: null,

	parentModel: null,

	events: {
		'click #id_addSourceButton': 'onAddSourceButtonClicked'
	},

	initialize: function(){
  	this.template = _.template( $("#id_AddSourceTemplate").html() );
		this.parentView = this.options.parentView;
		this.parentModel = this.options.parentModel;
		this.listenTo(this.collection, 'add', this.addSource);
		this.listenTo(this.collection, 'remove', this.removeSource);

		// Bind model validation to view
		Backbone.Validation.bind(this);

		this.render();
	},

  render: function() {
  	this.collection.forEach(this.addSource, this);
    this.$el.find('#addSource').html( this.template() );
  	this.initAutocomplete();

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

  addSource: function(model){

  	// Add new active source to DOM
    var theView = new SourceView({ model: model });
    this.$el.find('.sourcesContent').append( theView.render().el );

    // Clear Add source form
    this.clearSourceForm();

  },

	removeSource: function(model){
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

	clearSourceForm:function(){
		$('#id_source_name').val("");
	},

  initAutocomplete: function(){
    var self = this;
    $('#id_source_name').autocomplete({
      source: self.parentModel.get('sourceUrl'),
      minLength: 3,
      select: function (e, ui) {
      	e.preventDefault();
      	self.model.set('name', ui.item.value);
      	self.model.set('url', '');
      	if(self.model.isValid(true)){
					self.collection.add(self.model.toJSON());
					$(e.target).val('');
				}
	    }
    });
	},

	onAddSourceButtonClicked: function(){

		if( !_.isUndefined(this.addSourceView) ){
			this.addSourceView.undelegateEvents();
		}

    var addSourceModel = new AddSourceModel();
    this.addSourceView = new AddSourceView({ model: addSourceModel, sources: this.collection });		
	}

});