var ModalView = Backbone.View.extend({

	render: function(){
		return this;
	},

	open: function(){
		$('.process-manager-modal').addClass('hidden');
		this.render();
		this.$el.removeClass('hidden');
	},

	openModal: function(id){
		this.trigger('openModal',id);
	},

	close: function(){
		this.$el.addClass('hidden');
	},

});
