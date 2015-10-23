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

		var valid = model.set('excelRange', value);
		this.validate(model);
	},

	onChangeExcelRange: function (model, value) {
		this.$('input[name="' + model.get('name') + '"]').val(value);
		this.validate(model);
	},

	validate: function (model) {
		var $input = this.$('input[name="' + model.get('name') + '"]');
		model.isValid();

		if (model.get('notEmpty')) {
			$input.siblings('p.validation-not-empty')
				.toggleClass('hidden', model.get('excelRange') !== '');
			$input.toggleClass('has-error', model.get('excelRange') === '');
		}

		if (model.validationError === 'invalid-range') {
			$input.addClass('has-error');
			$input.siblings('p.validation-invalid-range').removeClass('hidden');
		} else {
			$input.removeClass('has-error');
			$input.siblings('p.validation-invalid-range').addClass('hidden');
		}

	}
})