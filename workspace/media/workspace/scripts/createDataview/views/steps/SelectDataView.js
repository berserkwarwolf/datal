var SelectDataView = Backbone.View.extend({

    events: {
        'change select.select-table': 'onClickSelectTable',
        'click button.btn-headers': 'onClickHeaders'
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

        this.listenTo(this.internalState, 'change:mode', this.onChangeMode, this);
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

        if (this.headersOptionsView) {
            this.headersOptionsView.remove();
            delete this.headersOptionsView;
        }
        this.headersOptionsView = new HeadersOptionsView({
            collection: this.collection,
            model: this.internalState
        });
        this.headersOptionsView.render();
        this.headersOptionsView.hide();
        this.$('.headers-options-view').append(this.headersOptionsView.$el);

        if (this.filtersOptionsView) {
            this.filtersOptionsView.remove();
            delete this.filtersOptionsView;
        }
        this.filtersOptionsView = new FiltersOptionsView({
            collection: this.collection,
            model: this.internalState
        });
        this.filtersOptionsView.render();
        this.filtersOptionsView.hide();
        this.$('.headers-options-view').append(this.filtersOptionsView.$el);
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

    onClickHeaders: function () {
        var mode = this.model.get('mode');
        if (mode === 'headers') {
            this.model.set('mode', 'data');
        } else {
            this.model.set('mode', 'headers');
        };
    },

    onChangeMode: function (model, value) {
        console.info('changed mode to ', value);
        if (value === 'headers') {
            this.selectionView.hide();
            this.headersOptionsView.show();
        } else if (value === 'filters') {
            this.selectionView.hide();
            this.filtersOptionsView.show();
        } else {
            this.filtersOptionsView.hide();
            this.headersOptionsView.hide();
            this.selectionView.show();
        }
    },

    isValid: function () {
        return true;
    }
});