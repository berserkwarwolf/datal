var SelectionCollection = Backbone.Collection.extend({
  model: Backbone.Model
});


var DataTableView = Backbone.View.extend({

  events: {
    'click button.add-btn': 'onClickAdd',
    'click button.add-btn-2': 'onClickAdd2'
  },

  initialize: function () {
    var self = this;

    this.table = new Handsontable(this.$('.table-view').get(0), {
      data: data,
      minSpareRows: 1,
      rowHeaders: true,
      colHeaders: true,
      contextMenu: true,
      renderer: function(instance, TD, row, col, prop, value, cellProperties) {
        if (cellProperties.classname) {
          TD.classList.add(cellProperties.classname);
        };
        return Handsontable.renderers.TextRenderer(instance, TD, row, col, prop, value, cellProperties);
      }
    });

    this.selectionCol = new SelectionCollection();

    this.selectionEl = this.$('.selected-cells');

    // Selects a range
    this.table.addHook('afterSelection', function (r1, c1, r2, c2) {
      console.log('afterSelectionEnd: ', [r1, c1, r2, c2]);
      self.cacheSelection([r1, c1, r2, c2]);
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
  },

  cacheSelection: function (coords) {
    this.selectedCoords = coords;
    this.range = this.table.getSelectedRange();
  },

  addClassToSelection: function (classname) {
    var cells = this.range.getAll();
    for (var i = 0; i < cells.length; i++) {
      this.table.setCellMeta(cells[i].row, cells[i].col, 'classname', classname);
    };
    this.table.render();
  },

  onClickAdd: function () {
    // this.addClassToSelection('hot-sel-1');
    this.addSelection();
  },

  onClickAdd2: function () {
    this.addSelection();
  },

  addSelection: function () {
    var newSelection = new Backbone.Model({
      range: this.selectedCoords,
      id: this.selectionCol.length + 1
    });
    this.addClassToSelection('hot-sel-' + newSelection.get('id'));
    this.selectionCol.add(newSelection);
    console.log(newSelection);
  }
});

