var mapChartView = junarChartView.extend({
        events : {
            'click #id_heatmapButton' : 'onToggleHeatMapButtonClicked'
        },

    render: function() {
        pChartDiv = "#id_visualizationResult";
        var att = this.model.attributes;
        att.properties = {mapType : att.mapType};

        var points = att.result.points;
        var clusters = (_.isUndefined(att.result.clusters))? []: att.result.clusters;

        //if (!_.isUndefined(att.result.sended)) console.log("MAP bounds: " + att.result.sended.bounds + " zoom: " + att.result.sended.zoom);
        //console.log(points);
        //console.log(clusters);
        if(_.isNull(att.map) || _.isUndefined(att.map)){
            //console.log("Redefining map");
            if (_.isNull(att.zoom_level)) att.zoom_level = 5;
            var center = {};
            if(!_.isUndefined(att.map_center) && att.map_center[0] != 0){
                center.lat     = att.map_center[0];
                center.long = att.map_center[1];
                }
            else
                {
                if (points[0]) center = points[0];
                else if (clusters[0]) center = clusters[0];

                if(!_.isUndefined(center.trace)){
                    var trace     = center.trace[0];
                    center.lat     = trace.lat;
                    center.long = trace.long;
                    }
                }

            att.map = new google.maps.Map($(pChartDiv)[0], {
                  zoom: att.zoom_level,
                  center: new google.maps.LatLng(center.lat, center.long),
                  styles: this.model.attributes.stylesDefault.map
                });


            google.maps.Map.prototype.clearOverlays = function() {
                for(var i=0; i < att.markers.length; i++) {att.markers[i].setMap(null);}
                att.markers = new Array();

                for(var i=0; i < att.clusters.length; i++) {att.clusters[i].marker.remove();}

                $(".clustermarker").remove();
                att.clusters = new Array();
                multimarkersUsed = [];
                att.heatMap = new google.maps.visualization.HeatmapLayer({data: new google.maps.MVCArray() , radius: 20, opacity: 0.8});
                }

            google.maps.Map.prototype.hideOverlays = function() {
                for(var i=0; i < att.markers.length; i++)
                    {att.markers[i].setMap(null);}

                $(".clustermarker").hide();

                }
            google.maps.Map.prototype.showOverlays = function() {
                for(var i=0; i < att.markers.length; i++)
                    {att.markers[i].setMap(att.map);}

                $(".clustermarker").show();

                }

            google.maps.event.addListener(att.map, 'zoom_changed', _.bind(this.reloadMapData, this));
            //google.maps.event.addListener(att.map, 'center_changed', _.bind(this.updateZoomLevel, this));
            google.maps.event.addListener(att.map, 'dragend', _.bind(this.reloadMapData, this));

            switch(att.mapType){
                case "roadmap" :
                    att.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                    break;
                case "satellite" :
                    att.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                    break;
                case "hybrid" :
                    att.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                    break;
            }

            att.heatMap = new google.maps.visualization.HeatmapLayer({data: new google.maps.MVCArray() , radius: 20, opacity: 0.8});
        }
        if(points && points.length > 0){
            var infoWindow = new google.maps.InfoWindow();
            //maybe Styles aren't loaded yet
            if (att.result.styles != undefined && _.isUndefined(att.styles)) att.styles = att.result.styles;

            for (var i=0; i<points.length; i++) {
                var point = points[i];
                var useStyle = false;//style and attributes
                var useStyleHigh = false;
                //point.style = "IconStyle00";
                if (!_.isUndefined(point.style))
                    {
                    useStyle = this.model.loadStyle(point.style, "_normal");
                    useStyleHigh= this.model.loadStyle(point.style + "_highlight");
                    }

                if (!_.isUndefined(point.trace)){

                    var trace     = point.trace;
                    var path     = [];
                    for (var j=0; j<trace.length; j++) {
                                                var pos = new google.maps.LatLng(trace[j].lat, trace[j].long);
                        path.push(pos);
                        //define weight for the heat map
                                                 pos.weight = 1;
                                            att.heatMap.getData().push(pos);
                    }

                    //if first and last Point are the same then is a closed polygon
                    var isPolygon = (trace[0].lat == trace[path.length-1].lat && trace[0].long == trace[path.length-1].long) ? true : false;

                    if (isPolygon == false)
                        {
                        polyStyle = this.model.kmlStyleToLine(this.model.attributes.stylesDefault.polyLine, useStyle.lineStyle)
                        polyStyleHigh = (useStyleHigh) ? this.model.kmlStyleToLine(this.model.attributes.stylesDefault.polyLine, useStyleHigh.lineStyle) : false;
                        var polyLine = new google.maps.Polyline({
                            path: path,
                            strokeColor: polyStyle.strokeColor,
                            strokeOpacity: polyStyle.strokeOpacity,
                            strokeWeight: polyStyle.strokeWeight
                        });
                        }
                    else
                        {
                        polyStyle = this.model.kmlStyleToPolygon(this.model.attributes.stylesDefault.polyLine, useStyle.lineStyle, useStyle.polyStyle)
                        polyStyleHigh = (useStyleHigh) ? this.model.kmlStyleToLine(this.model.attributes.stylesDefault.polyLine, useStyleHigh.lineStyle, useStyleHigh.polyStyle) : false;
                        var polyLine = new google.maps.Polygon({
                            path: path,
                            strokeColor: polyStyle.strokeColor,
                            strokeOpacity: polyStyle.strokeOpacity,
                            strokeWeight: polyStyle.strokeWeight,
                            fillColor: polyStyle.fillColor,
                            fillOpacity: polyStyle.fillOpacity,
                        });
                        }


                    google.maps.event.addListener(polyLine, 'click', (function(polyLine, info){
                        return function(event){
                            infoWindow.setContent("<div class='junarinfowindow'>" + String(info) + "</div>");
                            infoWindow.setPosition(event.latLng);
                            infoWindow.open(att.map);
                        };
                    })(polyLine, point.info));
                    //If it was set a second style for mouseover use it
                    if (polyStyleHigh)
                        {
                        google.maps.event.addListener(polyLine, 'mouseover'
                            , function(){
                                    this.setOptions({
                                        strokeColor: polyStyleHigh.strokeColor,
                                        fillColor: polyStyleHigh.fillColor,
                                        strokeOpacity: polyStyleHigh.strokeOpacity,
                                        strokeWeight: polyStyleHigh.strokeWeight,
                                        fillOpacity: polyStyleHigh.fillOpacity,
                                        });
                                });

                            google.maps.event.addListener(polyLine, 'mouseout', function(){
                                    this.setOptions({
                                        strokeColor: polyStyle.strokeColor,
                                        fillColor: polyStyle.fillColor,
                                        strokeOpacity: polyStyle.strokeOpacity,
                                        strokeWeight: polyStyle.strokeWeight,
                                        fillOpacity: polyStyle.fillOpacity,
                                        });
                                    });
                        }


                    polyLine.setMap(att.map);
                    att.markers.push(polyLine);
                }
                else{
                    var position = new google.maps.LatLng(point.lat, point.long);
                    var markerIcon = this.model.attributes.stylesDefault.marker.icon;
                    //For now personalized KMLFile-included markers files are not readable for us
                    if (useStyle && useStyle.iconStyle.href)
                        //just if it's a external link
                        if (useStyle.iconStyle.href.indexOf("http") > -1)
                            markerIcon = useStyle.iconStyle.href;

                    var marker = new google.maps.Marker({
                        position: position,
                        map: att.map,
                        icon: markerIcon,
                    });

                    google.maps.event.addListener(marker, 'click', (function(marker, info) {
                        return function() {
                          infoWindow.setContent("<div class='junarinfowindow'>" + String(info) + "</div>");
                          infoWindow.open(att.map, marker);
                        }
                    })(marker, point.info));

                    att.markers.push(marker);
                    //define weight for the heat map
                    position.weight = 1;
                    att.heatMap.getData().push(position);
                }
            }
        }

        if(clusters && clusters.length > 0){
            multimarkersUsed = [];
            for(var i=0; i<clusters.length; i++){
                var cluster = clusters[i];

                cluster.noWrap = true;//allow values outside ranges (-90 - 90, -180-180)

                var count = parseInt(cluster.info);
                cluster.counter = count;

                var position = new google.maps.LatLng(parseFloat(cluster.lat), parseFloat(cluster.long));
                position.weight = count;
                att.heatMap.getData().push(position);

                cluster.marker = new multimarker(cluster, cluster.info, att.map, att.manager.model.attributes.joinIntersectedClusters);
                att.clusters.push(cluster);
            }
        }

        //this.setTableHeight();
        return this;
    },
    reloadMapData: function(){
        var att = this.model.attributes;
         //if on a HeatMap I dont need to do anything
         if (att.onHeatMap)
             {
             //Also I need to remember to reload map data whe return
             att.needToReloadData = true;
             return true;
             }
         att.map.clearOverlays();
        this.setLoading();

        this.readDataFromMap();
        att.manager.refreshData(true);
    },
    readDataFromMap: function(){
        var att = this.model.attributes;
        this.updateZoomLevel();
        this.updateBounds();
        this.updateCenter();

    },
    /** Someone change the zoom on the map, so I update values */
    updateZoomLevel : function(){
        this.model.attributes.zoom_level = this.model.attributes.map.getZoom();
    },
    updateBounds : function(){
        var bounds = this.model.attributes.map.getBounds();
        if (bounds)
            this.model.attributes.map_bounds = [bounds.getNorthEast().lat(), bounds.getNorthEast().lng(), bounds.getSouthWest().lat(), bounds.getSouthWest().lng()];
    },
    updateCenter : function(){
        var center = this.model.attributes.map.getCenter();
        this.model.attributes.map_center = [center.lat(),center.lng()];
    },
    onToggleHeatMapButtonClicked : function(event) {

        var button = event.currentTarget;

        if ( $(button).hasClass('active') ) {
            $(button).removeClass('active');
        } else {
            $(button).addClass('active');
        }

        this.toggleHeatMap();

    },
    toggleHeatMap: function(){

        var att = this.model.attributes;

        if(!att.heatMap.getMap()){
            att.heatMap.setMap(att.map);
            att.onHeatMap = true;
            att.map.hideOverlays();
        }
        else{
            att.heatMap.setMap(null);
            att.onHeatMap = false;
            //sometimes I need to reload the data.
            if (att.needToReloadData)
                 {
                 att.needToReloadData = false;
                 this.reloadMapData();
                                }
            else
                        {
                         att.map.showOverlays();
                        }
        }
    }

});