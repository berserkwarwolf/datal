var CollectWebserviceView = StepView.extend({

	name: null,
	template: null,
	templateHTML: null,
	paramsList: null,

	initialize: function(){

		if( this.model.get('impl_details') != '' ){
			this.model.parseImplDetails();
		}

		this.templateHTML = $("#id_collectWebserviceTemplate").html();
		this.template = _.template( this.templateHTML );
		this.name = this.model.get('name');

		// Overriding el and $el
		this.el = '.step[data-step='+this.name+']',
		this.$el = $(this.el);

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['click .step[data-step='+this.name+'] .navigation .backButton'] = 'onPreviousButtonClicked';
		eventsObject['click .step[data-step='+this.name+'] .navigation .nextButton'] = 'onNextButtonClicked';
		eventsObject['change #id_impl_type'] = 'onImplTypeChange';
		eventsObject['change #id_license_url, #id_frequency'] = 'onSelectChange';
		this.addEvents(eventsObject);

		// Bind model validation to view
		Backbone.Validation.bind(this);

		// Init stickyNav
		// this.initStickyNav();

		this.render();

	}, 

	render: function(){

		var self = this;

		// Check if is the value is "other", and set that in the model.
		this.isOtherValue('frequency');
		this.isOtherValue('license_url');

		this.$el.find('.formContent').html( this.template( this.model.toJSON() ) );	

		// Init Param Collection
		this.initParamsList();

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

		var end_point = $.trim( this.model.get('end_point') );
		this.model.set('end_point', end_point);

		if(this.model.isValid(true)){
			this.model.set('params', this.paramsList.toJSON());
			this.model.setOutput();
			this.next();
		}
	},

	isOtherValue: function(field){

		var value = this.model.get(field),
			valuesToCheck = [],
			htmlString = this.parseHTML(this.templateHTML),
			values = htmlString.find('[name='+field+'] option');

		for(i=0;i<values.length;i++){
			valuesToCheck.push( values.eq(i).val() );
		}

		if( $.inArray(value, valuesToCheck) == -1 ){
			this.model.set(field, 'other');
			this.model.set(field+'_other', value);
		}

	},

	parseHTML:function(htmlString){
		var fakeEl = $( '<div></div>' );
		fakeEl.html( htmlString );
		return $(fakeEl);
	},

	onSelectChange: function(event){

		var element = event.currentTarget,
			value = $(element).val(),
			otherElement = $(element).attr('data-other'),
			otherRow = this.$el.find(otherElement);

		if(value == 'other'){
			otherRow.show();
		}else{
			otherRow.hide();
		}

	},

	setIndividualError: function(element, name, error){

		// If license_url, use error in license_url_other
		if( name == 'license_url'){
			element = $('#id_license_url_other')
		}

		// If frequency, use error in frequency_other
		if( name == 'frequency'){
			element = $('#id_frequency_other')
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

	stickyNav:function(){
		var stickyNavTop = $('#contentHeder').offset().top;
		var scrollTop = $(window).scrollTop();
			if (scrollTop > stickyNavTop) { 
				$('#contentHeder').addClass('sticky');
				$('#contentHeder').width($('.create').width());
			} else {
				$('#contentHeder').removeClass('sticky'); 
			}
	},

	initStickyNav:function(){
		var self = this;
		$(document).ready(function(){
			self.stickyNav();
			$(window).scroll(function() {
				self.stickyNav();
			});
		});
	},

	initParamsList: function(){
		var paramModel = new CollectWebserviceParamModel();
		this.paramsList = new CollectWebserviceParams( this.model.get('params') );
		this.paramsView = new CollectWebserviceParamsView({collection: this.paramsList, parentView:this, model: paramModel});
	},

	onImplTypeChange:function(event){
		if( $(event.currentTarget).val() == '1' ){
			$('#id_rest_json').hide();
			$('#id_soap_xml').slideDown();
		}else{
			$('#id_soap_xml').hide();
			$('#id_rest_json').slideDown();
		}
	}

});


