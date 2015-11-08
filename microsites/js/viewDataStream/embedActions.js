var ActionsMenu = Backbone.Model.extend({
    defaults: {
        $Button: null
        , $Container : null
        , $Menu : null
        , $getEmbedCodeButton : null
        , $embedContainer : null
        , $closeEmbedButton : null
    }
    , initialize: function(){
        this.attributes.$Container          = $('.actionsMenu');
        this.attributes.$Button             = this.attributes.$Container.find('[id*=id_menuDataServiceButton_]');
        this.attributes.$Menu               = this.attributes.$Container.find('[id*=id_tooltipDataServiceButton_]');
        this.attributes.$getEmbedCodeButton = this.attributes.$Container.find('[id*=id_embedButton]');
        this.attributes.$embedContainer     = $('.embedContainer');
        this.attributes.$closeEmbedButton   = this.attributes.$embedContainer.find('[id*=id_closeEmbedButton]');

        this.attributes.$Button.click(_.bind(this.displayMenu, this));
        this.attributes.$Menu.mouseleave(_.bind(this.closeMenu, this));
        this.attributes.$getEmbedCodeButton.click(_.bind(this.showEmbedCode, this));
        this.attributes.$closeEmbedButton.click(_.bind(this.closeEmbedCode, this));

    }
    , displayMenu: function(event) {
        event.stopPropagation();
        this.attributes.$Menu.fadeIn('fast');
        closeDataServiceShareTooltip();
    }
    , closeMenu: function(pEvent) {
        this.attributes.$Menu.fadeOut('fast');
    }
    , showEmbedCode: function(event){
        event.stopPropagation();
        closeDataServiceShareTooltip();
        var url = $(location).attr('href');
        var template =  '<iframe width="400" height="175" src="'+ url +'" frameborder="0" style="border:1px solid #E2E0E0;padding:0;margin:0;"></iframe>' + '<p style="padding:3px 0 15px 0;margin:0;font:11px arial, helvetica, sans-serif;color:#999;">' + gettext( "APP-POWEREDBY-TEXT" ) + ' <a href="' + Configuration.embedPoweredBy[0] + '" title="' + Configuration.embedPoweredBy[1] +'" style="color:#0862A2;">' + Configuration.embedPoweredBy[1] + '</a></p>';
        this.attributes.$embedContainer.find('textarea').val(template).focus(function(){ $(this).select(); });
        this.attributes.$Menu.fadeOut('fast');
        $('html, body').css('overflow','hidden');
        this.attributes.$embedContainer.fadeIn('fast');
    }
    , closeEmbedCode: function(event){
        $('html, body').css('overflow','visible');
        this.attributes.$embedContainer.fadeOut('fast');
    }
});

function onSuccessUrlShortened(pData){
	try {
		var lResult;
		for (var r in pData.results) {
			lResult = pData.results[r];
			lResult['longUrl'] = r;
			break;
		}
		
		var lShortUrl = lResult['shortUrl'];
		var lLongUrl = lResult['longUrl'];
		if (lShortUrl) {
			$fDataServiceContainer.data("short_url", lShortUrl);
			lShareBoxes.redisplay(lShortUrl, lLongUrl);
		}
	}catch(err){
		//catching error in case bitly explodes!!!
	}
}

function onClickShareMenu(event) {
    event.stopPropagation();
    var $lMenuContainer = $(this).next();
    $lMenuContainer.fadeIn('fast');
    $('[id*=id_tooltipDataServiceButton_]').fadeOut('fast');
}

function closeDataServiceShareTooltip(){
    $('div[id*=id_tooltipShareDataServiceButton_]').fadeOut('fast');
}