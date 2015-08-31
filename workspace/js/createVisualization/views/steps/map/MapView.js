var MapView = StepViewSPA.extend({
	
	initialize: function(){

		// Right way to extend events without overriding the parent ones
		this.addEvents({
	
			'click a.backButton': 			'onPreviousButtonClicked',
			'click a.nextButton': 			'onNextButtonClicked',
			'click button.selectData': 		'onSelectDataClicked',
			'click .chartType': 		'onChartTypeClicked',
			
			'keyup input#chartTitle': 		'onInputChanged'
		
		});

        this.modalView = new MapSelectDataModalView({
          el: '#MapSelectDataModal',
          model: this.model
        });
        this.modalView.on('open', function () {
            this.dataTableView.render();
        });

	}, 

	onSelectDataClicked: function(){
		this.modalView.open();
	},

	onInputChanged: function(e){
		var input = $(e.target);
		this.model.set(input.data('ref'),input.val());
	},

	onChartTypeClicked: function(e){
		e.preventDefault();
		var type = $(e.currentTarget).data('type');
		this.selectGraphType(type);
	},

	selectGraphType: function(type){
		this.$('.chartType').removeClass('active');
		this.$('[data-type="' + type + '"].chartType').addClass('active');
		this.model.set('type',type);
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