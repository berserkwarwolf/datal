// SPA: single page application
var ProcessManagerViewSPA = Backbone.View.extend({

	steps: [],
	index: 0,

	events: {
		'click .section-title .buttons-bar a[data-step]': 'onNavigationButtonClicked',
	},

	initialize: function(){
		if(this.options.buttonsContainer){
			this.buttonsView = new ButtonsViewSPA(
		    {
		      el: this.options.buttonsContainer
		    });
		} else {
			this.buttonsView = false;
		}
		this.render();
	},

	render: function(){
		if(this.buttonsView){
			this.buttonsView.setSteps(this.steps);
			this.buttonsView.render();
		}
		return this;
	},

	register: function(view){
		this.steps.push(view);
		this.listenTo(view,'next',this.next);
		this.listenTo(view,'previous',this.previous);
		this.render();
	},

	previous: function(output){

		// Previous
		if(this.index > 0){
			this.steps[this.index].finish();
			this.index--;
			this.selectNavigationTab(this.index);
			this.steps[this.index].start( this.model.get('output') );

		// Go to first "Static" Step
		}else{
			window.location = this.model.get('startUrl');
		}

	},

	next: function(output){

		// Next
		if( this.index < (this.steps.length-1) ){
			this.model.set('output',output);
			this.steps[this.index].finish();
			this.index++;
			this.selectNavigationTab(this.index);
			this.steps[this.index].start( this.model.get('output') );

		// Save
		}else if( this.index == (this.steps.length-1) ){

			var newRevisionId = output.revision_id;

			if( !_.isUndefined(newRevisionId) ){
				var newURL = this.model.get('finishUrl') + newRevisionId;
				this.model.set('finishUrl',  newURL);	
			};

			this.finish();
		}

	},

	goTo: function(index){
		this.finish();
		this.index = index;
		this.start();
	},

	start: function(){
		this.$el.find('.process_manager_step').hide();
		this.steps[0].start();
	},

	finish: function(){
		window.location = this.model.get('finishUrl');
	},

	onNavigationButtonClicked: function(event){

		console.log('hola');
		
		var button = event.currentTarget,
			indexToGo = $(button).attr('data-step');

		if(indexToGo != this.index){
			this.goTo(indexToGo);
			this.selectNavigationTab(indexToGo);
		}
		
	},

	selectNavigationTab: function(index){
		$('.section-title .buttons-bar').attr( 'data-step', ( parseFloat(index)+1 ) );
	},

	// cancel: function(){},

});