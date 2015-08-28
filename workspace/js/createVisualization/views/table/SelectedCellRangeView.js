var SelectedCellRangeView = Backbone.View.extend({
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