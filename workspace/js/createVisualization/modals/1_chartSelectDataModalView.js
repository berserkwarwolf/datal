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

		//init table
		var selectedCollection = new Backbone.Collection();

		var selectedRangesView = new SelectedRangesView({
			el: '.selected-ranges-view',
			collection: selectedCollection
		});

		var data = [
			{year: 2014, brand: 'Volvo', value: 10},
			{year: 2014, brand: 'Volvo', value: 10},
			{year: 2014, brand: 'Volvo', value: 10},
			{year: 2014, brand: 'Volvo', value: 10},
		];

		var myView = new DataTableView({
			el: '#example',
			data: data,
			collection: selectedCollection
		});
		//this.myView.render();
		return this;
	},

	onCloseClicked: function (e) {
		this.close(); //Close modal
	},

	onSelectLabelClicked: function(){
		this.openModal('chartSelectLabelModal');
	}

});