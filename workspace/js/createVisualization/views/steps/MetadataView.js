var MetadataView = StepViewSPA.extend({

	initialize: function(){
		this.addEvents({
			'click a.backButton': 'onPreviousButtonClicked',
			'click a.nextButton': 'onNextButtonClicked'
		});
	}, 

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onNextButtonClicked: function(){
		this.next();
	}

});