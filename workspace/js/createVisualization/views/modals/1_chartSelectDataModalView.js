var ChartSelectDataModalView = ModalView.extend({
	events: {
		'click a.close':'onCloseClicked',
		'click a.openOtherModal': 'onSelectLabelClicked'
	},

	render: function(){
		ModalView.prototype.render.call(this);

		//init table
		this.collection = new DataTableSelectedCollection();

		this.selectedRangesView = new SelectedRangesView({
			el: this.$('.selected-ranges-view'),
			collection: this.collection
		});

		this.dataTableView = new DataTableView({
			el: '#example',
			collection: this.collection
		});
		return this;
	},

	onCloseClicked: function (e) {
		this.close(); //Close modal
		var selectedData = this.collection.getColumns();
		console.log('selectedData:', selectedData);
		this.model.data.set('data', selectedData);
	},

	onSelectLabelClicked: function(){
		this.openModal('chartSelectLabelModal');
	}

});