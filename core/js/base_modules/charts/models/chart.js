var charts = charts || {
    models: {},
    views: {}
};

charts.models.Chart = Backbone.Model.extend({
    defaults: {
        type: 'linechart',
        lib: 'google',

        showLegend: true,
        invertedAxis: null,
        chartTemplate: '¿?',
        nullValueAction: '',
        nullValuePreset: '',
        traspose: false,

        //metadata
        meta_title: null,
        meta_description: null,
        meta_category: null,
        meta_notes: null,
        meta_source: null,
        meta_tags: null,

        //data selection
        range_headline:null,
        range_data:null,
        range_label:null

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

    getFormData: function(){
        var formData = this.getMeta();
        formData = _.extend( formData,this.getSettings() );
        return formData; 
    },

    getMeta: function(){
        var metadata = {
            title: this.get('meta_title'),
            description: this.get('meta_description'),
            notes: this.get('meta_notes'),
            category: this.get('meta_category'),
            source: this.get('meta_source'),
            tags: this.get('meta_tags')
        };

        return metadata;
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
            traspose: this.get('traspose'),

            //data selection
            range_headline: this.get('range_headline'),
            range_data: this.get('range_data'),
            range_label: this.get('range_label')
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
