var DataTableSelectionModel = Backbone.Model.extend({
	validate: function (attrs, options) {
		var excelRange = attrs.excelRange;
        if (excelRange === '') return;

        try {
            DataTableUtils.excelToRange(excelRange);
        } catch(exception){
            return 'invalid-range';
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
        var prevExcelRange = this.previous('excelRange'),
            result = null;
        if (prevExcelRange !== '') {
            try {
                result = DataTableUtils.excelToRange(prevExcelRange);
            } catch (exception) {
                console.log(exception);
            }
            return result;
        } else {
            return null;
        }
    }
});