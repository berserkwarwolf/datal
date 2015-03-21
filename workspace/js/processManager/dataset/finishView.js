var FinishView = StepView.extend({

	name: null,
	template: null,
	sources: null,
	tags: null,

	initialize: function(){

		this.template = _.template( $("#id_finishTemplate").html() );
		this.name = this.model.get('name');

		// Overriding el and $el
		this.el = '.step[data-step='+this.name+']',
		this.$el = $(this.el);

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['click .step[data-step='+this.name+'] .navigation .backButton'] = 'onPreviousButtonClicked';
		eventsObject['click .step[data-step='+this.name+'] .navigation .saveButton'] = 'onSaveButtonClicked';
		this.addEvents(eventsObject);

		// Bind model validation to view
		Backbone.Validation.bind(this);	

		this.render();

	},

	render: function(){

		var self = this;

		this.$el.find('.formContent').html( this.template( this.model.toJSON() ) );	

		// Init Source Collection
		this.initSourceList();

		// Init Tag Collection
		this.initTagList();

		this.initNotes();

		// Bind custom model validation callbacks
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

	initNotes: function(){
		new nicEditor({
			buttonList : ['bold','italic','underline','ul', 'ol', 'link', 'hr'],
			iconsPath: '/js_core/plugins/nicEdit/nicEditorIcons-2014.gif'
		}).panelInstance('id_notes');
	},

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onSaveButtonClicked: function(){

		if(this.model.isValid(true)){

			// Set sources and tags
			this.model.set('sources', this.sources.toJSON());
			this.model.set('tags', this.tags.toJSON());
				
			// Set model data attribute
			this.model.setData();	

			// Get Output and Data
			var output = this.model.get('output'),
				data = this.model.get('data');			

			// If output.files has a file, then upload and send data
			if( !_.isUndefined( output.inputFileId ) && output.files.length > 0 ){

				var self = this;

				// Set options
				$(output.inputFileId).fileupload('option', {
					url: this.model.get('saveUrl'),
					formData: data
				});

				// Send files and data
				$.when(
					$(output.inputFileId).fileupload('send', {
						files: output.files
					})
				).then(function(){
					self.next();
				});

			// else, normal save
			}else{
				$.ajax({
					url: this.model.get('saveUrl'),
					type:'POST',
					data: data,
					dataType: 'json',
					beforeSend: _.bind(this.onSaveBeforeSend, this),
					success: _.bind(this.onSaveSuccess, this),
					error: _.bind(this.onSaveError, this)
				});
			}

		}

	},

	onSaveBeforeSend: function(xhr, settings){

		// Prevent override of global beforeSend
		$.ajaxSettings.beforeSend(xhr, settings);

		$("#ajax_loading_overlay").show();

	},

	onSaveSuccess: function(response){
		this.next();
	},

	onSaveError: function(response){

		// Hide Loadings
		$("#ajax_loading_overlay").hide();

		// Set error Message
		$.gritter.add({
			title: 'Error',
			text: gettext('ERROR-LOADING-DATASET'),
			image: '/media_workspace/images/common/ic_validationError32.png',
			sticky: true,
			time: ''
		});

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

	initSourceList: function(){
	   var sourceModel = new SourceModel();
            this.sources = new Sources(this.model.get('sources'));
	   new SourcesView({collection: this.sources, parentView:this, model: sourceModel, parentModel: this.model});
	 },

	 initTagList: function(){
            var tagModel = new TagModel();
            this.tags = new Tags(this.model.get('tags'));
            new TagsView({collection: this.tags, parentView:this, model: tagModel, parentModel: this.model});
	 }

});
