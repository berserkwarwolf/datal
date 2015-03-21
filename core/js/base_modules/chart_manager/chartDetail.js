var ChartDetail = Backbone.Model.extend({
    defaults: {
        dataStreamJson : '',
        datastreamrevision_id: '',
        chartJson : '',
        $DataTableObject : null,
        chartObject : null,
        url : '',
        currentPage : 0,
        joinIntersectedClusters: true,
    },
    initialize : function(){
        this.loadChart();
        this.renderChart();
        $('[id*=id_resetDataServiceButton_]').click(_.bind(this.refreshChart , this));
    },
    loadChart : function(){
        var att     = this.attributes;
        //console.log(att);
        var chart = JSON.parse(att.chartJson);
        var result = (att.dataStreamJson.length>0) ? JSON.parse(att.dataStreamJson) : "";
        if (att.dataStreamJson !== '{fType="ERROR"}') result = JSON.parse(att.dataStreamJson);

        var type     = chart.format.type;

        if(type != "mapchart"){
            this.attributes.$DataTableObject = new DataTableCharts({'jsonResponse' : result});
            $('#id_dataStreamTable').html(this.attributes.$DataTableObject.attributes.$Table);
        }

        switch(type){
            case "barchart":
                att.chartObject = new BarChart({'$DataTable' : att.$DataTableObject, 'chartType' : type, 'manager' : this});
                break;
            case "columnchart":
                att.chartObject = new ColumnChart({'$DataTable' : att.$DataTableObject, 'chartType' : type, 'manager' : this});
                break;
            case "linechart":
                att.chartObject = new LineChart({'$DataTable' : att.$DataTableObject, 'chartType' : type, 'manager' : this});
                break;
            case "piechart":
                att.chartObject = new PieChart({'$DataTable' : att.$DataTableObject, 'chartType' : type, 'manager' : this});
                break;
            case "areachart":
                att.chartObject = new AreaChart({'$DataTable' : att.$DataTableObject, 'chartType' : type, 'manager' : this});
                break;
            case "geochart":
                att.chartObject = new GeoChart({'$DataTable' : att.$DataTableObject, 'chartType' : type, 'manager' : this});
                break;
            case "mapchart":
                att.chartObject = new mapChart({'result' : result, 'chartType' : type, 'manager' : this});
                break;
        }

        att.chartObject.loadJson(chart);
    },
    renderChart : function(){

        var chart = this.attributes.chartObject;

        if(chart.attributes.chartType == 'mapchart'){
            $('#id_toggleHeatMapButton').click(_.bind(this.onToggleHeatMapButtonClicked,this))
            this.renderMarkers();
        }else{
            chart.convertSelections();
            chart.renderDetail($('#id_chartDisplay'));
        }
    },
    onToggleHeatMapButtonClicked : function(){

        var heatMapButton = $('#id_toggleHeatMapButton');
        var chart = this.attributes.chartObject;

        if( heatMapButton.hasClass('toggled') ){
            heatMapButton.html( gettext( 'CHART-HEATMAP-TOGGLETEXT' ) ).removeClass('toggled');
        }
        else{
            heatMapButton.html( gettext( 'CHART-HEATMAP-TOGGLEDTEXT' ) ).addClass('toggled');
        }

        chart.toggleHeatMap();

    },
    refreshChart : function(){
        this.renderChart();
    },
    renderMarkers: function(){

        var att     = this.attributes;
        var data     = "visualization_revision_id=" + att.visualizationrevision_id;
        var bounds = att.chartObject.attributes.map_bounds;
        if(!_.isNull(bounds)){
            data += "&bounds=" + encodeURIComponent(bounds[0] + ";" + bounds[1] + ";" + bounds[2] + ";" + bounds[3])
        }
        else
            {
            //temporary fix copied from microsited advanced UI
            var d = $("#id_chartDisplay");
            var zf = Math.pow(2, att.chartObject.attributes.zoom_level) * 2;
            var dw = d.width()  / zf;
            var dh = d.height() / zf;

            bounds = [];
            bounds[0] = att.chartObject.attributes.map_center[0] + dh; //NE lat
            bounds[1] = att.chartObject.attributes.map_center[1] + dw; //NE lng
            bounds[2] = att.chartObject.attributes.map_center[0] - dh; //SW lat
            bounds[3] = att.chartObject.attributes.map_center[1] - dw; //SW lng
            data += "&bounds=" + encodeURIComponent(bounds[0] + ";" + bounds[1] + ";" + bounds[2] + ";" + bounds[3]);
            }

        data += "&zoom=" + att.chartObject.attributes.zoom_level;

        var _self = this;
        $.ajax({
                    url: '/visualizations/invoke',
                type: 'GET',
                data: data,
                cache: false,
                dataType: 'json',
                success: function(result){
                    var chart = _self.attributes.chartObject;
                    if (result === null) result={};// result={points: [], clusters: []};
                    chart.attributes.result = result;
                    if (result !== null && result.length)
                        chart.attributes.totalMarkers = result.length;
                    else
                        chart.attributes.totalMarkers = 0;
                    chart.renderDetail($('#id_chartDisplay'));
                },
                beforeSend: function(){
                       $("#ajax_loading_overlay").show();
                },
                complete: function(){
                     $("#ajax_loading_overlay").hide();
                },
                error: function(pResponse){
                }
        });
    },
});
