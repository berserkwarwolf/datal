var ChartSelectDataModalView = ModalView.extend({
	events: {
		'click a.close':'onCloseClicked',
		'click a.openOtherModal': 'onSelectLabelClicked'
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
			this.dataTableView = new DataTableView({
				el: '.data-table-view',
				collection: self.collection,
				invoke: payload
			});
			this.dataTableView.render();
		})
		return this;
	},

	onCloseClicked: function (e) {
		this.close(); //Close modal
		var selectedRows = this.collection.getRows();
		this.model.data.set('fields', [['number', 'year'], ['number', 'population']]);
		this.model.data.set('rows', selectedRows);
		this.model.set('selection', this.collection.getSelectionExcelStyle());
		console.log(this.collection.getSelectionExcelStyle());
	},

	onSelectLabelClicked: function(){
		this.openModal('chartSelectLabelModal');
	}

});