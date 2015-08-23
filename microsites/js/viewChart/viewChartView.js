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
        this.renderChart();
        return this;
    },
    renderChart: function () {
        if(typeof this.chartInstance === 'undefined'){
            this.createChartInstance();
        }

        if(this.chartInstance.valid()){
            this.chartInstance.render();
        };
    },
    createChartInstance: function () {
        var chartModelInstance = new this.ChartModelClass({
            type: this.model.get('chart.type'),
            options: {
                zoom: 14,
                center: {
                    "lat": "-33.4361640",
                    "long": "-70.6112010",
                }
            }
        });

        //TODO: fetch the data from the server
        // chartModelInstance.fetchData();
        chartModelInstance.data.set('points', theData.points);

        this.chartInstance = new this.ChartViewClass({
            el: $('#chartContainer'),
            model: chartModelInstance
        });
    }
});