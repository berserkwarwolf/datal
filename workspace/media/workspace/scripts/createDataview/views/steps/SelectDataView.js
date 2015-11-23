var SelectDataView = Backbone.View.extend({
    _cacheFocusedInput: 'range_lat',

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
            },
            enableFulllRowSelection: true
        });
        this.listenTo(this.dataTableView, 'afterSelection', function (range) {
            // console.log('afterSelection', range);
            // this.addSelection();
        }, this);
        this.listenTo(this.dataTableView, 'afterSelectionEnd', function () {
            // console.log('afterSelectionEnd');
            this.addSelection();
        }, this);

        this.dataTableView.render();

        this.selectionView = new SelectionView({
            el: this.$('.selection-view'),
            collection: this.collection
        });
        this.selectionView.render();
    },

    addSelection: function () {
        var selection = this.dataTableView.getSelection(),
            model;
        console.log('selection.mode:', selection.mode)
        if (selection.mode === 'col') {
            model = new DataTableSelectionModel({classname: 1});
        } else if (selection.mode === 'row') {
            model = new DataTableSelectionModel({classname: 2});
        } else if (selection.mode === 'table') {
            model = new DataTableSelectionModel({classname: 3});
        } else if (selection.mode === 'cell') {
            model = new DataTableSelectionModel({classname: 4});
        } else {
            return;
        }

        model.set(selection);
        var existing = this.checkExisting(model);
        if (existing) {
            this.collection.remove(existing);
        } else {
            this.collection.add(model);
        }
    },

    checkExisting: function (model) {
        var items = this.collection.filter(function (item) {
            return item.get('mode') === model.get('mode');
        });
        var existing = _.find(items, function (item) {
            return model.get('excelRange') === item.get('excelRange');
        });
        return existing;
    }

});