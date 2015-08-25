var charts = charts || {
    models: {},
    views: {}
};

charts.models.PieChart = charts.models.Chart.extend({
    type: 'piechart',
    defaults: _.extend({},charts.models.Chart.prototype.defaults, {
        type: 'piechart',
        options: {
            title: 'my pie chart'
        },
    })
});
