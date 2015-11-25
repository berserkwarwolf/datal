var SelectionView = Backbone.View.extend({
    events: {
        'click button.btn-clear': 'onClickClear',
        'click button.btn-headers': 'onClickHeaders',
        'click button.btn-filters': 'onClickFilters',
        'click button.btn-formats': 'onClickFormats'
    },

    initialize: function () {
        this.template = _.template( $('#selection_template').html() );
        this.listenTo(this.collection, 'add change remove reset', this.render, this);
        this.listenTo(this.model, 'change', this.render, this);
    },

    render: function () {
        var columns = this.filter('col'),
            rows = this.filter('row'),
            cells = this.filter('cell'),
            headers = this.filter('header'),
            total = this.collection.length;

        this.$el.html(this.template({
            columns: columns,
            rows: rows,
            cells: cells,
            headers: headers,
            total: total,
            state: this.model.toJSON()
        }));
    },

    onClickClear: function () {
        this.collection.reset();
    },

    onClickHeaders: function () {
        this.model.set('mode', 'headers');
    },

    show: function () {
        this.$el.removeClass('hidden');
    },

    hide: function () {
        this.$el.addClass('hidden');
    },

    filter: function (mode) {
        return this.collection.filter(function (model) {
            return model.get('mode') === mode;
        }).map(function (model) {
            return model.toJSON();
        });
    }
});
