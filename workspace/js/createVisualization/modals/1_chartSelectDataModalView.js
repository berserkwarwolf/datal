var ChartSelectDataModalView = ModalViewSPA.extend({

	initialize: function(){

		ModalViewSPA.prototype.initialize.call(this);

		// Right way to extend events without overriding the parent ones
		var eventsObject = {}
		eventsObject['click a.close'] = 'onCloseClicked';
		eventsObject['click a.openOtherModal'] = 'onSelectLabelClicked';		
		this.addEvents(eventsObject);

		// Bind model validation to view
		//Backbone.Validation.bind(this);

	},

	render: function(){
		ModalViewSPA.prototype.render.call(this);
		//do stuff
		return this;
	},

	onCloseClicked: function (e) {
		this.close(); //Close modal
	},

	onSelectLabelClicked: function(){
		this.openModal('chartSelectLabelModal');
	}

});