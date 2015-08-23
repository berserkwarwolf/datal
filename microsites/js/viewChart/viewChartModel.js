var viewChartModel = Backbone.Model.extend({
    defaults: {
        visualization_id: null,
        settings: {},
        chart: {
            lib: 'google',
            type: 'barchart'
        }
    },
    initialize: function(){
    }
});