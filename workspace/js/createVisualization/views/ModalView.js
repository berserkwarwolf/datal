var ModalView = Backbone.View.extend({

	open: function(){
		$('.process-manager-modal').addClass('hidden');
		this.$el.removeClass('hidden');
	},

	openModal: function(id){
		this.trigger('openModal',id);
	},

	close: function(){
		this.$el.addClass('hidden');
	},

});
