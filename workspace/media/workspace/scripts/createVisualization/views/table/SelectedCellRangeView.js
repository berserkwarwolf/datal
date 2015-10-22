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
			name = $target.attr('name'),
			value = $target.val(),
			model = _.find(this.models, function (item) {
				return item.get('name') === name;
			});

		var valid = model.set('excelRange', value);
		this.showValidations(model);
	},

	onChangeExcelRange: function (model, value) {
		this.$('input[name="' + model.get('name') + '"]').val(value);
		this.showValidations(model);
	},

	showValidations: function (model) {
		var $input = this.$('input[name="' + model.get('name') + '"]');
		model.isValid();

		if (model.get('notEmpty')) {
			$input.siblings('p.validation-not-empty')
				.toggleClass('hidden', model.get('excelRange') !== '');
			$input.toggleClass('has-error', model.get('excelRange') === '');
		}

		if (model.validationError === 'invalid-range') {
			$input.toggleClass('has-error', !!model.validationError);
			$input.siblings('p.validation-invalid-range').removeClass('hidden');
		} else {
			$input.siblings('p.validation-invalid-range').addClass('hidden');
		}

	}
})