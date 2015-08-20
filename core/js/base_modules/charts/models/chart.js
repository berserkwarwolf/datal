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
    },

    getGeneralSettings: function(){
        var settings = {
            format: {
                type: this.get('type'),
                lib: this.get('lib'),
                showLegend: this.get('showLegend'),
                invertedAxis: this.get('invertedAxis'),
                chartTemplate: '',//?
                nullValueAction: this.get('nullValueAction'),
                nullValuePreset: this.get('nullValuePreset'),
                showLegend: this.get('showLegend'),
                tranpose: this.get('traspose'),
                sort: this.get('sort')
            },
            title: this.get('title'),
            data: '',
            chart: this.getChartAttributes()
        };
        return settings;
    },

    getChartAttributes: function(){
        var attr = {};
        var that = this;
        _.each(this.get('attributes'),function(e){
            attr[e] = that.get(e);
        });
        return attr;
    }

});
