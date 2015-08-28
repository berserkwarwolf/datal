var SelectedCellRangeView = Backbone.View.extend({
	events: {
		'focusin input[@type="text"]': 'onFocusInput',
		'focusout input[@type="text"]': 'onFocusOutInput'
	},

	select: function (dataTableSelection) {
		this.selectedInput.val(dataTableSelection.range);
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
	}
})