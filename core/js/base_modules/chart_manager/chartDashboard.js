var DashboardChart = Backbone.Model.extend({
    defaults: {
		$Container : null,
		dataStreamId : 0,
		visualization_id : 0,
		endPoint : '',
		index : 0,
		dataStreamJson : '',
		chartJson : null,
		$DataTableObject : null,
		chartObject : null
	},
	initialize : function(){
		var att = this.attributes;
		this.executeDataStream();
		$('#id_removeDashboardChartButton_'+att.index).click(_.bind(this.removeChart , this));
		$('#id_refreshChartButton_'+att.index).click(_.bind(this.refreshChart , this));
	},
	initShares : function(){
		//implement later
	},
	updateShares : function(){
		//implement later
	},
	executeDataStream : function(){
		var att 	= this.attributes;
		var type 	= att.chartJson.format.type;
		
		var lData = 'pIndex=' + att.index;
		if(type == "mapchart"){
			lData += "&pLimit=1000";
		}
		
		var lajaxCall = $.ajax({
			url: '/rest/datastreams/' + att.dataStreamId + '/data.json',
			type: 'GET',
			data: lData,
			cache: false,
			dataType: 'json',
			beforeSend: _.bind(this.onBeforeSend, this),
			success: _.bind(this.onSuccessDataStreamExecute, this),
			error: _.bind(this.onErrorDataSreamExecute, this)
		});
		
		ajaxManager.register(att.dataStreamId, lajaxCall);
	},
	onBeforeSend : function(pEvent){
	    var $lDashboardDataServiceContainer = $('#id_dashboard_dataservice_container_' + this.attributes.index);
	    $lDashboardDataServiceContainer.find('.bottomActions').css('display', 'none');
	},
	onSuccessDataStreamExecute : function(pResponse){
		var att = this.attributes;
		att.dataStreamJson = pResponse;
		
		var l$Container = $('#id_dashboard_dataservice_container_' + att.index);
		var lTitle = l$Container.data("dataservice_title");
		var lCont = $('#id_dashboard_dataservice_'+att.index).html('<div id="id_chartBox_'+att.index +'" class="chartBox"><h2 class="chartTitle"><a href="/visualizations/action_view?visualization_revision_id='+ att.visualization_id +'" title="'+lTitle+'" target="_blank"><strong>'+lTitle+'</strong></a></h2><div class="chartContainer"><div id="id_chartContainer_'+att.index +'" class="chartContainerInner clearfix"></div></div></div>');
		att.$Container = lCont.find('#id_chartContainer_'+att.index);		

		l$Container.find('.bottomActions').css('display', '');
		
		l$Container.bind("mouseenter", { index :att.index }, function(pEvent){
			var lIndex = pEvent.data.index;
            $('#id_dashboard_dataservice_container_' + lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','visible');
	    });
		l$Container.bind("mouseleave", { index :att.index }, function(pEvent){
			var lIndex = pEvent.data.index;
            $('#id_dashboard_dataservice_container_' + lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
	    });
		
		$( '#id_maximized_dashboard_dataservice_' + att.index ).dialog({
            autoOpen     : false,
            width        : JPad.dataServiceDialogWidth + 200,
            height       : JPad.dataServiceDialogHeight + 200,
			resizeStop: function(event, ui) {
			}
        });
		
        $('#id_dashboard_dataservice_container_' + att.index).find('.dataStreamDrag').draggable({ snapMode: 'both'
            , revert: true
            , cursor: 'move'
            , start : function(){
            }
            , helper: onDragDashboardDataServiceHelper});

		var $lDroppableDashboardDataServiceContainer = $("#id_droppable_dashboard_dataservice_container_" + att.index );
		
		$lDroppableDashboardDataServiceContainer.droppable({
		  tolerance: 'pointer'
		  ,drop: onDataServiceDroppedHandler
		  ,accept: '.ao-draggable-dataservice, .dataStreamDrag'
		  ,hoverClass: 'drophover'
		  ,activeClass: 'ui-state-highlight'
		  });
				
		this.loadDataTable();
		this.loadChart();
		this.renderChart(false);
	},
	onErrorDataSreamExecute : function(pResponse){
		var att 	= this.attributes;
		var lHtml 	= '';
		var l$Container = $('#id_dashboard_dataservice_container_' + att.index);
		var lTitle = l$Container.data("dataservice_title");
		var lCont = $('#id_dashboard_dataservice_'+att.index).html('<div id="id_chartBox_'+att.index +'" class="chartBox errorFix"><h2 class="chartTitle"><a href="/visualizations/action_view?visualization_revision_id='+ att.visualization_id +'"  title="'+lTitle+'" target="_blank"><strong>'+lTitle+'</strong></a></h2><div id="id_chartContainer_'+att.index +'" class="chartContainer clearfix"></div></div>');
		
		att.$Container = lCont.find('#id_chartContainer_'+att.index);
		
		lHtml        += '<div class="dataStreamBox errorFix"><div class="dataStreamResult clearfix"><div class="Mensaje">';
		lHtml        += '<table class="Nulo">';
	    lHtml        += '<tr>';
	    lHtml        += '<td> ' + gettext( "APP-OOPS-TEXT" ) + ' <span>' + gettext( "DS-CANTLOADDATA-TEXT" ) + '.</span><span>' + gettext( "APP-PLEASE-TEXT" ) + ' <a id="id_retryDataServiceButton" href="javascript:;" title="' + gettext( "APP-TRYAGAIN-TITLE" ) + '">' + gettext( "APP-TRYAGAIN-TEXT" ) + '</a>. ' + gettext( "APP-ORGOTOTHE-TEXT" ) + ' <a href="'+l$Container.find('#id_gotosource').attr('href')+'">' + gettext( "APP-SOURCE-TEXT" ) + '</a>.</span></td>';
	    lHtml        += '</tr>';
	    lHtml        += '</table>';
		lHtml        += '</div></div></div>';
		
		l$Container.find('#id_chartContainer_' + att.index).html(lHtml);
		
		l$Container.find('.bottomActions').css('display', '');
		
		l$Container.bind("mouseenter", { index :att.index }, function(pEvent){
			var lIndex = pEvent.data.index;
            $('#id_dashboard_dataservice_container_' + lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','visible');
	    });
		l$Container.bind("mouseleave", { index :att.index }, function(pEvent){
			var lIndex = pEvent.data.index;
            $('#id_dashboard_dataservice_container_' + lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
	    });
		
		l$Container.find('#id_retryDataServiceButton').click(_.bind(this.refreshChart, this));
	},
	loadDataTable : function(){
		this.attributes.$DataTableObject = new renderChartsDataTable({'jsonResponse' : this.attributes.dataStreamJson});
	},
	loadChart : function(){
		var att 	= this.attributes;
		var lChart 	= att.chartJson.format.type;
		
		switch(lChart){
			case "barchart":
				att.chartObject = new BarChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "columnchart":
				att.chartObject = new ColumnChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "linechart":
				att.chartObject = new LineChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "piechart":
				att.chartObject = new PieChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "areachart":
				att.chartObject = new AreaChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "geochart":
				att.chartObject = new GeoChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "mapchart":
				att.chartObject = new MapChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
		}

		att.chartObject.loadJson(att.chartJson);	
	},
	renderChart : function(pLocalRender){
		var lChart = this.attributes.chartObject;
		lChart.loadJson(this.attributes.chartJson);
		lChart.convertSelections();
		lChart.renderDashboard(this.attributes.$Container, pLocalRender);
		
		if (fDataStreamNeedToMove) {
			var lAttributes = this.attributes;
			var $lDashboardDataService = $('#id_dashboard_dataservice_container_' + lAttributes.index);
			moveDashboardDataService($lDashboardDataService.data("dashboard_dataservice_id"), this.attributes.index, fMoveBeforeIndex);
			$lDashboardDataService.show();
		}
	},
	reRenderChart : function(){
		var lChart = this.attributes.chartObject;
		lChart.renderDashboard(this.attributes.$Container, true);
		//this.renderChart(true);
	},
	renderMaximized : function(){
		var lChart = this.attributes.chartObject;
		lChart.renderMaximize($( '#id_maximized_dashboard_dataservice_' + this.attributes.index ), true);
	},
	refreshChart : function(){
		startWaitMessageChart($('#id_dashboard_dataservice_'+this.attributes.index));
		this.executeDataStream();
	},
	removeChart : function(){

		var att 	= this.attributes;
		//var lUrl 	= Configuration.baseUri + '/dashboards/action_remove_dashboard_widget';
		var lUrl 	= '/dashboards/action_remove_dashboard_widget';		
		var lData 	= 'index='+att.index+'&dashboard_id='+fDashboardId+'&widget_id='+ $fDashboardsContainers.eq(att.index).data("dashboard_dataservice_id");
		
		if (confirm( gettext( "DB-REMOVECHART-CONFIRM" ) )) {
			$.ajax({
				url: lUrl,
				type: 'GET',
				data: lData,
				cache: false,
				dataType: 'json',
				success: this.onSuccessChartRemoved,
				error: this.onErrorChartRemoved
			});
		}
	},
	onSuccessChartRemoved : function(){
		$.url.setUrl(this.url);
	    var lFrom   = parseInt($.url.param("index"));
	    var lTo     = $fDashboardsContainers.size()-1;	
		
		for(i = lFrom; i < lTo; i++){
	        switchDashboardDataServices( i+1, i );
	    }
		
	    var $lDashboardDataServiceContainer = $fDashboardsContainers.eq(lTo);
	    var $lDroppableContainer            = $lDashboardDataServiceContainer.prev();
	    
	    $lDashboardDataServiceContainer.remove();
		$lDroppableContainer.remove();
				
	    if($fDashboardsContainers.size() == 1){
	        $fPersonalizeShowButton.trigger('click');
	    }
		
	    $fDashboardsContainers  = $("div[id*=id_dashboard_dataservice_container_]");
	    	    
	    JPad.init();
		
		jQuery.TwitterMessage( { type: 'success', message : gettext( "DB-CHARTREMOVE-SUCCESS" ) } );
	},
	onErrorChartRemoved : function(pResponse){
	    var lMessage = pResponse.status + ': ' + pResponse.statusText;
	    jQuery.TwitterMessage( { type: 'error', message : lMessage } );
	}
});


var MicrositesDashboardChart = DashboardChart.extend({
    defaults: {
	},
	initialize : function(){
		DashboardChart.prototype.initialize.call(this);
		_.defaults(this.attributes, DashboardChart.prototype.defaults);
	},
	onSuccessDataStreamExecute : function(pResponse){
		var att = this.attributes;
		att.dataStreamJson = pResponse;
		var lTitle = $('#id_dashboard_dataservice_container_' + att.index).data("dataservice_title");
		var lUrl = $('#id_dashboard_dataservice_container_' + att.index).data("datastream_permalink");
		var lCont = $('#id_dashboard_dataservice_'+att.index).html('<div id="id_chartBox_'+att.index +'" class="chartBox"><h2 class="chartTitle"><a id="dashboard_widget_link_'+ att.index +'" href="'+ lUrl +'"  title="'+lTitle+'" target="_blank"><strong>'+lTitle+'</strong></a></h2><div class="chartContainer"><div id="id_chartContainer_'+att.index +'" class="chartContainerInner clearfix"></div></div></div>');
		att.$Container = lCont.find('#id_chartContainer_'+att.index); 
		
		l$Container = $('#id_dashboard_dataservice_container_' + att.index);
		l$Container.find('.bottomActions').css('display', '');
		
		l$Container.bind("mouseenter", { index :att.index }, function(pEvent){
			var lIndex = pEvent.data.index;
            $('#id_dashboard_dataservice_container_' + lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','visible');
	    });
		l$Container.bind("mouseleave", { index :att.index }, function(pEvent){
			var lIndex = pEvent.data.index;
            $('#id_dashboard_dataservice_container_' + lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
	    });
		try{
			var embed = 'chartEmbed_' + att.index;
			//TODO change for new implementation
			//window[embed] = new EmbedCodeCharts({'$OverlayContainer' : $('#id_embedCode'), '$ChartContainer' : $('#id_embed_chart_container'), '$data' : $('#id_dashboard_dataservice_container_' + att.index)});
			$('#id_dashboard_dataservice_container_' + att.index).find('[id*=id_embedChartButton_]').bind('click', {index: att.index}, onAddAndEmbedChartButtonClicked);
		}catch(e){}
		
		
		$( '#id_maximized_dashboard_dataservice_' + att.index ).dialog({
            autoOpen     : false,
            width        : JPad.dataServiceDialogWidth + 200,
            height       : JPad.dataServiceDialogHeight + 200,
			resizeStop: function(event, ui) {
			}
        });
		
		this.loadDataTable();
		this.loadChart();
		this.renderChart(false);
	},
	onErrorDataSreamExecute : function(pResponse){
		var att 	= this.attributes;
		var lHtml 	= '';
		var lTitle = $('#id_dashboard_dataservice_container_' + att.index).data("dataservice_title");
		var lUrl = $('#id_dashboard_dataservice_container_' + att.index).data("datastream_permalink");
		var lCont = $('#id_dashboard_dataservice_'+att.index).html('<div id="id_chartBox_'+att.index +'" class="chartBox errorFix"><h2 class="chartTitle"><a href="'+ lUrl +'"  title="'+lTitle+'" target="_blank"><strong>'+lTitle+'</strong></a></h2><div class="chartContainer"><div id="id_chartContainer_'+att.index +'" class="chartContainerInner clearfix"></div></div></div>');
		att.$Container = lCont.find('#id_chartContainer_'+att.index); 
		
		att.$Container = lCont.find('#id_chartContainer_'+att.index);
		
		lHtml        += '<div class="dataStreamBox errorFix"><div class="dataStreamResult clearfix"><div class="Mensaje">';
		lHtml        += '<table class="Nulo">';
	    lHtml        += '<tr>';
	    lHtml        += '<td> ' + gettext( "APP-OOPS-TEXT" ) + ' <span>' + gettext( "DS-CANTLOADDATA-TEXT" ) + '.</span><span>' + gettext( "APP-PLEASE-TEXT" ) + ' <a id="id_retryDataServiceButton" href="javascript:;" title="' + gettext( "APP-TRYAGAIN-TITLE" ) + '">' + gettext( "APP-TRYAGAIN-TEXT" ) + '</a>. ' + gettext( "APP-ORGOTOTHE-TEXT" ) + ' <a href="'+att.$Container.find('#id_gotosource').attr('href')+'">' + gettext( "APP-SOURCE-TEXT" ) + '</a>.</span></td>';
	    lHtml        += '</tr>';
	    lHtml        += '</table>';
		lHtml        += '</div></div></div>';
		
		att.$Container.find('#id_chartContainer_' + att.index).html(lHtml);

		att.$Container = $('#id_dashboard_dataservice_container_' + att.index);
		att.$Container.find('.bottomActions').css('display', '');
		
		att.$Container.bind("mouseenter", { index :att.index }, function(pEvent){
			var lIndex = pEvent.data.index;
            $('#id_dashboard_dataservice_container_' + lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','visible');
	    });
		att.$Container.bind("mouseleave", { index :att.index }, function(pEvent){
			var lIndex = pEvent.data.index;
            $('#id_dashboard_dataservice_container_' + lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
	    });
		
		$('#id_dashboard_dataservice_container_' + att.index).find('#id_retryDataServiceButton').click(_.bind(this.refreshChart, this));
	},
});
