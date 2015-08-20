var ChartView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['click a.backButton'] = 'onPreviousButtonClicked';
		eventsObject['click a.nextButton'] = 'onNextButtonClicked';
		eventsObject['click button.selectData'] = 'onSelectDataClicked';
		eventsObject['click button.chartType'] = 'onChartTypeClicked';
		eventsObject['change select#chartLibrary'] = 'onChartLibraryChanged';
		eventsObject['keyup input#chartTitle'] = 'onInputTitleChanged';
		eventsObject['keyup input#yTitle'] = 'onInputTitleChanged';
		eventsObject['keyup input#xTitle'] = 'onInputTitleChanged';
		this.addEvents(eventsObject);

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

	onInputTitleChanged: function(e){
		var input = $(e.target);
		this.model.set(input.data('ref'),input.val());

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
		this.chartSettings = this.factoryChart();

		this.chartRender();

		//chart factory from model?
		$('#chartContainer').html(this.model.get('type') + ' - '+ this.model.get('lib') );

	},

	availableCharts: {
		'd3':{
			'linechart': {
						'Class': charts.views.C3LineChart,
						'Model': charts.models.LineChart,
						'attributes': ['yTitle','xTitle']
					},
			'barchart': {
						'Class': charts.views.C3BarChart,
						'Model': charts.models.BarChart,
						'attributes': ['yTitle','xTitle']
					},
		},
		'google':{
			'linechart': {
						'Class': charts.views.GoogleLineChart,
						'Model': charts.models.LineChart,
						'attributes': ['yTitle','xTitle']
					},
			'barchart': {
						'Class': charts.views.GoogleBarChart,
						'Model': charts.models.BarChart,
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

	chartRender: function(){

		if(this.chartSettings){

			//change visibility of controls
			$('.attributeControl').hide();
			_.each(this.chartSettings.attributes,function(e){
				$('.attributeControl#'+e).show();
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