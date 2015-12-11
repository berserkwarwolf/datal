var viewVisualizationView = function(options) {
	this.inheritedEvents = [];

	Backbone.View.call(this, options);
}

_.extend(viewVisualizationView.prototype, Backbone.View.prototype, {
		
	// Extend functions

	baseEvents: {

		// Add View Visualization events as Base Events
		//'click #id_exportToXLSButton, #id_exportToCSVButton': 'setWaitingMessage',
		//'click #id_permalink, #id_GUID': 'onInputClicked',



		// Add View Visualization events as Base Events
		'click #id_embedButton' : 'onEmbedButtonClicked',
		'click #id_openInfoButton, #id_openAPIButton, #id_openNotesButton' : 'onOpenSidebarButtonClicked',
		'click #id_openNotesLink': 'onViewMoreDescriptionLinkClicked',
		'click #id_closeInfoButton, #id_closeAPIButton, #id_closeNotesButton': 'onCloseSidebarButtonClicked',
		'click #id_exportToXLSButton, #id_exportToCSVButton, #id_exportButton' : 'onExportButtonClicked',
		'click #id_permalink, #id_GUID' : 'onInputClicked',
		'click #id_downloadLink, #id_exportToXLSButton, #id_exportToCSVButton' : 'setWaitingMessage',
		'click #id_refreshButton, #id_retryButton' : 'onRefreshButtonClicked',



	},

	events: function() {
		var e = _.extend({}, this.baseEvents);

		_.each(this.inheritedEvents, function(events) {
			e = _.extend(e, events);
		});

		return e;
	},

	addEvents: function(eventObj) {
		this.inheritedEvents.push(eventObj);
		this.delegateEvents();
	},

	// viewVisualizationView functions










//     el : "body",
//     chartContainer: "#id_visualizationResult",

//     initialize : function() {

//         this.$window = $(window);

//         // init Sidebars
//         this.initSidebarTabs();
//         this.initInfoSidebar();

//         this.chartView = new ChartView({
//             el: '#id_visualizationResult',
//             model: this.model
//         });

//         this.render();
//         this.bindEvents();
//         this.handleResizeEnd();
//     },
//     /**
//      * Amarra eventos de la vista principal
//      */
//     bindEvents: function () {
//         var self = this;

//         this.$window.on('resize', function () {
//             if(this.resizeTo) clearTimeout(this.resizeTo);
//             this.resizeTO = setTimeout(function() {
//                 self.handleResizeEnd.call(self);
//             }, 500);
//         });
//     },
//     /**
//      * Inicializa la barra lateral con los tabs
//      */
//     initSidebarTabs: function () {
//         this.$tabIcons = $('.tabs .icons');
//         this.$columnsContainer = $('#id_columns');
//         this.$sidebarContainer = this.$columnsContainer.find('.sidebar');
//         this.bindSidebarEvents();
//     },
//     /**
//      * Amarra los eventos del sidebar
//      */
//     bindSidebarEvents: function () {
//         var self = this;
//         this.$sidebarContainer.on('transitionend webkitTransitionEnd', function (e) {
//             self.handleResizeEnd.call(self);
//         });
//         this.$sidebarContainer.find('a.close').on('click', function (e) {
//             self.hideSidebar.call(self, '');
//             e.preventDefault();
//         });
//         this.$tabIcons.on('click', 'a.icon', function (e) {
//             e.preventDefault();
//             self.handleSidebarClick.call(self, $(this));
//         });
//     },
//     /**
//      * Maneja el evento click del sidebar
//      * @param  {object} $tab
//      */
//     handleSidebarClick: function ($tab) {
//         var sidebarContentId = $tab.attr('rel');

//         if($tab.hasClass('refresh'))
//             return this.handleViewRefresh();

//         if($tab.hasClass('embed'))
//             return this.showEmbedModal();

//         if($tab.hasClass('active')){
//             $tab.removeClass('active');
//             if(sidebarContentId)
//                 this.hideSidebar(sidebarContentId);
//         } else {
//             this.$tabIcons.find('.active').removeClass('active');
//             $tab.addClass('active');
//             if(sidebarContentId)
//                 this.showSidebar(sidebarContentId);
//         }
//     },
//     /**
//      * Abre la ventana modal con el codigo para embedir la visualizacion
//      */
//     showEmbedModal : function() {
//         new embedChartView({
//             model : new embedChart({
//                 title : this.model.get("title"),
//                 url : this.model.get("embedUrl")
//             }, {
//                 validate : true
//             })
//         });
//     },
//     /**
//      * Maneja recargas de la vista principal
//      */
//     handleViewRefresh: function () {
//         window.location.reload();
//     },
//     /**
//      * Maneja la accion de mostrar el sidebar del chart
//      * @param  {obejct} sidebarContentId
//      */
//     showSidebar: function (sidebarContentId) {
//         var $sidebarContent = $('#' + sidebarContentId);
//         //Esconde cualquier elemento visible dentro del sidebar
//         if(sidebarContentId.indexOf('tooltip') < 0){
//             this.$columnsContainer.find('.sidebar>div').hide();
//             this.$columnsContainer.addClass('showSidebar');
//         }
//         $sidebarContent.show();
//     },
//     /**
//      * Esconde el sidebar del chart
//      */
//     hideSidebar: function (sidebarContentId) {
//         //Se deben considerar los tooltips del sidebar
//         this.$tabIcons.find('.tooltip').hide();
//         if(sidebarContentId.indexOf('tooltip') < 0){
//             this.$columnsContainer.find('.sidebar>div').hide();
//             this.$columnsContainer.removeClass('showSidebar');
//         }
//     },
//     initInfoSidebar: function () {
//         // Permalink
//         this.permalinkHelper();

//         // Hits
//         new visualizationHitsView({model: new visualizationHits(), visualization: this.model});
//     },
//     permalinkHelper: function(){
//         // //var permalink = this.model.attributes.permaLink,
//         // // debería ir permalink?!?!?!
//         // var permalink = this.model.attributes.publicUrl,
//         // self = this;
//         // $('#id_permalink').val(permalink);

//         // if (typeof(BitlyClient) != 'undefined') {
//         //     BitlyClient.shorten( permalink, function(pData){

//         //         var response,
//         //           shortUrl;

//         //         for(var r in pData.results) {
//         //         response = pData.results[r];
//         //         break;
//         //         }

//         //         shortUrl = response['shortUrl'];

//         //         if(shortUrl){
//         //           self.model.attributes.shortUrl = shortUrl;
//         //           $('#id_permalink').val(shortUrl);
//         //         }

//         //     });

//         // }


//     },
//     onInputClicked: function(event) {

//         var input = event.currentTarget;
//         $(input).select();

//     },

//     initAPISidebar: function () {
		
//     },
//     initNotesSidebar: function () {
		
//     },
//     /**
//      * Muestra un elemento UI para indicar el estado de carga
//      */
//     setLoading: function () {
//         // TODO: Implementar loader
//     },
//     /**
//      * Maneja la acciones a realizar cuando se redimenciona la ventana
//      */
//     handleResizeEnd: function () {
//         var chartInstance = this.chartInstance,
//             overflowX =  'hidden',
//             overflowY =  'hidden',
//             $sidebarContainer = $('#id_columns .sidebar'),
//             $mainHeader = $('.brandingHeader'),
//             $chartHeader = $('.dataTable header');

//         //Calcula el alto de los headers
//         var otherHeights = $mainHeader.outerHeight(true) 
//                          + $chartHeader.outerHeight(true);

//         //Ajusta overflow si se está mostrando el sidebar
//         if(this.$columnsContainer.hasClass('showSidebar')){
//             overflowX = 'auto';
//         }

//         //Calcula el alto que deberá tener el contenedor del chart
//         var height = this.$window.height() - otherHeights - 70;
//         this.chartView.$el.css({
//             height: height + 'px',
//             maxHeight: height + 'px',
//             minHeight: height + 'px',
//             overflowX: overflowX,
//             overflowY: overflowY
//         });
//         this.$sidebarContainer.css({
//             height: height + 'px'
//         });
//         this.chartView.render();
//     },

//     setWaitingMessage: function(event){

//         var titleText;

//         titleText = gettext("VIEWDS-WAITMESSAGEEXPORT-TITLE");

//         $.gritter.add({
//           title: titleText,
//           text: gettext("VIEWDS-WAITMESSAGEDOWNLOAD-TEXT"),
//           image: '/static/microsites/images/microsites/ic_download.gif',
//           sticky: false,
//           time: ''
//         });

//     },

//     /**
//      * Render de la vista
//      */
//     render: function () {
//         this.chartView.render();
//         return this;
//     }
















	el: "body",
	chartContainer: "#id_visualizationResult",

	initialize : function() {
		
		// Preload JS Images
		this.preloadImages();

		this.listenTo(this.model, "change:filter", this.updateExportsURL);









		// NEW
		this.chartView = new ChartView({
			el: '#id_visualizationResult',
			model: this.model
		});








		
		// init Sidebars
		this.initInfoSidebar();
		this.initAPISidebar();
		this.initNotesSidebar();

		// Render
		this.render();

	},

	//
	loadExtraDatatable: function(){ // dual work on filters active. First read from python view, if filter, read from ajax (paginated))
		var mdl = new dataTable();
		// mdl.set('rows', 0); // remove limit pagination in this cases
		this.theDataTable = new dataTableView({model: mdl, dataStream: this.model, parentView: this});
	},

	setLoading : function() {
		var otherHeights =
		parseFloat( $('.dataTable header').height() )
		+ parseFloat( $('.dataTable header').css('padding-top').split('px')[0] )
		+ parseFloat( $('.dataTable header').css('padding-bottom').split('px')[0] )
		+ parseFloat( $('.dataTable header').css('border-bottom-width').split('px')[0] )
			+ 2;// Fix to perfection;

			this.setHeights('#' + this.chartContainer + ' .loading', otherHeights);
			$('#id_visualizationResult').html('<div class="result"><div class="loading">'+ gettext('APP-LOADING-TEXT') + '</div></div>');
	},

	setMiniLoading: function(){
		$("#id_miniLoading").show();
	},

	unsetLoading: function(){
		$("#id_miniLoading").hide();
	},

	render : function() {
		this.chartView.render();
		return this;
	},

	// open the embed from form iframe code
	onEmbedButtonClicked : function() {
		new embedChartView({
			model : new embedChart({
				title : this.model.get("title"),
				url : this.model.get("embedUrl")
			}, {
				validate : true
			})
		});
	},

	onViewMoreDescriptionLinkClicked: function(event){
		this.onOpenSidebarButtonClicked(event);
		this.toggleDescriptionLink();
	},

	toggleDescriptionLink: function(){
		var button = $('.dataTable header h2 .link'),
			tab = $('.tabs .sidebarIcon.notes'),
			viewMore = button.find('.viewMore'),
			viewLess = button.find('.viewLess');

		if( button.hasClass('active') ){
			tab.addClass('active');
			viewLess.show();
			viewMore.hide();
		}else{
			tab.removeClass('active');
			viewLess.hide();
			viewMore.show();
		}
	},

	onOpenSidebarButtonClicked : function(event) {

		var button = event.currentTarget;

		// If not disabled
		if( !$(button).hasClass('isDisabled') ){

			if( $(button).hasClass('active') ){

				this.onCloseSidebarButtonClicked(event);

			}else{

				$('.tabs .sidebarIcon').removeClass('active');
				
				$(button).addClass('active');

				// For preferences.account_description_enhancement
				if( $(button).attr('id') == 'id_openNotesButton' || $(button).attr('id') == 'id_openNotesLink' ){
					$('.dataTable header h2 .link').addClass('active');
					this.toggleDescriptionLink();
				}else{
					$('.dataTable header h2 .link').removeClass('active');
					this.toggleDescriptionLink();
				}

				// Hide all sidebars and show necesary one
				$('.sidebar .box').hide(0 ,function(){
					$('#'+button.rel).show(0, function(){
						$('#id_columns').addClass('showSidebar');
					});
				});

				// Toogle DataTable if filter tab
				if( $(button).attr('id') == 'id_openFiltersButton' ){
					// if it's the first time call the data!
					if (null === this.theDataTable)
						{this.loadExtraDatatable();}
					$('#id_toggleComponent a').removeClass('active');
					$('#id_toggleComponent a[rel=table]').addClass('active');
					this.toggleDataTable('show');
				}

			}

		}

	},

	onCloseSidebarButtonClicked : function(event) {

		var button = event.currentTarget;

		$('.tabs .sidebarIcon').removeClass('active');
		$('#id_columns').removeClass('showSidebar');

		// Toogle DataTable if filter tab
		if( 
			$(button).attr('id') == 'id_closeFiltersButton' ||
			$(button).attr('id') == 'id_openFiltersButton'
		){
			this.toggleDataTable('hide');
		}

		// For preferences.account_description_enhancement
		$('.dataTable header h2 .link').removeClass('active');
		this.toggleDescriptionLink();

	},

	onExportButtonClicked : function(event) {

		var button = event.currentTarget,
			itemHeight = parseInt( $('#'+button.rel).find('li a').height() ),
			itemLength = parseInt( $('#'+button.rel).find('li').length ),
			containerPaddingTop = parseInt( $('#'+button.rel).css('padding-top').split('px')[0] ),
			containerPaddingBottom = parseInt( $('#'+button.rel).css('padding-bottom').split('px')[0] ),
			marginTop = - ( ( ( itemHeight * itemLength ) + ( containerPaddingTop + containerPaddingBottom ) ) / 2 ) + 'px';

		// Set middle position of tooltip
		$('#'+button.rel).css('margin-top', marginTop );

		// Toggle Fade
		$('#'+button.rel).fadeToggle(375);

		// Toggle Active class
		$('#id_exportButton').toggleClass('active');

	},

	initInfoSidebar : function() {

		// Set Height
		this.setSidebarHeight();

		// Permalink
		this.permalinkHelper();

		// Hits
		new visualizationHitsView({model: new visualizationHits(), visualization: this.model});

	},

	initAPISidebar : function() {
		this.setSidebarHeight();
	},

	initNotesSidebar : function() {
		this.setSidebarHeight();
	},

	setHeights: function(theContainer, theHeight){

		if(typeof theHeight == 'undefined'){
			theHeight = 0;
		}

		var heightContainer = String(theContainer),
			tabsHeight = parseFloat( $('.tabs').height() ),
			otherHeight = theHeight,
			minHeight = tabsHeight - otherHeight;

		$(heightContainer).css('min-height', minHeight+ 'px');

		$(window).resize(function(){

			var height =
				parseFloat( $(window).height() )
				- parseFloat( otherHeight   )
				- parseFloat( $('.brandingHeader').height() )
				- parseFloat( $('.content').css('padding-top').split('px')[0] )
				- parseFloat( $('.content').css('padding-bottom').split('px')[0] )
				// - parseFloat( $('.brandingFooter').height() )
				- parseFloat( $('.miniFooterJunar').height() );

			$(heightContainer).height(height);

		}).resize();

	},

	setChartContainerHeight:function(){
		
		var self = this;

		$(document).ready(function(){

			var otherHeights = 
				parseFloat( $('.dataTable header').height() )
				+ parseFloat( $('.dataTable header').css('padding-top').split('px')[0] )
				+ parseFloat( $('.dataTable header').css('padding-bottom').split('px')[0] )
				+ parseFloat( $('.dataTable header').css('border-bottom-width').split('px')[0] )
				+ 2;// Fix to perfection;

			self.setHeights( '#' + self.chartContainer, otherHeights );

			$('#' + self.chartContainer).css({
				overflow: 'auto'
			})

		});

	},

	setSidebarHeight : function() {

		var self = this;

		$(document).ready(function(){

			var otherHeights =
				parseFloat( $('.sidebar .box').css('border-top-width').split('px')[0] )
				+ parseFloat( $('.sidebar .box').css('border-bottom-width').split('px')[0] )
				+ parseFloat( $('.sidebar .box .title').height() )
				+ parseFloat( $('.sidebar .box .title').css('border-bottom-width').split('px')[0] );
						
			self.setHeights( '.sidebar .boxContent', otherHeights );

		});

	},

	permalinkHelper: function(){
		// var permalink = this.model.attributes.publicUrl,
		// self = this;
		// $('#id_permalink').val(permalink);

		// if (typeof(BitlyClient) != 'undefined') {
		// 	BitlyClient.shorten( permalink, function(pData){

		// 		var response,
		// 		  shortUrl;

		// 		for(var r in pData.results) {
		// 		response = pData.results[r];
		// 		break;
		// 		}

		// 		shortUrl = response['shortUrl'];

		// 		if(shortUrl){
		// 		  self.model.attributes.shortUrl = shortUrl;
		// 		  $('#id_permalink').val(shortUrl);
		// 		}
		
		// 	});
		// }
	},

	onInputClicked : function(event) {
		var input = event.currentTarget;
		$(input).select();
	},

	setWaitingMessage : function(event) {

		var button = event.currentTarget, titleText;

		if ($(button).attr('id') == "id_downloadLink") {
			titleText = gettext("VIEWDS-WAITMESSAGEDOWNLOAD-TITLE");
		} else {
			titleText = gettext("VIEWDS-WAITMESSAGEEXPORT-TITLE");
		}

		$.gritter.add({
			title : titleText,
			text : gettext("VIEWDS-WAITMESSAGEDOWNLOAD-TEXT"),
			image : '/media_microsites/images/microsites/ic_download.gif',
			sticky : false,
			time : ''
		});

	},

	preloadImages : function() {

		$(document).ready(function(){

			// Images Array
			var JSImages = [
			'/static/microsites/images/microsites/ic_download.gif',
			'/static/core/styles/plugins/images/gritter.png',
			'/static/core/styles/plugins/images/ie-spacer.gif',
			'/static/microsites/images/microsites/im_miniLoading.gif'
			];

			// Preload JS Images
			new preLoader(JSImages);

		});

	},
			
	onRefreshButtonClicked : function() {
		// by now only maps has an ajax function activated.
		var chType = this.model.attributes.chart_type;
		if (chType != "mapchart")
			window.location.reload();
		else {
			this.setMiniLoading();
			this.refreshData(true);
		}
	},

	updateExportsURL: function(){

		var params = [],
			paramsQuery = '',
			filter = this.model.get('filter'),
			CSV = this.model.get('exportCSVURL'),
			XLS = this.model.get('exportXLSURL')

		if(params.length > 0){
			paramsQuery = params.join('');
		}

		// Update Export href Values
		$('#id_exportToCSVButton').attr('href',CSV+paramsQuery+filter);
		$('#id_exportToXLSButton').attr('href',XLS+paramsQuery+filter);

	},



























});

viewVisualizationView.extend = Backbone.View.extend;
