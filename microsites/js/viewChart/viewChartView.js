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

        this.chartInstance.model.data.bind('change', this.renderChart, this);
        return this;
    },
    renderChart: function () {
        this.chartInstance.model.set('this', 'that');
        this.chartInstance.render();
    },
    initializeChart: function () {
        if(typeof this.chartInstance === 'undefined'){
            this.createChartInstance();
        }
    },
    createChartInstance: function () {
        var chartModelInstance = new this.ChartModelClass({
            type: this.model.get('chart.type'),
            resourceID: 7856,
            options: {
                zoom: 17,
                center: {
                    lat: 38.58267175145875,
                    long: -121.4893537031936
                }
            }
        });

        this.chartInstance = new this.ChartViewClass({
            el: $('#chartContainer'),
            model: chartModelInstance
        });
    }
});