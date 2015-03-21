var ChartLoader = Backbone.Model.extend({
	defaults: {
		dataStreamJson : '',
		chartJson : '',
		$DataTableObject : null,
		chartObject : null, 
		height : 0,
		width : 0
	},
	initialize : function(){
		this.loadDataTable();
		this.loadChart();
		this.renderChart();
	},
	loadDataTable : function(){
		this.attributes.$DataTableObject = new renderChartsDataTable({'jsonResponse' : JSON.parse(this.attributes.dataStreamJson)});
	},
	loadChart : function(){
		var att = this.attributes;
		var lJson = JSON.parse(att.chartJson);
		var lChart = lJson.format.type;
		
		switch(lChart){
			case "barchart":
				att.chartObject = new BarChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "columnchart":
				att.chartObject = new ColumnChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "linechart":
				att.chartObject = new LineChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "piechart":
				att.chartObject = new PieChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "areachart":
				att.chartObject = new AreaChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "geochart":
				att.chartObject = new GeoChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
			case "mapchart":
				att.chartObject = new MapChart({'$DataTable' : att.$DataTableObject, 'chartType' : lChart, 'manager' : this});
				break;
		}

		att.chartObject.loadJson(lJson);	
	},
	renderChart : function(){
		var lChart = this.attributes.chartObject;
		lChart.loadJson(JSON.parse(this.attributes.chartJson));
		lChart.convertSelections();
		lChart.renderEmbed($('#id_chartDisplay'), this.attributes.width, this.attributes.height);
	}
}); 

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

function initDataService(){
    if (areEmbedOptionsEnabled) {
        var lActionsMenu = new ActionsMenu();

        var lUrl        = $fDataServiceContainer.data("permalink");
        var lName       = $fDataServiceContainer.data('dataservice_title');
        $('a[id*=id_menuShareDataServiceButton_]').click(onClickShareMenu);
        $('div[id*=id_tooltipShareDataServiceButton_]').mouseleave(closeDataServiceShareTooltip);
        $('div[id*=id_tooltipShareDataServiceButton_] .J .ic_Menu').click(closeDataServiceShareTooltip);
//        try{
//            var lInputShareBox = new InputShareBox({
//                '$Container': $('.shareMenu .share_url_input')
//                , 'shortUrl': lUrl
//                , 'longUrl': lUrl
//            });
//
//            var lTwitterShareBox = new TwitterShareBox({
//                '$Container': $('.shareMenu li.twitter iframe')
//                , 'shortUrl': lUrl
//                , 'longUrl': lUrl
//                , 'title': lName
//                , 'count': 'horizontal'
//                , 'width': 20
//                , 'height': 112
//            });
//
//            var lFacebookShareBox = new FacebookShareBox({
//                '$Container': $('.shareMenu li.facebook iframe')
//                , 'shortUrl': lUrl
//                , 'longUrl': lUrl
//                , 'layout': 'button_count'
//                , 'width': 20
//                , 'height': 112
//            });
//
//            var lGooglePlusShareBox = new GooglePlusShareBox({
//                '$Container': $('.shareMenu li.google div')
//                , 'shortUrl': lUrl
//                , 'longUrl': lUrl
//                , 'size': 'medium'
//            });
//
//            var lLinkedinShareBox = new LinkedinShareBox({
//                '$Container': $('.shareMenu li.linkedin iframe')
//                , 'shortUrl': lUrl
//                , 'longUrl': lUrl
//                , 'data_counter': 'right'
//            });
//
//            lShareBoxes = new ShareBoxes();
//            lShareBoxes.add(lInputShareBox);
//            lShareBoxes.add(lTwitterShareBox);
//            lShareBoxes.add(lFacebookShareBox);
//            lShareBoxes.add(lGooglePlusShareBox);
//            lShareBoxes.add(lLinkedinShareBox);
//
//            if (typeof(BitlyClient) != 'undefined') {
//                BitlyClient.shorten(lUrl, 'onSuccessUrlShortened');
//            }
//        }catch(e){
//        }

        $(':not(.actionsMenu,.actionsMenu *,.shareMenu *,.shareMenu)').click(function(event){
            event.stopPropagation();
            $('[id*=id_tooltipDataServiceButton_]').fadeOut('fast');
            closeDataServiceShareTooltip();
        });
    }
}