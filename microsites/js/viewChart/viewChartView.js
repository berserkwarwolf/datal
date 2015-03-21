/**
 * Backbone View for charts and maps
 */
var viewChartView = Backbone.View.extend({
            el : "body",
            renderDiv : "id_visualizationResult",
            events : {
                'click #id_embedButton' : 'onEmbedButtonClicked',
                'click #id_openInfoButton, #id_openAPIButton, #id_openNotesButton' : 'onOpenSidebarButtonClicked',
                'click #id_closeInfoButton, #id_closeAPIButton, #id_closeNotesButton' : 'onCloseSidebarButtonClicked',
                'click #id_exportToXLSButton, #id_exportToCSVButton, #id_exportButton' : 'onExportButtonClicked',
                'click #id_permalink, #id_GUID' : 'onInputClicked',
                'click #id_downloadLink, #id_exportToXLSButton, #id_exportToCSVButton' : 'setWaitingMessage',
                'click #id_refreshButton, #id_retryButton' : 'onRefreshButtonClicked',
            },

            // -----------------------------------

            initialize : function() {

                // Preload JS Images
                this.preloadImages();

                this.listenTo(this.model, "change", this.render);

                // init Sidebars
                this.initInfoSidebar();
                this.initAPISidebar();
                this.initNotesSidebar();

                // map charts are loaded by ajax, the view doesn't send me the dataset
                if (this.model.attributes.chart_type === "mapchart")
                    {
                    this.loadBase();// for async calls (just maps by now)
                    this.refreshData(true); // ask data by ajax and show it.
                    }
                else {
                    this.loadChart();
                    this.renderChart();
                }
            },
            //On async calls I need first some basic parameters    (maps by now)
            loadBase : function(){
                var att = this.model.attributes; // visualization properties on model.js
                var chart = JSON.parse(att.chartJson); // specific data for the chart
                var typechart = chart.format.type;
                if (typechart === "mapchart") {this.createMapChart(chart);}
                },
            //load the dataset
            loadChart : function() {
                var att = this.model.attributes; // visualization properties on model.js
                var chart = JSON.parse(att.chartJson); // specific data for the chart
                // sometimes (on ajax calls) I already have a parsed object
                // sometimes it's empty because an async call later
                var result;
                if (typeof att.visualizationJson === "object")
                    result = att.visualizationJson;
                 else if (att.visualizationJson === "")
                     result = "";
                 else
                      result = JSON.parse(att.visualizationJson);

                chart.result = result;
                var typechart = chart.format.type;

                //si ya existe no crearlo de nuevo
                if (!_.isNull(att.chartObject))
                    {
                    att.chartObject.attributes.result = result;
                    if (att.chartObject.attributes.map) att.chartObject.attributes.map.clearOverlays();
                    }
                else
                    {
                    if (typechart === "piechart") {this.createPieChart(chart);}
                    if (typechart === "geochart") {this.createGeoChart(chart);}
                    if (typechart === "columnchart" || typechart === "areachart" || typechart === "linechart" || typechart === "barchart")
                        {this.createGenericGoogleChart(chart);}

                    }
            },
            /**
             * Basic data parse from junar core to our backbone models
             */
            parseChartProperties: function(chart){
                var att = this.model.attributes;
                //join all properties in one plain object
                var initData = $.extend(chart, chart.format, chart.chart);

                //some fixes, somo properties has diferent names
                initData.chartType = initData.type;
                initData.viz = this.model;
                initData.manager=this;
                if (chart.result && chart.result.styles != undefined) initData.styles = chart.result.styles;
                return initData;
            },
            createGenericGoogleChart: function(chart){
                initData = this.parseChartProperties(chart);
                var att = this.model.attributes;
                att.chartObject = new genericGoogleChart(initData);
                if (initData.type === "columnchart") att.viewObject = new columnChartView({'model' : att.chartObject});
                if (initData.type === "areachart") att.viewObject = new areaChartView({'model' : att.chartObject});
                if (initData.type === "linechart") att.viewObject = new lineChartView({'model' : att.chartObject});
                if (initData.type === "barchart") att.viewObject = new barChartView({'model' : att.chartObject});
            },

            createGeoChart: function(chart){
                initData = this.parseChartProperties(chart);
                var att = this.model.attributes;
                att.chartObject = new GeoChart(initData);
                att.viewObject = new geoChartView({'model' : att.chartObject});
            },

            createPieChart: function(chart){
                initData = this.parseChartProperties(chart);
                var att = this.model.attributes;

                att.chartObject = new PieChart(initData);
                att.viewObject = new pieChartView({'model' : att.chartObject});
            },

            createMapChart : function(chart){
                initData = this.parseChartProperties(chart);
                var att = this.model.attributes;

                initData.map_center = initData.mapCenter;
                initData.zoom_level = initData.zoomLevel;

                att.chartObject = new mapChart2(initData);
                att.viewObject = new mapChartView({'model' : att.chartObject});
            },

            renderChart : function() {

                this.setChartContainerHeight()

                var chart = this.model.attributes.chartObject; // mapChart or another junarChart object

                // get the defaults sizes for the charts
                var chartW = ( $('#id_visualizationResult').width() * 97 ) / 100; // use 97% to prevent scrolls
                var chartH = ( $('#id_visualizationResult').height() * 97 ) / 100; // use 97% to prevent scrolls
                //chart.attributes.size = [ Configuration.chartSize.normal.width, Configuration.chartSize.normal.height ];
                chart.attributes.size = [ chartW, chartH ];
                // else {chart.convertSelections();}

                this.model.attributes.viewObject.render();
                this.unsetLoading();
            },


            refreshChart : function() {
                this.renderChart();
            },
            loadNextPage : function() {
                // there is no "pages" here
            },
            setLoading : function() {
                var otherHeights =
                    parseFloat( $('.dataTable header').height() )
                    + parseFloat( $('.dataTable header').css('padding-top').split('px')[0] )
                    + parseFloat( $('.dataTable header').css('padding-bottom').split('px')[0] )
                    + parseFloat( $('.dataTable header').css('border-bottom-width').split('px')[0] )
                    + 2;// Fix to perfection;

                this.setHeights('#' + this.renderDiv + ' .loading', otherHeights);
                $('.dataTable .data').html('<div id="id_visualizationResult"><div class="result"><div class="loading">'+ gettext('APP-LOADING-TEXT') + '</div></div></div>');
            },
            setMiniLoading: function(){
                $("#id_miniLoading").show();
                },
            unsetLoading: function(){
                $("#id_miniLoading").hide();
            },
            refreshData : function(renderAfter) {
                var att = this.model.attributes;
                var _self = this;
                var lData = "visualization_revision_id=" + this.model.attributes.visualizationrevision_id;
                if (att.chart_type === "mapchart" && att.chartObject) { // the first time att.chartObject doesn't exist
                    if (!_.isNull(att.chartObject.attributes.zoom_level)) {
                        lData += "&zoom=" + att.chartObject.attributes.zoom_level;
                        //if not exists force get bounds
                        if (_.isNull(att.chartObject.attributes.map_bounds)) {
                            att.chartObject.getBoundsByCenterAndZoom("#id_visualizationResult");
                            }
                    }
                    if (!_.isNull(att.chartObject.attributes.map_bounds)) {
                        var bounds = att.chartObject.attributes.map_bounds;
                        lData += "&bounds=" + encodeURIComponent(bounds[0] + ";" + bounds[1] + ";" + bounds[2] + ";" + bounds[3]);
                    }
                }

                if (att.lastAjaxCall)
                    {
                    _self.setMiniLoading();
                    att.lastAjaxCall.abort();
                    //console.log("ABORT CALL");
                    }

                att.lastAjaxCall = $.ajax({
                    url : '/visualizations/invoke',
                    type : 'GET',
                    data : lData,
                    cache : false,
                    dataType : 'json',
                    success : function(result) {
                        if (!_.isNull(att.chartObject))
                            {
                            result.sended = {bounds: att.chartObject.attributes.map_bounds, zoom: att.chartObject.attributes.zoom_level}
                            }
                        _self.model.attributes.visualizationJson = result;
                        if (renderAfter) {
                            _self.loadChart(); // load the data, define chart type, and show it
                            _self.renderChart();
                        }
                    },
                    error : function(pResponse) {
                        //TO NACHO DESIGN _self.unsetLoading();
                    }
                });
            },
            render : function() {
                this.renderChart();
                return this;
            },

            // open the embed from form iframe code
            onEmbedButtonClicked : function() {
                new embedChartView({
                    model : new embedChart({
                        title : this.model.get("title"),
                        url : this.model.get("embedUrl")
                    }, {
                        validate : true
                    })
                });
            },

            onOpenSidebarButtonClicked : function(event) {

                var button = event.currentTarget;

                if ($(button).hasClass('active')) {

                    this.onCloseSidebarButtonClicked();

                } else {

                    $('.tabs .sidebarIcon').removeClass('active');

                    $(button).addClass('active');

                    $('.sidebar .box').hide(0, function() {
                        $('#' + button.rel).show(0, function() {
                            $('#id_columns').addClass('showSidebar');
                        });
                    });

                }

            },

            onCloseSidebarButtonClicked : function() {
                $('.tabs .sidebarIcon').removeClass('active');
                $('#id_columns').removeClass('showSidebar');
            },

            onExportButtonClicked : function(event) {

                var button = event.currentTarget, itemHeight = parseInt($(
                        '#' + button.rel).find('li a').height()), itemLength = parseInt($(
                        '#' + button.rel).find('li').length), containerPaddingTop = parseInt($(
                        '#' + button.rel).css('padding-top').split('px')[0]), containerPaddingBottom = parseInt($(
                        '#' + button.rel).css('padding-bottom').split('px')[0]), marginTop = -(((itemHeight * itemLength) + (containerPaddingTop + containerPaddingBottom)) / 2)
                        + 'px';

                // Set middle position of tooltip
                $('#' + button.rel).css('margin-top', marginTop);

                // Toggle Fade
                $('#' + button.rel).fadeToggle(375);

                // Toggle Active class
                $('#id_exportButton').toggleClass('active');

            },

            initInfoSidebar : function() {

                // Set Height
                this.setSidebarHeight();

                // Permalink
                this.permalinkHelper();

                // Hits
                new visualizationHitsView({model: new visualizationHits(), visualization: this.model});

            },

            initAPISidebar : function() {
                this.setSidebarHeight();
            },

            initNotesSidebar : function() {
                this.setSidebarHeight();
            },

            setHeights : function(theContainer, theHeight) {

                if (typeof theHeight == 'undefined') {theHeight = 0;}

                var heightContainer = String(theContainer);
                var tabsHeight = parseFloat($('.tabs').height());
                var otherHeight = theHeight;
                var minHeight = tabsHeight - otherHeight;

                $(heightContainer).css('min-height', minHeight + 'px');

                $(window).resize(function() {
                    var height = parseFloat($(window).height())
                        - parseFloat(otherHeight)
                        - parseFloat($('.brandingHeader').height())
                        - parseFloat($('.content').css('padding-top').split('px')[0])
                        - parseFloat($('.content').css('padding-bottom').split('px')[0])
                        // - parseFloat($('.brandingFooter').height() )
                        - parseFloat($('.miniFooterJunar').height());

                    $(heightContainer).height(height);

                    }).resize();

            },

            setChartContainerHeight:function(){
                var otherHeights =
                  parseFloat( $('.dataTable header').height() )
                + parseFloat( $('.dataTable header').css('padding-top').split('px')[0] )
                + parseFloat( $('.dataTable header').css('padding-bottom').split('px')[0] )
                + parseFloat( $('.dataTable header').css('border-bottom-width').split('px')[0] )
                    + 2;// Fix to perfection;

              this.setHeights( '#' + this.renderDiv, otherHeights );

              $('#' + this.renderDiv).css({
                  overflow: 'auto'
              })

            },

            setSidebarHeight : function() {
                var self = this;
                $(document).ready(function() {
                    var otherHeights = parseFloat($('.sidebar .box').css('border-top-width').split('px')[0])
                        + parseFloat($('.sidebar .box').css('border-bottom-width').split('px')[0])
                        + parseFloat($('.sidebar .box .title').height())
                        + parseFloat($('.sidebar .box .title').css('border-bottom-width').split('px')[0]);

                self.setHeights('.sidebar .boxContent',otherHeights);
                });

            },

            permalinkHelper : function() {
                var permalink = this.model.attributes.permaLink, self = this;
                $('#id_permalink').val(permalink);
                if (typeof (BitlyClient) != 'undefined') {
                    BitlyClient.shorten(permalink, function(pData) {
                        var response, shortUrl;
                        for ( var r in pData.results) {
                            response = pData.results[r];
                            break;
                        }

                        shortUrl = response['shortUrl'];
                        if (shortUrl) {
                            self.model.attributes.shortUrl = shortUrl;
                            $('#id_permalink').val(shortUrl);
                        }

                    });
                }
            },

            onInputClicked : function(event) {
                var input = event.currentTarget;
                $(input).select();
            },

            setWaitingMessage : function(event) {

                var button = event.currentTarget, titleText;

                if ($(button).attr('id') == "id_downloadLink") {
                    titleText = gettext("VIEWDS-WAITMESSAGEDOWNLOAD-TITLE");
                } else {
                    titleText = gettext("VIEWDS-WAITMESSAGEEXPORT-TITLE");
                }

                $.gritter
                        .add({
                            title : titleText,
                            text : gettext("VIEWDS-WAITMESSAGEDOWNLOAD-TEXT"),
                            image : '/media_microsites/images/microsites/ic_download.gif',
                            sticky : false,
                            time : ''
                        });

            },

            preloadImages : function() {

                $(document)
                        .ready(
                                function() {

                                    // Images Array
                                    var JSImages = [
                                            '/media_microsites/images/microsites/ic_download.gif',
                                            '/media_core/styles/plugins/images/gritter.png',
                                            '/media_core/styles/plugins/images/ie-spacer.gif',
                                            '/media_microsites/images/microsites/im_miniLoading.gif'
                                            ];

                                    // Preload JS Images
                                    new preLoader(JSImages);

                                });

            },
            onRefreshButtonClicked : function() {
                // by now only maps has an ajax function activated.
                var chType = this.model.attributes.chart_type;
                if (chType != "mapchart")
                    window.location.reload();
                else {
                    this.setMiniLoading();
                    this.refreshData(true);
                }
            }

        });