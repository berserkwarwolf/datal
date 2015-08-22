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
        var chartSettings = this.chartsFactory.create(this.model.get('type'),this.model.get('lib'));

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
            type: this.model.get('type')
        });
        console.log('chartModelInstance', chartModelInstance.toJSON());

        //TODO: fetch the data from the server
        // chartModelInstance.fetchData();
        chartModelInstance.data.set('fields', [['number', 'year'], ['number', 'population']]);
        chartModelInstance.data.set('rows', theData);

        console.log('chartData', chartModelInstance.data.toJSON());

        this.chartInstance = new this.ChartViewClass({
            el: $('#chartContainer'),
            model: chartModelInstance
        });
    }
});