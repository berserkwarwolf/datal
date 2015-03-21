var ActionsMenu = Backbone.Model.extend({
    defaults: {
        $Button: null
        , $Container : null
        , $Menu : null
    }
    , initialize: function(){
        this.attributes.$Container = $('.actionsMenu');
        this.attributes.$Button    = this.attributes.$Container.find('[id*=id_menuDataServiceButton_]');
        this.attributes.$Menu      = this.attributes.$Container.find('[id*=id_tooltipDataServiceButton_]');

        this.attributes.$Button.click(_.bind(this.displayMenu, this));
        this.attributes.$Menu.mouseleave(_.bind(this.closeMenu, this));
        this.initOptions();

    }
    , displayMenu: function(pEvent) {
        this.attributes.$Menu.fadeIn('fast');
    }
    , closeMenu: function(pEvent) {
        this.attributes.$Menu.fadeOut('fast');
    }
    , initOptions: function() {
        var lCsvMenuOption = new CsvMenuOption({ '$Menu': this.attributes.$Menu });
		var lGoogleSpreadSheetMenuOption = new GoogleSpreadSheetMenuOption({ '$Menu': this.attributes.$Menu });
    }
});

var MenuOption = Backbone.Model.extend({
    defaults: {
        $Button: null
        , $Menu: null
    }
    , initialize: function(){
    }
});

var CsvMenuOption = MenuOption.extend({
    defaults: {
    }
    , initialize: function(){

        var att = this.attributes;

        MenuOption.prototype.initialize.call(this);
        _.defaults(att, MenuOption.prototype.defaults);

        att.$Button = att.$Menu.find('a[id*=id_exportToCSV_]');
        att.$Button.bind('click', {index: this.getIndex()}, exportCSV.exportDataServiceCSV);
    }
    , getIndex: function() {
        return $fDataServiceContainer.data("dataservice_id");
    }
});

var GoogleSpreadSheetMenuOption = MenuOption.extend({
    defaults: {
        $Container : null
        , $Input: null
    }
    , initialize: function(){

        var att = this.attributes;

        MenuOption.prototype.initialize.call(this);
        _.defaults(att, MenuOption.prototype.defaults);

        att.$Button = att.$Menu.find('#id_googlespreadsheetDataStreamButton_');
        att.$Container = $('#id_googleSpreadsheetsContainer');
        att.$Input = att.$Container.find('#id_googleSpreadsheetDataStreamInput');

        att.$Button.click(_.bind(this.display, this));
        att.$Container.overlay(fOverlayDefaultsOptions);
    }
    , display: function(pEvent) {
            this.beforeDisplay();
            this.attributes.$Container.data('overlay').load();
            this.attributes.$Input.click(function(){ $(this).select(); });
    }
    , close: function(pEvent) {
        this.attributes.$Input.unbind('click');
        this.attributes.$Container.data('overlay').close();
    }
    , beforeDisplay: function() {
    }
});

exportCSV = {
    exportDataServiceCSV : function( pEvent ){

        var $DataStream = $("#id_dataservice_container");

        var lDataStreamId = $DataStream.data('dataservice_id');
        var lEndPoint = $DataStream.data('dataservice_end_point');

        exportCSV.sendCSV( lDataStreamId, lEndPoint );
    },
    sendCSV : function( pDataStreamId, pEndPoint ){
        var $lExportContainer = $('#id_exportToCSVContainer').contents();

        var lHtml = '<html><body>';
        lHtml = lHtml + '<form action="' + Configuration.baseUri + '/portal/DataServicesManager/actionExportCSV" method="POST">';
        lHtml = lHtml + '<input id="id_endPoint" type="hidden" name="end_point" value=""/>';
        lHtml = lHtml + '<input id="id_dataStreamId" type="hidden" name="datastream_id" value=""/>';
        lHtml = lHtml + '</form>';
        lHtml = lHtml + '</body></html>';

        var lDoc = $lExportContainer[0];
        lDoc.open();
        lDoc.writeln(lHtml);
        lDoc.close();
        
        $lExportContainer.find('#id_endPoint').val(pEndPoint);
        $lExportContainer.find('#id_dataStreamId').val(pDataStreamId);

        $lExportContainer.find('form')[0].submit();
    }
};

function onSuccessUrlShortened(pData){
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
}

function onClickShareMenu() {
    var $lMenuContainer = $(this).next();
    $lMenuContainer.fadeIn('fast');
}

function closeDataServiceShareTooltip(){
    $('div[id*=id_tooltipShareDataServiceButton_]').fadeOut('fast');
}