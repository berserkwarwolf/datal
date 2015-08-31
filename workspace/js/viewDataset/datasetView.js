var datasetView = Backbone.Epoxy.View.extend({

	el: '.main-section',
	deleteListResources: null,

	template: null,

	events: {
		'click #id_delete': 'onDeleteButtonClicked',
		'click #id_approve, #id_reject, #id_publish, #id_sendToReview, #id_unpublish': 'changeStatus',
	},

	initialize: function(){
		this.template = _.template( $("#context-menu-template").html() );
		this.listenTo(this.model, "change:status", this.render);
		this.render();
	},

	render: function() {
		this.$el.find('.context-menu').html( this.template( this.model.toJSON() ) );
		return this;
	},

	onDeleteButtonClicked: function(){
		self = this;
		this.deleteListResources = new Array();
		this.deleteListResources.push(this.options.model);
		var deleteItemView = new DeleteItemView({
				models: this.deleteListResources,
				type: "datastreams",
				parentView: this.parentView
		});
	},

	changeStatus: function(event){
		
		var action = $(event.currentTarget).attr('data-action'),
			data = {'action': action},
			url = this.model.get('changeStatusUrl'),
			self = this;

		$.ajax({
			url: url,
			type: 'POST',
			data: data,
			dataType: 'json',
			beforeSend: function(xhr, settings){
				// Prevent override of global beforeSend
				$.ajaxSettings.beforeSend(xhr, settings);
				// Show Loading
				$("#ajax_loading_overlay").show();
			},
			success: function(response){

				console.log(response);

				if(response.status == 'ok'){
					
					// Set Status
					self.model.set('status_str',STATUS_CHOICES( response.dataset_status ));
					self.model.set('status',response.dataset_status);

					// Set OK Message
					$.gritter.add({
						title: gettext('APP-SETTINGS-SAVE-OK-TITLE'),
						text: response.messages,
						image: '/static/workspace/images/common/ic_validationOk32.png',
						sticky: false,
						time: 2500
					});

				}else{

					datalEvents.trigger('datal:application-error', response);

				}

			},
			error:function(response){

				datalEvents.trigger('datal:application-error', response);

			},
			complete:function(response){
				// Hide Loading
				$("#ajax_loading_overlay").hide();
			}
		});

	},

});