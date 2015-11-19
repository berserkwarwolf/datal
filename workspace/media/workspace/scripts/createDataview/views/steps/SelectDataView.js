var SelectDataView = Backbone.View.extend({

    initialize: function (options) {
        this.template = _.template( $('#select_data_template').html() );
        this.collection = new DataTableSelectedCollection();
        this.datasetModel = options.datasetModel;
    },

    render: function () {
        this.$el.html(this.template());

        this.dataTableView = new DataTableView({
            el: this.$('.data-table-view'),
            collection: this.collection,
            dataview: {
                rows: this.datasetModel.get('tables')[0]
            }
        });

        this.dataTableView.render();
    }
});