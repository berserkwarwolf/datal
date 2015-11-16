var ChooseTableView = Backbone.View.extend({
    fetch: function () {
        var self = this;
        return $.getJSON('http://workspace.dev:8015/rest/datasets/61701/tables.json?&limit=100&_=1447703003254').then(function (response) {
            self.tables = response;
        });
    },

    render: function () {
        console.log(this.$el);
        var data = [
          ["", "Ford", "Volvo", "Toyota", "Honda"],
          ["2014", 10, 11, 12, 13],
          ["2015", 20, 11, 14, 13],
          ["2016", 30, 15, 12, 13]
        ];
        var container = this.$el.get(0);
        var hot = new Handsontable(container, {
          data: this.tables[0],
          minSpareRows: 1,
          rowHeaders: true,
          colHeaders: true,
          contextMenu: true
        });
    }
});