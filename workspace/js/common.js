if(typeof datalEvents === 'undefined'){
    var datalEvents = {};
    _.extend(datalEvents, Backbone.Events);
}

var BaseView = Backbone.View.extend({

	el: 'body',

	events: {
		"click .header .tab.pulldown > a": "onHeaderPulldownButtonClicked",
	},

	initialize: function(){
		this.showHiddenElements();
		this.setNavigationActiveTab();
		this.initOpenDataSiteButton();
		
		var self = this;
		$(window).scroll(function(){
			self.headerScrollEffect();
		}); 

		this.render();
	},

	render: function(){
		return this;
	},

	// Shows up hidden elements
	showHiddenElements: function(){
		$('.main-section, .header .global-navigation').css('visibility','visible');
	},

	// Set navigation active tab
	setNavigationActiveTab: function(){
		var navActiveTab = $('meta[name=main-option]').attr('content');
		if(navActiveTab != 'none'){
			$('#' + navActiveTab).addClass('active');
		}
	},

	initOpenDataSiteButton: function(){
		// If link is empty
		if( 
			$('#id_openDataSiteButton').attr('href') == '' ||
			$('#id_openDataSiteButton').attr('href') == 'http://'
		){
			$('#id_openDataSiteButton').removeAttr('href');
			this.events["click #id_openDataSiteButton"] = "onOpenDataSiteButtonClicked"
		}
	},

	// Go to Open Data Site 
	onOpenDataSiteButtonClicked: function(event){

		event.preventDefault();

		var message = gettext('APP-INEXISTENT-DOMAIN');

		// If is admin, change message
		if( authManager.isAdmin() ){
			message = gettext('APP-INEXISTENT-DOMAIN-ADMIN-1') + '<a href="http://' + Configuration.baseUri + '/admin/domain" title="' + gettext('APP-INEXISTENT-DOMAIN-ADMIN-2') + '">' + gettext('APP-INEXISTENT-DOMAIN-ADMIN-2') + '</a>.';			
		}

		$.gritter.add({
			title: gettext('APP-INEXISTENT-DOMAIN-TITLE'),
			text: message,
			image: '/static/workspace/images/common/ic_validationError32.png',
			sticky: true,
			time: ''
		});

		return false;

	},

	// Header tab pulldown menu
	onHeaderPulldownButtonClicked: function(event){
		event.preventDefault();
		var button = event.currentTarget;
		$(button).next('.submenu').toggle().parent().toggleClass('active');
	},

	// Header Scroll Effect
	headerScrollEffect: function(){
		var offset = this.getScrollXY(),
			header = this.$el.find('.header');
		offset[1] > 0 ? header.addClass('scrollEffect') : header.removeClass('scrollEffect');
	},
	getScrollXY: function(){
	  var scrOfX = 0, scrOfY = 0;
	  if( typeof( window.pageYOffset ) == 'number' ) {
	    //Netscape compliant
	    scrOfY = window.pageYOffset;
	    scrOfX = window.pageXOffset;
	  } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
	    //DOM compliant
	    scrOfY = document.body.scrollTop;
	    scrOfX = document.body.scrollLeft;
	  } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
	    //IE6 standards compliant mode
	    scrOfY = document.documentElement.scrollTop;
	    scrOfX = document.documentElement.scrollLeft;
	  }
	  return [ scrOfX, scrOfY ];
	}

});