var UnpublishView = Backbone.View.extend({
	
	el: '#id_unpublishDataview',

	parentView: null,
	
	events: {
		"click #id_unpublishResource": "unpublishDataview",
		"click #id_unpublishRevision": "unpublishRevision"
	},

	initialize: function(options) {

		this.parentView = this.options.parentView;

		// init Overlay
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
		
		// Render
		this.render();

	},

	render: function(){
		this.$el.data('overlay').load();
	},

	unpublishDataview: function() {

		var affectedResourcesCollection = new AffectedResourcesCollection();
		var affectedResourcesCollectionUnpublishView = new AffectedResourcesCollectionUnpublishView({
			collection: affectedResourcesCollection,
			models: this.options.models,
			type: this.options.type,
			parentView: this.parentView
		});

		this.closeOverlay();
		this.undelegateEvents();
		
	},

	unpublishRevision: function(event) {
		this.parentView.changeStatus(event, false);

		this.closeOverlay();
		this.undelegateEvents();
	}, 

	closeOverlay: function() {
		$("#ajax_loading_overlay").hide();
		this.$el.data('overlay').close();
	}

});