function HandsontableClassRendererPatch(TD, cellProperties) {
  if (cellProperties.classArray) {
    TD.className = '';
    for (var i = 0; i < cellProperties.classArray.length; i++) {
      TD.classList.add('hot-sel-' + cellProperties.classArray[i]);
    };
  };
};

Handsontable.renderers.registerRenderer('selectedTextRenderer', function () {
  HandsontableClassRendererPatch(arguments[1], arguments[6]);
  return Handsontable.renderers.TextRenderer.apply(this, arguments);
});

Handsontable.renderers.registerRenderer('selectedNumericRenderer', function () {
  HandsontableClassRendererPatch(arguments[1], arguments[6]);
  return Handsontable.renderers.NumericRenderer.apply(this, arguments);
});

Handsontable.renderers.registerRenderer('selectedDateRenderer', function () {
  HandsontableClassRendererPatch(arguments[1], arguments[6]);
  return Handsontable.renderers.DateRenderer.apply(this, arguments);
});

Handsontable.renderers.registerRenderer('selectedLinkRenderer', function () {
  HandsontableClassRendererPatch(arguments[1], arguments[6]);
  return Handsontable.renderers.NumericRenderer.apply(this, arguments);
});

var DataTableView = Backbone.View.extend({

  // Holds available selection identifiers
  // these are maped to classes 'hot-sel-1', 'hot-sel-2', ...
  available: _.range(12, 0, -1),

  typeToRenderer: {
    TEXT: 'selectedTextRenderer',
    LINK: 'selectedLinkRenderer',
    NUMBER: 'selectedNumericRenderer',
    DATE: 'selectedDateRenderer'
  },

  initialize: function (options) {
    var self = this,
      invoke = options.invoke;

    var columns = _.map(_.first(invoke.fArray, invoke.fCols), function (col) {
      return {
        renderer: self.typeToRenderer[col.fType]
      };
    });

    var rows = _.map(_.range(0, invoke.fRows), function () {
      var row = invoke.fArray.splice(0, invoke.fCols);
      return _.pluck(row, 'fStr');
    });

    this.data = rows;

    this.table = new Handsontable(this.$('.table-view').get(0), {
      rowHeaders: true, colHeaders: true, readOnly: true,
      allowInsertRow: false, allowInsertColumn: false,
      disableVisualSelection: ['current'],
      colWidths: 80,
      columns: columns,
    });

    // Selects a range
    this.table.addHook('afterSelection', function (r1, c1, r2, c2) {
      self.cacheSelection({
        from: {row: r1, col: c1},
        to: {row: r2, col: c2}
      });
    });

    // Clicks on a column or row header
    this.table.addHook('afterOnCellMouseDown', function (event, coords, TD) {
      self.cacheSelection({
        from: {row: coords.row, col: coords.col},
        to: {row: coords.row, col: coords.col}
      });
    });

    this.listenTo(this.collection, 'add', this.onAddSelected, this);
    this.listenTo(this.collection, 'remove', this.onRmSelected, this);
  },

  render: function () {
    this.table.loadData(this.data);
  },

  cacheSelection: function (coords) {
    this._selectedCoordsCache = coords;
    this.trigger('selected', this.rangeToExcel(coords));
  },

  coordsToCells: function (coords) {
    var cells = [],
      rows = _.range(coords.from.row, coords.to.row + 1),
      cols = _.range(coords.from.col, coords.to.col + 1);

    if (coords.from.row === -1) {
      rows = _.range(0, this.table.countRows());
    }
    if (coords.from.col === -1) {
      cols = _.range(0, this.table.countCols());
    }

    _.each(rows, function (r) {
      _.each(cols, function (c) {
        cells.push({row: r, col: c});
      });
    });
    return cells;
  },

  addCellsMeta: function (cells, selId) {
    var ids;
    for (var i = 0; i < cells.length; i++) {
      ids = this.table.getCellMeta(cells[i].row, cells[i].col).classArray || [];
      ids.push(selId);
      this.table.setCellMeta(cells[i].row, cells[i].col, 'classArray', ids);
    };
  },

  rmCellsMeta: function (cells, selId) {
    var ids;
    for (var i = 0; i < cells.length; i++) {
      ids = this.table.getCellMeta(cells[i].row, cells[i].col).classArray || [];
      ids.splice(ids.indexOf(selId), 1);
      this.table.setCellMeta(cells[i].row, cells[i].col, 'classArray', ids);
    };
  },

  addSelection: function (name) {
    var newId = this.available.pop(),
      range = this._selectedCoordsCache,
      data,
      model;
    if (range.from.row === -1) {
      data = this.table.getDataAtCol(range.from.col);
    } else {
      data = this.table.getData(range.from.row, range.from.col, range.to.row, range.to.col);
      // TODO: this takes only the first item from the selection. To support many column selection, 
      // it should do something else, like split the columns into separate series.
      data = _.map(data, _.first);
    }
    console.log(name);
    model = new DataTableSelectionModel({
      id: newId,
      range: range,
      selection: this.rangeToExcel(range),
      data: data
    });
    if (model.isValid()) {
      this.collection.add(model);
    } else {
      alert(model.validationError)
    }
  },

  onAddSelected: function (model) {
    var cells = this.coordsToCells(model.get('range'));
    this.addCellsMeta(cells, model.get('id'));
    this.table.render();
  },

  onRmSelected: function (model) {
    var cells = this.coordsToCells(model.get('range'));
    this.available.push(model.get('id'));
    this.rmCellsMeta(cells, model.get('id'));
    this.table.render();
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
