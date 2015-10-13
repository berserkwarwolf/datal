var CollectWebserviceParamsView = Backbone.View.extend({

	el: '#paramForm',

	parentView: null,

	template: null,

	events: {
		'click #id_applyParamButton': 'onAddParamButtonClicked'
	},

	initialize: function(options){
  	this.template = _.template( $("#id_CollectWebserviceAddParamTemplate").html() );
		this.parentView = options.parentView;
		this.listenTo(this.collection, 'add', this.addParam);
		this.listenTo(this.collection, 'remove', this.removeParam);

		// Bind model validation to view
		Backbone.Validation.bind(this);

		this.render();
	},

  render: function() {
  	this.collection.forEach(this.addParam, this);
    this.$el.find('#addForm').html( this.template() );

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

  addParam: function(model){

  	// Add new active param to DOM
    var theView = new CollectWebserviceParamView({ model: model });
    this.$el.find('.paramContent').append( theView.render().el );

    // Clear Add param form
    this.clearParamForm();

  },

	removeParam: function(model){
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

	clearParamForm:function(){
		$('#id_param_name, #id_default_value').val("");
		$('#id_enable_editable').prop('checked', false);
	},

	onAddParamButtonClicked:function(){
		var name = $('#id_param_name').val(),
				default_value = $('#id_default_value').val(),
				editable = $('#id_enable_editable').is(':checked');

		this.model.set('name', name);
		this.model.set('default_value', default_value);
		this.model.set('editable', editable);
		
		if(this.model.isValid(true)){
			this.collection.add(this.model.toJSON());
		}
	}

});