/**
 * Backbone View for charts and maps
 */
var viewChartView = Backbone.View.extend({
    el : "body",
    chartContainer: "#id_visualizationResult",
    initialize : function() {

        this.chartsFactory = new charts.ChartsFactory();

        // init Sidebars
        this.initSidebarTabs();
        this.initInfoSidebar();
        this.initAPISidebar();
        this.initNotesSidebar();

        this.setupChart();
        this.render();
        this.listenTo(this.model, "change", this.render);
        this.bindEvents();
    },
    /**
     * Inicializa la barra lateral con los tabs
     */
    initSidebarTabs: function () {
        this.tabIcons = $('.tabs .icons');
        this.columnsContainer = $('#id_columns');
    },
    /**
     * Amarra eventos de la vista principal
     */
    bindEvents: function () {
        var self = this;
        this.tabIcons.on('click', 'a', function (e) {
            e.preventDefault();
            self.handleSidebarClick.call(self, $(this));
        });
    },
    /**
     * Maneja el evento click del sidebar
     * @param  {object} $tab
     */
    handleSidebarClick: function ($tab) {
        var sidebarContentId = $tab.attr('rel');

        if($tab.hasClass('active')){
            $tab.removeClass('active');
            this.hideSidebar();
        } else {
            this.tabIcons.find('.active').removeClass('active');
            if(typeof sidebarContentId == 'undefined'){
                this.hideSidebar();
            } else {
                this.showSidebar(sidebarContentId);
            }
            $tab.addClass('active');
        }
    },
    showSidebar: function (sidebarContentId) {
        var $sidebarContent = $('#' + sidebarContentId);
        $sidebarContent.show();
        this.columnsContainer.addClass('showSidebar');
    },
    hideSidebar: function () {
        this.columnsContainer.find('.sidebar div').hide();
        this.columnsContainer.removeClass('showSidebar');
    },
    initInfoSidebar: function () {
        // Permalink
        // this.permalinkHelper();

        // Hits
        new visualizationHitsView({model: new visualizationHits(), visualization: this.model});
    },
    initAPISidebar: function () {
        
    },
    initNotesSidebar: function () {
        
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

        this.setContainersSize();

        this.chartInstance.model.fetchData();
    },
    setLoading: function () {
        
    },
    setContainersSize:function(){
        var chartInstance = this.chartInstance,
            $chartContainer = $(this.chartContainer),
            $sidebarContainer = $('#id_columns .sidebar'),
            $window = $(window),
            $mainHeader = $('.brandingHeader'),
            $chartHeader = $('.dataTable header');

        var handleResizeEnd = function () {
            //Calcula el alto de los headers
            var otherHeights = $mainHeader.outerHeight(true) 
                             + $chartHeader.outerHeight(true);
            //Calucla el alto que deberá tener el contenedor del chart
            var minHeight = $window.height() - otherHeights - 70;
            $chartContainer.css({
                height: minHeight + 'px'
            });
            $sidebarContainer.css({
                height: minHeight + 'px'
            })
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

    },
});