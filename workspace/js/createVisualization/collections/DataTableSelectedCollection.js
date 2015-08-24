var DataTableSelectedCollection = Backbone.Collection.extend({

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
	}
});