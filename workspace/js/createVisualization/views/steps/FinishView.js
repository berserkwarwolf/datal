var FinishView = StepViewSPA.extend({

	initialize: function(){

		this.addEvents({
			'click a.backButton': 'onPreviousButtonClicked',
			'click a.finishButton': 'onFinishButtonClicked'
		});

	}, 

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onFinishButtonClicked: function(){		
		var data = this.model.getFormData();
		console.log(data);
		$.ajax({
			url: '/visualizations/create?datastream_revision_id='
				+ this.model.get('datastream_revision_id'),
			type:'POST',
			data: data,
			dataType: 'json'
		}).then(function (response) {
			console.log(response);
			window.location = '/visualizations/';
		});
	}

});