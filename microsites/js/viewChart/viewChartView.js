/**
 * Backbone View for charts and maps
 */
var viewChartView = Backbone.View.extend({
    el : "body",
    chartContainer: "#id_visualizationResult",
        
    events:{
        'click #id_exportToXLSButton, #id_exportToCSVButton': 'setWaitingMessage' 
    },

    initialize : function() {
        var self = this;

        this.chartsFactory = new charts.ChartsFactory();
        this.$window = $(window);

        // init Sidebars
        this.initSidebarTabs();

        this.setupChart();
        this.render();
        this.listenTo(this.model, "change", this.render);
        this.bindEvents();
        $(function () {
            self.onDocumentReady.call(self);
        });
    },
    /**
     * Maneja acciones a reliazar cuando termina la primera carga de la pagina
     */
    onDocumentReady: function () {
        this.handleResizeEnd();
    },
    /**
     * Amarra eventos de la vista principal
     */
    bindEvents: function () {
        var self = this;

        this.$window.on('resize', function () {
            if(this.resizeTo) clearTimeout(this.resizeTo);
            this.resizeTO = setTimeout(function() {
                self.handleResizeEnd.call(self);
            }, 500);
        });
    },
    /**
     * Inicializa la barra lateral con los tabs
     */
    initSidebarTabs: function () {
        this.$tabIcons = $('.tabs .icons');
        this.$columnsContainer = $('#id_columns');
        this.$sidebarContainer = this.$columnsContainer.find('.sidebar');
        this.bindSidebarEvents();
    },
    /**
     * Amarra los eventos del sidebar
     */
    bindSidebarEvents: function () {
        var self = this;
        this.$sidebarContainer.on('transitionend webkitTransitionEnd', function (e) {
            self.handleResizeEnd.call(self);
        });
        this.$sidebarContainer.find('a.close').on('click', function (e) {
            self.hideSidebar.call(self, '');
            e.preventDefault();
        });
        this.$tabIcons.on('click', 'a.icon', function (e) {
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

        if($tab.hasClass('refresh'))
            return this.handleViewRefresh();

        if($tab.hasClass('embed'))
            return this.showEmbedModal();

        if($tab.hasClass('active')){
            $tab.removeClass('active');
            if(sidebarContentId)
                this.hideSidebar(sidebarContentId);
        } else {
            this.$tabIcons.find('.active').removeClass('active');
            $tab.addClass('active');
            if(sidebarContentId)
                this.showSidebar(sidebarContentId);
        }
    },
    /**
     * Abre la ventana modal con el codigo para embedir la visualizacion
     */
    showEmbedModal : function() {
        new embedChartView({
            model : new embedChart({
                title : this.model.get("title"),
                url : this.model.get("embedUrl")
            }, {
                validate : true
            })
        });
    },
    /**
     * Maneja recargas de la vista principal
     */
    handleViewRefresh: function () {
        window.location.reload();
    },
    /**
     * Maneja la accion de mostrar el sidebar del chart
     * @param  {obejct} sidebarContentId
     */
    showSidebar: function (sidebarContentId) {
        var $sidebarContent = $('#' + sidebarContentId);
        //Esconde cualquier elemento visible dentro del sidebar
        if(sidebarContentId.indexOf('tooltip') < 0){
            this.$columnsContainer.find('.sidebar>div').hide();
            this.$columnsContainer.addClass('showSidebar');
        }
        $sidebarContent.show();
    },
    /**
     * Esconde el sidebar del chart
     */
    hideSidebar: function (sidebarContentId) {
        //Se deben considerar los tooltips del sidebar
        this.$tabIcons.find('.tooltip').hide();
        if(sidebarContentId.indexOf('tooltip') < 0){
            this.$columnsContainer.find('.sidebar>div').hide();
            this.$columnsContainer.removeClass('showSidebar');
        }
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
     * Maneja la acciones a realizar cuando se redimenciona la ventana
     */
    handleResizeEnd: function () {
        var chartInstance = this.chartInstance,
            overflowX =  'hidden',
            overflowY =  'hidden',
            $sidebarContainer = $('#id_columns .sidebar'),
            $mainHeader = $('.brandingHeader'),
            $chartHeader = $('.dataTable header');

        //Calcula el alto de los headers
        var otherHeights = $mainHeader.outerHeight(true) 
                         + $chartHeader.outerHeight(true);

        //Ajusta overflow si se está mostrando el sidebar
        if(this.$columnsContainer.hasClass('showSidebar')){
            overflowX = 'auto';
        }

        //Calucla el alto que deberá tener el contenedor del chart
        var height = this.$window.height() - otherHeights - 70;
        this.$chartContainer.css({
            height: height + 'px',
            maxHeight: height + 'px',
            minHeight: height + 'px',
            overflowX: overflowX,
            overflowY: overflowY
        });
        this.$sidebarContainer.css({
            height: height + 'px'
        });
        chartInstance.render();
    },

    setWaitingMessage: function(event){

        var titleText;

        titleText = gettext("VIEWDS-WAITMESSAGEEXPORT-TITLE");

        $.gritter.add({
          title: titleText,
          text: gettext("VIEWDS-WAITMESSAGEDOWNLOAD-TEXT"),
          image: '/static/microsites/images/microsites/ic_download.gif',
          sticky: false,
          time: ''
        });

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