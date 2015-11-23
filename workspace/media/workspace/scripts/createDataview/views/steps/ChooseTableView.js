var ChooseTableView = Backbone.View.extend({
    events: {
        'click a.select-table-item': 'onClickSelectTable'
    },

    initialize: function (options) {
        this.template = _.template( $('#choose_table_template').html() );
        this.datasetModel = options.datasetModel;
    },

    render: function () {
        // TODO: mostrar en este template las tablas disponibles en el model.get('tables'). Tambien
        // renderizar la seleccionada o la primera si no hay una seleccionada.
        this.$el.html(this.template({tables: [1,2,3]}));

        var container = this.$('.table-container').get(0);
        this.table = new Handsontable(container, {
            rowHeaders: true,
            colHeaders: true,
            readOnly: true,
            readOnlyCellClassName: 'htDimmed-datal', // the regular class paints text cells grey
            allowInsertRow: false,
            allowInsertColumn: false,
            disableVisualSelection: ['current', 'area'],
            colWidths: 80,
            manualColumnResize: true,
            manualRowResize: true,
            rowHeaders: true,
            colHeaders: true,
            contextMenu: false,
            data: this.datasetModel.get('tables')[0]
        });
    },

    onClickSelectTable: function (e) {
        e.preventDefault();
        var $target = $(e.currentTarget),
            tableId = $target.data('tableId');
        console.info('ChooseTableView: selected table with id', tableId);
        // TODO: set selected table-id in the dataview model

        // TODO: render this view, highlighting the selected table in the UL
        // and showing the table on the right panel.
    }
});