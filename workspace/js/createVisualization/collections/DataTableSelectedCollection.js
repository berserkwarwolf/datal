var DataTableSelectedCollection = Backbone.Collection.extend({
	model: DataTableSelectionModel,

	getSelectionExcelStyle: function () {
		return _.map(this.models, function (model) {
			return model.get('selection');
		}).join(';');
	},

	getColumns: function () {
		return _.map(this.models, function (model) {
			return model.get('data');
		});
	},

	getFields: function () {
		return _.map(this.getColumns(), function (col) {
			return ['number', _.first(col)];
		});
	},

	getRows: function () {
		return _.map(_.rest(_.unzip(this.getColumns())), function (row) {
			return _.map(row, parseFloat);
		});
	},

	getSelectionChartStyle: function () {
		var range_data = this.findWhere({name: 'range_data'});
		var range_headers = this.findWhere({name: 'range_headers'});
		var range_labels = this.findWhere({name: 'range_labels'});
		return {
			range_data: range_data ? range_data.get('selection') : undefined,
			range_headers: range_headers ? range_headers.get('selection') : undefined,
			range_labels: range_labels ? range_labels.get('selection') : undefined
		}
	}
});