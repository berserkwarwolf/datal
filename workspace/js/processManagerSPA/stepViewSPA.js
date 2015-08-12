var StepViewSPA = function(options) {
	this.inheritedEvents = [];

	Backbone.Epoxy.View.call(this, options);
}

_.extend(StepViewSPA.prototype, Backbone.Epoxy.View.prototype, {
		
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

	// Step functions

	init: function(){
		this.$el.addClass('process_manager_step');
		this.$el.hide();
		this.render();
		return this;
	},

	render: function(){
		return this;
	},

	start: function(output){
		this.$el.show();
	},

	finish: function(){
		this.$el.hide();
	},

	next: function(){
		this.trigger('next');
	},

	previous: function(){
		this.trigger('previous');
	},

	// cancel: function(){},

	// restart: function(){},

});

StepViewSPA.extend = Backbone.Epoxy.View.extend;