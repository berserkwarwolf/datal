var SelectedCellRangeView = Backbone.View.extend({
	events: {
		'focusin input[@type="text"]': 'onFocusInput',
		'focusout input[@type="text"]': 'onFocusOutInput',
		'click button': 'onClickButton'
	},
	initialize: function () {
		this.render();
		this.listenTo(this.collection, 'add remove reset', this.onCollectionChange, this);
	},
	render: function () {
	},
	select: function (range) {
		this.selectedInput.val(range);
	},
	onFocusInput: function (event) {
		var $target = $(event.currentTarget),
			name = $target.attr('name');

		this.$('input[type="text"]').removeClass('active');

		$target.data('selected', 'selected')
			.addClass('active');
		this.selectedInput = $target;
		this.selectedFieldName = $target.attr('name');
	},
	onFocusOutInput: function (event) {
		var $target = $(event.currentTarget),
			name = $target.attr('name');
			console.log(event, name);
		this.trigger('focusout', name);
	},
	onClickButton: function (event) {
		event.preventDefault();
	}
})