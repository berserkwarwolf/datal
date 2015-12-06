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

var CreationProcessManager = ProcessManager.extend({
	defaults : {
		is_update : false,
		is_update_selection : false,
		typeCollect : '',
		tableType : '',
		$SelectedTable : null,
		endPoint : '',
		implType : '',
		implDetails : '',
		bucketName: '',
		dataSource : '',
		dataSourceXML : '',
		selectStatementXML : '',
		rdfTemplate : '',
		paramQueryString : '',
		paramPreviewQueryString : '',
		tagsQueryString : '',
		serviceQueryString : '',
		operationQueryString : '',
		metaData : '',
		sourceQueryString : '',
		tableKeys : [],
		suggestionOn : false,
		headers : [],
		totalsCols : [],
		mavgCols : [],
		mavgPeriod : 0,
		avgCols : [],
		sumCols : [],
		aliases : []
	},
	initialize : function(){
		_.defaults(this.attributes, ProcessManager.prototype.defaults);
		ProcessManager.prototype.initialize.call(this);
	},
	init : function(){
		this.attributes.typeCollect = $('#id_type_collect').val();
		this.attributes.endPoint = $('#id_end_point').val();
		
		ProcessManager.prototype.init.call(this);
		
		this.attributes.implType = $('#id_impl_type').val();
		this.attributes.implDetails = $('#id_impl_details').val();
		this.attributes.bucketName = $('#id_bucket_name').val();
		
		this.attributes.is_update_selection = $('#id_is_edit_selection').val() == 'False' ? false : true;
		this.attributes.is_update = $('#id_is_update').val() == 'False' ? false : true;
		
		if(this.attributes.is_update_selection){
			this.attributes.dataSourceXML = $('#id_data_source').val();
			this.attributes.selectStatementXML = $('#id_select_statement').val();
			this.attributes.rdfTemplate = $('#id_rdf_template').val() || "";
		}
		
		this.start();
	},
	goToPrevStep: function(){
		var lIndex = this.attributes.index;
		var new_index = lIndex + 1;
		//$('#id_steps_navbar').removeClass('stepsNavbar' + new_index).addClass('stepsNavbar' + lIndex);
		$('#id_steps_navbar').attr('data-step', (new_index-2) );
		ProcessManager.prototype.goToPrevStep.call(this);
	},
	goToNextStep: function(){
		var lIndex = this.attributes.index + 1;
		var new_index = lIndex + 1;
		//$('#id_steps_navbar').removeClass('stepsNavbar' + lIndex ).addClass('stepsNavbar' + new_index);
		$('#id_steps_navbar').attr('data-step', (new_index-1) );
		ProcessManager.prototype.goToNextStep.call(this);
	},
	goToStep : function(pIndex){
		var lIndex = this.attributes.index + 1;
		var new_index = pIndex + 1;
		// $('#id_steps_navbar').removeClass('stepsNavbar' + lIndex).addClass('stepsNavbar' + new_index);
		$('#id_steps_navbar').attr('data-step', (new_index-1) );
		ProcessManager.prototype.goToStep.call(this, pIndex);
	}
});