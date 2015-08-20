var ChartView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}

		this.addEvents({
	
			'click a.backButton': 			'onPreviousButtonClicked',
			'click a.nextButton': 			'onNextButtonClicked',
			'click button.selectData': 		'onSelectDataClicked',
			'click button.chartType': 		'onChartTypeClicked',
			'change select#chartLibrary': 	'onChartLibraryChanged',
			
			'keyup input#chartTitle': 		'onInputChanged',
			'keyup input#yTitle': 			'onInputChanged',
			'keyup input#xTitle': 			'onInputChanged',
			'keyup input#nullValuePreset': 	'onInputChanged',
			
			'change input[type=radio]': 	'onRadioChanged',
			'click input[type=checkbox]': 	'onCheckboxChanged'

		});

		this.chartsFactory = new charts.ChartsFactory(); // create ChartsFactory

		// Bind model validation to view
		//Backbone.Validation.bind(this);

		this.render();

	}, 

	render: function(){

		var self = this;
		
		return this;
	},

	onSelectDataClicked: function(){
		this.openModal('chartSelectDataModal');
	},

	onChartTypeClicked: function(e){
		e.preventDefault();
		var type = $(e.target).data('type');
		this.selectGraphType(type);
	},

	onChartLibraryChanged: function(e){
		var lib = $(e.target).val();
		this.model.set('lib',lib);
		this.chartChanged();
	},

	onInputChanged: function(e){
		var input = $(e.target);
		this.model.set(input.data('ref'),input.val());

		console.log(this.model.getGeneralSettings());
	},

	onCheckboxChanged: function(e){
		console.log(e);
		var input = $(e.target);

		console.log(input.val());
//		this.model.set(input.attr('name'),input.val());

/*		if(input.val()=='given'){
			$('#nullValuePreset').show();
		}else{
			$('#nullValuePreset').hide();
		}*/

		console.log(this.model.getGeneralSettings());
	},

	onRadioChanged: function(e){
		var input = $(e.target);
		this.model.set(input.attr('name'),input.val());

		if(input.val()=='given'){
			$('#nullValuePreset').show();
		}else{
			$('#nullValuePreset').hide();
		}

		console.log(this.model.getGeneralSettings());
	},

	selectGraphType: function(type){
		$('.chartType').removeClass('active');
		$('.chartType.'+type).addClass('active');
		this.model.set('type',type);
		this.chartChanged();
	},

	chartChanged: function(){
		this.cleanChart();
		this.createChart();
	},

	cleanChart: function(){
		//mejorar
		$('#chartContainer').html('');
	},

	createChart: function(){
		this.chartSettings = this.chartsFactory.create(this.model.get('type'),this.model.get('lib'));

		this.chartRender();

		//chart factory from model?
		$('#chartContainer').html(this.model.get('type') + ' - '+ this.model.get('lib') );

	},

	chartRender: function(){

		if(this.chartSettings){

			//change visibility of controls
			$('.attributeControl').hide();
			_.each(this.chartSettings.attributes,function(e){
				$('.attributeControl.'+e+'AttributeControl').show();
			});

			//Set list of custom attributes for my model
			this.model.set('attributes',this.chartSettings.attributes);

			this.chartModel = new this.chartSettings.Model({
					id:1
				});

			//this.chartModel.fetchData();

			this.chartInstance = new this.chartSettings.Class({
				el: '#chartContainer',
				model: this.chartModel,
			});
			
			//this.chartInstance.render();
		
		} else {
			console.log('There are not class for this');
		}

	},

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onNextButtonClicked: function(){		

		/*if(this.model.isValid(true)){
			this.model.setOutput();*/
			this.next();
		/*}*/

	},

	start: function(){
		this.constructor.__super__.start.apply(this);

		// default google
		this.model.set('lib','google');

		// chart type from first step
		var initial = this.model.get('type');
		initial = (initial)?initial:'line';
		this.selectGraphType(initial);

	},



});