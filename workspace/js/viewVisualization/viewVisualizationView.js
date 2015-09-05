/**
 * Backbone View for charts and maps
 */
var viewVisualizationView = Backbone.View.extend({
    el : ".main-section",

    chartContainer: "#id_visualizationResult",
    initialize : function() {

        this.template = _.template( $("#context-menu-template").html() );
        this.listenTo(this.model, "change", this.render);

        this.chartsFactory = new charts.ChartsFactory();

        this.setupChart();
        this.render();
    },
    setupChart: function () {
        this.chartFormat = JSON.parse(this.model.get('chartJson')).format;

        console.log("this.chartFormat:", this.chartFormat);

        var chartSettings = this.chartsFactory.create(this.chartFormat.type,this.chartFormat.lib);

        this.ChartViewClass = chartSettings.Class;
        this.ChartModelClass = charts.models.Chart;
    },
    render: function () {
        console.log("this.model:", this.model.toJSON());
        this.$el.find('.context-menu').html( this.template( this.model.toJSON() ) );
        this.initializeChart();
        this.chartInstance.render();
        return this;
    },
    initializeChart: function () {
        if(typeof this.chartInstance === 'undefined'){
            this.createChartInstance();
        }
    },
    createChartInstance: function () {
        this.setChartContainerSize();

        var chartModelInstance = new this.ChartModelClass({
            type: this.model.get('chart.type'),
            resourceID: this.model.get('visualizationrevision_id')
        });

        this.chartInstance = new this.ChartViewClass({
            el: this.chartContainer,
            model: chartModelInstance
        });

        this.chartInstance.model.fetchData();
    },
    setLoading: function () {
        
    },

    setChartContainerSize:function(){
        var $window = $(window),
            container = $(this.chartContainer),
            $header = $('header.header'),
            $title = $('.main-section .section-title'),
            $sidebar = $('.main-navigation');

        //Asigna listener al resize de la ventana para ajustar tamaño del chart
        $window.on('resize', function () {
            //Calcula el alto de los headers
            var otherHeights = $header.outerHeight(true) + $title.outerHeight(true)
                minHeight = $window.height() - otherHeights - 40;
            //Calcula el ancho de los sidebars
            var otherWidths = $sidebar.outerWidth(true),
                minWidth = $window.width() - otherWidths - 80;
            container.css({
                height: minHeight + 'px',
                width: minWidth + 'px'
            });
        }).trigger('resize');
    }
});