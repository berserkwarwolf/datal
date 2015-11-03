var DataTableSelectionModel = Backbone.Model.extend({
	validate: function (attrs, options) {
		var excelRange = attrs.excelRange,
            r = /^(([a-zA-Z]*)?(\d*)?:([a-zA-Z]*)?(\d*)?)?$/,
            validRange = true;

        if (excelRange === undefined) {
            return;
        } else {
            validRange = r.test(excelRange);
        }

        if (!validRange) {
            return 'invalid-range';
        }
	},

    hasRange: function () {
        return this.has('excelRange') && this.get('excelRange') !== '';
    },

    getRange: function () {
        var excelRange = this.get('excelRange');
        if (_.isUndefined(excelRange)) {
            return undefined;
        } else {
            return DataTableUtils.excelToRange(this.get('excelRange'));
        }
    },

    getPreviousRange: function () {
        var prevExcelRange = this.previous('excelRange'),
            result = undefined;
        if (prevExcelRange !== undefined && prevExcelRange !== '') {
            try {
                result = DataTableUtils.excelToRange(prevExcelRange);
            } catch (exception) {
                console.error(exception);
            }
        }
        return result;
    }
});