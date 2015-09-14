var datasetView = Backbone.Epoxy.View.extend({

	el: '.main-section',
	deleteListResources: null,

	template: null,

	events: {
		'click #id_delete': 'onDeleteButtonClicked',
		'click #id_approve, #id_reject, #id_publish, #id_sendToReview': 'changeStatus',
		'click #id_unpublish': 'onUnpublishButtonClicked'
	},

	initialize: function(){
		this.template = _.template( $("#context-menu-template").html() );
		this.listenTo(this.model, "change:status", this.render);
		this.render();
	},

	render: function() {
		this.$el.find('.context-menu').html( this.template( this.model.toJSON() ) );
		this.setContentHeight();
		return this;
	},

	setContentHeight: function(){

		var self = this;

		$(document).ready(function(){

			var otherHeights = 0;

			self.setHeights( '.resources-table', otherHeights );

		});

	},

	setHeights: function(theContainer, theHeight){

		if(typeof theHeight == 'undefined'){
			theHeight = 0;
		}

		var heightContainer = String(theContainer),
			tabsHeight = parseFloat( $('.main-navigation').height() ),
			otherHeight = theHeight,
			minHeight = tabsHeight - otherHeight;

		$(window).resize(function(){

			var windowHeight;
			if( $(window).height() < 600){
			// Set window height minimum value to 600
				windowHeight = 600;
			}else{
				windowHeight = $(window).height();
			}

			var sectionContentHeight =
			windowHeight
			- parseFloat( otherHeight )
			- $('.header').height()
			- $('.main-section .section-title').height()
			- parseFloat( $('.main-section .section-content').css('padding-top').split('px')[0] )
			- parseInt($('.main-section .section-content .detail').css('padding-top').split('px')[0])
			- parseInt($('.main-section .section-content .detail').css('padding-bottom').split('px')[0])
			- 20; // to set some space at the bottom

			$(heightContainer).css('height', sectionContentHeight+'px');

		}).resize();

	}, 

	onDeleteButtonClicked: function(){
		this.deleteListResources = new Array();
		this.deleteListResources.push(this.options.model);
		var deleteItemView = new DeleteItemView({
				models: this.deleteListResources,
				type: "datastreams"
		});
	},

	onUnpublishButtonClicked: function(){
		this.unpublishListResources = new Array();
		this.unpublishListResources.push(this.options.model);
		var unpublishView = new UnpublishView({
				models: this.unpublishListResources,
				type: "datastreams",
				parentView: this
		});
	},

	changeStatus: function(event, killemall){
		
		var action = $(event.currentTarget).attr('data-action'),
			data = {'action': action},
			url = this.model.get('changeStatusUrl'),
			self = this;

		if(action == 'unpublish'){
			if( killemall == true ){
				data.killemall = true;
			}else{
				data.killemall = false;
			}
		}

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

				if(response.status == 'ok'){
					
					// Set Status
					self.model.set('status_str',STATUS_CHOICES( response.dataset_status ));
					self.model.set('status',response.dataset_status);

					// Update Heights
					setTimeout(function(){
						self.setContentHeight();
					}, 0);

					// Set OK Message
					$.gritter.add({
						title: response.messages.title,
						text: response.messages.description,
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

	}

});