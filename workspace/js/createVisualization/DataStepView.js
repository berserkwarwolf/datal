var DataStepView = Backbone.View.extend({
	events: {
		'click a.btn-next': 'onClickNext',
		'click a.btn-prev': 'onClickPrev'
	},
	onClickNext: function (e) {
		e.preventDefault();
		this.trigger('step', 1);
	},
	onClickPrev: function (e) {
		e.preventDefault();
		this.trigger('step', -1);
	},
	hide: function () {
		this.$el.addClass('hidden');
	},
	show: function () {
		this.$el.removeClass('hidden');
	}
});