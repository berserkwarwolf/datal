var ChooseTableView = Backbone.View.extend({
    fetch: function () {
        var self = this;
        return $.getJSON('http://workspace.dev:8015/rest/datasets/61701/tables.json?&limit=100&_=1447703003254').then(function (response) {
            self.tables = response;
        });
    },

    render: function () {
        var container = $('.choose-table-container').get(0);
        var hot = new Handsontable(container, {
          data: this.tables[0],
          minSpareRows: 1,
          rowHeaders: true,
          colHeaders: true,
          contextMenu: false
        });
    }
});