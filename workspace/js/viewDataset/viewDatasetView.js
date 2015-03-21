var ViewDatasetView = Backbone.Epoxy.View.extend({

	el: '.main-section',

	events: {
		'click #id_delete': 'onDeleteButtonClicked',
		'click #id_approve, #id_reject': 'review',
	},

	bindings: {
		'#id_status': 'text:status',
	},

	initialize: function(){
		this.render();
	},

	render: function(){
		this.setSidebarHeight();
		this.setContentHeight();
		return this;
	},

	setSidebarHeight: function(){

		var self = this;

		$(document).ready(function(){

			var otherHeights = 0;
			self.setHeights( '.sidebar-container .box', otherHeights );

		});

	},

	setContentHeight: function(){

		var self = this;

		$(document).ready(function(){

			var otherHeights = 
			parseFloat( $('.detail-container header').height() )
			+ parseFloat( $('.detail-container header').css('padding-top').split('px')[0] )
			+ parseFloat( $('.detail-container header').css('padding-bottom').split('px')[0] )
			+ parseFloat( $('.detail-container header').css('border-bottom-width').split('px')[0] )
			+ 2;// Fix to perfection;

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

		$(heightContainer).css('min-height', minHeight+ 'px');

		$(window).resize(function(){

			var windowHeight;
			if( $(window).height() < 600){
			// Set window height minimum value to 600
				windowHeight = 600;
			}else{
				windowHeight = $(window).height();
			}

			var alertHeight = 0;
			if($('.section-content .alert').length > 0){
				if($('.section-content .alert').css('display') != 'none'){
					alertHeight =
						parseFloat( $('.section-content .alert').height() )
						+ parseFloat( $('.section-content .alert').css('padding-top').split('px')[0] )
						+ parseFloat( $('.section-content .alert').css('padding-bottom').split('px')[0] )
						+ parseFloat( $('.section-content .alert').css('margin-bottom').split('px')[0] );
				}
			}

			var sectionContentHeight =
			windowHeight
			- parseFloat( otherHeight )
			- ( alertHeight )
			- $('.header').height()
			- parseInt($('.header').css('border-top-width').split('px')[0])
			- parseInt($('.header').css('border-bottom-width').split('px')[0])
			- $('.main-section .section-title').height()
			- parseInt($('.main-section .section-content').css('padding-top').split('px')[0])
			- parseInt($('.main-section .section-content').css('padding-bottom').split('px')[0])
			- $('.footer').height()
			- 3; // 3 rounds up the number, don't know why.

			$(heightContainer).css('height', sectionContentHeight+'px');

		}).resize();

	}, 

	onDeleteButtonClicked: function(){
		console.log('delete');
	},

	review: function(event){
		
		var action = $(event.currentTarget).attr('data-action'),
			data = {'action': action},
			url = this.model.get('reviewURL'),
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

				if(response.status == 'ok'){
					
					// Set Status
					self.model.set('status',response.dataset_status)

					// Hide Review Bar
					self.$el.find('#id_reviewBar').hide();

					// Update Heights
					setTimeout(function(){
						self.setSidebarHeight();
						self.setContentHeight();
					}, 0);

					// Set OK Message
					$.gritter.add({
						title: gettext('APP-SETTINGS-SAVE-OK-TITLE'),
						text: response.messages,
						image: '/media_workspace/images/common/ic_validationOk32.png',
						sticky: false,
						time: 2500
					});

				}else{

					// Set Error Message
					$.gritter.add({
						title: gettext('ADMIN-HOME-SECTION-ERROR-TITLE'),
						text: response.messages,
						image: '/media_workspace/images/common/ic_validationError32.png',
						sticky: true,
						time: ''
					});

				}

			},
			error:function(response){
				// Set Error Message
				$.gritter.add({
					title: gettext('ADMIN-HOME-SECTION-ERROR-TITLE'),
					text: gettext('ADMIN-HOME-SECTION-ERROR-TEXT'),
					image: '/media_workspace/images/common/ic_validationError32.png',
					sticky: true,
					time: ''
				});
			},
			complete:function(response){
				// Hide Loading
				$("#ajax_loading_overlay").hide();
			}
		});

	},

});