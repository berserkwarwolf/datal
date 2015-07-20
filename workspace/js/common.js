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
		this.resizeContainer();
		this.showHiddenElements();
		this.setNavigationActiveTab();
		this.initOpenDataSiteButton();

		this.render();
	},

	render: function(){
		return this;
	},

	// Calculate height of .content-section to make it cover all the layout and resizable
	resizeContainer: function(){
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
				- $('.header').height()
				- parseInt($('.header').css('border-top-width').split('px')[0])
				- parseInt($('.header').css('border-bottom-width').split('px')[0])
				- $('.main-section .section-title').height()
				- $('.footer').height()
				- 3; // 3 rounds up the number, don't know why.

			$('.main-section .section-content').css('min-height', sectionContentHeight+'px');

			sectionContentHeight = 
				sectionContentHeight
				- parseInt($('.main-section .section-content').css('padding-top').split('px')[0])
				- parseInt($('.main-section .section-content').css('padding-bottom').split('px')[0]);

			$('.main-section .wrapper3').css('min-height', sectionContentHeight+'px');

		}).resize();
	},

	// Shows up hidden elements
	showHiddenElements: function(){
		$('.footer, .main-section').css('visibility','visible');
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
	}

});