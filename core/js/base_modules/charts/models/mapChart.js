var charts = charts || {
    models: {},
    views: {}
};

charts.models.MapChart = charts.models.Chart.extend({
    type: 'map',
    defaults: _.extend({},charts.models.Chart.prototype.defaults, {
        type: 'map',
        options: {
            zoom: 5,
            center: {
                lat: 0, 
                long: 0
            },
        },
    })
});
