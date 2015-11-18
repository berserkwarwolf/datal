var SelectDataView = Backbone.View.extend({

    initialize: function (options) {
        this.template = _.template( $('#select_data_template').html() );
        this.datasetModel = options.datasetModel;
    },

    render: function () {
        this.$el.html(this.template());

        var container = this.$('.table-container').get(0);

        this.table = new Handsontable(container, {
            data: this.datasetModel.get('tables')[0],
            minSpareRows: 1,
            rowHeaders: true,
            colHeaders: true,
            contextMenu: false
        });
    }
});