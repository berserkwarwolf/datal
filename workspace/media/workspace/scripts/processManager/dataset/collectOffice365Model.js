var CollectOffice365Model = StepModel.extend({
	
	defaults:{
		calendar: "",
		range: "",
		collect_type: 3
	},

	setOutput: function(){

		var output = this.get('output');

		output.calendar = $.trim( this.get('calendar') );
		output.range = $.trim( this.get('range') );
		output.collect_type = this.get('collect_type');
		
		this.set('output',output);

	}

});