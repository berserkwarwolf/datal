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
		var selectedRows = this.collection.getRows();
		this.model.data.set('fields', [['number', 'year'], ['number', 'population']]);
		this.model.data.set('rows', selectedRows);
	},

	onSelectLabelClicked: function(){
		this.openModal('chartSelectLabelModal');
	}

});