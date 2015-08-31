var MapView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
		this.addEvents({
	
			'click a.backButton': 			'onPreviousButtonClicked',
			'click a.nextButton': 			'onNextButtonClicked',
			'click button.selectData': 		'onSelectDataClicked',
			'click .chartType': 		'onChartTypeClicked',
			
			'keyup input#chartTitle': 		'onInputChanged'
		
		});

        this.model.set({lib:'google'});

        this.chartsFactory = new charts.ChartsFactory();

        this.modalView = new MapSelectDataModalView({
          el: '#MapSelectDataModal',
          model: this.model
        });
        this.modalView.on('open', function () {
            this.dataTableView.render();
        });

        // Event binding
        this.listenTo(this.model, 'change:type', this.onChartChanged, this);
    }, 

	onSelectDataClicked: function(){
		this.modalView.open();
	},

	onInputChanged: function(e){
		var input = $(e.target);
		this.model.set(input.data('ref'),input.val());
	},

	onChartTypeClicked: function(e){
		e.preventDefault();
		var type = $(e.currentTarget).data('type');
		this.selectGraphType(type);
	},

	selectGraphType: function(type){
		this.$('.chartType').removeClass('active');
		this.$('[data-type="' + type + '"].chartType').addClass('active');
		this.model.set('type',type);
	},

	onChartChanged: function(){
		if(this.model.get('isMap')){
			console.log('you selected type: ', this.model.get('type') );
			this.setupChart();
			this.renderChart();
		}
	},

	setupChart: function(){
        var chartSettings = this.chartsFactory.create(this.model.get('type'), this.model.get('lib'));

        if(chartSettings){

            //Set list of custom attributes for my model
            this.model.set('attributes', chartSettings.attributes);

            this.ChartViewClass = chartSettings.Class;

        } else {
            delete this.ChartViewClass;
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
		this.goTo(0);
	},

	onNextButtonClicked: function(){		
		this.next();
	},

	start: function(){
		this.constructor.__super__.start.apply(this);
	}


});