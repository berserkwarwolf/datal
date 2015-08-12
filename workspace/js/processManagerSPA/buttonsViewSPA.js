var ButtonsViewSPA = function(options) {
	Backbone.Epoxy.View.call(this, options);
}

_.extend(ButtonsViewSPA.prototype, Backbone.Epoxy.View.prototype, {
		
	// Extend functions

	baseEvents: {},

	renderSteps: [],

	events: function() {
	},

	initialize: function(){
		//this.$el = $(this.el);

      	this.template = _.template( $('#id_buttons_render_PM').html() );
	},

	render: function(){
		this.$el.html( this.template({steps:this.renderSteps}) );
		return this;
	},

	setSteps: function(steps){
		if(steps.length){
			this.steps = steps;
			this.renderSteps = [];
			var self = this;
			_.each(steps,function(step,i){
				self.renderSteps.push({ix:i, name:step.options.name, el: step.options.el});
			});
		}
	},

	start: function(output){
	},

	finish: function(){
	},

	next: function(){
	},

	previous: function(){
	}

});

ButtonsViewSPA.extend = Backbone.Epoxy.View.extend;