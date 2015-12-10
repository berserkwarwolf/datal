var FormatsView = Backbone.Epoxy.View.extend({
    events: {
        'click button.btn-clear': 'onClickClear',
        'click button.btn-back': 'onClickBack',
        'click button.btn-ok': 'onClickOk',
        'change input[name="separator"]': 'onChangeSeparatorType'
    },

    bindings: {
        "select.select-column": "value:column, events:['change']",
        "select.select-data-type": "value:type, events:['change']",
        'input[name="customPattern"]': "value:customPattern, events:['keyup']",
        "select.decimal-separator": "value:decimalSeparator, events:['change']",
        "select.thousand-separator": "value:thousandSeparator, events:['change']",
        "select[name=inputLocale]": "value:inputLocale, events:['change']"
    },

    initialize: function (options) {
        this.template = _.template( $('#formats_template').html() );
        this.stateModel = options.stateModel;
        this.totalCols = options.totalCols;

        this.listenTo(this.model, 'change:column', this.onChangeColumn, this);
        this.listenTo(this.model, 'change:type', this.onChangeType, this);
        this.listenTo(this.model, 'change:originPattern', this.onChangeOriginPattern, this);
    },

    render: function () {
        var columns = _.map(_.range(0, this.totalCols), function (number) {
                return DataTableUtils.intToExcelCol(number + 1);
            });

        this.$el.html(this.template({
            columns: columns,
        }));
        this.applyBindings();

        this.inputPatternView = new PatternView({
            el: this.$('.input-pattern-view'),
        });
        this.inputPatternView.on('change', function (value) {
            this.model.set('originPattern', value);
        }, this);
        this.inputPatternView.render();

        this.displayPatternView = new PatternView({
            el: this.$('.display-pattern-view'),
        });
        this.displayPatternView.on('change', function (value) {
            this.model.set('displayPattern', value);
        }, this);
        this.displayPatternView.render();

        Backbone.Validation.bind(this, {
            valid: function (view, attr, selector) {
                view.setIndividualError(view.$('[name=' + attr + ']'), attr, '');
            },
            invalid: function (view, attr, error, selector) {
                view.setIndividualError(view.$('[name=' + attr + ']'), attr, error);
            },
        });
    },

    onClickBack: function () {
        this.collection.reset();
        this.stateModel.set('mode', 'data');
    },

    onClickClear: function () {
        this.collection.reset();
    },

    onClickOk: function () {
        if (this.model.isValid(true)) {
            this.collection.add(this.model);
            this.stateModel.set('mode', 'data');
        }
    },

    onChangeColumn: function (model, value) {
        if (value !== '') {
            this.model.set('excelCol', DataTableUtils.intToExcelCol(Number(value) + 1));
            this.$('.row-data-type').removeClass('hidden');
        } else {
            this.model.unset('excelCol');
            this.$('.row-data-type').addClass('hidden');
        }
    },

    onChangeType: function (model, value) {
        if (value === 'TEXT') {
            this.$('.input-output-view').addClass('hidden');
        } else if (value === 'NUMBER' || value === 'DATE') {
            this.$('.input-output-view').removeClass('hidden');
        }
    },

    onChangeOriginPattern: function (model, value) {
        if (value === 'custom') {
            this.$('.row-custom-pattern').removeClass('hidden');
        } else {
            this.$('.row-custom-pattern').addClass('hidden');
        }
    },

    onChangeSeparatorType: function (e) {
        var value = $(e.currentTarget).val();
        this.model.set('separatorType', value);
        if (value === 'symbol') {
            this.$('.input-locale').addClass('hidden');
            this.$('.separators').removeClass('hidden');
        } else {
            this.$('.input-locale').removeClass('hidden');
            this.$('.separators').addClass('hidden');
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

    setIndividualError: function(element, name, error){
        if( error !== ''){
            element.addClass('has-error');
            element.next('p.has-error').remove();
            element.after('<p class="has-error">'+error+'</p>');
        } else {
            element.removeClass('has-error');
            element.next('p.has-error').remove();
        }
    },

    show: function () {
        this.$el.removeClass('hidden');
    },

    hide: function () {
        this.$el.addClass('hidden');
    },
});
