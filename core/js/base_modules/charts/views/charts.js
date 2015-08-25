var charts = charts || {
    models: {},
    views: {}
};


charts.views.LineChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'linechart') {
            console.error('A DataLine model must be suplied');
        }
    }
});

charts.views.AreaChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'areachart') {
            console.error('A DataLine model must be suplied');
        }
    }
});

charts.views.BarChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'barchart') {
            console.error('A DataLine model must be suplied');
        }
    }
});

charts.views.ColumnChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'columnchart') {
            console.error('A DataLine model must be suplied');
        }
    }
});


charts.views.PieChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'piechart') {
            console.error('A DataLine model must be suplied');
        }
    }
});
