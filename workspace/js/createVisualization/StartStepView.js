var StartStepView = Backbone.View.extend({
	events: {
		'click a.btn-type': 'onClickType'
	},
	onClickType: function (e) {
		var $target = $(e.currentTarget),
			type = $target.data('type');
		e.preventDefault();
		this.model.set('type', type);
		this.trigger('step', 1);
		this.hide();
	},
	hide: function () {
		this.$el.addClass('hidden');
	},
	show: function () {
		this.$el.removeClass('hidden');
	}
});