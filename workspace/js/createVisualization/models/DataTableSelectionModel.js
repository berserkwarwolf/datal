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
        var excelRange = this.get('excelRange');
        if (_.isUndefined(excelRange)) {
            return false;
        } else {
            return DataTableUtils.excelToRange(this.get('excelRange'));
        }
    },
    getPreviousRange: function () {
        return DataTableUtils.excelToRange(this.previous('excelRange'));
    }
});