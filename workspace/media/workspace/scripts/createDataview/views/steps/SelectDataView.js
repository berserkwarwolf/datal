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
            rowHeaders: true,
            colHeaders: true,
            readOnly: true,
            readOnlyCellClassName: 'htDimmed-datal', // the regular class paints text cells grey
            allowInsertRow: false,
            allowInsertColumn: false,
            disableVisualSelection: ['current'],
            colWidths: 80,
            manualColumnResize: true,
            manualRowResize: true,
            rowHeaders: true,
            colHeaders: true,
            contextMenu: false,
        });
    }
});