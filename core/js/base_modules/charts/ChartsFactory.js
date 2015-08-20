var charts = charts || {
    models: {},
    views: {}
};

charts.ChartsFactory = Backbone.Model.extend({
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

	create: function(type,lib){
		if( _.has(this.availableCharts,lib) &&
			_.has(this.availableCharts[lib],type) ){
			return this.availableCharts[lib][type];
		} else {
			return false;
		}

	}
});