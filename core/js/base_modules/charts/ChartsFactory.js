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
                            'attributes': ['yTitle','xTitle']
                        },
                'areachart': {
                            'Class': charts.views.C3AreaChart,
                            'attributes': ['yTitle','xTitle']
                        },
                'barchart': {
                            'Class': charts.views.C3BarChart,
                            'attributes': ['yTitle','xTitle']
                        },
                'columnchart': {
                            'Class': charts.views.C3ColumnChart,
                            'attributes': ['yTitle','xTitle']
                        },
                'piechart': {
                            'Class': charts.views.C3PieChart,
                            'attributes': ['yTitle','xTitle']
                        }                       
            },
            'google':{
                'linechart': {
                            'Class': charts.views.GoogleLineChart,
                            'attributes': ['yTitle','xTitle']
                        },
                'areachart': {
                            'Class': charts.views.GoogleAreaChart,
                            'attributes': ['yTitle','xTitle']
                        },
                'barchart': {
                            'Class': charts.views.GoogleBarChart,
                            'attributes': ['yTitle']
                        },
                'columnchart': {
                            'Class': charts.views.GoogleColumnChart,
                            'attributes': ['yTitle']
                        },
                'piechart': {
                            'Class': charts.views.GooglePieChart,
                            'attributes': ['yTitle']
                        },              
                'map': {
                        'Class': charts.views.MapChart,
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