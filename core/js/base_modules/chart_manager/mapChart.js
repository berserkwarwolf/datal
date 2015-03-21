var mapChart = Chart.extend({
	defaults : {
		mapType : 'roadmap',
		zoom_level : 5,
		map_center : null,
		map_bounds : null,
		markers: [],
		clusters: [],
		totalMarkers: 0,
		heatMap: null,
	},
	initialize : function(){
										
	},
	render : function(pChartDiv, pLocalRender){
		var att = this.attributes;
		
		var points 		= att.result.points;
		var clusters 	= (_.isUndefined(att.result.clusters))? []: att.result.clusters;
		var center  	= {};
		if(_.isNull(att.map_center[0]) || _.isNull(att.map_center[1])){
			
			if(points && points.length > 0){
				center = points[0];
	            if(!_.isUndefined(center.trace)){
	                var trace   = center.trace[0];
	                center.lat  = trace.lat;
	                center.long = trace.long;
	            }
			}
			else{
				if(clusters.length > 0){center = clusters[0];}
			}
		}
		else{
			center.lat = att.map_center[0];
			center.long= att.map_center[1];
		}
		
		att.map = new google.maps.Map(pChartDiv[0], {
		      zoom: att.zoom_level,
		      center: new google.maps.LatLng(center.lat, center.long)
	    });			
		
		google.maps.event.addListener(att.map, 'zoom_changed', _.bind(this.updateZoomLevel, this));
		google.maps.event.addListener(att.map, 'center_changed', _.bind(this.updateCenter, this));
		google.maps.event.addListener(att.map, 'dragend', _.bind(this.updateBounds, this));

		switch(att.mapType){
			case "roadmap" :
				att.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
				break;
			case "satellite" :
				att.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
				break;
			case "hybrid" :
				att.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
		}
		
		att.heatMap = new google.maps.visualization.HeatmapLayer({data: new google.maps.MVCArray(), opacity: 0.8, maxIntensity: 5});
		
		if(points && points.length > 0){
		    var infoWindow 	= new google.maps.InfoWindow();
		    for (var i=0; i<points.length; i++) {
		    	
		    	var point = points[i];
				
				if(!_.isUndefined(point.trace)){
					
					var trace 	= point.trace;
					var path 	= [];
				    for (var j=0; j<trace.length; j++) {				
				    	path.push(new google.maps.LatLng(trace[j].lat, trace[j].long));
					}

					var polyLine = new google.maps.Polyline({
					    path: path,
					    strokeColor: "#FF0000",
					    strokeOpacity: 1.0,
					    strokeWeight: 3
					});
						
					google.maps.event.addListener(polyLine, 'click', (function(polyLine, info){
			          return function(event){
							    infoWindow.setContent("<div class='junarinfowindow'>" + String(info) + "</div>");
							    infoWindow.setPosition(event.latLng);
							    infoWindow.open(att.map);
					          };
					})(polyLine, point.info));
						
					polyLine.setMap(att.map);
					
					att.markers.push(polyLine);
				}
				else{				
					var position = new google.maps.LatLng(point.lat, point.long);
									
					var marker = new google.maps.Marker({
			        	position: position
					});
						        	
					google.maps.event.addListener(marker, 'click', (function(marker, info) {
				        return function() {
				        	infoWindow.setContent("<div class='junarinfowindow'>" + String(info) + "</div>");
				          infoWindow.open(att.map, marker);
				        }
				    })(marker, point.info));

					marker.setMap(att.map);
					att.heatMap.getData().push(position);
					
					att.markers.push(marker);
				}
		    }
		}
		// test clusters points
		/*
		
		clusters.push({lat: 37.3374879398245, long: -122.238369785611, info: 299 })
		clusters.push({lat: 37.5869879398245, long: -122.156569785611, info: 599 })
		clusters.push({lat: 37.3126879398245, long: -122.324269785611, info: 2099 })
		clusters.push({lat: 37.5997879398245, long: -122.005669785611, info: 5099 })
		clusters.push({lat: 37.4008879398245, long: -122.077069785611, info: 10099 })
		*/
		
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
				att.clusters.push(cluster);
				
				new multimarker(cluster, cluster.info, att.map, att.manager.attributes.joinIntersectedClusters);
			}			
		}		
	},
		
	toggleHeatMap: function(){
		
		var att = this.attributes;
		
		if(!att.heatMap.getMap()){
			att.heatMap.setMap(att.map);
			
			for(var i=0; i<att.markers.length; i++){
				var marker = att.markers[i];
				
				marker.setVisible(false);
			}
			
			$(".clustermarker").hide();
			
		}
		else{
			att.heatMap.setMap(null);
			
			for(var i=0; i<att.markers.length; i++){
				var marker = att.markers[i];
				marker.setVisible(true);
			}
			$(".clustermarker").show();
		}
		
		//console.log("END HEATMAPPING");
		
	},	
	updateBounds : function(){
		var att = this.attributes;
		var bounds = att.map.getBounds();
		
		att.map_bounds = [bounds.getNorthEast().lat(), bounds.getNorthEast().lng(), bounds.getSouthWest().lat(), bounds.getSouthWest().lng()];
		
		att.manager.renderMarkers();
	},
	updateZoomLevel : function(){
		var att = this.attributes;		
		att.zoom_level = att.map.getZoom();
		
		this.updateBounds();
		this.updateCenter();
	},
	updateCenter : function(){
		var att = this.attributes;		
		var center = att.map.getCenter();
		att.map_center = [center.lat(),center.lng()];
	},	
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertData' : att.invertedData, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset };
		json.title = att.title;
		json.data = att.dataSelection;
		
		chart.latitudSelection = $('#id_latitudSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_latitudSelection_'+ att.chartTemplate).text() : '';
		chart.longitudSelection = $('#id_longitudSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_longitudSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		chart.traceSelection = $('#id_traceSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_traceSelection_'+ att.chartTemplate).text() : '';
		chart.mapType = $('#id_mapTypeSelect_'+att.chartTemplate).val();
		chart.zoomLevel = att.zoom_level;
		chart.mapCenter = att.map_center;
		json.chart = chart
		return json;
	},
	loadJson : function(pJsonChart){
		var att = this.attributes;
		att.chartType = pJsonChart.format.type;
		att.chartTemplate = pJsonChart.format.chartTemplate;
		att.title = pJsonChart.title;
		att.showLegend = pJsonChart.format.showLegend;
		att.invertedAxis = pJsonChart.format.invertedAxis;
		att.invertedData = pJsonChart.format.invertData;
		att.correlativeData = pJsonChart.format.correlativeData;
		att.nullValueAction = pJsonChart.format.nullValueAction;
		att.nullValuePreset = pJsonChart.format.nullValuePreset;
		att.dataSelection = pJsonChart.data;
		att.headerSelection = pJsonChart.chart.headerSelection;
		att.latitudSelection = pJsonChart.chart.latitudSelection;
		att.longitudSelection = pJsonChart.chart.longitudSelection;
		att.traceSelection = pJsonChart.chart.traceSelection;
		att.mapType = pJsonChart.chart.mapType;
		att.zoom_level = pJsonChart.chart.zoomLevel;
		att.map_center = pJsonChart.chart.mapCenter;
	},
	convertSelections : function(){
		var att = this.attributes;

		att.$DataTable.setExcelSelection(att.longitudSelection,'ao-longitud');
		att.$DataTable.setExcelSelection(att.latitudSelection,'ao-latitud');
		att.$DataTable.setExcelSelection(att.traceSelection,'ao-trace');
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
	},
	pagedSetSelection_backup : function(){
		var att = this.attributes;

		var longitudSelection 	= $.trim(att.longitudSelection).split(" ");
		var latitudSelection 	= $.trim(att.latitudSelection).split(" ");
		var traceSelection 		= $.trim(att.traceSelection).split(" ");
		var dataSelection 		= $.trim(att.dataSelection).split(" ");
		/*
		 * if(addressSelection != ''){ if(addressSelection[0] == "Column"){ var
		 * pages = Math.ceil(att.$DataTable.attributes.totalRows / 1000);
		 * for(var i = 1; i < pages; i++){ var selection =
		 * [addressSelection[1],i, ':', addressSelection[1],i*1000].join(" ");
		 * this.setLimitedSelection(selection, 'ao-address'); } }else{
		 * att.$DataTable.setExcelSelection(att.addressSelection,'ao-address');
		 * att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
		 * att.$DataTable.setExcelSelection(att.headerSelection,'ao-header'); } }
		 *
		 * if(longitudSelection != ''){ if(longitudSelection[0] == "Column"){
		 *
		 * }else{
		 * att.$DataTable.setExcelSelection(att.longitudSelection,'ao-longitud');
		 * att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
		 * att.$DataTable.setExcelSelection(att.headerSelection,'ao-header'); } }
		 *
		 * if(latitudSelection != ''){ if(latitudSelection[0] == "Column"){
		 *
		 * }else{
		 * att.$DataTable.setExcelSelection(att.latitudSelection,'ao-latitud');
		 * att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
		 * att.$DataTable.setExcelSelection(att.headerSelection,'ao-header'); } }
		 */
		if(traceSelection != ''){
			if(traceSelection[0] == "Column"){
				var rows = att.$DataTable.attributes.totalRows;
				var pages = Math.ceil(att.$DataTable.attributes.totalRows / 5000);
				var last_page = 5000;
				for(var i = 1; i <= pages; i++){
					if(i == 1){
						// var selection = [traceSelection[2],i, ':',
						// traceSelection[2], i*1000];
						// var data = [dataSelection[2],i, ':',
						// dataSelection[2], i*1000];
						this.attributes.$DataTable.resetSelection('ao-trace');
						this.attributes.$DataTable.resetSelection('ao-data');
					}else if(i == pages){
						var selection = [traceSelection[2],last_page, ':', traceSelection[2], parseInt(last_page + rows)];
						var data = [dataSelection[2],last_page, ':', dataSelection[2], parseInt(last_page + rows)];
					}
					else{
						var selection = [traceSelection[2],last_page, ':', traceSelection[2], i*5000];
						var data = [dataSelection[2],last_page, ':', dataSelection[2], i*5000];
					}
					
					last_page 	= i*5000;
					rows 		= rows - 5000;
					if(i != 1){
						// make timeout method
						var type = 'ao-trace';
						var _self = this;
						var sel = selection;
						var da = data;
						var t = setTimeout((function(a, b, c, d){
							return function(){
								d.setLimitedSelection(a, b, c, d);
							};
						})(type, sel, da, _self), 3000*i);
					}
				}
			}else{
				att.$DataTable.setExcelSelection(att.traceSelection,'ao-trace');
				att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
				att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
			}
		}
	},
	pagedSetSelection : function(pages, i, last_page){
		var att = this.attributes;

		var traceSelection 		= $.trim(att.traceSelection).split(" ");
		var dataSelection 		= $.trim(att.dataSelection).split(" ");
		var rows = att.$DataTable.attributes.totalRows;
		// var pages = Math.ceil(att.$DataTable.attributes.totalRows / 1000);
		// var last_page = 1000;
		if(i == 1){
			// var selection = [traceSelection[2],i, ':', traceSelection[2],
			// i*1000];
			// var data = [dataSelection[2],i, ':', dataSelection[2], i*1000];
			// this.attributes.$DataTable.resetSelection('ao-trace');
			// this.attributes.$DataTable.resetSelection('ao-data');
		}else if(i == pages){
			var selection = [traceSelection[2],last_page + 1, ':', traceSelection[2], parseInt(last_page + rows)];
			var data = [dataSelection[2],last_page + 1, ':', dataSelection[2], parseInt(last_page + rows)];
		}
		else{
			var selection = [traceSelection[2],last_page + 1, ':', traceSelection[2], i*5000];
			var data = [dataSelection[2],last_page + 1, ':', dataSelection[2], i*5000];
		}
		
		// last_page = i*1000;
		// rows = rows - 1000;
		if(i != 1){
			// make timeout method
			var type = 'ao-trace';
			var _self = this;
			var sel = selection;
			var da = data;
			this.setLimitedSelection(type, sel, da, this);
		}
	},
	setLimitedSelection : function(type, selection, data, _self){
		_self.attributes.$DataTable.resetSelection(type);
		_self.attributes.$DataTable.resetSelection('ao-data');
		_self.attributes.$DataTable.setExcelSelection(selection.join(" "), type);
		_self.attributes.$DataTable.setExcelSelection(data.join(" "), 'ao-data');
		_self.specialParse();
	},
	specialParse : function(){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData = [];
		var $Table = att.$DataTable.attributes.$Table;
		var $Rows = $Table.find('tr');
		var $Headers	= $Table.find('td.' + att.headerClass);
		
		var lengthRows =  $Rows.size();
		for (i = 0; i < lengthRows; i++) {
		// $Table.find('tr').each(function(i){
			var $Data		= $Rows.eq(i).find('td.' + att.dataClass);
			var $Trace		= $Rows.eq(i).find('td.' + att.traceClass);
			var lLat 	= '';
			var lLong 	= '';
			var lTrace	= $.trim($Trace.eq(0).text());
			var lValue = "";

			var lengthData = $Data.size();
			for (j = 0; j < lengthData; j++) {
			// $Data.each(function(i){
				var unParsedData = $.trim($Data.eq(j).text());
				var lHeader	= $.trim($Headers.eq(i).text());
				var data 	= parseNumber(unParsedData)
				
				if(lHeader != ""){
					lValue += "<strong>"+lHeader+ "</strong>: ";
				}
				lValue += unParsedData;
				lValue += "<br/>";
			};

			if (lValue != '') {
				if(lTrace !=''){
					var $lCell 		= $Trace.eq(0);
					var cellIndex 	= $lCell[0].cellIndex;
					var rowIndex 	= $lCell.eq(0).parents('tr')[0].rowIndex;
					var lType 		= $($lCell.parents('table')[0].rows[rowIndex].cells[cellIndex+1]).text();
				}
				var marker = [lLat, lLong, lValue, lTrace, lType];
				lData.push(marker);
			}
		};
		
		var lLocations = lData;

		var mouselocation;
	    var infoWindow = new google.maps.InfoWindow();
	    var marker, i;
	    var markers = [];
		
	    for (i = 0; i < lLocations.length; i++) {
			// KML multi geometry/ trace selections
			if(lLocations[i][3] != ""){
				var lCoordinates = [];
				var lCoords = lLocations[i][3].split(" ");
				var lType = lLocations[i][4];
				if(lType == "Point"){
					var lValues = lCoords[0].split(',');
					marker = new google.maps.Marker({
			        	position: new google.maps.LatLng(lValues[0],lValues[1])
					});
					
					var loc = lLocations[i][2];

			      google.maps.event.addListener(marker, 'click', (function(marker, loc) {
			        return function() {
			          infoWindow.setContent(String(loc));
			          infoWindow.open(att.map, marker);
			        }
			      })(marker, loc));
			      markers.push(marker);
			      att.markerCluster.addMarker(marker);

				}else{
					for(j = 0; j < lCoords.length; j++){
						var lValues = lCoords[j].split(',');
						if(j == 0){
							this.attributes.map.setCenter(new google.maps.LatLng(lValues[1],lValues[0]))
						}
						lCoordinates.push(new google.maps.LatLng(lValues[1],lValues[0]));
					}
					  var lPath = new google.maps.Polyline({
					    path: lCoordinates,
					    strokeColor: "#FF0000",
					    strokeOpacity: 1.0,
					    strokeWeight: 3
					  });
					
					  var aux = String(lLocations[i][2]);
						    google.maps.event.addListener(this.attributes.map, 'mousemove', function(event) {
						      mouselocation = event.latLng;
						    });

							google.maps.event.addListener(lPath, 'click', (function(lPath,index){
					          return function(){
						    infoWindow.setContent(aux);
						    infoWindow.position = mouselocation;
						    infoWindow.open(att.map);
					          };
						})(lPath,i));
						
					lPath.setMap(this.attributes.map);
				}
			}
		}
	},
	reset : function(){
		this.attributes.$DataTable.resetSelection('ao-longitud');
		this.attributes.$DataTable.resetSelection('ao-latitud');
		this.attributes.$DataTable.resetSelection('ao-header');
		this.attributes.$DataTable.resetSelection('ao-trace');
		$('#id_latitudSelection_mapchart span').text( gettext( "APP-SELECTRANGE-TEXT" ) ).addClass('shadowText');
		$('#id_longitudSelection_mapchart span').text( gettext( "APP-SELECTRANGE-TEXT" ) ).addClass('shadowText');
	}
});
