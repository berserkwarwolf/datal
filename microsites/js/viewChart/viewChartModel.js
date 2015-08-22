var viewChartModel = Backbone.Model.extend({
    defaults: {
        visualization_id: null,
        settings: {},
        lib: 'google',
        type: 'barchart'
    },
    initialize: function(){
    }
});