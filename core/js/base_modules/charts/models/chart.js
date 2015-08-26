var charts = charts || {
    models: {},
    views: {}
};

charts.models.Chart = Backbone.Model.extend({
    urlRoot: '/api/charts/',
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
        this.data = new charts.models.ChartData({
            urlRoot: this.get('resourceUrl'),
            idAttribute: this.get('resourceIdAttribute'),
            id: this.get('resourceID')
        });
        this.bindEvents();
    },

    bindEvents: function () {
        //Se actualizan los filtros de los datos cuando se cambian las options
        this.on('change:options', this.updateFetchFilters);
        this.listenTo(this.data, 'data_updated', this.handleDataUpdate);
    },

    /**
     * Default fetch filter updater
     */
    updateFetchFilters: function () {
        this.data.set('fetchFilters', this.get('options'));
    },

    /**
     * Handler para manejar las actualizaciones a los datos
     * @return {[type]} [description]
     */
    handleDataUpdate: function () {
        console.log("ChartModel data updated:");
        this.trigger('data_updated');
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
