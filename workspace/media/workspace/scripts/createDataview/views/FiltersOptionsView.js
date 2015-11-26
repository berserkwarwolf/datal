var FiltersOptionsView = Backbone.View.extend({
    events: {
        'click button.btn-clear': 'onClickClear',
        'click button.btn-back': 'onClickBack',
        'click button.btn-ok': 'onClickOk',
        'change select.select-column': 'onChangeColumn',
        'change select.select-operator': 'onChangeOperator',
        'change select.select-value-type': 'onChangeValueType',
        'change input:text': 'onChangeInput'
    },

    initialize: function (options) {
        this.template = _.template( $('#filters_options_template').html() );
        this.stateModel = options.stateModel;
    },

    render: function () {
        // TODO: enumerar las columnas disponibles
        var columns = ['A', 'B', 'C', 'D'];

        this.$el.html(this.template({
            columns: columns,
            filter: this.model.toJSON(),
            state: this.stateModel.toJSON()
        }));
    },

    onClickBack: function () {
        // TODO: clear 'header' elements from the collection
        console.info('TODO: clear header elements from the collection');
        this.stateModel.set('mode', 'data');
    },

    onClickClear: function () {
        // TODO: clear 'header' elements from the collection
        console.info('TODO: clear header elements from the collection');
    },

    onClickOk: function () {
        this.collection.add(this.model);
        this.stateModel.set('mode', 'data');
    },

    onChangeColumn: function (e) {
        var value = $(e.currentTarget).val();
        if (value !== '') {
            this.model.set('column', value);
            this.$('.row-operator').removeClass('hidden');
        } else {
            this.model.unset('column');
            this.$('.row-operator').addClass('hidden');
            this.$('.row-operator').addClass('hidden');
            this.$('.row-fixed-value').addClass('hidden');
            this.$('.row-parameter').addClass('hidden');
        }
    },

    onChangeOperator: function (e) {
        var value = $(e.currentTarget).val();
        if (value !== '') {
            this.model.set('operator', value);
            this.$('.row-value-type').removeClass('hidden');
        } else {
            this.model.unset('operator');
            this.$('.row-value-type').addClass('hidden');
            this.$('.row-fixed-value').addClass('hidden');
            this.$('.row-parameter').addClass('hidden');
        }
    },

    onChangeValueType: function (e) {
        var value = $(e.currentTarget).val();
        if (value === '') {
            this.$('.row-operator').removeClass('hidden');
        } else if (value === 'fixed') {
            this.$('.row-fixed-value').removeClass('hidden');
            this.$('.row-parameter').addClass('hidden');
        } else if (value === 'parameter') {
            this.$('.row-fixed-value').addClass('hidden');
            this.$('.row-parameter').removeClass('hidden');
        }
    },

    onChangeInput: function (e) {
        var $target = $(e.currentTarget),
            name = $target.attr('name'),
            value = $target.val();
        if (value !== '') {
            this.model.set(name, value);
        } else {
            this.model.unset(name);
        }
    },

    show: function () {
        this.$el.removeClass('hidden');
    },

    hide: function () {
        this.$el.addClass('hidden');
    },
});
