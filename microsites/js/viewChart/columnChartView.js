/**
 * Copy of dataTableView
 */
var columnChartView = junarChartView.extend({
	
	getChart: function(jqDiv)
		{return new google.visualization.ColumnChart(jqDiv);},
		
	
    parseAttributes : function(){
		var att = this.model.attributes;
		if (att.scale === undefined) att.scale = 0;
		if (att.size === undefined) {att.size = [850,600];}
        var lProps = {
			title: att.title,
            width: att.size[0], height:att.size[1],
            hAxis: {title: att.xTitle},
            vAxis: {title: att.yTitle, maxValue : att.scale},
            legend : att.showLegend ? 'right' : 'none'
           };
		att.properties = lProps;
	},
});