var SelectDataView = Backbone.View.extend({

    events: {
        'change select.select-table': 'onClickSelectTable'
    },

    _mode: 'data',

    initialize: function (options) {
        this.internalState = new Backbone.Model({
            mode: 'data'
        });

        this.template = _.template( $('#select_data_template').html() );
        this.datasetModel = options.datasetModel;
    },

    render: function () {
        this.$el.html(this.template({tables: [1,2,3]}));
        var tableId = this.model.get('tableId');
        this.$('.select-table').val(tableId);

        this.dataTableView = new DataTableView({
            el: this.$('.data-table-view'),
            collection: this.collection,
            dataview: {
                rows: this.datasetModel.get('tables')[tableId-1]
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
            collection: this.collection,
            model: this.internalState
        });
        this.selectionView.render();
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
        e.preventDefault();
        var $target = $(e.currentTarget),
            tableId = $target.val();

        this.model.set('tableId', tableId);
        this.render();
        console.info('ChooseTableView: selected table with id', tableId);

        // TODO: render this view, highlighting the selected table in the UL
        // and showing the table on the right panel.
    },

    isValid: function () {
        return true;
    }
});