var Chart = Backbone.Model.extend({
	defaults : {
		$DataTable	: null,
		title 		: '',
		showLegend 	: false,
		size 		: [0,0],
		dataSelection : '',
		data		: '',
		invertedData: false,
		invertedAxis: false,
		correlativeData : false,
		multipleSeries : false,
		seriesData : [],
		nullValueAction : 'exclude',
		nullValuePreset : '',
		properties	: '',
		chartType	: '',
		chartTemplate : '',
		manager		: null
	}, 
	initialize : function(){
		var att = this.attributes;
		
		$('#id_done_headers_' + att.chartTemplate).click(_.bind(this.onSelectHeadersComplete, this));
		$('#id_select_headers_' + att.chartTemplate).click(_.bind(this.onPickChartHeaders, this));
		$('#id_clear_headers_' + att.chartTemplate).click(_.bind(this.onClearPickHeaders, this));
		$('#id_done_labels_' + att.chartTemplate).click(_.bind(this.onSelectLabelsComplete, this));
		$('#id_select_labels_' + att.chartTemplate).click(_.bind(this.onPickChartLabels, this));
		$('#id_clear_labels_' + att.chartTemplate).click(_.bind(this.onClearPickLabels, this));
		
		var $yTitle = $('#id_yTitle_'+ att.chartTemplate);
		$yTitle.click(function(){
            if ($yTitle.val() == gettext( "APP-ENTERNAME-TEXT" ) ) {
                $yTitle.val('');
				$yTitle.removeClass('shadowText');
            }
        }).blur(function(){
            if ($yTitle.val() == '') {
                $yTitle.val( gettext( "APP-ENTERNAME-TEXT" ) );
				$yTitle.addClass('shadowText');
            }
        }).trigger('blur');
		
		var $xTitle = $('#id_xTitle_'+ att.chartTemplate);
		$xTitle.click(function(){
            if ($xTitle.val() == gettext( "APP-ENTERNAME-TEXT" ) ) {
                $xTitle.val('');
				$xTitle.removeClass('shadowText');
            }
        }).blur(function(){
            if ($xTitle.val() == '') {
                $xTitle.val( gettext( "APP-ENTERNAME-TEXT" ) );
				$xTitle.addClass('shadowText');
            }
        }).trigger('blur');
	},
	onPickChartHeaders : function(pEvent){
		var att = this.attributes;
		att.manager.selectionStarted();
		$('#id_headerOptions_'+ att.chartTemplate + ', #id_dataTableContainer').expose({ closeOnEsc: false, closeOnClick: false })
		$('#id_editHeaders_' + att.chartTemplate).hide();
		$('#id_startPickHeaders_' + att.chartTemplate).show();
		
		att.$DataTable.enableSelection("ao-header");
	},
	onPickChartLabels : function(pEvent){
		var att = this.attributes;
		att.manager.selectionStarted();
		$('#id_labelsOptions_'+ att.chartTemplate + ', #id_dataTableContainer').expose({ closeOnEsc: false, closeOnClick: false })
		$('#id_editLabels_' + att.chartTemplate).hide();
		$('#id_startPickLabels_' + att.chartTemplate).show();
		
		att.$DataTable.enableSelection("ao-label");
	},
	onSelectLabelsComplete : function(){
		$.mask.close();
		var att = this.attributes;
		att.manager.selectionComplete();
		$.mask.close();
		$('#id_editLabels_' + att.chartTemplate).show();
		$('#id_startPickLabels_' + att.chartTemplate).hide();
		
		att.$DataTable.disableSelecion();		
		$('#id_labelsSelection_'+att.chartTemplate).html(att.$DataTable.generateExcelSelection('ao-label'));
	},
	onSelectHeadersComplete : function(){
		$.mask.close();
		var att = this.attributes;
		att.manager.selectionComplete();
		$.mask.close();
		$('#id_editHeaders_' + att.chartTemplate).show();
		$('#id_startPickHeaders_' + att.chartTemplate).hide();
		
		att.$DataTable.disableSelecion();
		
		$('#id_headerSelection_' +att.chartTemplate).html(att.$DataTable.generateExcelSelection('ao-header'));
	},
	onClearPickLabels : function(){
		this.attributes.$DataTable.resetSelection('ao-label');
	},
	onClearPickHeaders : function(){
		this.attributes.$DataTable.resetSelection('ao-header');
	},
	generateJson : function(){
	},
	loadJson : function(){
	},
	convertSelections : function(pSelection){
	},
	parseAttributes : function(){
	},
	render : function(pChartDiv, pLocalRender){
	},
	renderDashboard : function(pChartDiv, pLocalRender){
		var $Container = $('.chartContainer').eq(0);
		this.attributes.size = [$Container.width(), 167];
		this.render(pChartDiv, pLocalRender);
	},
	renderMaximize : function(pChartDiv, pLocalRender){
		this.attributes.size = [800, 525];
		this.render(pChartDiv, pLocalRender);
	},
	renderDetail : function(pChartDiv){
		this.attributes.size = [$('#id_chartDisplay').width()-10, $('#id_chartDisplay').height()-20];
		this.render(pChartDiv, false);
	},
	renderHome : function(pChartDiv){
		this.attributes.size = [400, 200];
		this.render(pChartDiv, false);
	},
	renderEmbed : function(pChartDiv, pWidth, pHeight){
		this.attributes.size = [pWidth, pHeight];
		this.render(pChartDiv, false);
	},
	renderPreview : function(pChartDiv){
		var $Container = $('.CR .columnContent'); 
		this.attributes.size = [$Container.width(), 400];
		this.render(pChartDiv, false);
	},
	reset : function(){
	
	}
});

var ColumnChart = Chart.extend({
	defaults : {
		xTitle : '',
		yTitle : '',
		labelSelection : '',
		headerSelection : '',
		legendClass : 'ao-label',
		headerClass : 'ao-header',
		dataClass : 'ao-data',
		scale : 0,
	}, 
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		$('#id_yTitle_'+ this.attributes.chartTemplate +', #id_xTitle_'+ this.attributes.chartTemplate + ', #id_scale_'+ this.attributes.chartTemplate).change(_.bind(this.onOptionsChanged, this));
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		att.yTitle = $('#id_yTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_yTitle_'+ att.chartTemplate).val() : '';
		att.xTitle = $('#id_xTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_xTitle_'+ att.chartTemplate).val() : '';
		att.scale = $('#id_scale_'+ this.attributes.chartTemplate).val() != '' ? $('#id_scale_'+ this.attributes.chartTemplate).val() : 0;

		att.manager.renderChartPreview();
	},
	parseCorrelativeData : function(){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		var $headers = $Table.find('.' + att.headerClass);
		
		var lTotalCols = 0;
		var lLastCol = 0;
		var lColList = [];
		$Table.find('.'+att.dataClass).each(function(i){
			if($(this)[0].cellIndex > lLastCol){
				lLastCol = $(this)[0].cellIndex;
				lColList.push($(this)[0].cellIndex+1);
				lTotalCols++;
			}
		});
		
		for (var i = 0; i <= 1; i++) {
			var lCol = {};
			lCol.id = i + '_' + '';
			lCol.label = '';
			if (i == 0) {
				lCol.type = 'string';
			}
			else {
				lCol.type = 'number';
			}
			data.cols.push(lCol);
		}
		
		data.rows = [];
		var lData;
		var lPreviousDataValue = null;
		var $lCells = $Table.find('td.' + att.dataClass);
		var $Legend = $Table.find('td.' + att.legendClass);
		
		if($lCells.size() > 0){
			for (var i = 0; i < lColList.length; i++){
				$Table.find('tr:gt(0)').children("td:nth-child("+lColList[i]+").ao-data").each(function(i){
					lData = { c: [] };
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim('')) };
					}
					lData.c.push(lHeader);
					
					var unParsedData = $.trim($(this).text());
					var dataVal = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataVal)){
						if(att.nullValueAction == "previous"){
							dataVal = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataVal = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataVal)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataVal };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataVal)) {
						// do nothing
					}else{
						lData.c.push(lValue);
						data.rows.push(lData);
						lPreviousDataValue = dataVal;
					}
				});
			};
		}
		att.data = new google.visualization.DataTable(data);
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		data.cols = this.generateHeaders($Table);
		data.rows = this.generateData($Table);
		
		att.data = new google.visualization.DataTable(data);
	},
	generateHeaders : function(p$Table){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= p$Table;
		var invertedAxis = att.invertedAxis;
		var $headers = $Table.find('.' + att.headerClass);

		if ($headers.size() > 1 ) {
			var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'string';
				data.cols.push(lCol);
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
				
				data.cols.push(lCol);
			});
		}
		
		if ($headers.size() == 0 ) {
			var lTotalCols = 0;
			var lLastCol = 0;

			if(invertedAxis){
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this).parent('tr')[0].rowIndex > lLastCol){
						lLastCol = $(this).parent('tr')[0].rowIndex;
						lTotalCols++;
					}
				});
			}else if(att.multipleSeries){
				var lSeries = $Table.find('[class*=series_], .ao-data').toArray();
				lSeries 	= _.groupBy(lSeries, function(element){return element.className});
				lTotalCols 	= _.keys(lSeries).length;
			}else{
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this)[0].cellIndex > lLastCol){
						lLastCol = $(this)[0].cellIndex;
						lTotalCols++;
					}
				});
			}
			
			for (var i = 0; i <= lTotalCols; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		if ($headers.size() == 1) {
			for (var i = 0; i <= 1; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if(i==1){
					var lHeader = $.trim($headers.eq(0).text());
					lCol.id = i + '_' + lHeader;
					lCol.label = lHeader;
				}
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		return data.cols;
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData;
		var data 	= {};
		data.rows 	= [];
		var lPreviousDataValue = null;
		var $Table = p$Table;
		var invertedAxis = att.invertedAxis;
		var invertedData = att.invertedData;
		var $Rows = $Table.find('tr');
		
		if(invertedAxis){
			var lColumnData = this.organizeSelectedColumns();
			var $lLegend 	= $Table.find('td.' + att.legendClass);
			var lIndex		= 0;

			for (var i = 0; i < lColumnData.length; i++){
				lData = { c: [] };
				if(typeof lColumnData[i] !== "undefined"){
					var lHeader;
					if($lLegend.eq(lIndex).size() == 1 ){
						lHeader = { v: String($.trim($lLegend.eq(lIndex).text())) };
						lIndex++;
					}else{
						lHeader = { v: String($.trim("")) };
					}
					lData.c.push(lHeader);
					
					lDataAux = lColumnData[i];
					for (var j = 0; j < lDataAux.length; j++) {
						var unParsedData = $.trim($(lDataAux[j]).text());
						var lNum = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(lNum)){
							if(att.nullValueAction == "previous"){
								lNum = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								lNum = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(lNum)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: lNum };
						}
						if (att.nullValueAction == "exclude" && isNaN(lNum)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
					}
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(invertedData){
			for (var i = $Rows.size(); i >= 0; i--){
				var $Legend = $Rows.eq(i).find('td.' + att.legendClass);
				var $Data	= $Rows.eq(i).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}	
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(att.multipleSeries){
			var lSeries = $Table.find('[class*=series_], .ao-data').toArray();
			lSeries 	= _.groupBy(lSeries, function(element){return element.className});
			var lKeys 	= _.keys(lSeries);
			
			var lLength = 0;
			for (var i = 0; i < lKeys.length; i++) {
				var lKey = lKeys[i];
				if(lSeries[lKey].length > lLength){
					lLength = lSeries[lKey].length;
				}
			}
			
			for (var i = 0; i < lLength; i++) {
				var lLabel = $(lSeries["ao-data"]).parent().find('.ao-label');
				lData = { c: [] };
				lHeader = { v: String($.trim(lLabel.eq(0).text())) };
				lData.c.push(lHeader);
				for (var j = 0; j < lKeys.length; j++) {
					var lKey = lKeys[j];
					var unParsedData = $.trim($(lSeries[lKey][i]).text());
					var dataAux = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataAux)){
						if(att.nullValueAction == "previous"){
							dataAux = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataAux = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataAux)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataAux };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataAux)) {
						lValue = { v: 0 };
						lData.c.push(lValue);
						lPreviousDataValue = dataAux;
					}else{
						lData.c.push(lValue);
						lPreviousDataValue = dataAux;
					}
				}
				data.rows.push(lData);
			}
		}else{
			$Table.find('tr').each(function(i){
				var $Legend = $(this).find('td.' + att.legendClass);
				var $Data	= $(this).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}
			});
		}
		
		return data.rows;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1],
            hAxis: {title: att.xTitle},
            vAxis: {title: att.yTitle, maxValue : att.scale},
            legend : att.showLegend ? 'right' : 'none'
           };
		att.properties = lProps;
	},
	organizeSelectedColumns :  function(){
		var _this = this;
		var att = _this.attributes;
		var $Table = att.$DataTable.attributes.$Table;
		var lColumns = [];
		
		$Table.find('td.' + att.dataClass).each(function(i){
			var lRowIndex 	= $(this).parent()[0].rowIndex;
			var lCellIndex 	= this.cellIndex;

			var localCol = lColumns[lCellIndex];
			if(typeof localCol === "undefined"){
				lColumns[lCellIndex] = [];
				localCol = lColumns[lCellIndex];
				localCol.push(this);
			}else{
				localCol.push(this);
			}
		});
		
		return lColumns;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			if(this.attributes.correlativeData){
				this.parseCorrelativeData();
			}else{
				this.parseData();
			}
		}
		
		this.parseAttributes();

		var chart = new google.visualization.ColumnChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
	},
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertData' : att.invertedData, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset, 'multipleSeries' : att.multipleSeries };
		json.title = att.title;
		if(att.multipleSeries){
			json.data = [];
			var lSeries = $('#id_multiple_container [id*=id_series_]');
			for(var i = 0; i < lSeries.size(); i++){
				var lValue = {};
				lValue.series = $.trim(lSeries.eq(i).attr('data'));
				lValue.selection = $.trim(lSeries.eq(i).val());
				json.data.push(lValue);
			}			
		}else{
			json.data = att.dataSelection;	
		}
		
		chart.xTitle = att.xTitle;
		chart.yTitle = att.yTitle;
		chart.scale = att.scale;
		chart.labelSelection = $('#id_labelsSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_labelsSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" )? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		
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
		att.multipleSeries = pJsonChart.format.multipleSeries;
		if(att.multipleSeries){
			att.seriesData = [];
			var lSeries = pJsonChart.data;
			for(var i = 0; i < lSeries.length; i++){
				var lValue = {};
				lValue.series = lSeries[i].series;
				lValue.selection = lSeries[i].selection;
				att.seriesData.push(lValue);
			}			
		}else{
			att.dataSelection = pJsonChart.data;	
		}
		att.xTitle = pJsonChart.chart.xTitle;
		att.yTitle = pJsonChart.chart.yTitle;
		att.scale = pJsonChart.chart.scale;
		att.labelSelection = pJsonChart.chart.labelSelection;
		att.headerSelection = pJsonChart.chart.headerSelection;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.labelSelection,'ao-label');
		if(att.multipleSeries){
			var lSeries = att.seriesData;
			for(var i = 0; i < lSeries.length; i++){
				att.$DataTable.setExcelSelection(lSeries[i].selection, lSeries[i].series);
			}			
		}else{
			att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
		}
	}
});

var BarChart = Chart.extend({
	defaults : {
		xTitle : '',
		yTitle : '',
		labelSelection : '',
		headerSelection : '',
		legendClass : 'ao-label',
		headerClass : 'ao-header',
		dataClass : 'ao-data',
		scale : 0
	}, 
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		$('#id_yTitle_'+ this.attributes.chartTemplate +', #id_xTitle_'+ this.attributes.chartTemplate + ', #id_scale_'+ this.attributes.chartTemplate).change(_.bind(this.onOptionsChanged, this));
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		att.yTitle = $('#id_yTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_yTitle_'+ att.chartTemplate).val() : '';
		att.xTitle = $('#id_xTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_xTitle_'+ att.chartTemplate).val() : '';
		att.scale = $('#id_scale_'+ this.attributes.chartTemplate).val() != '' ? $('#id_scale_'+ this.attributes.chartTemplate).val() : 0;

		att.manager.renderChartPreview();
	},
	parseCorrelativeData : function(){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		var $headers = $Table.find('.' + att.headerClass);
		
		var lTotalCols = 0;
		var lLastCol = 0;
		var lColList = [];
		$Table.find('.'+att.dataClass).each(function(i){
			if($(this)[0].cellIndex > lLastCol){
				lLastCol = $(this)[0].cellIndex;
				lColList.push($(this)[0].cellIndex+1);
				lTotalCols++;
			}
		});
		
		for (var i = 0; i <= 1; i++) {
			var lCol = {};
			lCol.id = i + '_' + '';
			lCol.label = '';
			if (i == 0) {
				lCol.type = 'string';
			}
			else {
				lCol.type = 'number';
			}
			data.cols.push(lCol);
		}
		
		data.rows = [];
		var lData;
		var lPreviousDataValue = null;
		var $lCells = $Table.find('td.' + att.dataClass);
		var $Legend = $Table.find('td.' + att.legendClass);
		
		if($lCells.size() > 0){
			for (var i = 0; i < lColList.length; i++){
				$Table.find('tr:gt(0)').children("td:nth-child("+lColList[i]+").ao-data").each(function(i){
					lData = { c: [] };
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim('')) };
					}
					lData.c.push(lHeader);
					
					var unParsedData = $.trim($(this).text());
					var dataVal = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataVal)){
						if(att.nullValueAction == "previous"){
							dataVal = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataVal = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataVal)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataVal };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataVal)) {
						// do nothing
					}else{
						lData.c.push(lValue);
						data.rows.push(lData);
						lPreviousDataValue = dataVal;
					}
				});
			};
		}
		att.data = new google.visualization.DataTable(data);
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		data.cols = this.generateHeaders($Table);
		data.rows = this.generateData($Table);
		
		att.data = new google.visualization.DataTable(data);
	},
	generateHeaders : function(p$Table){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= p$Table;
		var invertedAxis = att.invertedAxis;
		var $headers = $Table.find('.' + att.headerClass);

		if ($headers.size() > 1 ) {
			var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'string';
				data.cols.push(lCol);
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
				
				data.cols.push(lCol);
			});
		}
		
		if ($headers.size() == 0 ) {
			var lTotalCols = 0;
			var lLastCol = 0;

			if(invertedAxis){
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this).parent('tr')[0].rowIndex > lLastCol){
						lLastCol = $(this).parent('tr')[0].rowIndex;
						lTotalCols++;
					}
				});
			}else if(att.multipleSeries){
				var lSeries = $Table.find('[class*=series_], .ao-data').toArray();
				lSeries 	= _.groupBy(lSeries, function(element){return element.className});
				lTotalCols 	= _.keys(lSeries).length;
			}else{
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this)[0].cellIndex > lLastCol){
						lLastCol = $(this)[0].cellIndex;
						lTotalCols++;
					}
				});
			}
			
			for (var i = 0; i <= lTotalCols; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		if ($headers.size() == 1) {
			for (var i = 0; i <= 1; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if(i==1){
					var lHeader = $.trim($headers.eq(0).text());
					lCol.id = i + '_' + lHeader;
					lCol.label = lHeader;
				}
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		return data.cols;
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData;
		var data 	= {};
		data.rows 	= [];
		var lPreviousDataValue = null;
		var $Table = p$Table;
		var invertedAxis = att.invertedAxis;
		var invertedData = att.invertedData;
		var $Rows = $Table.find('tr');

		if(invertedAxis){
			var lColumnData = this.organizeSelectedColumns();
			var $lLegend 	= $Table.find('td.' + att.legendClass);
			var lIndex		= 0;

			for (var i = 0; i < lColumnData.length; i++){
				lData = { c: [] };
				if(typeof lColumnData[i] !== "undefined"){
					var lHeader;
					if($lLegend.eq(lIndex).size() == 1 ){
						lHeader = { v: String($.trim($lLegend.eq(lIndex).text())) };
						lIndex++;
					}else{
						lHeader = { v: String($.trim("")) };
					}
					lData.c.push(lHeader);
					
					lDataAux = lColumnData[i];
					for (var j = 0; j < lDataAux.length; j++) {
						var unParsedData = $.trim($(lDataAux[j]).text());
						var lNum = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(lNum)){
							if(att.nullValueAction == "previous"){
								lNum = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								lNum = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(lNum)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: lNum };
						}
						if (att.nullValueAction == "exclude" && isNaN(lNum)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
					}
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(invertedData){
			for (var i = $Rows.size(); i >= 0; i--){
				var $Legend = $Rows.eq(i).find('td.' + att.legendClass);
				var $Data	= $Rows.eq(i).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}	
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(att.multipleSeries){
			var lSeries = $Table.find('[class*=series_], .ao-data').toArray();
			lSeries 	= _.groupBy(lSeries, function(element){return element.className});
			var lKeys 	= _.keys(lSeries);
			
			var lLength = 0;
			for (var i = 0; i < lKeys.length; i++) {
				var lKey = lKeys[i];
				if(lSeries[lKey].length > lLength){
					lLength = lSeries[lKey].length;
				}
			}
			
			for (var i = 0; i < lLength; i++) {
				var lLabel = $(lSeries["ao-data"]).parent().find('.ao-label');
				lData = { c: [] };
				lHeader = { v: String($.trim(lLabel.eq(0).text())) };
				lData.c.push(lHeader);
				for (var j = 0; j < lKeys.length; j++) {
					var lKey = lKeys[j];
					var unParsedData = $.trim($(lSeries[lKey][i]).text());
					var dataAux = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataAux)){
						if(att.nullValueAction == "previous"){
							dataAux = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataAux = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataAux)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataAux };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataAux)) {
						lValue = { v: 0 };
						lData.c.push(lValue);
						lPreviousDataValue = dataAux;
					}else{
						lData.c.push(lValue);
						lPreviousDataValue = dataAux;
					}
				}
				data.rows.push(lData);
			}
		}else{
			$Table.find('tr').each(function(i){
				var $Legend = $(this).find('td.' + att.legendClass);
				var $Data	= $(this).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}
			});
		}
		return data.rows;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1] ,
            hAxis: {title: att.xTitle},
            vAxis: {title: att.yTitle, maxValue : att.scale},
            legend : att.showLegend ? 'right' : 'none'
           };
		att.properties = lProps;
	},
	organizeSelectedColumns :  function(){
		var _this = this;
		var att = _this.attributes;
		var $Table = att.$DataTable.attributes.$Table;
		var lColumns = [];
		
		$Table.find('td.' + att.dataClass).each(function(i){
			var lRowIndex 	= $(this).parent()[0].rowIndex;
			var lCellIndex 	= this.cellIndex;

			var localCol = lColumns[lCellIndex];
			if(typeof localCol === "undefined"){
				lColumns[lCellIndex] = [];
				localCol = lColumns[lCellIndex];
				localCol.push(this);
			}else{
				localCol.push(this);
			}
		});
		
		return lColumns;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			if(this.attributes.correlativeData){
				this.parseCorrelativeData();
			}else{
				this.parseData();
			}
		}

		this.parseAttributes();

		var chart = new google.visualization.BarChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
	},
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertData' : att.invertedData, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset, 'multipleSeries' : att.multipleSeries };
		json.title = att.title;
		if(att.multipleSeries){
			json.data = [];
			var lSeries = $('#id_multiple_container [id*=id_series_]');
			for(var i = 0; i < lSeries.size(); i++){
				var lValue = {};
				lValue.series = $.trim(lSeries.eq(i).attr('data'));
				lValue.selection = $.trim(lSeries.eq(i).val());
				json.data.push(lValue);
			}			
		}else{
			json.data = att.dataSelection;	
		}
		
		chart.xTitle = att.xTitle;
		chart.yTitle = att.yTitle;
		chart.scale = att.scale;
		chart.labelSelection = $('#id_labelsSelection_'+att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_labelsSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		
		json.chart = chart
		return json;
	},
	loadJson : function(pJsonChart){
		var att = this.attributes;
		att.chartType = pJsonChart.format.type;
		att.chartTemplate = pJsonChart.format.chartTemplate;
		att.title = pJsonChart.title;
		att.showLegend = pJsonChart.format.showLegend;
		att.invertedData = pJsonChart.format.invertData;
		att.invertedAxis = pJsonChart.format.invertedAxis;
		att.correlativeData = pJsonChart.format.correlativeData;
		att.nullValueAction = pJsonChart.format.nullValueAction;
		att.nullValuePreset = pJsonChart.format.nullValuePreset;
		att.multipleSeries = pJsonChart.format.multipleSeries;
		if(att.multipleSeries){
			att.seriesData = [];
			var lSeries = pJsonChart.data;
			for(var i = 0; i < lSeries.length; i++){
				var lValue = {};
				lValue.series = lSeries[i].series;
				lValue.selection = lSeries[i].selection;
				att.seriesData.push(lValue);
			}			
		}else{
			att.dataSelection = pJsonChart.data;	
		}
		att.xTitle = pJsonChart.chart.xTitle;
		att.yTitle = pJsonChart.chart.yTitle;
		att.scale = pJsonChart.chart.scale;
		att.labelSelection = pJsonChart.chart.labelSelection;
		att.headerSelection = pJsonChart.chart.headerSelection;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.labelSelection,'ao-label');
		if(att.multipleSeries){
			var lSeries = att.seriesData;
			for(var i = 0; i < lSeries.length; i++){
				att.$DataTable.setExcelSelection(lSeries[i].selection, lSeries[i].series);
			}			
		}else{
			att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
		}
	}
});

var LineChart = Chart.extend({
	defaults : {
		xTitle : '',
		yTitle : '',
		labelSelection : '',
		headerSelection : '',
		legendClass : 'ao-label',
		headerClass : 'ao-header',
		dataClass : 'ao-data'
	}, 
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		$('#id_yTitle_'+ this.attributes.chartTemplate +', #id_xTitle_'+ this.attributes.chartTemplate + ', #id_scale_'+ this.attributes.chartTemplate).change(_.bind(this.onOptionsChanged, this));
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		att.yTitle = $('#id_yTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_yTitle_'+ att.chartTemplate).val() : '';
		att.xTitle = $('#id_xTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_xTitle_'+ att.chartTemplate).val() : '';
		att.scale = $('#id_scale_'+ this.attributes.chartTemplate).val() != '' ? $('#id_scale_'+ this.attributes.chartTemplate).val() : 0;

		att.manager.renderChartPreview();
	},
	parseCorrelativeData : function(){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		var $headers = $Table.find('.' + att.headerClass);
		
		var lTotalCols = 0;
		var lLastCol = 0;
		var lColList = [];
		$Table.find('.'+att.dataClass).each(function(i){
			if($(this)[0].cellIndex > lLastCol){
				lLastCol = $(this)[0].cellIndex;
				lColList.push($(this)[0].cellIndex+1);
				lTotalCols++;
			}
		});
		
		for (var i = 0; i <= 1; i++) {
			var lCol = {};
			lCol.id = i + '_' + '';
			lCol.label = '';
			if (i == 0) {
				lCol.type = 'string';
			}
			else {
				lCol.type = 'number';
			}
			data.cols.push(lCol);
		}
		
		data.rows = [];
		var lData;
		var lPreviousDataValue = null;
		var $lCells = $Table.find('td.' + att.dataClass);
		var $Legend = $Table.find('td.' + att.legendClass);
		
		if($lCells.size() > 0){
			for (var i = 0; i < lColList.length; i++){
				$Table.find('tr:gt(0)').children("td:nth-child("+lColList[i]+").ao-data").each(function(i){
					lData = { c: [] };
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim('')) };
					}
					lData.c.push(lHeader);
					
					var unParsedData = $.trim($(this).text());
					var dataVal = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataVal)){
						if(att.nullValueAction == "previous"){
							dataVal = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataVal = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataVal)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataVal };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataVal)) {
						// do nothing
					}else{
						lData.c.push(lValue);
						data.rows.push(lData);
						lPreviousDataValue = dataVal;
					}
				});
			};
		}
		att.data = new google.visualization.DataTable(data);
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		data.cols = this.generateHeaders($Table);
		data.rows = this.generateData($Table);
		
		att.data = new google.visualization.DataTable(data);
	},
	generateHeaders : function(p$Table){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= p$Table;
		var invertedAxis = att.invertedAxis;
		var $headers = $Table.find('.' + att.headerClass);

		if ($headers.size() > 1 ) {
			var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'string';
				data.cols.push(lCol);
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
				
				data.cols.push(lCol);
			});
		}
		
		if ($headers.size() == 0 ) {
			var lTotalCols = 0;
			var lLastCol = 0;

			if(invertedAxis){
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this).parent('tr')[0].rowIndex > lLastCol){
						lLastCol = $(this).parent('tr')[0].rowIndex;
						lTotalCols++;
					}
				});
			}else if(att.multipleSeries){
				var lSeries = $Table.find('[class*=series_], .ao-data').toArray();
				lSeries 	= _.groupBy(lSeries, function(element){return element.className});
				lTotalCols 	= _.keys(lSeries).length;
			}else{
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this)[0].cellIndex > lLastCol){
						lLastCol = $(this)[0].cellIndex;
						lTotalCols++;
					}
				});
			}
			
			for (var i = 0; i <= lTotalCols; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		if ($headers.size() == 1) {
			for (var i = 0; i <= 1; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if(i==1){
					var lHeader = $.trim($headers.eq(0).text());
					lCol.id = i + '_' + lHeader;
					lCol.label = lHeader;
				}
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		return data.cols;
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData;
		var data 	= {};
		data.rows 	= [];
		var lPreviousDataValue = null;
		var $Table = p$Table;
		var invertedAxis = att.invertedAxis;
		var invertedData = att.invertedData;
		var $Rows = $Table.find('tr');
		
		if(invertedAxis){
			var lColumnData = this.organizeSelectedColumns();
			var $lLegend 	= $Table.find('td.' + att.legendClass);
			var lIndex		= 0;

			for (var i = 0; i < lColumnData.length; i++){
				lData = { c: [] };
				if(typeof lColumnData[i] !== "undefined"){
					var lHeader;
					if($lLegend.eq(lIndex).size() == 1 ){
						lHeader = { v: String($.trim($lLegend.eq(lIndex).text())) };
						lIndex++;
					}else{
						lHeader = { v: String($.trim("")) };
					}
					lData.c.push(lHeader);
					
					lDataAux = lColumnData[i];
					for (var j = 0; j < lDataAux.length; j++) {
						var unParsedData = $.trim($(lDataAux[j]).text());
						var lNum = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(lNum)){
							if(att.nullValueAction == "previous"){
								lNum = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								lNum = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(lNum)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: lNum };
						}
						if (att.nullValueAction == "exclude" && isNaN(lNum)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
					}
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(invertedData){
			for (var i = $Rows.size(); i >= 0; i--){
				var $Legend = $Rows.eq(i).find('td.' + att.legendClass);
				var $Data	= $Rows.eq(i).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}	
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(att.multipleSeries){
			var lSeries = $Table.find('[class*=series_], .ao-data').toArray();
			lSeries 	= _.groupBy(lSeries, function(element){return element.className});
			var lKeys 	= _.keys(lSeries);
			
			var lLength = 0;
			for (var i = 0; i < lKeys.length; i++) {
				var lKey = lKeys[i];
				if(lSeries[lKey].length > lLength){
					lLength = lSeries[lKey].length;
				}
			}
			
			for (var i = 0; i < lLength; i++) {
				var lLabel = $(lSeries["ao-data"]).parent().find('.ao-label');
				lData = { c: [] };
				lHeader = { v: String($.trim(lLabel.eq(0).text())) };
				lData.c.push(lHeader);
				for (var j = 0; j < lKeys.length; j++) {
					var lKey = lKeys[j];
					var unParsedData = $.trim($(lSeries[lKey][i]).text());
					var dataAux = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataAux)){
						if(att.nullValueAction == "previous"){
							dataAux = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataAux = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataAux)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataAux };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataAux)) {
						lValue = { v: 0 };
						lData.c.push(lValue);
						lPreviousDataValue = dataAux;
					}else{
						lData.c.push(lValue);
						lPreviousDataValue = dataAux;
					}
				}
				data.rows.push(lData);
			}
		}else{
			$Table.find('tr').each(function(i){
				var $Legend = $(this).find('td.' + att.legendClass);
				var $Data	= $(this).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}
			});
		}
		
		return data.rows;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1] ,
            hAxis: {title: att.xTitle},
            vAxis: {title: att.yTitle, maxValue : att.scale},
            legend : att.showLegend ? 'right' : 'none'
           };
		att.properties = lProps;
	},
	organizeSelectedColumns :  function(){
		var _this = this;
		var att = _this.attributes;
		var $Table = att.$DataTable.attributes.$Table;
		var lColumns = [];
		
		$Table.find('td.' + att.dataClass).each(function(i){
			var lRowIndex 	= $(this).parent()[0].rowIndex;
			var lCellIndex 	= this.cellIndex;

			var localCol = lColumns[lCellIndex];
			if(typeof localCol === "undefined"){
				lColumns[lCellIndex] = [];
				localCol = lColumns[lCellIndex];
				localCol.push(this);
			}else{
				localCol.push(this);
			}
		});
		
		return lColumns;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			if(this.attributes.correlativeData){
				this.parseCorrelativeData();
			}else{
				this.parseData();
			}
		}
		
		this.parseAttributes();

		var chart = new google.visualization.LineChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
	},
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertData' : att.invertedData, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset, 'multipleSeries' : att.multipleSeries  };
		json.title = att.title;
		if(att.multipleSeries){
			json.data = [];
			var lSeries = $('#id_multiple_container [id*=id_series_]');
			for(var i = 0; i < lSeries.size(); i++){
				var lValue = {};
				lValue.series = $.trim(lSeries.eq(i).attr('data'));
				lValue.selection = $.trim(lSeries.eq(i).val());
				json.data.push(lValue);
			}			
		}else{
			json.data = att.dataSelection;	
		}
		
		chart.xTitle = att.xTitle;
		chart.yTitle = att.yTitle;
		chart.scale = att.scale;
		chart.labelSelection = $('#id_labelsSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_labelsSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		
		json.chart = chart
		return json;
	},
	loadJson : function(pJsonChart){
		var att = this.attributes;
		att.chartType = pJsonChart.format.type;
		att.chartTemplate = pJsonChart.format.chartTemplate;
		att.title = pJsonChart.title;
		att.showLegend = pJsonChart.format.showLegend;
		att.invertedData = pJsonChart.format.invertData;
		att.invertedAxis = pJsonChart.format.invertedAxis;
		att.correlativeData = pJsonChart.format.correlativeData;
		att.nullValueAction = pJsonChart.format.nullValueAction;
		att.nullValuePreset = pJsonChart.format.nullValuePreset;
		att.multipleSeries = pJsonChart.format.multipleSeries;
		if(att.multipleSeries){
			att.seriesData = [];
			var lSeries = pJsonChart.data;
			for(var i = 0; i < lSeries.length; i++){
				var lValue = {};
				lValue.series = lSeries[i].series;
				lValue.selection = lSeries[i].selection;
				att.seriesData.push(lValue);
			}			
		}else{
			att.dataSelection = pJsonChart.data;	
		}
		att.xTitle = pJsonChart.chart.xTitle;
		att.yTitle = pJsonChart.chart.yTitle;
		att.scale = pJsonChart.chart.scale;
		att.labelSelection = pJsonChart.chart.labelSelection;
		att.headerSelection = pJsonChart.chart.headerSelection;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.labelSelection,'ao-label');
		if(att.multipleSeries){
			var lSeries = att.seriesData;
			for(var i = 0; i < lSeries.length; i++){
				att.$DataTable.setExcelSelection(lSeries[i].selection, lSeries[i].series);
			}			
		}else{
			att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
		}
	}
});

var PieChart = Chart.extend({
	defaults : {
		is3D 		: false,
		labelSelection : '',
		legendClass : 'ao-label',
		dataClass : 'ao-data'
	},
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		$('#id_is3d_'+ this.attributes.chartType).change(_.bind(this.onOptionsChanged, this));
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		att.is3D = $('#id_is3d_'+ att.chartType).attr('checked');
				
		att.manager.renderChartPreview();
	},
	parseData : function(){
		var data = {};
		var _this = this;
		var att = _this.attributes;
		var invertedAxis = att.invertedAxis;
		var $Table = att.$DataTable.attributes.$Table;
		data.cols = [];
		
		var $headers = $Table.find('.' + att.headerClass);
		if ($headers.size() > 1 ) {
			var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'string';
				data.cols.push(lCol);
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
				
				data.cols.push(lCol);
			});
		}
		if ($headers.size()==0 ) {
			var lTotalCols = 0;
			var lLastCol = 0;
			$Table.find('.'+att.dataClass).each(function(i){
				if($(this)[0].cellIndex > lLastCol){
					lLastCol = $(this)[0].cellIndex;
					lTotalCols++;
				}
			});
			
			for (var i = 0; i <= lTotalCols; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		if ($headers.size() == 1) {
			for (var i = 0; i <= 1; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if(i==1){
					var lHeader = $.trim($headers.eq(0).text());
					lCol.id = i + '_' + lHeader;
					lCol.label = lHeader;
				}
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		data.rows = [];
		var lData;
		var lPreviousDataValue = null;
		
		if (invertedAxis) {
			var lColumnData = this.organizeSelectedColumns();
			var $lLegend = $Table.find('td.' + att.legendClass);
			var lIndex = 0;
			
			for (var i = 0; i < lColumnData.length; i++) {
				lData = {
					c: []
				};
				if (typeof lColumnData[i] !== "undefined") {
					var lHeader;
					if ($lLegend.eq(lIndex).size() == 1) {
						lHeader = {
							v: String($.trim($lLegend.eq(lIndex).text()))
						};
						lIndex++;
					}
					else {
						lHeader = {
							v: String($.trim(""))
						};
					}
					lData.c.push(lHeader);
					
					lDataAux = lColumnData[i];
					for (var j = 0; j < lDataAux.length; j++) {
						var unParsedData = $.trim($(lDataAux[j]).text());
						var lNum = parseNumber(unParsedData);
						var lValue;
						if (unParsedData == "" || isNaN(lNum)) {
							if (att.nullValueAction == "previous") {
								lNum = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if (att.nullValueAction == "preset") {
								lNum = parseNumber(att.nullValuePreset);
							}
						}
						if (isNaN(lNum)) {
							lValue = {
								v: 0
							};
						}
						else {
							lValue = {
								v: lNum
							};
						}
						if (att.nullValueAction == "exclude" && isNaN(lNum)) {
							lValue = {
								v: 0
							};
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
						else {
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
					}
					if (lData.c.length != 1) {
						data.rows.push(lData);
					}
				}
			};
		}else {
			$Table.find('tr').each(function(i){
				var $Legend = $(this).find('td.' + att.legendClass);
				var $Data = $(this).find('td.' + att.dataClass);
				lData = {
					c: []
				};
				if ($Data.size() > 0) {
					var lHeader;
					if ($Legend.size() > 0) {
						lHeader = {
							v: String($.trim($Legend.eq(0).text()))
						};
					}
					else {
						lHeader = {
							v: String($.trim($Legend.eq(0).text()))
						};
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if (unParsedData == "" || isNaN(data)) {
							if (att.nullValueAction == "previous") {
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if (att.nullValueAction == "preset") {
								data = parseNumber(att.nullValuePreset);
							}
						}
						if (isNaN(data)) {
							lValue = {
								v: 0
							};
						}
						else {
							lValue = {
								v: data
							};
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
						// do nothing
						}
						else {
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}
					});
					if (lData.c.length != 1) {
						data.rows.push(lData);
					}
				}
			});
		}
		att.data = new google.visualization.DataTable(data);
	},
	parseAttributes : function(){
        var att = this.attributes;
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1] ,
            legend : att.showLegend ? 'right' : 'none',
            is3D : att.is3D
           };
		att.properties = lProps;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			this.parseData();
		}

		this.parseAttributes();
		
		var chart = new google.visualization.PieChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
	},
	organizeSelectedColumns :  function(){
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		var lColumns = [];
		
		$Table.find('td.' + att.dataClass).each(function(i){
			var lRowIndex 	= $(this).parent()[0].rowIndex;
			var lCellIndex 	= this.cellIndex;

			var localCol = lColumns[lCellIndex];
			if(typeof localCol === "undefined"){
				lColumns[lCellIndex] = [];
				localCol = lColumns[lCellIndex];
				localCol.push(this);
			}else{
				localCol.push(this);
			}
		});
		
		return lColumns;
	},
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset };
		json.title = att.title;
		json.data = att.dataSelection;
		
		chart.labelSelection = $('#id_labelsSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_labelsSelection_'+ att.chartTemplate).text() : '';
		chart.is3D = att.is3D;
		
		json.chart = chart
		return json;
	},
	loadJson : function(pJsonChart){
		var att = this.attributes;
		att.chartType = pJsonChart.format.type;
		att.chartTemplate = pJsonChart.format.chartTemplate;
		att.title = pJsonChart.title;
		att.showLegend = pJsonChart.format.showLegend;
		att.dataSelection = pJsonChart.data;
		att.labelSelection = pJsonChart.chart.labelSelection;
		att.invertedAxis = pJsonChart.format.invertedAxis;
		att.correlativeData = pJsonChart.format.correlativeData;
		att.nullValueAction = pJsonChart.format.nullValueAction;
		att.nullValuePreset = pJsonChart.format.nullValuePreset;
		att.is3D = pJsonChart.chart.is3D;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.labelSelection,'ao-label');
		att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
	}
});

var ScatterChart = Chart.extend({
	defaults : {
		xTitle : '',
		yTitle : '',
		xSelection : '',
		ySelection : '',
		headerSelection : '',
		xClass : 'ao-x',
		yClass : 'ao-y',
		headerClass : 'ao-header'
	}, 
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		$('#id_yTitle_'+ this.attributes.chartTemplate +', #id_xTitle_'+ this.attributes.chartTemplate).change(_.bind(this.onOptionsChanged, this));
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		att.yTitle = $('#id_yTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_yTitle_'+ att.chartTemplate).val() : '';
		att.xTitle = $('#id_xTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_xTitle_'+ att.chartTemplate).val() : '';
		
		att.manager.renderChartPreview();
	},
	parseCorrelativeData : function(){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		var $headers = $Table.find('.' + att.headerClass);
		
		var lTotalCols = 0;
		var lLastCol = 0;
		var lColList = [];
		$Table.find('.'+att.dataClass).each(function(i){
			if($(this)[0].cellIndex > lLastCol){
				lLastCol = $(this)[0].cellIndex;
				lColList.push($(this)[0].cellIndex+1);
				lTotalCols++;
			}
		});
		
		for (var i = 0; i <= 1; i++) {
			var lCol = {};
			lCol.id = i + '_' + '';
			lCol.label = '';
			if (i == 0) {
				lCol.type = 'number';
			}
			else {
				lCol.type = 'number';
			}
			data.cols.push(lCol);
		}
		
		data.rows = [];
		var lData;
		var lPreviousDataValue = null;
		var $lCells = $Table.find('td.' + att.dataClass);
		var $Legend = $Table.find('td.' + att.legendClass);
		
		if($lCells.size() > 0){
			for (var i = 0; i < lColList.length; i++){
				$Table.find('tr:gt(0)').children("td:nth-child("+lColList[i]+").ao-data").each(function(i){
					lData = { c: [] };
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim('')) };
					}
					lData.c.push(lHeader);
					
					var unParsedData = $.trim($(this).text());
					var dataVal = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataVal)){
						if(att.nullValueAction == "previous"){
							dataVal = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataVal = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataVal)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataVal };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataVal)) {
						// do nothing
					}else{
						lData.c.push(lValue);
						data.rows.push(lData);
						lPreviousDataValue = dataVal;
					}
				});
			};
		}
		att.data = new google.visualization.DataTable(data);
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		data.cols = this.generateHeaders($Table);
		data.rows = this.generateData($Table);

		att.data = new google.visualization.DataTable(data);
	},
	generateHeaders : function(p$Table){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= p$Table;
		var invertedAxis = att.invertedAxis;
		var $headers = $Table.find('.' + att.headerClass);

		if ($headers.size() > 1 ) {
			var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'string';
				data.cols.push(lCol);
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
				
				data.cols.push(lCol);
			});
		}
		
		if ($headers.size() == 0 ) {
			var lTotalCols = 0;
			var lLastCol = 0;

			if(invertedAxis){
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this).parent('tr')[0].rowIndex > lLastCol){
						lLastCol = $(this).parent('tr')[0].rowIndex;
						lTotalCols++;
					}
				});
			}else{
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this)[0].cellIndex > lLastCol){
						lLastCol = $(this)[0].cellIndex;
						lTotalCols++;
					}
				});
			}
			
			for (var i = 0; i < lTotalCols; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'number';
				data.cols.push(lCol);
			}
		}
		
		if ($headers.size() == 1) {
			for (var i = 0; i <= 1; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if(i==1){
					var lHeader = $.trim($headers.eq(0).text());
					lCol.id = i + '_' + lHeader;
					lCol.label = lHeader;
				}
				if (i == 0) {
					lCol.type = 'number';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		return data.cols;
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData;
		var data 	= {};
		data.rows 	= [];
		var lPreviousDataValue = null;
		var $Table = p$Table;
		var invertedAxis = att.invertedAxis;
		var invertedData = att.invertedData;
		var $Rows = $Table.find('tr');
		
		if(invertedAxis){
			var lColumnData = this.organizeSelectedColumns();
			var $lLegend 	= $Table.find('td.' + att.legendClass);
			var lIndex		= 0;

			for (var i = 0; i < lColumnData.length; i++){
				lData = { c: [] };
				if(typeof lColumnData[i] !== "undefined"){
					var lHeader;
					if($lLegend.eq(lIndex).size() == 1 ){
						lHeader = { v: String($.trim($lLegend.eq(lIndex).text())) };
						lIndex++;
					}else{
						lHeader = { v: String($.trim("")) };
					}
					lData.c.push(lHeader);
					
					lDataAux = lColumnData[i];
					for (var j = 0; j < lDataAux.length; j++) {
						var unParsedData = $.trim($(lDataAux[j]).text());
						var lNum = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(lNum)){
							if(att.nullValueAction == "previous"){
								lNum = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								lNum = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(lNum)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: lNum };
						}
						if (att.nullValueAction == "exclude" && isNaN(lNum)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
					}
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(invertedData){
			for (var i = $Rows.size(); i >= 0; i--){
				var $Legend = $Rows.eq(i).find('td.' + att.legendClass);
				var $Data	= $Rows.eq(i).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}	
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else{
			$Table.find('tr').each(function(i){
				var $Legend = $(this).find('td.' + att.legendClass);
				var $Data	= $(this).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					// lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}
			});
		}
		
		return data.rows;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1],
            hAxis: {title: att.xTitle},
            vAxis: {title: att.yTitle},
            legend : att.showLegend ? 'right' : 'none'
           };
		att.properties = lProps;
	},
	organizeSelectedColumns :  function(){
		var _this = this;
		var att = _this.attributes;
		var $Table = att.$DataTable.attributes.$Table;
		var lColumns = [];
		
		$Table.find('td.' + att.dataClass).each(function(i){
			var lRowIndex 	= $(this).parent()[0].rowIndex;
			var lCellIndex 	= this.cellIndex;

			var localCol = lColumns[lCellIndex];
			if(typeof localCol === "undefined"){
				lColumns[lCellIndex] = [];
				localCol = lColumns[lCellIndex];
				localCol.push(this);
			}else{
				localCol.push(this);
			}
		});
		
		return lColumns;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			if(this.attributes.correlativeData){
				this.parseCorrelativeData();
			}else{
				this.parseData();
			}
		}

		this.parseAttributes();
		var chart = new google.visualization.ScatterChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
	},
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertData' : att.invertedData, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset };
		json.title = att.title;
		json.data = att.dataSelection;
		
		chart.xTitle = att.xTitle;
		chart.yTitle = att.yTitle;
		chart.labelSelection = $('#id_labelsSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_labelsSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		
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
		att.xTitle = pJsonChart.chart.xTitle;
		att.yTitle = pJsonChart.chart.yTitle;
		att.labelSelection = pJsonChart.chart.labelSelection;
		att.headerSelection = pJsonChart.chart.headerSelection;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.labelSelection,'ao-label');
		att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
	}
});

var AreaChart = Chart.extend({
	defaults : {
		xTitle : '',
		yTitle : '',
		labelSelection : '',
		headerSelection : '',
		legendClass : 'ao-label',
		headerClass : 'ao-header',
		dataClass : 'ao-data'
	}, 
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		$('#id_yTitle_'+ this.attributes.chartTemplate +', #id_xTitle_'+ this.attributes.chartTemplate + ', #id_scale_'+ this.attributes.chartTemplate).change(_.bind(this.onOptionsChanged, this));
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		att.yTitle = $('#id_yTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_yTitle_'+ att.chartTemplate).val() : '';
		att.xTitle = $('#id_xTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_xTitle_'+ att.chartTemplate).val() : '';
		att.scale = $('#id_scale_'+ this.attributes.chartTemplate).val() != '' ? $('#id_scale_'+ this.attributes.chartTemplate).val() : 0;

		att.manager.renderChartPreview();
	},
	parseCorrelativeData : function(){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		var $headers = $Table.find('.' + att.headerClass);
		
		var lTotalCols = 0;
		var lLastCol = 0;
		var lColList = [];
		$Table.find('.'+att.dataClass).each(function(i){
			if($(this)[0].cellIndex > lLastCol){
				lLastCol = $(this)[0].cellIndex;
				lColList.push($(this)[0].cellIndex+1);
				lTotalCols++;
			}
		});
		
		for (var i = 0; i <= 1; i++) {
			var lCol = {};
			lCol.id = i + '_' + '';
			lCol.label = '';
			if (i == 0) {
				lCol.type = 'string';
			}
			else {
				lCol.type = 'number';
			}
			data.cols.push(lCol);
		}
		
		data.rows = [];
		var lData;
		var lPreviousDataValue = null;
		var $lCells = $Table.find('td.' + att.dataClass);
		var $Legend = $Table.find('td.' + att.legendClass);
		
		if($lCells.size() > 0){
			for (var i = 0; i < lColList.length; i++){
				$Table.find('tr:gt(0)').children("td:nth-child("+lColList[i]+").ao-data").each(function(i){
					lData = { c: [] };
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim('')) };
					}
					lData.c.push(lHeader);
					
					var unParsedData = $.trim($(this).text());
					var dataVal = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataVal)){
						if(att.nullValueAction == "previous"){
							dataVal = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataVal = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataVal)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataVal };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataVal)) {
						// do nothing
					}else{
						lData.c.push(lValue);
						data.rows.push(lData);
						lPreviousDataValue = dataVal;
					}
				});
			};
		}
		att.data = new google.visualization.DataTable(data);
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		data.cols = this.generateHeaders($Table);
		data.rows = this.generateData($Table);
		
		att.data = new google.visualization.DataTable(data);
	},
	generateHeaders : function(p$Table){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= p$Table;
		var invertedAxis = att.invertedAxis;
		var $headers = $Table.find('.' + att.headerClass);

		if ($headers.size() > 1 ) {
			var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'string';
				data.cols.push(lCol);
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
				
				data.cols.push(lCol);
			});
		}
		
		if ($headers.size() == 0 ) {
			var lTotalCols = 0;
			var lLastCol = 0;

			if(invertedAxis){
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this).parent('tr')[0].rowIndex > lLastCol){
						lLastCol = $(this).parent('tr')[0].rowIndex;
						lTotalCols++;
					}
				});
			}else if(att.multipleSeries){
				var lSeries = $Table.find('[class*=series_], .ao-data').toArray();
				lSeries 	= _.groupBy(lSeries, function(element){return element.className});
				lTotalCols 	= _.keys(lSeries).length;
			}else{
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this)[0].cellIndex > lLastCol){
						lLastCol = $(this)[0].cellIndex;
						lTotalCols++;
					}
				});
			}
			
			for (var i = 0; i <= lTotalCols; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		if ($headers.size() == 1) {
			for (var i = 0; i <= 1; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if(i==1){
					var lHeader = $.trim($headers.eq(0).text());
					lCol.id = i + '_' + lHeader;
					lCol.label = lHeader;
				}
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		return data.cols;
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData;
		var data 	= {};
		data.rows 	= [];
		var lPreviousDataValue = null;
		var $Table = p$Table;
		var invertedAxis = att.invertedAxis;
		var invertedData = att.invertedData;
		var $Rows = $Table.find('tr');
		
		if(invertedAxis){
			var lColumnData = this.organizeSelectedColumns();
			var $lLegend 	= $Table.find('td.' + att.legendClass);
			var lIndex		= 0;

			for (var i = 0; i < lColumnData.length; i++){
				lData = { c: [] };
				if(typeof lColumnData[i] !== "undefined"){
					var lHeader;
					if($lLegend.eq(lIndex).size() == 1 ){
						lHeader = { v: String($.trim($lLegend.eq(lIndex).text())) };
						lIndex++;
					}else{
						lHeader = { v: String($.trim("")) };
					}
					lData.c.push(lHeader);
					
					lDataAux = lColumnData[i];
					for (var j = 0; j < lDataAux.length; j++) {
						var unParsedData = $.trim($(lDataAux[j]).text());
						var lNum = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(lNum)){
							if(att.nullValueAction == "previous"){
								lNum = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								lNum = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(lNum)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: lNum };
						}
						if (att.nullValueAction == "exclude" && isNaN(lNum)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
					}
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(invertedData){
			for (var i = $Rows.size(); i >= 0; i--){
				var $Legend = $Rows.eq(i).find('td.' + att.legendClass);
				var $Data	= $Rows.eq(i).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}	
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(att.multipleSeries){
			var lSeries = $Table.find('[class*=series_], .ao-data').toArray();
			lSeries 	= _.groupBy(lSeries, function(element){return element.className});
			var lKeys 	= _.keys(lSeries);
			
			var lLength = 0;
			for (var i = 0; i < lKeys.length; i++) {
				var lKey = lKeys[i];
				if(lSeries[lKey].length > lLength){
					lLength = lSeries[lKey].length;
				}
			}
			
			for (var i = 0; i < lLength; i++) {
				var lLabel = $(lSeries["ao-data"]).parent().find('.ao-label');
				lData = { c: [] };
				lHeader = { v: String($.trim(lLabel.eq(0).text())) };
				lData.c.push(lHeader);
				for (var j = 0; j < lKeys.length; j++) {
					var lKey = lKeys[j];
					var unParsedData = $.trim($(lSeries[lKey][i]).text());
					var dataAux = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataAux)){
						if(att.nullValueAction == "previous"){
							dataAux = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataAux = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataAux)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataAux };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataAux)) {
						lValue = { v: 0 };
						lData.c.push(lValue);
						lPreviousDataValue = dataAux;
					}else{
						lData.c.push(lValue);
						lPreviousDataValue = dataAux;
					}
				}
				data.rows.push(lData);
			}
		}else{
			$Table.find('tr').each(function(i){
				var $Legend = $(this).find('td.' + att.legendClass);
				var $Data	= $(this).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}
			});
		}
		
		return data.rows;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1],
            hAxis: {title: att.xTitle},
            vAxis: {title: att.yTitle, maxValue : att.scale},
            legend : att.showLegend ? 'right' : 'none'
           };
		att.properties = lProps;
	},
	organizeSelectedColumns :  function(){
		var _this = this;
		var att = _this.attributes;
		var $Table = att.$DataTable.attributes.$Table;
		var lColumns = [];
		
		$Table.find('td.' + att.dataClass).each(function(i){
			var lRowIndex 	= $(this).parent()[0].rowIndex;
			var lCellIndex 	= this.cellIndex;

			var localCol = lColumns[lCellIndex];
			if(typeof localCol === "undefined"){
				lColumns[lCellIndex] = [];
				localCol = lColumns[lCellIndex];
				localCol.push(this);
			}else{
				localCol.push(this);
			}
		});
		
		return lColumns;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			if(this.attributes.correlativeData){
				this.parseCorrelativeData();
			}else{
				this.parseData();
			}
		}

		this.parseAttributes();
		var chart = new google.visualization.AreaChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
	},
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertData' : att.invertedData, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset, 'multipleSeries' : att.multipleSeries };
		json.title = att.title;
		if(att.multipleSeries){
			json.data = [];
			var lSeries = $('#id_multiple_container [id*=id_series_]');
			for(var i = 0; i < lSeries.size(); i++){
				var lValue = {};
				lValue.series = $.trim(lSeries.eq(i).attr('data'));
				lValue.selection = $.trim(lSeries.eq(i).val());
				json.data.push(lValue);
			}			
		}else{
			json.data = att.dataSelection;	
		}
		
		chart.xTitle = att.xTitle;
		chart.yTitle = att.yTitle;
		chart.scale = att.scale;
		chart.labelSelection = $('#id_labelsSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_labelsSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		
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
		att.multipleSeries = pJsonChart.format.multipleSeries;
		if(att.multipleSeries){
			att.seriesData = [];
			var lSeries = pJsonChart.data;
			for(var i = 0; i < lSeries.length; i++){
				var lValue = {};
				lValue.series = lSeries[i].series;
				lValue.selection = lSeries[i].selection;
				att.seriesData.push(lValue);
			}			
		}else{
			att.dataSelection = pJsonChart.data;	
		}
		att.xTitle = pJsonChart.chart.xTitle;
		att.yTitle = pJsonChart.chart.yTitle;
		att.scale = pJsonChart.chart.scale;
		att.labelSelection = pJsonChart.chart.labelSelection;
		att.headerSelection = pJsonChart.chart.headerSelection;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.labelSelection,'ao-label');
		if(att.multipleSeries){
			var lSeries = att.seriesData;
			for(var i = 0; i < lSeries.length; i++){
				att.$DataTable.setExcelSelection(lSeries[i].selection, lSeries[i].series);
			}			
		}else{
			att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
		}
	}
});

var CandlestickChart = Chart.extend({
	defaults : {
		xTitle : '',
		yTitle : '',
		labelSelection : '',
		headerSelection : '',
		legendClass : 'ao-label',
		headerClass : 'ao-header',
		dataClass : 'ao-data'
	}, 
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		$('#id_yTitle_'+ this.attributes.chartTemplate +', #id_xTitle_'+ this.attributes.chartTemplate).change(_.bind(this.onOptionsChanged, this));
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		att.yTitle = $('#id_yTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_yTitle_'+ att.chartTemplate).val() : '';
		att.xTitle = $('#id_xTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_xTitle_'+ att.chartTemplate).val() : '';
		
		att.manager.renderChartPreview();
	},
	parseCorrelativeData : function(){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		var $headers = $Table.find('.' + att.headerClass);
		
		var lTotalCols = 0;
		var lLastCol = 0;
		var lColList = [];
		$Table.find('.'+att.dataClass).each(function(i){
			if($(this)[0].cellIndex > lLastCol){
				lLastCol = $(this)[0].cellIndex;
				lColList.push($(this)[0].cellIndex+1);
				lTotalCols++;
			}
		});
		
		for (var i = 0; i <= 1; i++) {
			var lCol = {};
			lCol.id = i + '_' + '';
			lCol.label = '';
			if (i == 0) {
				lCol.type = 'string';
			}
			else {
				lCol.type = 'number';
			}
			data.cols.push(lCol);
		}
		
		data.rows = [];
		var lData;
		var lPreviousDataValue = null;
		var $lCells = $Table.find('td.' + att.dataClass);
		var $Legend = $Table.find('td.' + att.legendClass);
		
		if($lCells.size() > 0){
			for (var i = 0; i < lColList.length; i++){
				$Table.find('tr:gt(0)').children("td:nth-child("+lColList[i]+").ao-data").each(function(i){
					lData = { c: [] };
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim('')) };
					}
					lData.c.push(lHeader);
					
					var unParsedData = $.trim($(this).text());
					var dataVal = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataVal)){
						if(att.nullValueAction == "previous"){
							dataVal = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataVal = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataVal)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataVal };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataVal)) {
						// do nothing
					}else{
						lData.c.push(lValue);
						data.rows.push(lData);
						lPreviousDataValue = dataVal;
					}
				});
			};
		}
		att.data = new google.visualization.DataTable(data);
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		data.cols = this.generateHeaders($Table);
		data.rows = this.generateData($Table);
		
		att.data = new google.visualization.DataTable(data);
	},
	generateHeaders : function(p$Table){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= p$Table;
		var invertedAxis = att.invertedAxis;
		var $headers = $Table.find('.' + att.headerClass);

		if ($headers.size() > 1 ) {
			var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'string';
				data.cols.push(lCol);
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
				
				data.cols.push(lCol);
			});
		}
		
		if ($headers.size() == 0 ) {
			var lTotalCols = 0;
			var lLastCol = 0;

			if(invertedAxis){
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this).parent('tr')[0].rowIndex > lLastCol){
						lLastCol = $(this).parent('tr')[0].rowIndex;
						lTotalCols++;
					}
				});
			}else{
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this)[0].cellIndex > lLastCol){
						lLastCol = $(this)[0].cellIndex;
						lTotalCols++;
					}
				});
			}
			
			for (var i = 0; i <= lTotalCols; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		if ($headers.size() == 1) {
			for (var i = 0; i <= 1; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if(i==1){
					var lHeader = $.trim($headers.eq(0).text());
					lCol.id = i + '_' + lHeader;
					lCol.label = lHeader;
				}
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		return data.cols;
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData;
		var data 	= {};
		data.rows 	= [];
		var lPreviousDataValue = null;
		var $Table = p$Table;
		var invertedAxis = att.invertedAxis;
		var invertedData = att.invertedData;
		var $Rows = $Table.find('tr');
		
		if(invertedAxis){
			var lColumnData = this.organizeSelectedColumns();
			var $lLegend 	= $Table.find('td.' + att.legendClass);
			var lIndex		= 0;

			for (var i = 0; i < lColumnData.length; i++){
				lData = { c: [] };
				if(typeof lColumnData[i] !== "undefined"){
					var lHeader;
					if($lLegend.eq(lIndex).size() == 1 ){
						lHeader = { v: String($.trim($lLegend.eq(lIndex).text())) };
						lIndex++;
					}else{
						lHeader = { v: String($.trim("")) };
					}
					lData.c.push(lHeader);
					
					lDataAux = lColumnData[i];
					for (var j = 0; j < lDataAux.length; j++) {
						var unParsedData = $.trim($(lDataAux[j]).text());
						var lNum = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(lNum)){
							if(att.nullValueAction == "previous"){
								lNum = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								lNum = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(lNum)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: lNum };
						}
						if (att.nullValueAction == "exclude" && isNaN(lNum)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
					}
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(invertedData){
			for (var i = $Rows.size(); i >= 0; i--){
				var $Legend = $Rows.eq(i).find('td.' + att.legendClass);
				var $Data	= $Rows.eq(i).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}	
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else{
			$Table.find('tr').each(function(i){
				var $Legend = $(this).find('td.' + att.legendClass);
				var $Data	= $(this).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}
			});
		}
		
		return data.rows;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1],
            hAxis: {title: att.xTitle},
            vAxis: {title: att.yTitle},
            legend : att.showLegend ? 'right' : 'none'
           };
		att.properties = lProps;
	},
	organizeSelectedColumns :  function(){
		var _this = this;
		var att = _this.attributes;
		var $Table = att.$DataTable.attributes.$Table;
		var lColumns = [];
		
		$Table.find('td.' + att.dataClass).each(function(i){
			var lRowIndex 	= $(this).parent()[0].rowIndex;
			var lCellIndex 	= this.cellIndex;

			var localCol = lColumns[lCellIndex];
			if(typeof localCol === "undefined"){
				lColumns[lCellIndex] = [];
				localCol = lColumns[lCellIndex];
				localCol.push(this);
			}else{
				localCol.push(this);
			}
		});
		
		return lColumns;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			if(this.attributes.correlativeData){
				this.parseCorrelativeData();
			}else{
				this.parseData();
			}
		}

		this.parseAttributes();
		var chart = new google.visualization.CandlestickChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
	},
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertData' : att.invertedData, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset };
		json.title = att.title;
		json.data = att.dataSelection;
		
		chart.xTitle = att.xTitle;
		chart.yTitle = att.yTitle;
		chart.labelSelection = $('#id_labelsSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_labelsSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		
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
		att.xTitle = pJsonChart.chart.xTitle;
		att.yTitle = pJsonChart.chart.yTitle;
		att.labelSelection = pJsonChart.chart.labelSelection;
		att.headerSelection = pJsonChart.chart.headerSelection;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.labelSelection,'ao-label');
		att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
	}
});

var ComboChart = Chart.extend({
	defaults : {
		xTitle : '',
		yTitle : '',
		labelSelection : '',
		headerSelection : '',
		legendClass : 'ao-label',
		headerClass : 'ao-header',
		seriesType : [],
		dataClass : 'ao-data'
	}, 
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		$('#id_yTitle_'+ this.attributes.chartTemplate +', #id_xTitle_'+ this.attributes.chartTemplate).change(_.bind(this.onOptionsChanged, this));
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		att.yTitle = $('#id_yTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_yTitle_'+ att.chartTemplate).val() : '';
		att.xTitle = $('#id_xTitle_'+ att.chartTemplate).val() != gettext( "APP-ENTERNAME-TEXT" ) ? $('#id_xTitle_'+ att.chartTemplate).val() : '';
		
		att.manager.renderChartPreview();
	},
	parseCorrelativeData : function(){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		var $headers = $Table.find('.' + att.headerClass);
		
		var lTotalCols = 0;
		var lLastCol = 0;
		var lColList = [];
		$Table.find('.'+att.dataClass).each(function(i){
			if($(this)[0].cellIndex > lLastCol){
				lLastCol = $(this)[0].cellIndex;
				lColList.push($(this)[0].cellIndex+1);
				lTotalCols++;
			}
		});
		
		for (var i = 0; i <= 1; i++) {
			var lCol = {};
			lCol.id = i + '_' + '';
			lCol.label = '';
			if (i == 0) {
				lCol.type = 'string';
			}
			else {
				lCol.type = 'number';
			}
			data.cols.push(lCol);
		}
		
		data.rows = [];
		var lData;
		var lPreviousDataValue = null;
		var $lCells = $Table.find('td.' + att.dataClass);
		var $Legend = $Table.find('td.' + att.legendClass);
		
		if($lCells.size() > 0){
			for (var i = 0; i < lColList.length; i++){
				$Table.find('tr:gt(0)').children("td:nth-child("+lColList[i]+").ao-data").each(function(i){
					lData = { c: [] };
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim('')) };
					}
					lData.c.push(lHeader);
					
					var unParsedData = $.trim($(this).text());
					var dataVal = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(dataVal)){
						if(att.nullValueAction == "previous"){
							dataVal = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset"){
							dataVal = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(dataVal)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: dataVal };
					}
					if (att.nullValueAction == "exclude" && isNaN(dataVal)) {
						// do nothing
					}else{
						lData.c.push(lValue);
						data.rows.push(lData);
						lPreviousDataValue = dataVal;
					}
				});
			};
		}
		att.data = new google.visualization.DataTable(data);
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		data.cols = this.generateHeaders($Table);
		data.rows = this.generateData($Table);
		
		att.data = new google.visualization.DataTable(data);
	},
	generateHeaders : function(p$Table){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= p$Table;
		var invertedAxis = att.invertedAxis;
		var $headers = $Table.find('.' + att.headerClass);

		if ($headers.size() > 1 ) {
			var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				lCol.type = 'string';
				data.cols.push(lCol);
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
				
				data.cols.push(lCol);
			});
		}
		
		if ($headers.size() == 0 ) {
			var lTotalCols = 0;
			var lLastCol = 0;

			if(invertedAxis){
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this).parent('tr')[0].rowIndex > lLastCol){
						lLastCol = $(this).parent('tr')[0].rowIndex;
						lTotalCols++;
					}
				});
			}else{
				$Table.find('.' + att.dataClass).each(function(i){
					if($(this)[0].cellIndex > lLastCol){
						lLastCol = $(this)[0].cellIndex;
						lTotalCols++;
					}
				});
			}
			
			for (var i = 0; i <= lTotalCols; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		if ($headers.size() == 1) {
			for (var i = 0; i <= 1; i++) {
				var lCol = {};
				lCol.id = i + '_' + '';
				lCol.label = '';
				if(i==1){
					var lHeader = $.trim($headers.eq(0).text());
					lCol.id = i + '_' + lHeader;
					lCol.label = lHeader;
				}
				if (i == 0) {
					lCol.type = 'string';
				}
				else {
					lCol.type = 'number';
				}
				data.cols.push(lCol);
			}
		}
		
		return data.cols;
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData;
		var data 	= {};
		data.rows 	= [];
		var lPreviousDataValue = null;
		var $Table = p$Table;
		var invertedAxis = att.invertedAxis;
		var invertedData = att.invertedData;
		var $Rows = $Table.find('tr');
		
		if(invertedAxis){
			var lColumnData = this.organizeSelectedColumns();
			var $lLegend 	= $Table.find('td.' + att.legendClass);
			var lIndex		= 0;

			for (var i = 0; i < lColumnData.length; i++){
				lData = { c: [] };
				if(typeof lColumnData[i] !== "undefined"){
					var lHeader;
					if($lLegend.eq(lIndex).size() == 1 ){
						lHeader = { v: String($.trim($lLegend.eq(lIndex).text())) };
						lIndex++;
					}else{
						lHeader = { v: String($.trim("")) };
					}
					lData.c.push(lHeader);
					
					lDataAux = lColumnData[i];
					for (var j = 0; j < lDataAux.length; j++) {
						var unParsedData = $.trim($(lDataAux[j]).text());
						var lNum = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(lNum)){
							if(att.nullValueAction == "previous"){
								lNum = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								lNum = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(lNum)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: lNum };
						}
						if (att.nullValueAction == "exclude" && isNaN(lNum)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}
					}
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else if(invertedData){
			for (var i = $Rows.size(); i >= 0; i--){
				var $Legend = $Rows.eq(i).find('td.' + att.legendClass);
				var $Data	= $Rows.eq(i).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = lNum;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}	
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}		
			};
		}else{
			$Table.find('tr').each(function(i){
				var $Legend = $(this).find('td.' + att.legendClass);
				var $Data	= $(this).find('td.' + att.dataClass);
				lData = { c: [] };
				if($Data.size() > 0){
					var lHeader;
					if($Legend.size() > 0 ){
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}else{
						lHeader = { v: String($.trim($Legend.eq(0).text())) };
					}
					lData.c.push(lHeader);
					
					$Data.each(function(i){
						var unParsedData = $.trim($(this).text());
						var data = parseNumber(unParsedData);
						var lValue;
						if(unParsedData == "" || isNaN(data)){
							if(att.nullValueAction == "previous"){
								data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
							}
							if(att.nullValueAction == "preset"){
								data = parseNumber(att.nullValuePreset);
							}
						}
						if(isNaN(data)){
							lValue = { v: 0 };
						}
						else{
							lValue = { v: data };
						}
						if (att.nullValueAction == "exclude" && isNaN(data)) {
							lValue = { v: 0 };
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}else{
							lData.c.push(lValue);
							lPreviousDataValue = data;
						}
					});
					if(lData.c.length != 1){
						data.rows.push(lData);
					}
				}
			});
		}
		
		return data.rows;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1],
            hAxis: {title: att.xTitle},
            vAxis: {title: att.yTitle},
            legend : att.showLegend ? 'right' : 'none',
			series : []
           };
		if(att.seriesType.length != 0){
			for(i = 0; i < att.seriesType.length; i++){
				lProps.series.push({i : att.seriesType[i]});
			}
		}else{
			lProps.seriesType = 'bars';
			lProps.series.push({3 : 'line'});
		}
		att.properties = lProps;
	},
	organizeSelectedColumns :  function(){
		var _this = this;
		var att = _this.attributes;
		var $Table = att.$DataTable.attributes.$Table;
		var lColumns = [];
		
		$Table.find('td.' + att.dataClass).each(function(i){
			var lRowIndex 	= $(this).parent()[0].rowIndex;
			var lCellIndex 	= this.cellIndex;

			var localCol = lColumns[lCellIndex];
			if(typeof localCol === "undefined"){
				lColumns[lCellIndex] = [];
				localCol = lColumns[lCellIndex];
				localCol.push(this);
			}else{
				localCol.push(this);
			}
		});
		
		return lColumns;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			if(this.attributes.correlativeData){
				this.parseCorrelativeData();
			}else{
				this.parseData();
			}
		}

		this.parseAttributes();
		var chart = new google.visualization.ComboChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
	},
	generateJson : function(){
		var att = this.attributes;
		var chart = {};
		var json = {};
		
		json.format = {'type' : att.chartType, 'chartTemplate' : att.chartTemplate, 'showLegend' :att.showLegend, 'invertData' : att.invertedData, 'invertedAxis' : att.invertedAxis, 'correlativeData' : att.correlativeData, 'nullValueAction' : att.nullValueAction, 'nullValuePreset' : att.nullValuePreset };
		json.title = att.title;
		json.data = att.dataSelection;
		
		chart.xTitle = att.xTitle;
		chart.yTitle = att.yTitle;
		chart.labelSelection = $('#id_labelsSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_labelsSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		
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
		att.xTitle = pJsonChart.chart.xTitle;
		att.yTitle = pJsonChart.chart.yTitle;
		att.labelSelection = pJsonChart.chart.labelSelection;
		att.headerSelection = pJsonChart.chart.headerSelection;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.labelSelection,'ao-label');
		att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
	}
});

var GeoChart = Chart.extend({
	defaults : {
		region : 'world',
		headerSelection : '',
		headerClass : 'ao-header',
		latitudClass : 'ao-latitud',
		latitudSelection : '',
		longitudClass : 'ao-longitud',
		longitudSelection : '',
		regionClass: 'ao-region',
		regionSelection: '',
		dataClass : 'ao-data'
	}, 
	initialize : function(){
		Chart.prototype.initialize.call(this);
		_.defaults(this.attributes, Chart.prototype.defaults);
		
		var att = this.attributes;
		$('#id_done_latitud_' + att.chartTemplate).click(_.bind(this.onSelectLatitudComplete, this));
		$('#id_select_latitud_' + att.chartTemplate).click(_.bind(this.onPickChartLatitud, this));
		$('#id_clear_latitud_' + att.chartTemplate).click(_.bind(this.onClearPickLatitud, this));
		
		$('#id_done_longitud_' + att.chartTemplate).click(_.bind(this.onSelectLongitudComplete, this));
		$('#id_select_longitud_' + att.chartTemplate).click(_.bind(this.onPickChartLongitud, this));
		$('#id_clear_longitud_' + att.chartTemplate).click(_.bind(this.onClearPickLongitud, this));

		$('#id_done_region_' + att.chartTemplate).click(_.bind(this.onSelectRegionComplete, this));
		$('#id_select_region_' + att.chartTemplate).click(_.bind(this.onPickChartRegion, this));
		$('#id_clear_region_' + att.chartTemplate).click(_.bind(this.onClearPickRegion, this));
		
		
		$('#id_regionSelect_' + att.chartTemplate).change(_.bind(this.onOptionsChanged, this));
	},
	
	
	onPickChartRegion : function(pEvent){
		var att = this.attributes;
		att.manager.selectionStarted();
		$('#id_regionOptions_'+ att.chartTemplate + ', #id_dataTableContainer').expose({ closeOnEsc: false, closeOnClick: false })
		$('#id_editRegion_' + att.chartTemplate).hide();
		$('#id_startPickRegion_' + att.chartTemplate).show();
		
		att.$DataTable.enableSelection("ao-region");
	},
	onSelectRegionComplete : function(){
		$.mask.close();
		var att = this.attributes;
		att.manager.selectionComplete();
		$.mask.close();
		$('#id_editRegion_' + att.chartTemplate).show();
		$('#id_startPickRegion_' + att.chartTemplate).hide();
		
		att.$DataTable.disableSelecion();		
		$('#id_regionSelection_'+att.chartTemplate).html(att.$DataTable.generateExcelSelection('ao-region'));
	},
	onClearPickRegion : function(){
		this.attributes.$DataTable.resetSelection('ao-region');
	},
	
	
	onPickChartLatitud : function(pEvent){
		var att = this.attributes;
		att.manager.selectionStarted();
		$('#id_latitudOptions_'+ att.chartTemplate + ', #id_dataTableContainer').expose({ closeOnEsc: false, closeOnClick: false })
		$('#id_editLatitud_' + att.chartTemplate).hide();
		$('#id_startPickLatitud_' + att.chartTemplate).show();
		
		att.$DataTable.enableSelection("ao-latitud");
	},
	onSelectLatitudComplete : function(){
		$.mask.close();
		var att = this.attributes;
		att.manager.selectionComplete();
		$.mask.close();
		$('#id_editLatitud_' + att.chartTemplate).show();
		$('#id_startPickLatitud_' + att.chartTemplate).hide();
		
		att.$DataTable.disableSelecion();		
		$('#id_latitudSelection_'+att.chartTemplate).html(att.$DataTable.generateExcelSelection('ao-latitud'));
	},
	onClearPickLatitud : function(){
		this.attributes.$DataTable.resetSelection('ao-latitud');
	},
	onPickChartLongitud : function(pEvent){
		var att = this.attributes;
		att.manager.selectionStarted();
		$('#id_longitudOptions_'+ att.chartTemplate + ', #id_dataTableContainer').expose({ closeOnEsc: false, closeOnClick: false })
		$('#id_editLongitud_' + att.chartTemplate).hide();
		$('#id_startPickLongitud_' + att.chartTemplate).show();
		
		att.$DataTable.enableSelection("ao-longitud");
	},
	onSelectLongitudComplete : function(){
		$.mask.close();
		var att = this.attributes;
		att.manager.selectionComplete();
		$.mask.close();
		$('#id_editLongitud_' + att.chartTemplate).show();
		$('#id_startPickLongitud_' + att.chartTemplate).hide();
		
		att.$DataTable.disableSelecion();		
		$('#id_longitudSelection_'+att.chartTemplate).html(att.$DataTable.generateExcelSelection('ao-longitud'));
	},
	onClearPickLongitud : function(){
		this.attributes.$DataTable.resetSelection('ao-longitud');
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		
		att.region = $('#id_regionSelect_' + att.chartTemplate).val();
		att.manager.renderChartPreview();
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		data.cols = this.generateHeaders($Table);
		data.rows = this.generateData($Table);

		att.data = new google.visualization.DataTable(data);
	},
	generateHeaders : function(p$Table){
		var data 	= {};
		data.cols 	= [];
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= p$Table;
		var $headers = $Table.find('.' + att.headerClass);
		var $Region = $Table.find('tr').find('td.' + att.regionClass);
		if ($headers.size() > 1 ) {
		    if ($Region.length > 0) {
		        var lCol = {};
                lCol.id = 0 + '_';
                lCol.label = '';
                lCol.type = 'string'
                data.cols.push(lCol);
		    }
		    else {
    			var lCol = {};
    			lCol.id = i + '_' + '';
    			lCol.label = '';
    			lCol.type = 'number';
    			data.cols.push(lCol);
    			data.cols.push(lCol);
		        
		    }
			
			$headers.each(function(i){
				var $lHeader = $(this);
				var lCol = {};
				var lHeader = $.trim($lHeader.text());
				lCol.id = i + '_' + lHeader;
				lCol.label = lHeader;
				lCol.type = 'number';
			
				data.cols.push(lCol);
			});
		}
	
		if ($headers.size() == 0 ) {
		    if ($Region.length > 0) {
                var lCol = {};
                var lCol2 = {};
                lCol.id = 0 + '_';
                lCol.label = '';
                lCol.type = 'string'
                data.cols.push(lCol);
                lCol2.id = 1 + '_';
                lCol2.type = 'number';
                lCol2.label = '';
                data.cols.push(lCol2);
            }
            else {
    			for (var i = 0; i <= 2; i++) {
    				var lCol = {};
    				lCol.id = i + '_' + '';
    				lCol.label = '';
    				lCol.type = 'number';
    				data.cols.push(lCol);
    			}
			}
		}
	
		if ($headers.size() == 1) {
		    if ($Region.length > 0) {
		        var lCol = {};
                lCol.id = 0 + '_';
                lCol.label = '';
                lCol.type = 'string'
                data.cols.push(lCol);
                var lCol2 = {};
                var lHeader = $.trim($headers.eq(0).text());
				lCol2.id = 2 + '_' + lHeader;
				lCol2.label = lHeader;
				lCol2.type = 'number';
				data.cols.push(lCol2);
		    }
		    else {
    			for (var i = 0; i < 3; i++) {
    				var lCol = {};
    				lCol.id = i + '_' + '';
    				lCol.label = '';
    				if(i == 2){
    					var lHeader = $.trim($headers.eq(0).text());
    					lCol.id = i + '_' + lHeader;
    					lCol.label = lHeader;
    				}
    				lCol.type = 'number';
    				data.cols.push(lCol);
    			}
			}
		}
		return data.cols;
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData;
		var data 	= {};
		data.rows 	= [];
		var lPreviousDataValue = null;
		var $Table = p$Table;
		var invertedAxis = att.invertedAxis;
		var invertedData = att.invertedData;
		var $Rows = $Table.find('tr');
		
		
		$Table.find('tr').each(function(i){
		    
			var $Latitud = $(this).find('td.' + att.latitudClass);
			var $Longitud = $(this).find('td.' + att.longitudClass);
			var $Data	= $(this).find('td.' + att.dataClass);
			var $Region = $(this).find('td.' + att.regionClass);
			lData = { c: [] };
		    var lLat;
		    var lLong;
			if($Data.size() > 0){
			    
			    if ($.trim($Region.eq(0).text()) == '') {
			    
    				lLat 	= { v: String($.trim($Latitud.eq(0).text())) };
    				lLong 	= { v: String($.trim($Longitud.eq(0).text())) };
    				lData.c.push(lLat);
    				lData.c.push(lLong);
    			}
    			else {
    			    lData.c.push({v: String($.trim($Region.eq(0).text()))});
    			}
				
				$Data.each(function(i){
					var unParsedData = $.trim($(this).text());
					var data = parseNumber(unParsedData);
					var lValue;
					if(unParsedData == "" || isNaN(data)){
						if(att.nullValueAction == "previous") {
							data = (lPreviousDataValue == null) ? 0 : lPreviousDataValue;
						}
						if(att.nullValueAction == "preset") {
							data = parseNumber(att.nullValuePreset);
						}
					}
					if(isNaN(data)){
						lValue = { v: 0 };
					}
					else{
						lValue = { v: data };
					}
					if (att.nullValueAction == "exclude" && isNaN(data)) {
						lValue = { v: 0 };
						lData.c.push(lValue);
						lPreviousDataValue = data;
					}else{
						lData.c.push(lValue);
						lPreviousDataValue = data;
					}
				});
				if(lData.c.length != 1){
					data.rows.push(lData);
				}
			}
		});
		
		return data.rows;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			region : att.region,
			displayMode: 'auto', 
            width: att.size[0], height:att.size[1],
            legend : att.showLegend ? {} : 'none'
           };
		att.properties = lProps;
	},
	render : function(pChartDiv, pLocalRender){
		if(!pLocalRender){
			this.parseData();
		}

		this.parseAttributes();
		var chart = new google.visualization.GeoChart($(pChartDiv)[0]);
        chart.draw(this.attributes.data, this.attributes.properties);
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
		chart.regionSelection = $('#id_regionSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_regionSelection_'+ att.chartTemplate).text() : '';
		chart.headerSelection = $('#id_headerSelection_'+ att.chartTemplate).text() != gettext( "APP-SELECTRANGE-TEXT" ) ? $('#id_headerSelection_'+ att.chartTemplate).text() : '';
		chart.region = $('#id_regionSelect_'+att.chartTemplate).val();
		
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
		att.regionSelection = pJsonChart.chart.regionSelection;
		att.region = pJsonChart.chart.region;
	},
	convertSelections : function(){
		var att = this.attributes;
		
		att.$DataTable.setExcelSelection(att.headerSelection,'ao-header');
		att.$DataTable.setExcelSelection(att.longitudSelection,'ao-longitud');
		att.$DataTable.setExcelSelection(att.latitudSelection,'ao-latitud');
		att.$DataTable.setExcelSelection(att.regionSelection,'ao-region');
		att.$DataTable.setExcelSelection(att.dataSelection,'ao-data');
	},
	reset : function(){
		this.attributes.$DataTable.resetSelection('ao-longitud');
		this.attributes.$DataTable.resetSelection('ao-latitud');
		this.attributes.$DataTable.resetSelection('ao-region');
		$('#id_latitudSelection_geochart span').text( gettext( "APP-SELECTRANGE-TEXT" ) ).addClass('shadowText');
		$('#id_regionSelection_geochart span').text( gettext( "APP-SELECTRANGE-TEXT" ) ).addClass('shadowText');
		$('#id_longitudSelection_geochart span').text( gettext( "APP-SELECTRANGE-TEXT" ) ).addClass('shadowText');		
	}
});

var MapChart = Chart.extend({
	defaults : {
		mapType : 'roadmap',
		headerSelection : '',
		headerClass : 'ao-header',
		latitudClass : 'ao-latitud',
		latitudSelection : '',
		longitudClass : 'ao-longitud',
		longitudSelection : '',
		traceSelection : '',
		traceClass : 'ao-trace',
		dataClass : 'ao-data',
		zoom_level : 5,
		map_center : [0,0],
		markerClusterer : null,
		totalMarkers : 0
	}, 
	initialize : function(){
		var map = this;
		var att = this.attributes;
		
		Chart.prototype.initialize.call(map);
		_.defaults(att, Chart.prototype.defaults);
			
		$('#id_done_latitud_' + att.chartTemplate).click(_.bind(this.onSelectLatitudComplete, this));
		$('#id_select_latitud_' + att.chartTemplate).click(_.bind(this.onPickChartLatitud, this));
		$('#id_clear_latitud_' + att.chartTemplate).click(_.bind(this.onClearPickLatitud, this));
		
		$('#id_done_longitud_' + att.chartTemplate).click(_.bind(this.onSelectLongitudComplete, this));
		$('#id_select_longitud_' + att.chartTemplate).click(_.bind(this.onPickChartLongitud, this));
		$('#id_clear_longitud_' + att.chartTemplate).click(_.bind(this.onClearPickLongitud, this));
		
		$('#id_done_trace_' + att.chartTemplate).click(_.bind(this.onSelectTraceComplete, this));
		$('#id_select_trace_' + att.chartTemplate).click(_.bind(this.onPickChartTrace, this));
		$('#id_clear_trace_' + att.chartTemplate).click(_.bind(this.onClearPickTrace, this));
		
		$('#id_mapTypeSelect_' + att.chartTemplate).change(_.bind(this.onOptionsChanged, this));		
	},
	
	onPickChartLatitud : function(pEvent){
		var att = this.attributes;
		att.manager.selectionStarted();
		$('#id_latitudOptions_'+ att.chartTemplate + ', #id_dataTableContainer').expose({ closeOnEsc: false, closeOnClick: false })
		$('#id_editLatitud_' + att.chartTemplate).hide();
		$('#id_startPickLatitud_' + att.chartTemplate).show();
		
		att.$DataTable.enableSelection("ao-latitud");
	},
	onSelectLatitudComplete : function(){
		$.mask.close();
		var att = this.attributes;
		att.manager.selectionComplete();
		$.mask.close();
		$('#id_editLatitud_' + att.chartTemplate).show();
		$('#id_startPickLatitud_' + att.chartTemplate).hide();
		
		att.$DataTable.disableSelecion();		
		$('#id_latitudSelection_'+att.chartTemplate).html(att.$DataTable.generateExcelSelection('ao-latitud'));
	},
	onClearPickLatitud : function(){
		this.attributes.$DataTable.resetSelection('ao-latitud');
	},
	onPickChartLongitud : function(pEvent){
		var att = this.attributes;
		att.manager.selectionStarted();
		$('#id_longitudOptions_'+ att.chartTemplate + ', #id_dataTableContainer').expose({ closeOnEsc: false, closeOnClick: false })
		$('#id_editLongitud_' + att.chartTemplate).hide();
		$('#id_startPickLongitud_' + att.chartTemplate).show();
		
		att.$DataTable.enableSelection("ao-longitud");
	},
	onSelectLongitudComplete : function(){
		$.mask.close();
		var att = this.attributes;
		att.manager.selectionComplete();
		$.mask.close();
		$('#id_editLongitud_' + att.chartTemplate).show();
		$('#id_startPickLongitud_' + att.chartTemplate).hide();
		
		att.$DataTable.disableSelecion();		
		$('#id_longitudSelection_'+att.chartTemplate).html(att.$DataTable.generateExcelSelection('ao-longitud'));
	},
	onClearPickLongitud : function(){
		this.attributes.$DataTable.resetSelection('ao-longitud');
	},
	onPickChartTrace : function(pEvent){
		var att = this.attributes;
		att.manager.selectionStarted();
		$('#id_traceOptions_'+ att.chartTemplate + ', #id_dataTableContainer').expose({ closeOnEsc: false, closeOnClick: false })
		$('#id_editTrace_' + att.chartTemplate).hide();
		$('#id_startPickTrace_' + att.chartTemplate).show();
		
		att.$DataTable.enableSelection("ao-trace");
	},
	onSelectTraceComplete : function(){
		$.mask.close();
		var att = this.attributes;
		att.manager.selectionComplete();
		$.mask.close();
		$('#id_editTrace_' + att.chartTemplate).show();
		$('#id_startPickTrace_' + att.chartTemplate).hide();
		
		att.$DataTable.disableSelecion();		
		$('#id_traceSelection_'+att.chartTemplate).html(att.$DataTable.generateExcelSelection('ao-trace'));
	},
	onClearPickTrace : function(){
		this.attributes.$DataTable.resetSelection('ao-trace');
	},
	onOptionsChanged : function(){
		var att = this.attributes;
		
		att.mapType = $('#id_mapTypeSelect_' + att.chartTemplate).val();
		att.manager.renderChartPreview();
	},
	parseData : function(){
		var data 	= {};
		var _this 	= this;
		var att 	= _this.attributes;
		var $Table 	= att.$DataTable.attributes.$Table;
		
		att.data = this.generateData($Table);
	},
	generateData : function(p$Table){
		var _this 	= this;
		var att 	= _this.attributes;
		var lData = [];
		var $Table = p$Table;
		var $Rows = $Table.find('tr');
		var $Headers	= $Table.find('td.' + att.headerClass);
		
		$Table.find('tr').each(function(i){
			if(i<=1000){
				var $Latitud 	= $(this).find('td.' + att.latitudClass);
				var $Longitud 	= $(this).find('td.' + att.longitudClass);
				var $Data		= $(this).find('td.' + att.dataClass);
				var $Trace		= $(this).find('td.' + att.traceClass);
				var lLat 	= _this.parseLatitude($Latitud.eq(0).text());
				var lLong 	= _this.parseLongitude($Longitud.eq(0).text());
				var lTrace	= $.trim($Trace.eq(0).text());
				var lValue = "";

				$Data.each(function(i){
					if(i<=1000){
						var $lCell 	= $(this);
						var $lLinks = $lCell.find('a');
						var unParsedData = ($lLinks.size() == 0 )? $.trim($lCell.text()) : $lLinks.parent().html();

						var lHeader	= $.trim($Headers.eq(i).text());
						// var data = parseNumber(unParsedData)
						
						if(lHeader != ""){
							lValue += "<strong>"+lHeader+ "</strong>: ";
						}/*
							 * if(isNaN(data)){ lValue += data; } else{ lValue +=
							 * unParsedData; }
							 */
						lValue += unParsedData;

						lValue += "<br/>";
					}
				});
				if (lValue != '') {
					if(lTrace !=''){
						var $lCell = $Trace.eq(0);
						var cellIndex = $lCell[0].cellIndex;
						var rowIndex = $lCell.eq(0).parents('tr')[0].rowIndex;
						var lType = $($lCell.parents('table')[0].rows[rowIndex].cells[cellIndex+1]).text();
					}
					var marker = [lLat, lLong, lValue, lTrace, lType];
					lData.push(marker);
				}
			}
		});
		
		return lData;
	},
	parseLongitude : function(pLongitude){
		var lValue = "";
		if (pLongitude != "") {
			var lValue = $.trim(pLongitude).replace(",", ".").toLowerCase();
			if (lValue.indexOf("w") != -1) {
				lValue = lValue.replace("w", "-").replace(" ", "");
			}
			if (lValue.indexOf("e") != -1) {
				lValue = lValue.replace("e", "").replace(" ", "");
			}
		}
		
		return lValue;
	},
	parseLatitude : function(pLatitude){
		var lValue = "";
		if (pLatitude != "") {
			var lValue = $.trim(pLatitude).replace(",", ".").toLowerCase();
			if (lValue.indexOf("n") != -1) {
				lValue = lValue.replace("n", "").replace(" ", "");
			}
			if (lValue.indexOf("s") != -1) {
				lValue = lValue.replace("s", "-").replace(" ", "");
			}
		}
		return lValue;
	},
	parseAttributes : function(){
		var att = this.attributes;
        var lProps = {
			mapType : att.mapType
           };
		att.properties = lProps;
	},
	render : function(pChartDiv, pLocalRender){
		var map = this;
		var att = this.attributes;
		if(!pLocalRender){
			this.parseData();
		}
		
		this.parseAttributes();
		
		var lLocations = this.attributes.data;
		if(typeof this.attributes.zoom_level === 'undefined'){
			this.attributes.zoom_level = 5;
		}
		if(typeof this.attributes.map_center != 'undefined'){
			if(this.attributes.map_center[0] == 0 || this.attributes.map_center[1] == 0){
				if(lLocations[0][0] == "" && lLocations[0][1] == "" && lLocations[0][3] != ""){
					var lCoords = lLocations[0][3].split(" ");
					var lValues = lCoords[0].split(',');
					var lType = lLocations[0][4];
					if(lType == "Point"){
						var newCoords = [lValues[0], lValues[1]];
					}else{
						var newCoords = [lValues[1], lValues[0]];
					}
					this.attributes.map = new google.maps.Map($(pChartDiv)[0], {
				      zoom: this.attributes.zoom_level,
				      center: new google.maps.LatLng(newCoords[0], newCoords[1]),
				    });	
				}
				else{
					this.attributes.map = new google.maps.Map($(pChartDiv)[0], {
				      zoom: this.attributes.zoom_level,
				      center: new google.maps.LatLng(lLocations[0][0], lLocations[0][1]),
				    });	
				}
			}
			else {
				this.attributes.map = new google.maps.Map($(pChartDiv)[0], {
			      zoom: this.attributes.zoom_level,
			      center: new google.maps.LatLng(this.attributes.map_center[0], this.attributes.map_center[1])
			    });
			}
		}else{
			if(lLocations[0][0] == "" && lLocations[0][1] == "" && lLocations[0][3] != ""){
				var lCoords = lLocations[0][3].split(" ");
				var lValues = lCoords[0].split(',');
				var lType = lLocations[0][4];
				if(lType == "Point"){
					var newCoords = [lValues[0], lValues[1]];
				}else{
					var newCoords = [lValues[1], lValues[0]];
				}
				this.attributes.map = new google.maps.Map($(pChartDiv)[0], {
			      zoom: this.attributes.zoom_level,
			      center: new google.maps.LatLng(newCoords[0], newCoords[1]),
			    });	
			}
			else{
				this.attributes.map = new google.maps.Map($(pChartDiv)[0], {
			      zoom: this.attributes.zoom_level,
			      center: new google.maps.LatLng(lLocations[0][0], lLocations[0][1]),
			    });	
			}
		}
		
		var mouselocation;
	    var infowindow = new google.maps.InfoWindow();
	    var marker, i;
	    var markers = [];
	    var mcOptions = {maxZoom: 18};
		att.markerCluster = new MarkerClusterer(att.map, markers, mcOptions);
		
	    for (i = 0; i < lLocations.length; i++) { 
	    	// normal lat long markers
			if(lLocations[i][3] == "" && lLocations[i][0] != "" && lLocations[i][1] != ""){
				marker = new google.maps.Marker({
		        	position: new google.maps.LatLng(lLocations[i][0], lLocations[i][1])
				});
			var loc = lLocations[i][2];
	        	
		      google.maps.event.addListener(marker, 'click', (function(marker, loc) {
		        return function() {
		          infowindow.setContent(String(loc));
		          infowindow.open(att.map, marker);
		        }
		      })(marker, loc));
		      markers.push(marker);
		      att.markerCluster.addMarker(marker);
              
			}
			
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
		            
			      google.maps.event.addListener(marker, 'click', (function(marker, loc_inner) {
			        return function() {
			          infowindow.setContent(String(loc_inner));
			          infowindow.open(att.map, marker);
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

						google.maps.event.addListener(lPath, 'click', (function(lPath, aux_inner){
				          return function(){
								    infowindow.setContent(String(aux_inner));
								    infowindow.position = mouselocation;
								    infowindow.open(att.map);
						          };
						})(lPath, aux));
						
					lPath.setMap(this.attributes.map);
				}
			}
	    }

		google.maps.event.addListener(att.map, 'zoom_changed', _.bind(this.updateZoomLevel, this));
		google.maps.event.addListener(att.map, 'center_changed', _.bind(this.updateZoomLevel, this));

		switch(this.attributes.mapType){
			case "roadmap" : 
				this.attributes.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
				break;
			case "satellite" : 
				this.attributes.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
				break;
			case "hybrid" : 
				this.attributes.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
				break;
		}

		this.updateZoomLevel();
		google.maps.event.trigger(att.map, 'resize');
	},
	updateZoomLevel : function(){
		var att = this.attributes;
		att.zoom_level = att.map.getZoom();
		center = att.map.getCenter();
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
				var pages = Math.ceil(att.$DataTable.attributes.totalRows / 1000);
				var last_page = 1000;
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
						var selection = [traceSelection[2],last_page, ':', traceSelection[2], i*1000];
						var data = [dataSelection[2],last_page, ':', dataSelection[2], i*1000];
					}
					
					last_page 	= i*1000;
					rows 		= rows - 1000;
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
	pagedSetSelection2 : function(pages, i, last_page){
		var att = this.attributes;

		var traceSelection 		= $.trim(att.traceSelection).split(" ");
		var dataSelection 		= $.trim(att.dataSelection).split(" ");
		var rows 				= att.$DataTable.attributes.totalRows;
		var selection 			= [traceSelection[2], 1, ':', traceSelection[2], rows];
		var data 				= [dataSelection[2], 1, ':', dataSelection[2], rows];
		
		// make timeout method
		var type = 'ao-trace';
		var _self = this;
		var sel = selection;
		var da = data;
		this.setLimitedSelection(type, sel, da, this);
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
			var selection = [traceSelection[2],last_page + 1, ':', traceSelection[2], i*1000];
			var data = [dataSelection[2],last_page + 1, ':', dataSelection[2], i*1000];
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
	    var infowindow = new google.maps.InfoWindow();
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
			          infowindow.setContent(String(loc));
			          infowindow.open(att.map, marker);
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
						    infowindow.setContent(aux);
						    infowindow.position = mouselocation;
						    infowindow.open(att.map);
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