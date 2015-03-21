/**
 * Copy of dataTableView
 */
var lineChartView = junarChartView.extend({
	//create a google chart object
	getChart: function(jqDiv)
		{return new google.visualization.LineChart(jqDiv);},
});