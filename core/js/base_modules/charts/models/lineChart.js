var charts = charts || {
    models: {},
    views: {}
};

charts.models.LineChart = charts.models.Chart.extend({
    type: 'line',
    defaults: _.extend({},charts.models.Chart.prototype.defaults, {
        type: 'line',
        options: {
            title: 'my line chart',
            xLabel: 'x axis label',
            yLabel: 'y axis label'
        },
    })
});
