var SelectedCellRangeView = Backbone.View.extend({

	events: {
		'focusin input[@type="text"]': 'onFocusInput',
		'focusout input[@type="text"]': 'onFocusOutInput',
		'keyup input[@type="text"]': 'onKeyupInput'
	},

	initialize: function (options) {
        this.listenTo(this.collection, 'change:excelRange', this.onChangeExcelRange, this);
        this.listenTo(this.collection, 'add reset', this.render, this);
	},

	render: function  () {
		this.$('.input-row').addClass('hidden');
		this.collection.each(function (model) {
			this.$('[data-name="' + model.get('name')+ '"].input-row ').removeClass('hidden');
		});
		this.$('.input-row:not(.hidden) input[type="text"]').first().focus();
	},
	focus: function () {

	},
	clear: function () {
		this.$('input[type="text"]').val('');
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
			model = this.collection.find(function (model) {
				return model.get('name') === name;
			});

		if (value === '') {
			model.unset('excelRange');
		} else {
			model.set('excelRange', value);
		}
		this.validate(model);
	},

	onChangeExcelRange: function (model, value) {
		this.$('input[name="' + model.get('name') + '"]').val(value);
		this.validate(model);
	},

	validate: function (model) {
		var $input = this.$('input[name="' + model.get('name') + '"]'),
			hasRangeError, hasInvalidError;

		model.isValid();
		hasRangeError = (model.get('notEmpty') && !model.hasRange());
		hasInvalidError = (model.validationError === 'invalid-range');

		$input.siblings('p.validation-not-empty').toggleClass('hidden', !hasRangeError);
		$input.siblings('p.validation-invalid-range').toggleClass('hidden', !hasInvalidError);
		$input.toggleClass('has-error', hasInvalidError || hasRangeError);
	}
})