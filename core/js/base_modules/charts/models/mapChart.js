var charts = charts || {
    models: {},
    views: {}
};

charts.models.MapChart = charts.models.Chart.extend({
    type: 'map',
    defaults: _.extend({},charts.models.Chart.prototype.defaults, {
        type: 'map',
        //TOOD: Change the url for the final one
        resourceUrl: '/js_microsites/viewChart/map_sample_data.json?',
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
     * Fetch data for the map
     * @return {promise}
     */
    fetchData: function () {
        this.data.url = this.getDataUrl();
        return this.data.fetch();
    },

    /**
     * Prepare the url with all the params needed to make the request for the data
     * @return {string} url
     */
    getDataUrl: function () {
        var baseUrl = this.get('resourceUrl'),
            params = $.param({
                visualization_revision_id: this.get('resourceID'),
                zoom: this.get('options').zoom,
                bounds: this.get('options').bounds.join(';')
            });
        return baseUrl + params;
    }
});
