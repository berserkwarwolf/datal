var DataTableSelectedCollection = Backbone.Collection.extend({
	// TODO: format the return value of selection into ';' separated string of excel like ranges
	getSelection: function () {
		return _.map(this.models, function (model) {
			return model.get('range');
		});
	}
});