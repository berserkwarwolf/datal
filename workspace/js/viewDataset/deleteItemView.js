var DeleteItemView = Backbone.View.extend({

	el: '#id_deleteDataset',

	parentView: null,

	events: {
		"click #id_deleteResource": "deleteDataset",
		"click #id_deleteRevision": "deleteRevision"
	},

	initialize: function(options) {

		// this.parentView = this.options.parentView;

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

	deleteDataset: function() {
		var affectedResourcesCollection = new AffectedResourcesCollection();
		var affectedResourcesCollectionView = new AffectedResourcesCollectionView({
			collection: affectedResourcesCollection,
			itemCollection: this.options.itemCollection,
			models: this.options.models,
			type: this.options.type
		});
		this.closeOverlay();
		this.undelegateEvents();
	},

	deleteRevision: function() {
		self = this;
		_.each(this.options.models, function(model) {
			
			var resource = model.get('title');

			model.remove_revision({

				success: function() {
					$.gritter.add({
						title: gettext('APP-OVERLAY-DELETE-DATASET-CONFIRM-TITLE'),
						text: resource + ": " + gettext('APP-DELETE-DATASET-ACTION-TEXT'),
						image: '/static/workspace/images/common/ic_validationOk32.png',
						sticky: false,
						time: 3500
					});
					self.closeOverlay();
					self.undelegateEvents();
				},

				error: function() {
					$.gritter.add({
						title: gettext('APP-OVERLAY-DELETE-DATASET-CONFIRM-TITLE'),
						text: resource + ": " + gettext('APP-DELETE-DATASET-ACTION-ERROR-TEXT'),
						image: '/static/workspace/images/common/ic_validationError32.png',
						sticky: true,
						time: 2500
					});
					self.closeOverlay();
					self.undelegateEvents();
				}

			});

		});
	},

	closeOverlay: function() {
		this.$el.data('overlay').close();
	}
});