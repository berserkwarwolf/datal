var ChartSelectDataModalView = ModalView.extend({
	events: {
		'click button.btn-close':'onCloseClicked',
		'click button.btn-add-serie': 'addSelection'
	},

	render: function(){
		var self = this;
		ModalView.prototype.render.call(this);

		//init table
		this.collection = new DataTableSelectedCollection();

		this.selectedRangesView = new SelectedRangesView({
			el: this.$('.selected-ranges-view'),
			collection: this.collection
		});

		var dataUrl = ['/dataviews/invoke?datastream_revision_id=', 
			this.model.get('datastream_revision_id'),
			'&limit=50&page=0'].join('');

		// TODO: this is fetching data from the invoke endpoint which will be deprecated. Change the
		// request when it fails.
		$.getJSON(dataUrl).then(function (payload) {
			self.dataTableView = new DataTableView({
				el: '.data-table-view',
				collection: self.collection,
				invoke: payload
			});
			self.dataTableView.render();
		})
		return this;
	},

	onCloseClicked: function (e) {
		this.close(); //Close modal
		var selectedRows = this.collection.getRows();
		var selectedFields = this.collection.getFields();
		this.model.data.set('fields', selectedFields);
		this.model.data.set('rows', selectedRows);
		this.model.set('selection', this.collection.getSelectionExcelStyle());
	},

	addSelection: function () {
		this.dataTableView.addSelection();
	}

});