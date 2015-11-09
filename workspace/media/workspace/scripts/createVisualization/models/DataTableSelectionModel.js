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

    validateMaxCol: function (max) {
        var range = this.getRange();
        if (!_.isUndefined(range)) {
            return (range.from.col < max && range.to.col < max);
        }
    },

    validateMaxRow: function (max) {
        var range = this.getRange();
        console.info('validating max col', max);
        if (!_.isUndefined(range)) {
            return (range.from.col < max && range.to.col < max);
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