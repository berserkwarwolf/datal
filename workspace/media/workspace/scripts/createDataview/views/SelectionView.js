var SelectionView = Backbone.View.extend({
    events: {
        'click button.btn-clear': 'onClickClear',
        'click button.btn-headers': 'onClickHeaders',
        'click button.btn-filters': 'onClickFilters',
        'click button.btn-formats': 'onClickFormats'
    },

    initialize: function (options) {
        this.dataviewModel = options.dataviewModel;

        this.template = _.template( $('#selection_template').html() );
        this.listenTo(this.dataviewModel.selection, 'add change remove reset', this.render, this);
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

    onClickClear: function () {
        this.dataviewModel.selection.reset();
        this.dataviewModel.filters.reset();
    },

    onClickHeaders: function () {
        this.model.set('mode', 'headers');
    },

    onClickFilters: function () {
        this.model.set('mode', 'add-filter');
    },

    onClickFormats: function () {
        this.model.set('mode', 'formats');
    },

    show: function () {
        this.$el.removeClass('hidden');
    },

    hide: function () {
        this.$el.addClass('hidden');
    },

    filter: function (mode) {
        return this.dataviewModel.selection.filter(function (model) {
            return model.get('mode') === mode;
        }).map(function (model) {
            return model.toJSON();
        });
    }
});
