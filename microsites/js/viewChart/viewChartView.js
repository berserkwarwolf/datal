/**
 * Backbone View for charts and maps
 */
var viewChartView = Backbone.View.extend({
    initialize : function() {
        this.listenTo(this.model, "change", this.render);

        this.chartsFactory = new charts.ChartsFactory();

        this.setupChart();
        this.render();
    },
    setupChart: function () {
        var chartSettings = this.chartsFactory.create(this.model.get('chart').type,this.model.get('chart').lib);

        this.ChartViewClass = chartSettings.Class;
        this.ChartModelClass = chartSettings.Model;
    },
    render: function () {
        this.initializeChart();
        return this;
    },
    initializeChart: function () {
        if(typeof this.chartInstance === 'undefined'){
            this.createChartInstance();
        }
    },
    createChartInstance: function () {
        var chartModelInstance = new this.ChartModelClass({
            type: this.model.get('chart.type'),
            resourceUrl: 'http://data.cityofsacramento.org/visualizations/invoke',
            resourceIdAttribute: 'visualization_revision_id',
            resourceID: 6741,
            options: {
                zoom: 15,
                center: {
                    lat: 38.5806808485,
                    long: -121.4826359602
                }
            }
        });

        this.chartInstance = new this.ChartViewClass({
            el: $('#chartContainer'),
            model: chartModelInstance
        });
    }
});