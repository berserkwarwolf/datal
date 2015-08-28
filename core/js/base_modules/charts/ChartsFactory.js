var charts = charts || {
    models: {},
    views: {}
};

charts.ChartsFactory = function(){

	return {

		availableCharts: {
			'd3':{
				'linechart': {
							'Class': charts.views.C3LineChart,
							'Model': charts.models.LineChart,
							'attributes': ['yTitle','xTitle']
						},
				'areachart': {
							'Class': charts.views.C3AreaChart,
							'Model': charts.models.LineChart,
							'attributes': ['yTitle','xTitle']
						},
				'barchart': {
							'Class': charts.views.C3BarChart,
							'Model': charts.models.BarChart,
							'attributes': ['yTitle','xTitle']
						},
				'columnchart': {
							'Class': charts.views.C3ColumnChart,
							'Model': charts.models.BarChart,
							'attributes': ['yTitle','xTitle']
						},
				'piechart': {
							'Class': charts.views.C3PieChart,
							'Model': charts.models.BarChart,
							'attributes': ['yTitle','xTitle']
						}						
			},
			'google':{
				'linechart': {
							'Class': charts.views.GoogleLineChart,
							'Model': charts.models.LineChart,
							'attributes': ['yTitle','xTitle']
						},
				'areachart': {
							'Class': charts.views.GoogleAreaChart,
							'Model': charts.models.LineChart,
							'attributes': ['yTitle','xTitle']
						},
				'barchart': {
							'Class': charts.views.GoogleBarChart,
							'Model': charts.models.BarChart,
							'attributes': ['yTitle']
						},
				'columnchart': {
							'Class': charts.views.GoogleColumnChart,
							'Model': charts.models.BarChart,
							'attributes': ['yTitle']
						},
				'piechart': {
							'Class': charts.views.GooglePieChart,
							'Model': charts.models.PieChart,
							'attributes': ['yTitle']
						},				
                'map': {
                        'Class': charts.views.MapChart,
                        'Model': charts.models.MapChart,
                        'attributes': []
                    }
			}
		},
	
		create: function(type,lib){

            console.log('Chart Factory:', type, lib);

			if( _.has(this.availableCharts,lib) &&
				_.has(this.availableCharts[lib],type) ){
				return this.availableCharts[lib][type];
			} else {
				return false;
			}
		}
	}
};