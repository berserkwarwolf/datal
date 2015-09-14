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
		
		// Render
		this.render();
	},

	render: function(){
		this.$el.data('overlay').load();
	},

	unpublishDataset: function() {
		var affectedResourcesCollection = new AffectedResourcesCollection();
		var affectedResourcesCollectionUnpublishView = new AffectedResourcesCollectionUnpublishView({
			collection: affectedResourcesCollection,
			itemCollection: this.options.itemCollection,
			models: this.options.models,
			type: this.options.type
		});
		this.closeOverlay();
		this.undelegateEvents();
	},

	unpublishRevision: function() {
		self = this;
		_.each(this.options.models, function(model) {
			
			var resource = model.get('title');

			model.unpublish_revision({
				
                beforeSend: function(xhr, settings){
                    // Prevent override of global beforeSend
                    $.ajaxSettings.beforeSend(xhr, settings);
                    // Show Loading
                    $("#ajax_loading_overlay").show();
                },

				success: function(response, a) {
					$.gritter.add({
						title: gettext('APP-OVERLAY-UNPUBLISH-DATASET-CONFIRM-TITLE'),
						text: resource + ": " + gettext('APP-UNPUBLISH-DATASET-REV-ACTION-TEXT'),
						image: '/static/workspace/images/common/ic_validationOk32.png',
						sticky: false,
						time: 3500
					});
					self.closeOverlay();
					self.undelegateEvents();

                    var unpublishRevisionID = a['revision_id'],
                        location = window.location.href,
                        splitURL = location.split("/"),
                        cutURL = splitURL.slice(0, -1),
                        joinURL = cutURL.join("/");

                    if(unpublishRevisionID == -1){
                        setURL = joinURL;
                    }else{
                        setURL = joinURL + "/" + unpublishRevisionID;
                    }

                    setTimeout(function () {
                           window.location = setURL;
                    }, 2000);
				},

				error: function() {
					$.gritter.add({
						title: gettext('APP-OVERLAY-UNPUBLISH-DATASET-CONFIRM-TITLE'),
						text: resource + ": " + gettext('APP-UNPUBLISH-DATASET-REV-ACTION-ERROR-TEXT'),
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
		$("#ajax_loading_overlay").hide();
		this.$el.data('overlay').close();
	}
});