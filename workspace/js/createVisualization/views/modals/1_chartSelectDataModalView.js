var ChartSelectDataModalView = ModalViewSPA.extend({
	events: {
		'click a.close':'onCloseClicked',
		'click a.openOtherModal': 'onSelectLabelClicked'
	},

	render: function(){
		ModalViewSPA.prototype.render.call(this);

		//init table
		this.collection = new DataTableSelectedCollection();

		var selectedRangesView = new SelectedRangesView({
			el: this.$('.selected-ranges-view'),
			collection: this.collection
		});

		this.dataCollection = new Backbone.Collection();

		this.dataTableView = new DataTableView({
			el: '#example',
			collection: this.collection,
			dataCollection: this.dataCollection
		});
		return this;
	},

	onCloseClicked: function (e) {
		this.close(); //Close modal
		var selection = this.collection.getSelection();
		console.log('selection', selection);
		console.log(this.dataTableView.getData());
	},

	onSelectLabelClicked: function(){
		this.openModal('chartSelectLabelModal');
	}

});