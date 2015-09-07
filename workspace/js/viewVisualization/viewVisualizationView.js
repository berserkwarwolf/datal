/**
 * Backbone View for charts and maps
 */
var viewVisualizationView = Backbone.View.extend({
    el : ".main-section",

    chartContainer: "#id_visualizationResult",
    initialize : function() {

        this.template = _.template( $("#context-menu-template").html() );
        this.chartsFactory = new charts.ChartsFactory();

        this.setupChart();
        this.render();
        this.listenTo(this.model, "change", this.render);
    },
    setupChart: function () {
        this.model.set('chart', {
            lib: this.model.get('chartLib'),
            type: JSON.parse(this.model.get('chartJson')).format.type
        });

        var chartSettings = this.chartsFactory.create(this.model.get('chart').type, this.model.get('chart').lib);

        this.ChartViewClass = chartSettings.Class;
        this.ChartModelClass = charts.models.Chart;
    },
    render: function () {
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
        var chartModelInstance = new this.ChartModelClass({
            type: this.model.get('chart').type,
            resourceID: this.model.get('visualizationrevision_id')
        });

        this.chartInstance = new this.ChartViewClass({
            el: this.chartContainer,
            model: chartModelInstance
        });

        this.setChartContainerSize();

        this.chartInstance.model.fetchData();
    },
    setLoading: function () {
        
    },

    setChartContainerSize:function(){
        var chartInstance = this.chartInstance,
            container = $(this.chartContainer),
            $window = $(window),
            $mainHeader = $('header.header'),
            $title = $('.main-section .section-title'),
            $chartHeader = $('header.header');

        var handleResizeEnd = function () {
            //Calcula el alto de los headers
            var otherHeights = $mainHeader.outerHeight(true) 
                             + $title.outerHeight(true)
                             + $chartHeader.outerHeight(true);
            //Calucla el alto que deberá tener el contenedor del chart
            var minHeight = $window.height() - otherHeights - 70;
            container.css({
                height: minHeight + 'px'
            });
            chartInstance.render();
        }

        //Calcula el tamaño inicial
        handleResizeEnd();

        //Asigna listener al resize de la ventana para ajustar tamaño del chart
        $window.on('resize', function () {
            if(this.resizeTo) clearTimeout(this.resizeTo);
            this.resizeTO = setTimeout(function() {
                handleResizeEnd();
            }, 500);
        });
    }
});