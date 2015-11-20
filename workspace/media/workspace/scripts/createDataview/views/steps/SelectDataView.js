var SelectDataView = Backbone.View.extend({
    _cacheFocusedInput: 'range_lat',

    initialize: function (options) {
        this.template = _.template( $('#select_data_template').html() );
        this.collection = new DataTableSelectedCollection();
        this.rangeLatModel = new DataTableSelectionModel({classname: 1, name: 'range_lat', notEmpty: true});

        this.collection.reset([this.rangeLatModel]);

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
        this.listenTo(this.dataTableView, 'afterSelection', function (range) {
            this.addSelection(this._cacheFocusedInput);
        }, this);
        this.listenTo(this.dataTableView, 'afterSelectionEnd', function () {
            this.addSelection(this._cacheFocusedInput);
        }, this);

        this.dataTableView.render();

        this.selectionView = new SelectionView({
            el: this.$('.selection-view'),
            collection: this.collection
        });
        this.selectionView.render();
    },

    addSelection: function (name) {
        var selection = this.dataTableView.getSelection(),
            model = this.collection.find(function (model) {
                return model.get('name') === name;
            });
        model.set(selection);
    }
});