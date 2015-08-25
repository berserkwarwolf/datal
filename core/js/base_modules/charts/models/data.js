var charts = charts || {
    models: {},
    views: {}
};

charts.models.ChartData = Backbone.Model.extend({
    type: 'line',
    //TODO: change to final data url
    urlRoot: '/js_microsites/viewChart/map_sample_data.json',
    idAttribute: 'visualization_revision_id',
    defaults: {
        fetchFilters: {},
        type: 'line',
        fields: [
            // [fieldtype, fieldname]
        ],
        rows: [
            // [value, value, value, ...]
        ],
        //Map data
        points: [
            // "lat": "00.000000",
            // "long": "-00.000000",
            // "info": "<strong>Point text information</strong>"
        ]
    },

    initialize: function () {
        this.on('change:fetchFilters', this.handleFetchFiltersChange, this);
    },

    /**
     * Handle the change events on the filters so we can fetch updated data
     */
    handleFetchFiltersChange: function () {
        this.fetch();
    },

    /**
     * Add filters to the url 
     * Due to the dynamic nature of the data sources every fetch may use different filters
     */
    url: function () {
        var filters = this.get('fetchFilters');
        filters[this.idAttribute] = this.id;
        return this.urlRoot + '?' + $.param(filters);
    }
});
