var AddSourceView = Backbone.View.extend({

	el: '#addNewSource',

	sources: null,
	template: null,

	events: {
		'click #id_addNewSourceButton': 'onAddNewSourceButtonClicked'
	},

	initialize: function(){
		this.template = _.template( $("#id_AddNewSourceTemplate").html() );
		this.sources = this.options.sources;

		this.listenTo(this.sources, 'validateAdd', this.validateNameOnAdd);

		// Bind model validation to view
		Backbone.Validation.bind(this, {
			collection: this.sources
		});

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

		var name = $.trim($('#id_name').val()),
			url = $.trim($('#id_url_source').val());

		this.model.set('name', name);
		this.model.set('url', url);
		
		if(this.model.isValid(true)){

			// Validate URL and NAME with some rules using a custom method with an async ajax call
			// (needs to be this way because backbone.validation plugin does not support custom methods with built-in ones)
			if( this.model.validateSourceNameAlreadyExist() != false ){
				var error = this.model.validateSourceNameAlreadyExist();
				this.setIndividualError( this.$el.find('[name=name]'), 'name', error );
				return false;
			}
			if( this.model.validateSourceUrlAlreadyExist() != false ){
				var error = this.model.validateSourceUrlAlreadyExist();
				this.setIndividualError( this.$el.find('[name=url]'), 'url', error );
				return false;
			}

			this.sources.add(this.model.toJSON());
		}
		
	},

	validateNameOnAdd: function(error){
		// Is valid
		if( error == '' ){
			this.hideForm();

		// Is invalid
		}else{
			this.setIndividualError(this.$el.find('[name=name]'), 'name', error);
		}
	},

	hideForm: function(){
		this.$el.hide();
		this.undelegateEvents();
	}

});