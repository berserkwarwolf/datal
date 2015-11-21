var changeDataStreamParametersView = Backbone.View.extend({

	el: '#id_paramContainer',

	template: null,

	events:{
		'change input[name^="param"]': 'onParamChanged',
		'click #id_paramAcceptButton': 'onAcceptButtonClicked',
		'click #id_paramCancelButton': 'onCancelButtonClicked',
	},

	initialize: function(options) {
		this.dataStream = options.dataStream;

		this.listenTo(this.model, "invalid", this.onValidationErrors);

    this.$el.overlay({
    	top: 'center',
    	left: 'center',
    	mask: {
        color: '#000',
        loadSpeed: 200,
        opacity: 0.5,
        zIndex: 99999
   		}
    });

    this.$el.data('overlay').load();

	},

	render: function() {
	  return this;
	},

	onValidationErrors: function(){

	},

	onParamChanged: function(event){
		var param 	= event.currentTarget;
		var name 	= $.trim(param.name);
		var index 	= parseInt(name.slice(name.length-1));

		this.model.set("parameter" + index, $(param).val());
	},

	onAcceptButtonClicked:function(){
		this.dataStream.setArguments(this.model.attributes);
		this.$el.data('overlay').close();
	},

	onCancelButtonClicked:function(){
		this.$el.data('overlay').close();
	}

});