var ChartView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['click a.backButton'] = 'onPreviousButtonClicked';
		eventsObject['click a.nextButton'] = 'onNextButtonClicked';
		eventsObject['click button.selectData'] = 'onSelectDataClicked';
		eventsObject['click button.chartType'] = 'onChartTypeClicked';
		eventsObject['change select#chartLibrary'] = 'onChartLibraryChanged';
		
		eventsObject['keyup input#chartTitle'] = 'onInputChanged';
		eventsObject['keyup input#yTitle'] = 'onInputChanged';
		eventsObject['keyup input#xTitle'] = 'onInputChanged';
		eventsObject['keyup input#nullValuePreset'] = 'onInputChanged';
		
		eventsObject['change input[type=radio]'] = 'onRadioChanged';

		this.addEvents(eventsObject);

		// Bind model validation to view
		//Backbone.Validation.bind(this);

		this.listenTo(this.model.data, 'change:rows', this.onChangeData, this);
		this.listenTo(this.model, 'change:lib', this.onChartChanged, this);
		this.listenTo(this.model, 'change:type', this.onChartChanged, this);

	}, 

	onChangeData: function (model) {
		console.log('the data for your chart has changed', model.get('data'));
		// TODO: should call this.chartView.render();
		this.renderChart();
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
	},

	onInputTitleChanged: function(e){
		var input = $(e.target);
		this.model.set(input.data('ref'),input.val());

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
	},

	onChartChanged: function(){
		console.log('you selected type: ', this.model.get('type') + ' - '+ this.model.get('lib') );
		this.setupChart();
		this.renderChart();
	},

	setupChart: function(){
		var chartSettings = this.factoryChart();

		//chart factory from model?

		if(chartSettings){

			//change visibility of controls
			$('.attributeControl').hide();
			_.each(chartSettings.attributes,function(e){
				$('.attributeControl.'+e+'AttributeControl').show();
			});

			//Set list of custom attributes for my model
			this.model.set('attributes',chartSettings.attributes);

			this.ChartViewClass = chartSettings.Class;

		} else {
			console.log('There are not class for this');
		}

	},

	availableCharts: {
		'd3':{
			'linechart': {
						'Class': charts.views.C3LineChart,
						'attributes': ['yTitle','xTitle']
					},
			'barchart': {
						'Class': charts.views.C3BarChart,
						'attributes': ['yTitle','xTitle']
					},
		},
		'google':{
			'linechart': {
						'Class': charts.views.GoogleLineChart,
						'attributes': ['yTitle','xTitle']
					},
			'barchart': {
						'Class': charts.views.GoogleBarChart,
						'attributes': ['yTitle']
					}
		}
	},

	factoryChart: function(){
		if(_.has(this.availableCharts,this.model.get('lib')) &&
			_.has(this.availableCharts[this.model.get('lib')],this.model.get('type')) ){
			return this.availableCharts[this.model.get('lib')][this.model.get('type')];
		} else {
			return false;
		}

	},

	renderChart: function () {
	
		if (this.ChartViewClass) {

			this.chartInstance = new this.ChartViewClass({
				el: $('#chartContainer'),
				model: this.model,
			});
			
			this.chartInstance.render();
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