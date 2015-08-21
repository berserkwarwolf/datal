var ChartView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
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
			'change input[type=checkbox]': 	'onCheckboxChanged'

		});

		this.chartsFactory = new charts.ChartsFactory(); // create ChartsFactory

		// Bind model validation to view
		//Backbone.Validation.bind(this);

		this.listenTo(this.model.data, 'change:rows', this.onChangeData, this);
		this.listenTo(this.model, 'change:lib', this.onChartChanged, this);
		this.listenTo(this.model, 'change:type', this.onChartChanged, this);

	}, 

	onCheckboxChanged: function(e){
		var input = $(e.target);
		this.model.set(input.attr('name'),input.val());
	},

	onChangeData: function (model) {
		console.log('the data for your chart has changed', model.toJSON());
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

	onInputChanged: function(e){
		var input = $(e.target);
		this.model.set(input.data('ref'),input.val());
	},

	onRadioChanged: function(e){
		var input = $(e.target);
		this.model.set(input.attr('name'),input.val());

		if(input.val()=='given'){
			$('#nullValuePreset').show();
		}else{
			$('#nullValuePreset').hide();
		}
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

		var chartSettings = this.chartsFactory.create(this.model.get('type'),this.model.get('lib'));

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

	renderChart: function () {
	
		if (this.ChartViewClass) {

			this.chartInstance = new this.ChartViewClass({
				el: $('#chartContainer'),
				model: this.model,
			});
			
			if(this.chartInstance.valid()){
				this.chartInstance.render();
			};

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