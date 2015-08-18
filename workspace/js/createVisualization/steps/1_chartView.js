var ChartView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['click a.backButton'] = 'onPreviousButtonClicked';
		eventsObject['click a.nextButton'] = 'onNextButtonClicked';
		eventsObject['click button.selectData'] = 'onSelectDataClicked';
		eventsObject['click button.chartType'] = 'onChartTypeClicked';
		eventsObject['change select#chartLibrary'] = 'onChartLibraryChanged';
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
		this.chartView = this.factoryChart();

		this.chartRender();

		//chart factory from model?
		$('#chartContainer').html(this.model.get('type') + ' - '+ this.model.get('lib') );

	},

	factoryChart: function(){

		switch(this.model.get('lib')){
			case 'd3':
			
				switch(this.model.get('type')){
					case 'line':
						return charts.views.C3LineChart;
					break;
					case 'bars':
						return charts.views.C3BarChart
					break;
					default:
						return false;
					break;
				}
			
			break;

			case 'google':
			
				switch(this.model.get('type')){
					case 'line':
						return charts.views.GoogleLineChart;
					break;
					case 'bars':
						return charts.views.GoogleBarChart;
					break;
					default:
						return false;
					break;
				}
			
			break;
			
			default:
				return false;
			break;
		}
	},

	chartRender: function(){


		if(this.chartView){
			console.log(this.chartView);
			this.chartInstance = this.chartView({

			});
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