var ModalViewSPA = Backbone.View.extend({

	render: function(){
		$('body').append('<div id="'+this.options.id+'" class="process-manager-modal"></div>');
		this.$el = $('#'+this.options.id);
		this.$el.html(_.template($('#'+this.options.id+'Template').html()));
		this.delegateEvents();
		return this;
	},

	open: function(){
		$('.process-manager-modal').hide();
		this.render();
		this.$el.show();
	},

	openModal: function(id){
		this.trigger('openModal',id);
	},

	close: function(){
		this.$el.hide();
	},

});
