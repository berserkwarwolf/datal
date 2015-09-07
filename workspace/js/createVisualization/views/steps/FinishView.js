var FinishView = StepViewSPA.extend({

	initialize: function(){

		this.addEvents({
			'click a.backButton': 'onPreviousButtonClicked',
			'click button.editMetadata': 'onPreviousButtonClicked',
			'click button.editChart': 'onEditChartButtonClicked',
			'click a.finishButton': 'onFinishButtonClicked'
		});

		this.chartsFactory = new charts.ChartsFactory(); // create ChartsFactory

		this.chartContent = this.$el.find('.chartContentFinish');

	}, 

	onEditChartButtonClicked: function(){
		this.goTo(1);
	},

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onFinishButtonClicked: function(){		
		var data = this.model.getFormData();
		console.log(data);
		$.ajax({
			url: '/visualizations/create?datastream_revision_id='
				+ this.model.get('datastream_revision_id'),
			type:'POST',
			data: data,
			dataType: 'json'
		}).then(function (response) {
			if(response.status=='ok'){
				window.location = '/visualizations/'+response.revision_id;
			} else {
				console.error(response);
			}
		});
	},

	start: function(){
		this.constructor.__super__.start.apply(this);

		this.setupChart();
		this.renderChart();

	},

	finish: function(){
		this.constructor.__super__.finish.apply(this);
		if(this.chartInstance){
			this.chartInstance.destroy();
		}
	},

	setupChart: function(){

		var chartSettings = this.chartsFactory.create(this.model.get('type'),this.model.get('lib'));

		if(chartSettings){

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

			if(this.chartInstance){
				this.chartInstance.destroy();
			}

			this.chartInstance = new this.ChartViewClass({
				el: this.chartContent,
				model: this.model,
			});
			
			if(this.chartInstance.valid()){
				this.chartInstance.render();
			};
		}
	},

});