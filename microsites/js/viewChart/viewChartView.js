/**
 * Backbone View for charts and maps
 */
var viewChartView = Backbone.View.extend({
    el : "body",
    chartContainer: "#id_visualizationResult",
        
    events:{
        'click #id_exportToXLSButton, #id_exportToCSVButton': 'setWaitingMessage',
        'click #id_permalink, #id_GUID': 'onInputClicked',
    },

    initialize : function() {

        this.$window = $(window);

        // init Sidebars
        this.initSidebarTabs();
        this.initInfoSidebar();

        this.chartView = new ChartView({
            el: '#id_visualizationResult',
            model: this.model
        });

        this.render();
        this.bindEvents();
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
        this.permalinkHelper();

        // Hits
        new visualizationHitsView({model: new visualizationHits(), visualization: this.model});
    },
    permalinkHelper: function(){
        //var permalink = this.model.attributes.permaLink,
        // debería ir permalink?!?!?!
        var permalink = this.model.attributes.publicUrl,
        self = this;
$('#id_permalink').val(permalink);

        if (typeof(BitlyClient) != 'undefined') {
      BitlyClient.shorten( permalink, function(pData){

                var response,
                  shortUrl;

                for(var r in pData.results) {
                response = pData.results[r];
                break;
                }

                shortUrl = response['shortUrl'];

            if(shortUrl){
              self.model.attributes.shortUrl = shortUrl;
              $('#id_permalink').val(shortUrl);
            }

            });

    }


    },
    onInputClicked: function(event) {

        var input = event.currentTarget;
        $(input).select();

    },

    initAPISidebar: function () {
        
    },
    initNotesSidebar: function () {
        
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
        this.chartView.$el.css({
            height: height + 'px',
            maxHeight: height + 'px',
            minHeight: height + 'px',
            overflowX: overflowX,
            overflowY: overflowY
        });
        this.$sidebarContainer.css({
            height: height + 'px'
        });
        this.chartView.render();
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
        this.chartView.render();
        return this;
    }
});
