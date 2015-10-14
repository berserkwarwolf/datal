var FinishFileModel = FinishModel.extend({

	setDataFromOutput: function(){

		var output = this.get('output'),
			data = this.get('data');

		data.collect_type = output.collect_type;
		data.impl_type = output.impl_type;

		this.set('data',data);
		

	}

});