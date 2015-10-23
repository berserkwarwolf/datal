var DataTableSelectedCollection = Backbone.Collection.extend({
	model: DataTableSelectionModel,

	setCache: function () {
		this._cache = this.reduce(function (memo, m) {
            memo[m.get('name')] = m.get('excelRange');
            return memo;
        }, {});
        return this._cache;
	},

	revert: function () {
		_.each(this._cache, function (value, key) {
			var m = this.find(function (model) {
				return model.get('name') === key;
			}).set('excelRange', value);
		}, this);
	},

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
		var range_data = this.findWhere({name: 'range_data'}),
			range_headers = this.findWhere({name: 'range_headers'}),
			range_labels = this.findWhere({name: 'range_labels'}),
			range_lat = this.findWhere({name: 'range_lat'}),
			range_lon = this.findWhere({name: 'range_lon'});

		return {
			range_data: range_data ? range_data.getExcelRange() : undefined,
			range_headers: range_headers ? range_headers.getExcelRange() : undefined,
			range_labels: range_labels ? range_labels.getExcelRange() : undefined
		}
	}
});