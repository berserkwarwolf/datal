var ChartSelectLabelModalView = ModalViewSPA.extend({

	initialize: function(){

		ModalViewSPA.prototype.initialize.call(this);

	},

	render: function(){
		ModalViewSPA.prototype.render.call(this);
		//do stuff
		return this;
	},

	onCloseClicked: function (e) {
		this.close(); //Close modal
	}

});