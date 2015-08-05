var charts = charts || {
    models: {},
    views: {}
};


charts.views.LineChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'line') {
            console.error('A DataLine model must be suplied');
        }
    }
});


charts.views.BarChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'bar') {
            console.error('A DataLine model must be suplied');
        }
    }
});
