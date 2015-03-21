/**
 * Copy of dataTableView
 */
var pieChartView = junarChartView.extend({
	
	getChart: function(jqDiv)
		{return new google.visualization.PieChart(jqDiv);},
	
    parseAttributes : function(){
		var att = this.model.attributes;
		if (att.size === undefined) {att.size = [850,600];}
		if (att.is3D === undefined) {att.is3D = true;}
		var lProps = {
				title: att.title,
	            width: att.size[0], height:att.size[1] ,
	            legend : att.showLegend ? 'right' : 'none',
	            is3D : att.is3D
	           };
		att.properties = lProps;
	},
});