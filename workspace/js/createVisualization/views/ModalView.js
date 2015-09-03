var ModalView = Backbone.View.extend({

	open: function(){
		$('body').css('overflow', 'hidden');
		$('.process-manager-modal').addClass('hidden');
		this.$el.removeClass('hidden');
		this.trigger('open');
	},

	close: function(){
		$('body').css('overflow', 'auto');
		this.$el.addClass('hidden');
		this.trigger('close');
	},

});
