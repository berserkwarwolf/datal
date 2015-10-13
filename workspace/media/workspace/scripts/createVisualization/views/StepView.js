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

	initialize: function (options) {
		this.name = options.name;
		console.log('other options', options);
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

	goTo: function(index){
		this.trigger('goTo',index);
	},

	next: function(){
		this.trigger('next');
	},

	previous: function(){
		this.trigger('previous');
	},

	openModal: function(id){
		this.trigger('openModal', id);
	},

	setFlow: function(id){
		this.trigger('setFlow', id);
	},
	// cancel: function(){},

	// restart: function(){},

});

StepViewSPA.extend = Backbone.Epoxy.View.extend;