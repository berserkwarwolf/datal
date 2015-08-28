var MetadataView = StepViewSPA.extend({

	initialize: function(){
		this.addEvents({
			'click a.backButton': 'onPreviousButtonClicked',
			'click a.nextButton': 'onNextButtonClicked'
		});
	},

	bindings: {
		"input.title": 			"value:meta_title,		events:['keyup']",
		"input.description": 	"value:meta_description,events:['keyup']",
		"select.category": 		"value:meta_category,	events:['change']",
		"textarea.notes": 		"value:meta_notes,		events:['keyup']"
	},

	onPreviousButtonClicked: function(){
		console.log(this.model.getMeta());
		this.previous();
	},

	onNextButtonClicked: function(){
		this.next();
	}

});