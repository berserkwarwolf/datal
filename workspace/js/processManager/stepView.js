var StepView = function(options) {
	this.inheritedEvents = [];

	Backbone.Epoxy.View.call(this, options);
}

_.extend(StepView.prototype, Backbone.Epoxy.View.prototype, {
		
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

	initialize: function(){
		this.render();
	},

	render: function(){
		return this;
	},

	start: function(output){
		this.model.set('output',output);
		this.$el.show();
	},

	finish: function(){
		this.$el.hide();
	},

	next: function(){
		this.trigger('next',this.model.get('output'));
	},

	previous: function(){
		this.trigger('previous',this.model.get('output'));
	},

	// cancel: function(){},

	// restart: function(){},

});

StepView.extend = Backbone.Epoxy.View.extend;