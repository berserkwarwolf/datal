var StartView = StepViewSPA.extend({

	initialize: function(){

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['click a.chart-type'] = 'onChooseType';
		eventsObject['click a.previous'] = 'onPreviousButtonClicked';
		eventsObject['click a.next'] = 'onNextButtonClicked';
		this.addEvents(eventsObject);

		// Bind model validation to view
		//Backbone.Validation.bind(this);

		this.render();

	}, 

	render: function(){

		var self = this;
		
		return this;
	},

	onChooseType: function (e) {
		var $target = $(e.currentTarget),
			type = $target.data('type');
		console.log('selecionado',type);
		this.model.set('type', type);
		this.next();
		//this.trigger('step', 1);
	},

	onPreviousButtonClicked: function(){
		this.previous();
	},

	onNextButtonClicked: function(){		

		if(this.model.isValid(true)){
			//this.model.setOutput();
			this.next();
		}

	}

});