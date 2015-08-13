var ModalViewSPA = function(options) {
	this.inheritedEvents = [];

	Backbone.Epoxy.View.call(this, options);
}

_.extend(ModalViewSPA.prototype, Backbone.Epoxy.View.prototype, {
		
	// Extend functions

	baseEvents: {},

	events: function() {
		var e = _.extend({}, this.baseEvents);

		_.each(this.inheritedEvents, function(events) {
			e = _.extend(e, events);
		});

		return e;
	},

	addEvents: function(eventObj) {
		this.inheritedEvents.push(eventObj);
	},

	// Modal functions

	initialize: function(){
		this.render();
		return this;
	},

	render: function(){
		$('body').append('<div id="'+this.options.id+'" class="process-manager-modal"></div>');
		this.$el = $('#'+this.options.id);
		this.$el.html(_.template($('#'+this.options.id+'Template').html()));
		return this;
	},

	open: function(){
		$('.process-manager-modal').hide();
		this.$el.show();
	},

	openModal: function(id){
		this.trigger('openModal',id);
	},

	close: function(){
		this.$el.hide();
	},

});

ModalViewSPA.extend = Backbone.Epoxy.View.extend;