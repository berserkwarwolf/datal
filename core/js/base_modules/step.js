var Step = Backbone.Model.extend({
	defaults : {
		stepStarted : false,
		reset : false,
		$Container : null,
		$NextButton : null,
		$PreviousButton : null
	},
	initialize : function(){
		
	}, 
	init : function(){
	
	},
	start : function(){
		this.attributes.$Container.show();
		this.attributes.stepStarted = true;
	},
	stop : function(){
		this.attributes.$Container.hide();
	},
	onPrevStepButtonClicked : function(){
		CreationManager.goToPrevStep();
	},
	onNextStepButtonClicked : function(){
		CreationManager.goToNextStep();
	},
	restart : function(){
		this.reset();
		this.start();
	},
	reset : function(){
		this.attributes.stepStarted = false;
	}
}); 