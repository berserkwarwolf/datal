/**
 * Backbone View for charts and maps
 */
var viewEmbedChartView = Backbone.View.extend({
    el : "body",
    chartContainer: "#id_visualizationResult",

    initialize : function() {

        // Init Visualization
        this.chartView = new ChartView({
            el: this.chartContainer,
            model: this.model
        });

        // Render
        this.render();

    },

    render : function() {
        this.chartView.render();
        return this;
    },

});