var ProcessManager = Backbone.Model.extend({
	defaults : {
		index : 0,
		steps : []
	},
	initialize : function(){
		
	},
	init : function(){
		var lStep 		= null;
		var lStepSize 	= this.attributes.steps.length;
		
		for(var i = 0; i < lStepSize; i++){
			lStep = this.attributes.steps[i];
			lStep.init();
		}
	},
	start : function(){
		var lStep = this.attributes.steps[0];
		lStep.start();
	},
	register : function(pStep){
		this.attributes.steps.push(pStep);
	},
	goToNextStep : function(){
		var att 		= this.attributes;
		var lIndex 		= att.index + 1;
		var lTargetStep = att.steps[lIndex];
		var lActiveStep	= att.steps[att.index];

		lActiveStep.stop();
		lTargetStep.start();

		att.index = lIndex;
	},
	goToPrevStep : function(){
		var att 		= this.attributes;
		var lIndex 		= att.index - 1;
		var lTargetStep = att.steps[lIndex];
		var lActiveStep	= att.steps[att.index];

		lActiveStep.stop();

		if(lTargetStep.attributes.reset){
			this.resetSteps(lIndex);
			lTargetStep.restart();
		}else{
			lTargetStep.attributes.$Container.show();
		}

		att.index = lIndex;
	},
	goToStep : function(pIndex){
		var att 		= this.attributes;
		var lActiveStep = att.steps[att.index];
		var lTargetStep = null;

		lActiveStep.stop();

		for (var i = att.index; i >= pIndex; i--) {
			lTargetStep = att.steps[i];
			if (lTargetStep.attributes.reset) {
				this.resetSteps(i);
				lTargetStep.reset();
			}
		}

		if(att.steps[pIndex].attributes.reset){
			att.steps[pIndex].restart();
		}else{
			att.steps[pIndex].start();
		}

		att.index = pIndex;
	},
	resetSteps : function(pIndex){
		var att 		= this.attributes;
		var lTargetStep = null;
		var lInitValue 	= att.steps.length - 1;
		
		for (var i = lInitValue; i > pIndex; i--) {
			lTargetStep = att.steps[i];
			lTargetStep.reset();
		}
	}
});