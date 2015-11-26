var FiltersOptionsView = Backbone.View.extend({
    events: {
        'click button.btn-clear': 'onClickClear',
        'click button.btn-back': 'onClickBack',
        'click button.btn-ok': 'onClickOk',
        'change select.select-column': 'onChangeColumn',
        'change select.select-operation': 'onChangeOperantion'
    },

    initialize: function () {
        this.template = _.template( $('#filters_options_template').html() );
        this.listenTo(this.model, 'change', this.render, this);
    },

    render: function () {
        var columns = ['A', 'B', 'C', 'D'];

        this.$el.html(this.template({
            columns: columns,
            state: this.model.toJSON()
        }));
    },

    onClickBack: function () {
        // TODO: clear 'header' elements from the collection
        console.info('TODO: clear header elements from the collection');
        this.model.set('mode', 'data');
    },

    onClickClear: function () {
        // TODO: clear 'header' elements from the collection
        console.info('TODO: clear header elements from the collection');
    },

    onClickOk: function () {
        this.model.set('mode', 'data');
    },

    onChangeColumn: function (e) {
        console.log(e, 'onChangeColumn');
    },


    onChangeOperation: function (e) {
        console.log(e, 'onChangeOperation');
    },


    show: function () {
        this.$el.removeClass('hidden');
    },

    hide: function () {
        this.$el.addClass('hidden');
    },
});
