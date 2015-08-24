var ModalView = Backbone.View.extend({

	open: function(){
		$('.process-manager-modal').addClass('hidden');
		this.$el.removeClass('hidden');
	},

	close: function(){
		this.$el.addClass('hidden');
	},

});
