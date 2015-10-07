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
		this.addEvents(eventsObject);

		// Bind model validation to view
		Backbone.Validation.bind(this);

		// Init stickyNav
		// this.initStickyNav();

		this.render();

	}, 

	render: function(){

		var self = this;

		this.$el.find('.formContent').html( this.template( this.model.toJSON() ) );	

		// Init Param Collection
		this.initParamsList();

		// Show implementation type form
		this.onImplTypeRun( this.model.get('impl_type')  );

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
        var impl_type = $(event.currentTarget).val();
        this.onImplTypeRun(impl_type);
    },

    onImplTypeRun:function(impl_type){
        if( impl_type == '1' ){
            $('#id_rest_json').hide();
            $('#id_soap_xml').slideDown();
        }else{
            $('#id_soap_xml').hide();
            $('#id_rest_json').slideDown();
        }
    }

});


