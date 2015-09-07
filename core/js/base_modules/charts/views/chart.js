var charts = charts || {
    models: {},
    views: {}
};


charts.views.Chart = Backbone.View.extend({
    initialize: function(){
        if (this.model.get('type') === null) {
            console.error('Chart models must define a type property');
        }
        this.bindEvents();
    },

    bindEvents: function () {
        // this.model.on('change', this.render, this);
        this.model.on('data_updated', this.handleDataUpdated, this);
    },

    handleDataUpdated: function () {
        this.render();
    },

    formatData: function () {
    	// reads data from model and returns formated data for the specific
    	// subclass
    },

    valid: function () {
        // Check if data is correct
        // specific chart library
        return true;
    },

    render: function () {
    	// implements rendering of data received from :formatData: for the 
    	// specific chart library
    },

    destroy: function(){
        if(this.chart.destroy){ //c3
            this.chart.destroy();
        };
        if(this.chart.clearChart){ //google
            this.chart.clearChart();
        };
    }
});
