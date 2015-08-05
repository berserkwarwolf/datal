var data = [
  ["", "Ford", "Volvo", "Toyota", "Honda"],
  ["2014", 10, 11, 12, 13],
  ["2015", 20, 11, 14, 13],
  ["2016", 30, 15, 12, 13]
];

var DataTableView = Backbone.View.extend({
  initialize: function () {
    var self = this;

    this.table = new Handsontable(this.el, {
      data: data,
      minSpareRows: 1,
      rowHeaders: true,
      colHeaders: true,
      contextMenu: true
    });

    this.selectionEl = $('#selection');
    this.table.addHook('afterSelection', function (r1, c1, r2, c2) {
      console.log('afterSelectionEnd', r1, c1, r2, c2);
      self.selectionEl.text(String(r1)+String(c1)+String(r2)+String(c2));
    })
  }
});
