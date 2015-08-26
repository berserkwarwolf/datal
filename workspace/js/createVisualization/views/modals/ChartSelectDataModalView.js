var ChartSelectDataModalView = ModalView.extend({
	events: {
		'click button.btn-close':'onCloseClicked',
		'click button.btn-add-serie': 'addSelection'
	},

	initialize: function(){
		var self = this;

		//init table
		this.collection = new DataTableSelectedCollection();

		this.selectedCellRangeView = new SelectedCellRangeView({
			el: this.$('.selected-ranges-view'),
			collection: this.collection
		});
		this.listenTo(this.selectedCellRangeView, 'focusout', function (name) {
			console.log(name)
			// this.addSelection(name);
		});

		var dataUrl = ['/dataviews/invoke?datastream_revision_id=', 
			this.model.get('datastream_revision_id'),
			'&limit=50&page=0'].join('');

		// TODO: this is fetching data from the invoke endpoint which will be deprecated. Change the
		// request when it fails.
		$.getJSON(dataUrl).then(function (payload) {
			self.createDataTableView(payload);
		});

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

	createDataTableView: function (payload) {
		this.dataTableView = new DataTableView({
			el: this.$('.data-table-view'),
			collection: this.collection,
			invoke: payload
		});
		this.dataTableView.render();
		this.listenTo(this.dataTableView, 'selected', function (range) {
			this.selectedCellRangeView.select(range);
			// this.selectedCellRangeView.selectedFieldName
			// this.dataTableView.addSelection();
		}, this);
	},

	addSelection: function () {
		this.dataTableView.addSelection();
	}

});