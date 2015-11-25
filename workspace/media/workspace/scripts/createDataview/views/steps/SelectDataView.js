var SelectDataView = Backbone.View.extend({

    events: {
        'change select.select-table': 'onClickSelectTable'
    },

    initialize: function (options) {
        var tableId = this.model.get('tableId');

        this.datasetModel = options.datasetModel;
        this.internalState = new Backbone.Model({
            mode: 'data'
        });

        this.template = _.template( $('#select_data_template').html() );

        this.$el.html(this.template({tables: [1,2,3]}));
        this.$('.select-table').val(tableId);
    },

    render: function () {
        var tableId = this.model.get('tableId');

        if (this.dataTableView) {
            this.dataTableView.$('.table-view').empty();
        }

        this.dataTableView = new DataTableView({
            el: this.$('.data-table-view'),
            collection: this.collection,
            dataview: {
                rows: this.datasetModel.get('tables')[tableId-1]
            },
            enableFulllRowSelection: true
        });
        this.listenTo(this.dataTableView, 'afterSelectionEnd', function () {
            this.addSelection();
        }, this);
        this.dataTableView.render();

        if (this.selectionView) {
            this.selectionView.remove();
            delete this.selectionView;
        }
        this.selectionView = new SelectionView({
            collection: this.collection,
            model: this.internalState
        });
        this.selectionView.render();
        this.$('.selection-view').append(this.selectionView.$el);
    },

    addSelection: function () {
        var selection = this.dataTableView.getSelection(),
            model;

        if (this.internalState.get('mode') === 'data') {

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
        } else if (this.internalState.get('mode') === 'headers') {
            model = new DataTableSelectionModel({classname: 5});
            selection.mode = 'header';
        };

        model.set(selection);

        // TODO: Esta funcionalidad deberia estar encapsulada en collection.toggleModel()
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
    },

    onClickSelectTable: function (e) {
        var $target = $(e.currentTarget),
            tableId = $target.val();

        this.model.set('tableId', tableId);
        this.render();
    },

    isValid: function () {
        return true;
    }
});