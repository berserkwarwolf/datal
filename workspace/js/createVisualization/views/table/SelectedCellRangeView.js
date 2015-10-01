var SelectedCellRangeView = Backbone.View.extend({
	skipFocusFlag: 0,

	events: {
		'focusin input[@type="text"]': 'onFocusInput',
		'focusout input[@type="text"]': 'onFocusOutInput',
		'keyup input[@type="text"]': 'onKeyupInput'
	},

	initialize: function (options) {
        this.models = options.models;

        _.each(this.models, function (model, i) {
        	this.listenTo(model, 'change:excelRange', this.onChangeExcelRange, this);
        }, this);

	},

	clear: function () {
		this.$('input[type="text"]').val('');
	},

	focusNext: function () {
		if (this.skipFocusFlag >= 2) return;
		if (this.selectedInput.attr('name') === 'range_data') {
			this.$('input[name="range_labels"]').focus();
		} else if (this.selectedInput.attr('name') === 'range_labels') {
			this.$('input[name="range_headers"]').focus();
		}
		this.skipFocusFlag += 1;
	},

	focus: function  () {
		this.$('input[type="text"]').first().focus();
	},

	onFocusInput: function (event) {
		var $target = $(event.currentTarget),
			name = $target.attr('name');
		this.$('input[type="text"]').removeClass('active');
		$target.addClass('active');
		this.selectedInput = $target;
		this.trigger('focus-input', name);
	},

	onFocusOutInput: function (event) {
		var $target = $(event.currentTarget),
			name = $target.attr('name');
		this.trigger('focusout', name);
	},

	onKeyupInput: function (event) {
		var $target = $(event.currentTarget),
			name = $target.attr('name');
			value = $target.val(),
			model = _.findWhere(this.models, function (model) {
				return model.get('name') === name;
			});
		model.set('excelRange', value, {validate: true});
		this.showValidations();
	},

	onChangeExcelRange: function (model, value) {
		this.$('input[name="' + model.get('name') + '"]').val(value);
		this.showValidations();
	},

	showValidations: function () {
		_.each(this.models, function (model) {
			this.$('input[name="' + model.get('name') + '"]').toggleClass('has-error', !!model.validationError);
		});
	}
})