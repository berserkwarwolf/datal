var UnpublishView = Backbone.View.extend({
	
	el: '#id_unpublishVisualization',
	
	events: {
		"click #id_unpublishResource": "unpublishVisualization",
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

	unpublishVisualization: function() {
		var self = this;
    _.each(this.options.models, function(model) {
        resource = model.get('title');
        model.unpublish({
            
            beforeSend: function(xhr, settings){
                // Prevent override of global beforeSend
                $.ajaxSettings.beforeSend(xhr, settings);
                // Show Loading
                $("#ajax_loading_overlay").show();
            },

            success: function(response, a) {
                $.gritter.add({
                    title: gettext('APP-OVERLAY-UNPUBLISH-DATASET-CONFIRM-TITLE'),
                    text:  resource + ": "+ gettext('APP-UNPUBLISH-DATASET-ACTION-TEXT'),
                    image: '/static/workspace/images/common/ic_validationOk32.png',
                    sticky: false,
                    time: 3500
                });
                self.closeOverlay();
                self.undelegateEvents();

                var location = window.location.href,
                    splitURL = location.split("/"),
                    cutURL = splitURL.slice(0, -1),
                    joinURL = cutURL.join("/");

                setTimeout(function () {
                    window.location = joinURL;
                }, 2000);
                
            },

            error: function() {
                $.gritter.add({
                    title: gettext('APP-OVERLAY-UNPUBLISH-DATASET-CONFIRM-TITLE'),
                    text: resource + ": "+  gettext('APP-UNPUBLISH-DATASET-ACTION-ERROR-TEXT'),
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

	unpublishRevision: function() {
		self = this;
		_.each(this.options.models, function(model) {

			var resource = model.get('title');

			model.remove_revision({
				
                beforeSend: function(xhr, settings){
                    // Prevent override of global beforeSend
                    $.ajaxSettings.beforeSend(xhr, settings);
                    // Show Loading
                    $("#ajax_loading_overlay").show();
                },

				success: function(response, a) {
					$.gritter.add({
						title: gettext('APP-OVERLAY-UNPUBLISH-DATASTREAM-CONFIRM-TITLE'),
						text: resource + ": " + gettext('APP-UNPUBLISH-DATASTREAM-REV-ACTION-TEXT'),
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
						title: gettext('APP-OVERLAY-UNPUBLISH-DATASTREAM-TITLE'),
						text: resource + ": " + gettext('APP-UNPUBLISH-DATASTREAM-REV-ACTION-ERROR-TEXT'),
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