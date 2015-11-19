var PreviewView = Backbone.View.extend({

    typeToRenderer: {
        TEXT: 'selectedTextRenderer',
        LINK: 'selectedLinkRenderer',
        NUMBER: 'selectedNumericRenderer',
        DATE: 'selectedDateRenderer'
    },

    initialize: function () {
        this.template = _.template( $('#preview_dataview_template').html() );
        this.model.fetch();
        this.listenTo(this.model.data, 'change:rows', this.render, this);
    },

    render: function () {
        this.$el.html(this.template());

        var container = this.$('.table-container').get(0),
            tableRows = this.model.data.get('rows');

        if (!_.isUndefined(tableRows)) {
            this.table = new Handsontable(container, {
              disableVisualSelection: true,
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
              data: tableRows,
            });
        }
    }
});