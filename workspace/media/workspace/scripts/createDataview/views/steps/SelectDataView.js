var SelectDataView = Backbone.View.extend({

    events: {
        'change select.select-table': 'onChangeTable'
    },

    initialize: function (options) {
        var tableId;

        this.dataviewModel = options.dataviewModel;
        this.datasetModel = options.datasetModel;
        this.internalState = new Backbone.Model({
            mode: 'data'
        });

        tableId = this.dataviewModel.get('tableId');

        this.template = _.template( $('#select_data_template').html() );

        this.$el.html(this.template({tables: this.datasetModel.getTables()}));
        this.$('.select-table').val(tableId);

        this.listenTo(this.internalState, 'change:mode', this.onChangeMode, this);
    },

    render: function () {
        var tableId = this.dataviewModel.get('tableId');
        var rows = this.datasetModel.get('tables')[tableId];

        // TODO: move this elsewhere!
        this.dataviewModel.set('totalRows', rows.length);
        this.dataviewModel.set('totalCols', rows[0].length);

        if (this.dataTableView) {
            this.dataTableView.$('.table-view').empty();
        }

        this.dataTableView = new DataTableView({
            el: this.$('.data-table-view'),
            collection: this.dataviewModel.selection,
            dataview: {
                rows: rows
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
            collection: this.dataviewModel.selection,
            dataviewModel: this.dataviewModel,
            model: this.internalState
        });
        this.selectionView.render();
        this.$('.selection-view').append(this.selectionView.$el);

        if (this.headersOptionsView) {
            this.headersOptionsView.remove();
            delete this.headersOptionsView;
        }
        this.headersOptionsView = new HeadersOptionsView({
            model: this.internalState
        });
        this.headersOptionsView.render();
        this.headersOptionsView.hide();
        this.$('.headers-options-view').append(this.headersOptionsView.$el);
    },

    attachFiltersView: function () {
        this.destroyFiltersView();

        this.filtersOptionsView = new FiltersOptionsView({
            stateModel: this.internalState,
            collection: this.dataviewModel.filters,
            model: new Backbone.Model()
        });
        this.filtersOptionsView.render();
        this.$('.headers-options-view').append(this.filtersOptionsView.$el);
    },

    destroyFiltersView: function () {
        if (this.filtersOptionsView) {
            this.filtersOptionsView.remove();
            delete this.filtersOptionsView;
        }
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

            // Solo seleccionar filas en el modo headers
            if (selection.mode === 'row') {
                model = new DataTableSelectionModel({classname: 5});
                selection.mode = 'header';
            } else {
                return;
            }

        };

        model.set(selection);

        // TODO: Esta funcionalidad deberia estar encapsulada en collection.toggleModel()
        var existing = this.checkExisting(model);
        if (existing) {
            this.dataviewModel.selection.remove(existing);
        } else {
            this.dataviewModel.selection.add(model);
        }
    },

    checkExisting: function (model) {
        var items = this.dataviewModel.selection.filter(function (item) {
            return item.get('mode') === model.get('mode');
        });
        var existing = _.find(items, function (item) {
            return model.get('excelRange') === item.get('excelRange');
        });
        return existing;
    },

    onChangeTable: function (e) {
        var $target = $(e.currentTarget),
            tableId = $target.val();

        this.dataviewModel.set('tableId', tableId);
        var table = this.datasetModel.get('tables')[tableId];
        this.dataviewModel.set('totalCols', table[0].length);
        this.render();
    },

    onChangeMode: function (model, value) {
        if (value === 'headers') {
            this.selectionView.hide();
            this.headersOptionsView.show();
        } else if (value === 'add-filter') {
            this.selectionView.hide();
            this.attachFiltersView();
        } else {
            this.destroyFiltersView();
            this.headersOptionsView.hide();
            this.selectionView.show();
        }
    },

    isValid: function () {
        return true;
    }
});