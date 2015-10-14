var CollectFileView = StepView.extend({

	name: null,
	template: null,
	templateHTML: null,

	initialize: function(){

		this.templateHTML = $("#id_collectFileTemplate").html();
		this.template = _.template( this.templateHTML );
		this.name = this.model.get('name');

		// Overriding el and $el
		this.el = '.step[data-step='+this.name+']',
		this.$el = $(this.el);

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['change #id_file_data'] = 'onNextButtonClicked';
		eventsObject['drop #id_dropzone'] = 'onNextButtonClicked';
		eventsObject['click #id_avoidErrorsFile'] = 'onAvoidErrorsLinkClicked';
		this.addEvents(eventsObject);

		// Bind model validation to view
		Backbone.Validation.bind(this);

		this.render();

	}, 

	render: function(){

		var self = this;

		// Set template
		this.$el.find('.formContent').html( this.template( this.model.toJSON() ) );	

		// Init file upload
		this.initFileUpload();

		// Init resize on dropzone
		setTimeout(function(){
			self.setDropzoneHeight();
		}, 0);

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

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onNextButtonClicked: function(){

		var filename = "",
			files = this.model.get('files');

		// Create
		if(!_.isUndefined(files[0]) ){
			filename = files[0].name;

		// Edit
		}else{
			filename = this.model.get('file_data');
			
		}

		if(this.model.isValid(true)){
			this.model.set('impl_type',this.model.checkExtension(filename));
			this.model.setOutput();
			this.next();
		}

	},

	setIndividualError: function(element, name, error){

		if(name == 'file_data'){
			element = $('.step[data-step='+this.name+'] .input-file');
		}

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

	initFileUpload: function(){
		var self = this;
		$( this.model.get('inputFileId') ).fileupload({
			url: '/datasets/upload',
			acceptFileTypes: '/(\.|\/)(doc|docx|docm|dotx|dotm|xls|xlsx|xlsm|xltx|xltm|xlsb|xlam|xll|odt|ods|csv|txt|pdf|html|htm|xml|kml|kmz)$/i',
			autoUpload: false,
			maxNumberOfFiles: 1,
			replaceFileInput: false,
			singleFileUploads: true,
			add: _.bind(this.onFileUploadAdd, this),
			fail: _.bind(this.onFileUploadFail, this),
			start: function(){
				$("#ajax_loading_overlay").show();
			},
			dropZone: $('#id_dropzone'),
			drop: _.bind(this.onFileUploadAdd, this),
			dragover: _.bind(this.onDragOver, this),
			progress: _.bind(this.onFileUploadProgress, this),
		});

	},

	onFileUploadAdd: function(event, data) {
		this.model.set('files',data.files);
	},

	onFileUploadFail:function(event, data){
				// Hide Loadings
				$("#ajax_loading_overlay").hide();
				datalEvents.trigger('datal:application-error', data);
	},

	onAvoidErrorsLinkClicked: function(){

		var $overlay = $('#id_avoidErrorsOverlay');

		// init Overlay
		$overlay.overlay({
			top: 'center',
			left: 'center',
			mask: {
				color: '#000',
				loadSpeed: 200,
				opacity: 0.5,
				zIndex: 99999
			}
		});

		// Load overlay
		$overlay.data('overlay').load();

	},

	setDropzoneHeight: function(){

		$(window).resize(function(){

			var windowHeight;
			if( $(window).height() < 600){
				// Set window height minimum value to 600
				windowHeight = 600;
			}else{
				windowHeight = $(window).height();
			}

			var theHeight =
				windowHeight
				- $('.header').height()
				- $('.section-title').height()
				- parseInt($('.section-content > div').css('padding-top').split('px')[0])
				- parseInt($('.section-content > div').css('padding-bottom').split('px')[0])
				- parseInt($('#id_dropzone').css('border-top').split('px')[0])
				- parseInt($('#id_dropzone').css('border-bottom').split('px')[0])
				- parseInt($('#id_dropzone').css('padding-top').split('px')[0])
				- parseInt($('#id_dropzone').css('padding-bottom').split('px')[0])
				- parseInt($('#id_dropzone').css('margin-bottom').split('px')[0])
				- $('.collect footer').height()
				- 4; //fix to perfection

			$('#id_dropzone .td').css('height', theHeight+'px');

		}).resize();

	},  

	onDragOver: function(e){
		
		var dropZone = $('#id_dropzone'),
			timeout = window.dropZoneTimeout;
		if (timeout) {
			clearTimeout(timeout);
		}
		var found = false,
			node = e.target;
		do {
			if (node === dropZone[0]) {
				found = true;
				break;
			}
			node = node.parentNode;
		} while (node != null);
		if (found) {
			dropZone.addClass('hover');
		} else {
			dropZone.removeClass('hover');
		}
		window.dropZoneTimeout = setTimeout(function () {
			window.dropZoneTimeout = null;
			dropZone.removeClass('hover');
		}, 100);

	},

	onFileUploadProgress: function(event, data){
		console.log('progress');
		console.log(data);
	}

});