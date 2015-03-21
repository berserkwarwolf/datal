/**
 * Copy of dataTableView
 */
var areaChartView = junarChartView.extend({
	
	getChart: function(jqDiv)
		{return new google.visualization.AreaChart(jqDiv);},
	
    
});