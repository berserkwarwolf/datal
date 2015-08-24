var MapView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
		this.addEvents({
	
			'click a.backButton': 			'onPreviousButtonClicked',
			'click a.nextButton': 			'onNextButtonClicked',
			'click button.selectData': 		'onSelectDataClicked',
			
			'keyup input#chartTitle': 		'onInputChanged'
		
		});

		// Bind model validation to view
		//Backbone.Validation.bind(this);

/*		this.listenTo(this.model.data, 'change:markers', this.onChangeData, this);
		this.listenTo(this.model, 'change:lib', this.onChartChanged, this);
		this.listenTo(this.model, 'change:type', this.onChartChanged, this);*/

	}, 

	onSelectDataClicked: function(){
		this.openModal('mapSelectDataModal');
	},

	onInputChanged: function(e){
		var input = $(e.target);
		this.model.set(input.data('ref'),input.val());
	},

	onMapChanged: function(){
		if(this.model.get('isMap')){
			console.log('you selected type: ', this.model.get('type') );
			this.setupMap();
			this.renderMap();
		}
	},

	setupMap: function(){

		console.log('setupMap');
	},

	renderMap: function () {
	
		console.log('renderMap');
	},

	onPreviousButtonClicked: function(){
		this.goTo(0);
	},

	onNextButtonClicked: function(){		
		this.next();
	},

	start: function(){
		this.constructor.__super__.start.apply(this);
	}


});