var charts = charts || {
    models: {},
    views: {}
};

charts.models.Chart = Backbone.Model.extend({
    url: '',
    urlRoot: '/api/charts/',
    defaults: {
        resourceUrl: '',
        resourceID: null,
        resourceIdAttribute: null,
        type: null,
        options: {}
    },
    initialize: function () {
        this.data = new charts.models.ChartData();
    },
    render: function(){
        return true;
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

    getDataUrl: function () {
        return this.get('resourceUrl') + this.get('resourceIdAttribute') + '=' + this.get('resourceID');
    },

    getSettings: function(){
        var settings = {
            type: this.get('type'),
            lib: this.get('lib'),
            showLegend: this.get('showLegend'),
            invertedAxis: this.get('invertedAxis'),
            chartTemplate: '¿?',
            nullValueAction: this.get('nullValueAction'),
            nullValuePreset: this.get('nullValuePreset'),
            showLegend: this.get('showLegend'),
            tranpose: this.get('traspose'),
            sort: this.get('sort'),
            title: this.get('title')
        };

        settings = _.extend( settings,this.getChartAttributes() );

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
