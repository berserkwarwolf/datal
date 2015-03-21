/**
 * Copy of dataTableView
 */
var geoChartView = junarChartView.extend({
	
	getChart: function(jqDiv)
		{return new google.visualization.GeoChart(jqDiv);},
	
	parseAttributes : function(){
		var att = this.model.attributes;
		if (att.size === undefined) {att.size = [850,600];}//TODO get this size from another place
        var lProps = {
			region : att.region,
			displayMode: 'auto', 
            width: att.size[0], height:att.size[1],
            legend : att.showLegend ? {} : 'none'
           };
		att.properties = lProps;
	},
});