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


charts.views.BarChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'barchart') {
            console.error('A DataLine model must be suplied');
        }
    }
});
