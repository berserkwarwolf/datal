var charts = charts || {
    models: {},
    views: {}
};

charts.models.ChartData = Backbone.Model.extend({
    urlRoot: '/api/data/',
    defaults: {
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
    }
});
