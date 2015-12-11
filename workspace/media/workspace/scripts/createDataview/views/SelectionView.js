var SelectionView = Backbone.View.extend({
    events: {
        'click a.btn-clear': 'onClickClear',
        'click a.btn-headers': 'onClickHeaders',
        'click a.btn-filters': 'onClickFilters',
        'click a.btn-formats': 'onClickFormats'
    },

    initialize: function (options) {
        this.dataviewModel = options.dataviewModel;

        this.template = _.template( $('#selection_template').html() );
        this.listenTo(this.dataviewModel.selection, 'add change remove reset', this.render, this);
        this.listenTo(this.dataviewModel.filters, 'add change remove reset', this.render, this);
        this.listenTo(this.model, 'change', this.render, this);
    },

    render: function () {
        var columns = this.filter('col'),
            rows = this.filter('row'),
            cells = this.filter('cell'),
            headers = this.filter('header'),
            total = this.dataviewModel.selection.length;

        this.$el.html(this.template({
            columns: columns,
            rows: rows,
            cells: cells,
            headers: headers,
            total: total,
            filters: this.dataviewModel.filters.toJSON(),
            state: this.model.toJSON()
        }));
    },

    onClickClear: function (e) {
        var mode = $(e.currentTarget).data('mode');
        console.log('clear mode:', mode);
        if (mode === 'filter') {
            this.dataviewModel.filters.reset();
        } else {
            this.clearByMode(this.dataviewModel.selection, mode);
        }
    },

    onClickHeaders: function () {
        this.model.set('mode', 'headers');
    },

    onClickFilters: function () {
        this.model.set('mode', 'add-filter');
    },

    onClickFormats: function () {
        this.model.set('mode', 'set-formats');
    },

    show: function () {
        this.$el.removeClass('hidden');
    },

    hide: function () {
        this.$el.addClass('hidden');
    },

    filter: function (mode) {
        return this.dataviewModel.selection.filterByMode(mode).map(function (model) {
            return model.toJSON();
        });
    },

    clearByMode: function (collection, mode) {
        collection.remove(collection.filterByMode(mode));
    }

});
