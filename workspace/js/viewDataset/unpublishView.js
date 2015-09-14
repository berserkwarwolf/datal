var UnpublishView = Backbone.View.extend({

	el: '#id_unpublishDataset',

	parentView: null,

	events: {
		"click #id_unpublishResource": "unpublishDataset",
		"click #id_unpublishRevision": "unpublishRevision"
	},

	initialize: function(options) {

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

		// Set Parent View
		this.parentView = this.options.parentView;
		
		// Render
		this.render();
	},

	render: function(){
		this.$el.data('overlay').load();
	},

	unpublishDataset: function() {
		this.closeOverlay();
		this.undelegateEvents();

		var affectedResourcesCollection = new AffectedResourcesCollection();
		var affectedResourcesCollectionUnpublishView = new AffectedResourcesCollectionUnpublishView({
			collection: affectedResourcesCollection,
			itemCollection: this.options.itemCollection,
			models: this.options.models,
			type: this.options.type,
			parentView: this.parentView
		});

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