/**
 * Backbone View for charts and maps
 */
var viewEmbedChartView = Backbone.View.extend({
    el : "body",
    chartContainer: "#id_visualizationResult",
    initialize : function() {
        var self = this;

        this.chartsFactory = new charts.ChartsFactory();
        this.$window = $(window);

        this.setupChart();
        this.render();
        this.listenTo(this.model, "change", this.render);
    },
    /**
     * Configura el chart de la visualización
     */
    setupChart: function () {
        this.$chartContainer = $(this.chartContainer);

        this.model.set('chart', {
            lib: this.model.get('chartLib'),
            type: JSON.parse(this.model.get('chartJson')).format.type
        });

        var chartSettings = this.chartsFactory.create(this.model.get('chart').type, this.model.get('chart').lib);

        this.ChartViewClass = chartSettings.Class;
        this.ChartModelClass = charts.models.Chart;
    },
    /**
     * Initcializa el chart de la vista
     */
    initializeChart: function () {
        if(typeof this.chartInstance === 'undefined'){
            this.createChartInstance();
        }
    },
    /**
     * Crea una instancia del chart para ser insertado en la vista
     */
    createChartInstance: function () {
        var chartModelInstance = new this.ChartModelClass({
            type: this.model.get('chart').type,
            resourceID: this.model.get('visualizationrevision_id')
        });

        this.chartInstance = new this.ChartViewClass({
            el: this.chartContainer,
            model: chartModelInstance
        });

        this.chartInstance.model.fetchData();
    },
    /**
     * Muestra un elemento UI para indicar el estado de carga
     */
    setLoading: function () {
        // TODO: Implementar loader
    },
    /**
     * Render de la vista
     */
    render: function () {
        this.initializeChart();
        this.chartInstance.render();
        return this;
    }
});