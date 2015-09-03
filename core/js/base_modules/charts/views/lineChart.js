var charts = charts || {
    models: {},
    views: {}
};


charts.views.Chart = Backbone.View.extend({
    initialize: function(){
        if (this.model.get('type') === null) {
            console.error('Chart models must define a type property');
        }
    }
});


charts.views.LineChart = charts.views.Chart.extend({
    initialize: function(){
        if (this.model.get('type') !== 'line') {
            console.error('A DataLine model must be suplied');
        }
    }
});

