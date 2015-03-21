/**
 * Copy of dataTableView, master class for charts view
 */
var junarChartView = Backbone.View.extend({
	el: '#id_wrapper',
	template: null,
	renderDiv: "id_visualizationResult",
	events:{
	},
	initialize: function() {
		this.listenTo(this.model, "change:result", this.render);
	},
	render: function() {

		this.parseAttributes();
		
		//ask for a specific object 
	    var chart = this.getChart($("#" + this.renderDiv)[0]);
	    /*
	    console.log(this.model.attributes.result);
	    console.log(this.model.toCells());
	    console.log("labelSel: " + this.model.attributes.labelSelection);
	    console.log("header: " + this.model.attributes.headerSelection);
	    console.log("Data: ");
	    console.log(this.model.attributes.data);
	    */
	    var rdata = this.model.toGoogle2();
	    // console.log(rdata.result);
	    chart.draw(rdata.data, this.model.attributes.properties);
			return this;
	  },
	  parseAttributes : function(){
		var att = this.model.attributes;
		if (att.size === undefined) {
			var chartW = ( $('#id_visualizationResult').width() * 97 ) / 100; // use 97% to prevent scrolls
			var chartH = ( $('#id_visualizationResult').height() * 97 ) / 100; // use 97% to prevent scrolls
			att.size = [chartW, chartH];
		}
    var lProps = {
			title: att.title,
      width: att.size[0], 
      height: att.size[1],
      hAxis: {title: att.xTitle},
      vAxis: {title: att.yTitle, maxValue : att.scale},
      legend : att.showLegend ? 'right' : 'none'
    };
		att.properties = lProps;
	},

  //just show loading gif on the main DIV
  setLoading: function(){
          
    $("#id_miniLoading").show();
          
  }

});