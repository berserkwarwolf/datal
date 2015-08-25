var charts = charts || {
    models: {},
    views: {}
};

charts.models.MapChart = charts.models.Chart.extend({
    type: 'map',
    urlRoot: '/api/charts/',
    defaults: _.extend({},charts.models.Chart.prototype.defaults, {
        type: 'map',
        options: {
            zoom: 5,
            center: {
                lat: 0, 
                long: 0
            },
            bounds: []
        }
    }),

    /**
     * Prepare fetch filter from the options
     */
    updateFetchFilters: function () {
        var filters = {
            zoom: this.get('options').zoom,
            bounds: this.get('options').bounds.join(';')
        };
        this.data.set('fetchFilters', filters);
    }

});
