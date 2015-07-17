var ViewDataStreamView = Backbone.Epoxy.View.extend({

	el: '.main-section',

	theDataTable: null,
		listResources: null,
		sourceUrl: null,
		tagUrl: null,
		datastreamEditItemModel: null,

	events: {
		'click #id_delete': 'onDeleteButtonClicked',
		'click #id_approve, #id_reject': 'review',
		"click #id_addNewButton": "onAddNewButtonClicked",
		"click #id_edit": "onEditButtonClicked",
	},

	bindings: {
		'#id_status': 'text:status',
	},

	initialize: function(){
		this.theDataTable = new dataTableView({model: new dataTable(), dataStream: this.model, parentView: this});
		this.render();

		this.sourceUrl = this.options.sourceUrl;
		this.tagUrl = this.options.tagUrl;
		this.datastreamEditItemModel = this.options.datastreamEditItemModel;

		// Init Filters
		this.initFilters();
	},

	render: function(){
		this.setSidebarHeight();
		return this;
	},

	setSidebarHeight: function(){

		var self = this;

		$(document).ready(function(){

			var otherHeights = 0;
			self.setHeights( '.sidebar-container .box', otherHeights );

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
				- parseFloat( otherHeight	)
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
					self.model.set('status',response.datastream_status)

					// Hide Review Bar
					self.$el.find('#id_reviewBar').hide();

					// Show hidden buttons
					self.$el.find('#id_edit').show();
					self.$el.find('#id_delete').show();

					// Update overlay Edit status
					// self.options.datastreamEditItemModel.set('status',response.datastream_status_id);

					// Update Heights
					setTimeout(function(){
						self.updateHeights();
					}, 0);

					// Set OK Message
					$.gritter.add({
						title: gettext('APP-SETTINGS-SAVE-OK-TITLE'),
						text: response.messages,
						image: '/static/workspace/images/common/ic_validationOk32.png',
						sticky: false,
						time: 2500
					});

				}else{

					// Set Error Message
					$.gritter.add({
						title: gettext('ADMIN-HOME-SECTION-ERROR-TITLE'),
						text: response.messages,
						image: '/static/workspace/images/common/ic_validationError32.png',
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
					image: '/static/workspace/images/common/ic_validationError32.png',
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

	updateHeights: function(){
			
		// Update Sidebar Height
		this.setSidebarHeight();

		// Update Table Height
		if(this.theDataTable.model.attributes.result.fType == 'ARRAY'){
			if( $('.flexigrid').length == 0 ){
				var self = this;
				setTimeout(function(){
					self.updateHeights();
				}, 1000);
			}else{
				this.theDataTable.setFlexigridHeight();
			}
		}else{
			this.theDataTable.setTableHeight();
		}

		// Update Loading Height
		this.theDataTable.setLoadingHeight();

	},

	onEditButtonClicked: function(event){
		new DatastreamEditItemView({
			model: this.datastreamEditItemModel,
			parentView: this
		});
		},

	initFilters: function(){

		// Init Backbone PageableCollection
		this.listResources = new ListResources({
			filters: this.filters
		});

	},

	onAddNewButtonClicked: function() {
		var manageDatasetsOverlayView = new ManageDatasetsOverlayView({
			dataViewCreationStepsUrl: this.options.dataViewCreationStepsUrl,
		});
		},

	onDeleteButtonClicked: function(){
		self = this;
		this.deleteListResources = new Array();
		this.deleteListResources.push(this.options.model);
		var deleteItemView = new DeleteItemView({
			models: this.deleteListResources,
			type: "visualizations",
			parentView: this.parentView
		});
	},

});