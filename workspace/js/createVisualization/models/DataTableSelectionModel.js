var DataTableSelectionModel = Backbone.Model.extend({
	validate: function (attrs, options) {
		var range = attrs.range;
		if (range.from.col !== range.to.col) {
			return 'Selecting multiple columns is not supported'
		}
	}
});