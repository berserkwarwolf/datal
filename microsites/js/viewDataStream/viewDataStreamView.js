var viewDataStreamView = function(options) {
	this.inheritedEvents = [];

	Backbone.View.call(this, options);
}

_.extend(viewDataStreamView.prototype, Backbone.View.prototype, {
		
	// Extend functions

	baseEvents: {

		// Add View Data Stream events as Base Events

		'click #id_embedButton': 'onEmbedButtonClicked',
		'click #id_googleSpreadSheetButton': 'onGoogleSpreadSheetButtonClicked',
		'click #id_openInfoButton, #id_openAPIButton, #id_openNotesButton': 'onOpenSidebarButtonClicked',
		'click #id_closeInfoButton, #id_closeAPIButton, #id_closeNotesButton': 'onCloseSidebarButtonClicked',
		'click #id_googleSpreadSheetButton, #id_exportToXLSButton, #id_exportToCSVButton, #id_exportButton': 'onExportButtonClicked',		
		'click #id_permalink, #id_GUID': 'onInputClicked',
		'click #id_downloadLink, #id_exportToXLSButton, #id_exportToCSVButton': 'setWaitingMessage'	

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

	// viewDataStreamView functions

	el: "body",

	theDataTable: null,
	
	initialize: function() {
		
		// Preload JS Images
		this.preloadImages();

		//this.model contains all the necessary data
		this.theDataTable = new dataTableView({model: new dataTable(), dataStream: this.model, parentView: this });
		
		//if data changes, then redraw
		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model, "change:filter", this.updateExportsURL);
		this.listenTo(this.model, "change:pivotTableLicense", this.fixLicense);
		var i=0;
		while(i < $parameters.size()){
			var name = 'parameter' + i;
			this.listenTo(this.model, "change:"+name, this.onParamChanged);
			i++;
		}

		// init Sidebars
		this.initInfoSidebar();
		this.initAPISidebar();
		this.initNotesSidebar();

	},
	
	render: function(){
		return this;
	},	
	
	onEmbedButtonClicked: function(){
		new embedDataStreamView({
			model: new embedDataStream({title: this.model.get("title"), url: this.model.get("embedUrl")}, {validate: true})
		});		
	},
	
	onGoogleSpreadSheetButtonClicked: function(){
		new googleSpreadsheetDataStreamView({model: new googleSpreadsheetDataStream(), dataStream: this.model});
	},
	
	onOpenSidebarButtonClicked: function(event){

		var button = event.currentTarget;

		if( $(button).hasClass('active') ){

			this.onCloseSidebarButtonClicked();

		}else{

			$('.tabs .sidebarIcon').removeClass('active');
			
			$(button).addClass('active');

    	$('.sidebar .box').hide(0 ,function(){
	    	$('#'+button.rel).show(0, function(){
	        $('#id_columns').addClass('showSidebar');
	      });
    	});

    }

	},
    fixLicense: function()
          {
            var ptl = this.model.attributes.pivotTableLicense;
            if (ptl.indexOf("\n") > -1)
                ptl = ptl.replace("\n", "");
            if (ptl.indexOf("<br />") > -1)
                ptl = ptl.replace("<br />", "");
            this.model.attributes.pivotTableLicense = ptl;
          },
	onCloseSidebarButtonClicked: function(){	
	  $('.tabs .sidebarIcon').removeClass('active');
	  $('#id_columns').removeClass('showSidebar');
	},
	
	onExportButtonClicked: function(event){

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

	initInfoSidebar: function(){

		// Set Height
		this.setSidebarHeight();

		// Permalink
		this.permalinkHelper();

		// Hits
		new dataStreamHitsView({model: new dataStreamHits(), dataStream: this.model});

	},

	initAPISidebar: function(){
		this.setSidebarHeight();
	},

	initNotesSidebar: function(){
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
				- parseFloat( otherHeight	)
		    - parseFloat( $('.brandingHeader').height() )
		    - parseFloat( $('.content').css('padding-top').split('px')[0] )
		    - parseFloat( $('.content').css('padding-bottom').split('px')[0] )
		    // - parseFloat( $('.brandingFooter').height() )
		    - parseFloat( $('.miniFooterJunar').height() );

		  $(heightContainer).height(height);

  	}).resize();

	},

	setSidebarHeight: function(){

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

		// var permalink = this.model.attributes.permaLink,
		// 	self = this;

		// $('#id_permalink').val(permalink);

		// if (typeof(BitlyClient) != 'undefined') {
  //     BitlyClient.shorten( permalink, function(pData){

		// 		var response,
		// 		  shortUrl;
				
		// 		for(var r in pData.results) {
		//     	response = pData.results[r];
		//   		break;
		// 		}

		// 		shortUrl = response['shortUrl'];

		//     if(shortUrl){
		//       self.model.attributes.shortUrl = shortUrl;
		//       $('#id_permalink').val(shortUrl);
		//     }

		// 	});

  //   }

	},

	onInputClicked: function(event) {

    var input = event.currentTarget;
    $(input).select();

  },

  setWaitingMessage: function(event){

  	var button = event.currentTarget,
  		titleText;

  	if( $(button).attr('id') == "id_downloadLink" ){
  		titleText = gettext("VIEWDS-WAITMESSAGEDOWNLOAD-TITLE");
  	}else{
  		titleText = gettext("VIEWDS-WAITMESSAGEEXPORT-TITLE");
  	}

  	$.gritter.add({
      title: titleText,
      text: gettext("VIEWDS-WAITMESSAGEDOWNLOAD-TEXT"),
      image: '/static/microsites/images/microsites/ic_download.gif',
      sticky: false,
      time: ''
    });

  },

  preloadImages: function(){

  	$(document).ready(function(){

  		// Images Array
		  var JSImages = [
		    '/static/microsites/images/microsites/ic_download.gif',
		    '/static/core/styles/plugins/images/gritter.png',
		    '/static/core/styles/plugins/images/ie-spacer.gif'
		  ];

		  // Preload JS Images
		  new preLoader(JSImages);
  		
  	});

  },

  updateExportsURL: function(){

	  var params = [],
			n = 0,
			paramsQuery = '',
			filter = this.model.get('filter'),
  		CSV = this.model.get('exportCSVURL'),
  		XLS = this.model.get('exportXLSURL');
  		pivotTablesConfigUrl = this.model.get('pivotTableConfig');

		while( this.model.get('parameter' + n ) != undefined ){
			var param = 'pArgument' + n + '=' + this.model.get('parameter' + n ).value;
			if(n == 0){
				param = '?'+param;
			}else{
				param = '&'+param;
			}
			params.push(param);
			n++;					
		}

		if(params.length > 0){
			paramsQuery = params.join('');
		}

  	// Update Export href Values
  	$('#id_exportToCSVButton').attr('href',CSV+paramsQuery+filter);
  	$('#id_exportToXLSButton').attr('href',XLS+paramsQuery+filter);
  },

  onParamChanged: function(){

  	this.model.set('filter', '');
  	this.updateExportsURL();

  }

});

viewDataStreamView.extend = Backbone.View.extend;