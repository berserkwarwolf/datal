var DataTableSelectedCollection = Backbone.Collection.extend({

	getSelectionExcelStyle: function () {
		var self = this;
		return _.map(this.models, function (model) {
			return self.rangeToExcel(model.get('range'));
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
	},

	rangeToExcel: function (range) {
		var result;
		if (range.from.row === -1) {
			result = [this.intToExcelCol(range.from.col + 1), ':',
					this.intToExcelCol(range.to.col + 1)].join('');
		} else {
			result = [this.intToExcelCol(range.from.col + 1), range.from.row, ':',
					this.intToExcelCol(range.to.col + 1), range.to.row].join('');
		}
		return result
	},

	intToExcelCol: function (number) {
		var colName = '',
		dividend = Math.floor(Math.abs(number)),
		rest;

		while (dividend > 0) {
			rest = (dividend - 1) % 26;
			colName = String.fromCharCode(65 + rest) + colName;
			dividend = parseInt((dividend - rest)/26);
		}
		return colName;
	}

});