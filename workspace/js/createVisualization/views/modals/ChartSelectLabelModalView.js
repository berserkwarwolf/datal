var ChartSelectLabelModalView = ModalView.extend({

	events: {
		'click a.close':'onCloseClicked'
	},

	initialize: function(){

		ModalView.prototype.initialize.call(this);

	},

	render: function(){
		ModalView.prototype.render.call(this);
		//do stuff
		return this;
	},

	onCloseClicked: function (e) {
		this.close(); //Close modal
	}

});