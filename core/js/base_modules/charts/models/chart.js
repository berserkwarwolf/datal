var charts = charts || {
    models: {},
    views: {}
};

charts.models.Chart = Backbone.Model.extend({
    urlRoot: '/api/charts/',
    defaults: {
        resourceUrl: '',
        resourceID: null,
        resourceIdAttribute: null,
        type: 'linechart',
        lib: 'google',
        options: {
        },
        //metadata
        meta_title: null,
        meta_description: null,
        meta_category: null,
        meta_notes: null

    },

    initialize: function () {
        //Initialize data model with fetch filters
        this.data = new charts.models.ChartData({
            visualization_revision_id: this.get('resourceID')
        });

        //Update the fetch filters every time we change the options
        this.on('change:options', this.updateFetchFilters);
    },

    /**
     * Default fetch filter updater
     */
    updateFetchFilters: function () {
        this.data.set('fetchFilters', this.get('options'));
    },

    /**
     * Fetch data for the chart
     * @return {promise}
     */
    fetchData: function () {
        return this.data.fetch();
    },

    render: function(){
        return true;
    },

    getFormData: function(){
        return false; //return form data, 
    },

    getMeta: function(){
        var metadata = {
            title: this.get('meta_title'),
            description: this.get('meta_description'),
            notes: this.get('meta_notes'),
            category: this.get('meta_category')
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
            showLegend: this.get('showLegend'),
            traspose: this.get('traspose'),
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
