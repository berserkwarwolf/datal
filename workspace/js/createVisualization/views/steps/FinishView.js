var FinishView = StepViewSPA.extend({

	initialize: function(){

		this.addEvents({
			'click a.backButton': 'onPreviousButtonClicked',
			'click a.finishButton': 'onFinishButtonClicked'
		});

		// Bind model validation to view
		//Backbone.Validation.bind(this);

		this.render();

	}, 

	render: function(){

		var self = this;
		
		return this;
	},

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onFinishButtonClicked: function(){		

		var data = this.model.getSettings();
		$.ajax({
			url: '/visualizations/create?datastream_revision_id='+ this.model.get('datastream_revision_id'),
			type:'POST',
			data: data,
			dataType: 'json'
		}).then(function (response) {
			console.log(response);
			alert('TODO: save! & redirect!');
		});

	}

});