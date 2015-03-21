var CollectWebserviceParamView = Backbone.View.extend({

	className: "param",

  template: null,

  events: {
  	'click .remove': 'removeParam'
  },

  initialize: function(){
  	this.template = _.template( $("#id_CollectWebserviceParamTemplate").html() );
  	this.render();
  },

  render: function(){
    this.$el.html( this.template( this.model.toJSON() ) );
    return this;
  },

  removeParam: function(event){
  	// Remove from DOM
  	$(event.currentTarget).parents('.param').remove();

  	// Remove from colelction
    this.model.collection.remove( this.model.collection.get( this.model.cid ) );
  }

});