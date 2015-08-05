var charts = charts || {
    models: {},
    views: {}
};


charts.views.Chart = Backbone.View.extend({
    initialize: function(){
        if (this.model.get('type') === null) {
            console.error('Chart models must define a type property');
        }
    },

    formatData: function () {
    	// reads data from model and returns formated data for the specific
    	// subclass
    },

    render: function () {
    	// implements rendering of data received from :formatData: for the 
    	// specific chart library
    }
});
