var charts = charts || {
    models: {},
    views: {}
};

charts.models.Chart = Backbone.Model.extend({
    urlRoot: '/api/charts/',
    defaults: {
        resourceUrl: '',
        resourceID: null,
        type: null,
        options: {
            title: 'Title',
            xLabel: null,
            yLabel: null
        },
    },
    initialize: function () {
        this.data = new charts.models.ChartData();
    },
    fetchData: function () {
        var urlRoot = this.get('resourceUrl'),
            resourceID = this.get('resourceID');

        this.data = new charts.models.ChartData({
            id: resourceID
        }, {
            urlRoot: urlRoot
        });

        return this.data.fetch();
    }
});
