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

    this.utils = DataTableUtils;

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
      rowHeaders: true, colHeaders: true,
      readOnly: true,
      readOnlyCellClassName: 'htDimmed-datal', // the regular class paints text cells grey
      allowInsertRow: false, allowInsertColumn: false,
      disableVisualSelection: ['current'],
      colWidths: 80,
      columns: columns,
      manualColumnResize: true,
      manualRowResize: true,
    });

    // Selects a range
    this.table.addHook('afterSelection', function (r1, c1, r2, c2) {
      console.info('afterSelection', r1, c1, r2, c2);
      if (self._fullRowMode) {
        self.cacheSelection({
          from: {row: r1, col: -1},
          to: {row: r2, col: -1}
        });
      } else if (self._fullColumnMode) {
        self.cacheSelection({
          from: {row: -1, col: c1},
          to: {row: -1, col: c2}
        });
      } else {
        self.cacheSelection({
          from: {row: r1, col: c1},
          to: {row: r2, col: c2}
        });
      }
      self.triggerAfterSelection();
    });
    this.table.addHook('afterDeselect', function () {
      self.trigger('afterDeselect');
    });
    this.table.addHook('afterSelectionEnd', function (r, c, r2, c2) {
      self.trigger('afterSelectionEnd');
    });
    this.table.addHook('afterOnCellMouseOver', function (event, coords, TD) {
      self._fullColumnMode = (coords.row === -1);
      self._fullRowMode = (coords.col === -1);
    });

    this.listenTo(this.collection, 'add', this.onAddSelected, this);
    this.listenTo(this.collection, 'remove', this.onRmSelected, this);
  },

  render: function () {
    var self = this;
    this.table.loadData(this.data);
    _.each(this.collection.models, function (model) {
      self.onAddSelected(model);
    });
  },

  cacheSelection: function (coords) {
    this._selectedCoordsCache = coords;
  },

  triggerAfterSelection: function () {

    this.trigger('afterSelection', {
      coords: this._selectedCoordsCache,
      range: this.utils.rangeToExcel(this._selectedCoordsCache)
    });
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

  getSelection: function (name) {
    var range = this._selectedCoordsCache,
      data;

    if (range.from.row === -1) {
      data = this.table.getDataAtCol(range.from.col);
    } else {
      data = this.table.getData(range.from.row, range.from.col, range.to.row, range.to.col);
      // TODO: this takes only the first item from the selection. To support many column selection, 
      // it should do something else, like split the columns into separate series.
      data = _.map(data, _.first);
    }

    return {
        range: range,
        selection: this.utils.rangeToExcel(range),
        data: data
      };
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

  selectRange: function (excelRange) {
    var range = this.utils.excelToRange(excelRange),
      from = range.from,
      to = range.to;

    this.table.selectCell(from.row, from.col, to.row, to.col);
  }

});
