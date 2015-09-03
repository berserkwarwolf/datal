var ButtonsView = Backbone.View.extend({

	renderSteps: [],

	events: {
		'click a[data-step]': 'onNavigationButtonClicked'
	},

	initialize: function(){
      	this.template = _.template( $('#id_buttons_render_PM').html() );
	},

	render: function(){
		this.$el.html( this.template({steps:this.renderSteps}) );
		return this;
	},

	setSteps: function(steps){
		if(steps && steps.length){
			this.steps = steps;
			this.renderSteps = [];
			var self = this;
			_.each(steps,function(step,i){
				self.renderSteps.push({ix:i, name:step.options.name, el: step.options.el});
			});
		} else {
			this.renderSteps = [];
		}
	},

	onNavigationButtonClicked: function(event){
		var $target = $(event.currentTarget),
			step = $target.attr('data-step');
		this.trigger('goTo', step);
		this.$('.buttons-bar').attr( 'data-step', ( parseFloat(step)+1 ) );
	}

});
