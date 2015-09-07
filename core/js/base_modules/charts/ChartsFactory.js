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
                            'attributes': []
                        },
                'areachart': {
                            'Class': charts.views.C3AreaChart,
                            'attributes': []
                        },
                'barchart': {
                            'Class': charts.views.C3BarChart,
                            'attributes': []
                        },
                'columnchart': {
                            'Class': charts.views.C3ColumnChart,
                            'attributes': []
                        },
                'piechart': {
                            'Class': charts.views.C3PieChart,
                            'attributes': []
                        }                       
            },
            'google':{
                'linechart': {
                            'Class': charts.views.GoogleLineChart,
                            'attributes': []
                        },
                'areachart': {
                            'Class': charts.views.GoogleAreaChart,
                            'attributes': []
                        },
                'barchart': {
                            'Class': charts.views.GoogleBarChart,
                            'attributes': []
                        },
                'columnchart': {
                            'Class': charts.views.GoogleColumnChart,
                            'attributes': []
                        },
                'piechart': {
                            'Class': charts.views.GooglePieChart,
                            'attributes': []
                        },              
                'mapchart': {
                        'Class': charts.views.MapChart,
                        'attributes': []
                    }
            }
        },
    
        create: function(type,lib){
            type = type || 'linechart';
            lib = lib || 'google';

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