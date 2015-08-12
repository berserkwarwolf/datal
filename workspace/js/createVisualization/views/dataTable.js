var DataTableView = Backbone.View.extend({

  // Holds available selection identifiers
  // these are maped to classes 'hot-sel-1', 'hot-sel-2', ...
  available: _.range(9, 0, -1),

  events: {
    'click button.add-btn': 'addSelection',
  },

  initialize: function () {
    var self = this;

    this.table = new Handsontable(this.$('.table-view').get(0), {
      data: data,
      // minSpareRows: 1,
      rowHeaders: true,
      colHeaders: true,
      // contextMenu: true,
      readOnly: true,
      renderer: function(instance, TD, row, col, prop, value, cellProperties) {
        if (cellProperties.classArray) {
          TD.className = '';
          for (var i = 0; i < cellProperties.classArray.length; i++) {
            TD.classList.add('hot-sel-' + cellProperties.classArray[i]);
          };
        };
        return Handsontable.renderers.TextRenderer(instance, TD, row, col, prop, value, cellProperties);
      }
    });

    this.selectionEl = this.$('.selected-cells');

    // Selects a range
    this.table.addHook('afterSelection', function (r1, c1, r2, c2) {
      self.cacheSelection({
        from:{row: r1, col: c1},
        to: {row: r2, col: c2}
      });
      self.selectionEl.text([r1, c1, r2, c2].join(', '));
    });

    // Clicks on a column or row header
    this.table.addHook('afterOnCellMouseDown', function (event, coords, TD) {
      if (coords.row === -1) {
        self.selectionEl.text('column ' + coords.col);
      } else if (coords.col === -1) {
        self.selectionEl.text('row ' + coords.row);
      };
      self.cacheSelection({
        from: {row: coords.row, col: coords.col},
        to: {row: coords.row, col: coords.col}
      });
    });

    this.listenTo(this.collection, 'add', this.onAddSelected, this);
    this.listenTo(this.collection, 'remove', this.onRmSelected, this);
  },

  cacheSelection: function (coords) {
    this._selectedCoordsCache = coords;
    this.range = this.coordsToCells(coords);
  },

  addCellsClass: function (cells, selectionID) {
    this.addCellsMeta(cells, selectionID);
    this.table.render();
  },

  rmCellsClass: function (cells, selectionID) {
    this.rmCellsMeta(cells, selectionID);
    this.table.render();
  },

  coordsToCells: function (coords) {
    var cells = [],
      rows = _.range(coords.from.row, coords.to.row + 1),
      cols = _.range(coords.from.col, coords.to.col + 1);

    if (coords.from.row === -1) {
      rows = _.range(0, this.table.countRows());
    };

    if (coords.from.col === -1) {
      cols = _.range(0, this.table.countCols());
    };

    _.each(rows, function (row) {
      _.each(cols, function (col) {
        cells.push({row: row, col: col});
      });
    });
    return cells;
  },

  addCellsMeta: function (cells, selectionID) {
    var currentArray;
    for (var i = 0; i < cells.length; i++) {
      currentArray = this.table.getCellMeta(cells[i].row, cells[i].col).classArray || [];
      currentArray.push(selectionID);
      this.table.setCellMeta(cells[i].row, cells[i].col, 'classArray', currentArray);
    };
  },

  rmCellsMeta: function (cells, selectionID) {
    var currentArray = [];
    for (var i = 0; i < cells.length; i++) {
      currentArray = this.table.getCellMeta(cells[i].row, cells[i].col).classArray || [];
      currentArray.splice(currentArray.indexOf(selectionID), 1);
      this.table.setCellMeta(cells[i].row, cells[i].col, 'classArray', currentArray);
    };
  },

  addSelection: function () {
    var newId = this.available.pop(),
      model = new Backbone.Model({
        range: this._selectedCoordsCache,
        id: newId
      });
    this.collection.add(model);
  },

  onAddSelected: function (model) {
    var cells = this.coordsToCells(model.get('range'));
    this.addCellsClass(cells, model.get('id'));
  },

  onRmSelected: function (model) {
    var cells = this.coordsToCells(model.get('range'));
    this.available.push(model.get('id'));
    this.rmCellsClass(cells, model.get('id'));
  }
});

