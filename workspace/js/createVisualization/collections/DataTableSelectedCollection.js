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

	getRows: function () {
		return _.map(_.rest(_.unzip(this.getColumns())), function (row) {
			return [parseInt(row[0]), parseFloat(row[1])];
		});
	}
});