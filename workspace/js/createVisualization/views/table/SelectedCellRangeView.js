var SelectedCellRangeView = Backbone.View.extend({
	skipFocusFlag: 0,

	events: {
		'focusin input[@type="text"]': 'onFocusInput',
		'focusout input[@type="text"]': 'onFocusOutInput',
		'keyup input[@type="text"]': 'onKeyupInput'

	},

	clear: function () {
		this.$('input[type="text"]').val('');
	},

	select: function (dataTableSelection) {
		this.selectedInput.val(dataTableSelection.range);
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
		this.trigger('edit-input', name, $target.val());
	}
})