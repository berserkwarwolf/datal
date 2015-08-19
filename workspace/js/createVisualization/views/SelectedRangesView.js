var SelectedRangesView = Backbone.View.extend({
	events: {
		'click .btn-remove': 'onClickRemove'
	},
	initialize: function () {
		this.template = _.template($('#selected-ranges-template').html());
		this.render();
		this.listenTo(this.collection, 'add remove reset', this.onCollectionChange, this);
	},
	render: function () {
		this.$el.html(this.template({
            ranges: this.collection.toJSON()
        }));
	},
	onClickRemove: function (event) {
		var $target = $(event.currentTarget),
			id = $target.parent().data('cid');
		this.collection.remove(id);
	},
	onCollectionChange: function () {
		this.render();
	}
})