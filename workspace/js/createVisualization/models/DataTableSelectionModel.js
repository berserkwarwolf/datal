var DataTableSelectionModel = Backbone.Model.extend({
	validate: function (attrs, options) {
		var excelRange = attrs.excelRange;
        try {
            DataTableUtils.excelToRange(excelRange);
        } catch(exception){
            console.log(exception);
            return 'Invalid range';
        }
	},
    getRange: function () {
        return DataTableUtils.excelToRange(this.get('excelRange'));
    },
    getPreviousRange: function () {
        return DataTableUtils.excelToRange(this.previous('excelRange'));
    }
});