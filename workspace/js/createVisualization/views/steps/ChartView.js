var ChartView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
		this.addEvents({
	
			'click a.backButton': 			'onPreviousButtonClicked',
			'click a.nextButton': 			'onNextButtonClicked',
			'click button.selectData': 		'onSelectDataClicked',
			'click button.chartType': 		'onChartTypeClicked',
			'change select#chartLibrary': 	'onChartLibraryChanged',
			
			'keyup input#nullValuePreset': 	'onInputChanged',
			
			'change input[type=radio]': 	'onRadioChanged',
			'change input[type=checkbox]': 	'onCheckboxChanged'

		});

		this.chartsFactory = new charts.ChartsFactory(); // create ChartsFactory

        this.chartSelectDataModalView = new ChartSelectDataModalView({
          el: '#ChartSelectDataModal',
          model: this.model
        });
        this.chartSelectDataModalView.on('open', function () {
        	this.dataTableView.render();
        });

		this.listenTo(this.model.data, 'change:rows', this.onChangeData, this);
		this.listenTo(this.model, 'change:lib', this.onChartChanged, this);
		this.listenTo(this.model, 'change:type', this.onChartChanged, this);
		this.listenTo(this.chartSelectDataModalView, 'close',
			this.onCloseModal, this);

		this.chartContent = this.$el.find('.chartContent');

		this.setupChart();
	},

	bgClasses: {
			'barchart': 'previewBar',
			'columnchart': 'previewColumn',
			'areachart': 'previewArea',
			'linechart': 'previewLine',
			'piechart': 'previewPie'
	},	

	onCloseModal: function () {
		this.fetchPreviewData();
	},

	fetchPreviewData: function(){
		$("#ajax_loading_overlay").show();
		this.model.fetchPreviewData()
		.then(function () {
			$("#ajax_loading_overlay").hide();
		})
		.error(function(response){
			$("#ajax_loading_overlay").hide();
        });;
	},

	onCheckboxChanged: function(e){
		var input = $(e.target);
		this.model.set(input.attr('name'), input.prop('checked'));
		this.fetchPreviewData();
	},

	onChangeData: function (model) {
		console.log('the data for your chart has changed', model.toJSON());
		// TODO: should call this.chartView.render();
		this.renderChart();
	},

	onSelectDataClicked: function(){
		this.chartSelectDataModalView.open();
	},

	onChartTypeClicked: function(e){
		e.preventDefault();
		var type = $(e.currentTarget).data('type');
		this.selectGraphType(type);
	},

	onChartLibraryChanged: function(e){
		var lib = $(e.currentTarget).val();
		$('.chartType').hide();
		$('.chartType.'+lib+'Chart').show();
		this.model.set('lib',lib);
	},

	onInputChanged: function(e){
		var input = $(e.currentTarget);
		this.model.set(input.data('ref'), input.val());
		this.fetchPreviewData();
	},

	onRadioChanged: function(e){
		var input = $(e.currentTarget);
		this.model.set(input.attr('name'), input.val());

		if(input.val()=='given'){
			$('#nullValuePreset').show();
		}else{
			this.fetchPreviewData();
			$('#nullValuePreset').hide();
		}
	},

	selectGraphType: function(type){
		$('.chartType').removeClass('active');
		$('.chartType.'+type).addClass('active');
		this.changeClass(type);
		this.model.set('type',type);
	},



	changeClass: function(type){

		this.clearClassesChartBg();

		this.chartContent.addClass(this.bgClasses[type]);

	},

	clearClassesChartBg: function(){
		var that = this;
		_.each(this.bgClasses,function(clase,ix){
			that.chartContent.removeClass(clase);			
		});
	},

	onChartChanged: function(){
		if(!this.model.get('isMap')){
			console.log('you selected type: ', this.model.get('type') + ' - '+ this.model.get('lib') );
			this.setupChart();
			this.renderChart();
		}
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
			delete this.ChartViewClass;
			console.log('There are not class for this');
		}

	},

	renderChart: function () {
	
		if (this.ChartViewClass) {

			this.chartInstance = new this.ChartViewClass({
				el: this.$('.chartContent'),
				model: this.model,
			});
			
			if(this.chartInstance.valid()){
				this.clearClassesChartBg();
				this.chartInstance.render();
			};

		}
	},

	onPreviousButtonClicked: function(){
		this.goTo(0);
	},

	onNextButtonClicked: function(){		

		/*if(this.model.isValid(true)){
			this.model.setOutput();*/
			this.next();
		/*}*/

	},

	start: function(){
		this.constructor.__super__.start.apply(this);

		// chart type from first step
		var initial = this.model.get('type');
		this.selectGraphType(initial);

	},



});