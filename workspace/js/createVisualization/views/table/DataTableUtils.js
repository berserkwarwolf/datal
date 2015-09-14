var DataTableUtils = {
  rangeToExcel: function (range) {
    return [this.coordsToExcelCell(range.from), ':',
          this.coordsToExcelCell(range.to)].join('');
  },

  excelToRange: function (excelRange) {
    var parts = excelRange.split(':');

    return {
      from: this.excelCellToCoords(parts[0]),
      to: this.excelCellToCoords(parts[1])
    }
  },

  excelCellToCoords: function (cellStr) {
    return {
      col: this.excelColToInt(cellStr.replace(/\d+/g, '')) - 1,
      row: parseInt(cellStr.replace(/\D/g,'')) - 1
    }
  },

  coordsToExcelCell: function (coords) {
    return [
          (coords.col !== -1) ? this.intToExcelCol(coords.col + 1) : '', 
          (coords.row !== -1) ? coords.row + 1 : ''
        ].join('');
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
  },

  excelColToInt: function (colName) {
    var digits = colName.toUpperCase().split(''),
      number = 0;

    for (var i = 0; i < digits.length; i++) {
      number += (digits[i].charCodeAt(0) - 64)*Math.pow(26, digits.length - i - 1);
    }

    return number;    
  }
};
