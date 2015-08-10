var DataTableView = Backbone.View.extend({

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
      renderer: function(instance, TD, row, col, prop, value, cellProperties) {
        if (cellProperties.classname) {
          TD.classList.add(cellProperties.classname);
        };
        return Handsontable.renderers.TextRenderer(instance, TD, row, col, prop, value, cellProperties);
      }
    });

    this.selectionEl = this.$('.selected-cells');

    // Selects a range
    this.table.addHook('afterSelection', function (r1, c1, r2, c2) {
      console.log('afterSelectionEnd: ', [r1, c1, r2, c2]);
      self.cacheSelection({
        from:{
          row: r1,
          col: c1
        },
        to: {
          row: r2,
          col: c2
        }
      });
      self.selectionEl.text([r1, c1, r2, c2].join(', '));
    });

    // Clicks on a column or row header
    this.table.addHook('afterOnCellMouseDown', function (event, coords, TD) {
      console.log('afterOnCellMouseDown coords:', coords);
      self.cacheSelection(coords);

      if (coords.row === -1) {
        self.selectionEl.text('column ' + coords.col);
      } else if (coords.col === -1) {
        self.selectionEl.text('row ' + coords.row);
      };
    });

    this.listenTo(this.collection, 'add', this.onAddSelected, this);
    this.listenTo(this.collection, 'remove', this.onRmSelected, this);
  },

  cacheSelection: function (coords) {
    this._selectedCoordsCache = coords;
    console.log(this.coordsToCells(coords));
    this.range = this.coordsToCells(coords);
  },

  addClassToSelection: function (cells, classname) {
    this.setCellClass(cells, classname);
    this.table.render();
  },

  coordsToCells: function (coords) {
    var cells = [],
      rows = _.range(coords.from.row, coords.to.row + 1),
      cols = _.range(coords.from.col, coords.to.col + 1);
    _.each(rows, function (row) {
      _.each(cols, function (col) {
        cells.push({row: row, col: col});
      });
    });
    return cells;
  },

  setCellClass: function (cells, classname) {
    for (var i = 0; i < cells.length; i++) {
      this.table.setCellMeta(cells[i].row, cells[i].col, 'classname', classname);
    };
  },

  addSelection: function () {
    var newSelection = new Backbone.Model({
      range: this._selectedCoordsCache,
      id: this.collection.length + 1
    });
    this.collection.add(newSelection);
  },

  onAddSelected: function (model) {
    console.log(model);
    var cells = this.coordsToCells(model.get('range'));
    this.addClassToSelection(cells, 'hot-sel-' + model.get('id'));
  },

  onRmSelected: function (model) {
    console.log(model);
    this.table.removeCellMeta()
  }
});

