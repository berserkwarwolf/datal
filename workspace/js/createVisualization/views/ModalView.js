var ModalView = Backbone.View.extend({

	open: function(){
		$('.process-manager-modal').addClass('hidden');
		this.$el.removeClass('hidden');
		this.trigger('open');
	},

	close: function(){
		this.$el.addClass('hidden');
		this.trigger('close');
	},

});
