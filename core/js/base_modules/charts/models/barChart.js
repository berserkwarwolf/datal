var charts = charts || {
    models: {},
    views: {}
};


charts.models.BarChart = charts.models.Chart.extend({
    type: 'bar',
    defaults: _.extend({},charts.models.Chart.prototype.defaults, {
        type: 'bar',
        options: {
            title: 'my line chart',
            xLabel: 'x axis label',
            yLabel: 'y axis label'
        },
    })
});
