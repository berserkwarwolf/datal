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
        // @todo: check for use privileges
        if (!fIsPrivate) {
            var lGoogleSpreadSheetMenuOption = new GoogleSpreadSheetMenuOption({ '$Menu': this.attributes.$Menu });
        }
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
        att.$Container = $('#id_googleSpreadsheetsDatastreamContainer');
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

ajaxManager = {

    _ajaxRequests : '',

    init : function(){
        this._ajaxRequests = new Array();
    },

    register : function( id, pRequest ){
        this._ajaxRequests[ "p" + id.toString() ] =  pRequest;
    },

    kill : function( id ){
        try{
            if( this._ajaxRequests[id.toString()].readyState != 4 )
                this._ajaxRequests[id.toString()].abort();
        }
        catch( err ){
        }
    },

    killAll : function(){
        var _self = this;
        for(var i in this._ajaxRequests){
            _self.kill( i );
        }
        this.clear();
    },

    clear : function(){
        this._ajaxRequests = new Array();
    }
};

var EmbedCode = Backbone.Model.extend({

    defaults: {
        $Container: null
        , $TextArea: null
        , $DataStreamContainer: null
        , codeTemplate: null
        , defaultWidth: 400
        , defaultHeight: 175
        , defaultHeaderRows: 0
        , $WidthInput: null
        , $HeightInput: null
        , $HeadersRowsInput: null
		, defaultColumns: 0
		, $ColumnsInput: null
    }

    , initialize: function(){

        var att = this.attributes;
        att.$Container = $('#id_embedCode');
        att.$TextArea = att.$Container.find('#id_embedDataserviceTextarea');
        att.$WidthInput = $('#id_embedWidth');
        att.$HeightInput = $('#id_embedHeight');
        att.$HeadersRowsInput = $('#id_embedHeadersRows');
		att.$ColumnsInput = $('#id_embedColumns');
        att.$Container.overlay(fOverlayDefaultsOptions);

        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

        var lTemplate = '<iframe title="{{title}}" width="{{width}}" height="{{height}}" src="{{url}}" frameborder="0" style="border:1px solid #E2E0E0;padding:0;margin:0;"></iframe>'
                + '<p style="padding:3px 0 15px 0;margin:0;font:11px arial, helvetica, sans-serif;color:#999;">' + gettext( "APP-POWEREDBY-TEXT" ) + ' <a href="' + Configuration.embedPoweredBy[0] + '" title="' + Configuration.embedPoweredBy[1] +'" style="color:#0862A2;">' + Configuration.embedPoweredBy[1] + '</a></p>';
        att.codeTemplate = _.template(lTemplate);
    }

    , display: function(pEvent) {
        var att = this.attributes;
        this.beforeDisplay(pEvent);
        att.$WidthInput.change(_.bind(this.change, this));
        att.$HeightInput.change(_.bind(this.change, this));
        att.$HeadersRowsInput.change(_.bind(this.change, this));
		att.$ColumnsInput.change(_.bind(this.change, this));
        att.$Container.data('overlay').load();
    }

    , close: function(pEvent) {
        var att = this.attributes;
        att.$Container.data('overlay').close();
        att.$DataStreamContainer = null;
        att.$WidthInput.unbind('change');
        att.$HeightInput.unbind('change');
        att.$HeadersRowsInput.unbind('change');
        att.$TextArea.unbind('focus');
    }

    , beforeDisplay: function(pEvent) {
        var att = this.attributes;
        att.$DataStreamContainer = $(pEvent.data.containerSelector);

        // frozen only for tables
        if (att.$DataStreamContainer.find('.flexigrid').size() == 0) {
            var lHeadersRowsInputId = att.$HeadersRowsInput.attr('id');
            att.$HeadersRowsInput.css('display', 'none');
            $('label[for='+lHeadersRowsInputId+']').css('display', 'none');
			
			var lColumnsInputId = att.$ColumnsInput.attr('id');
            att.$ColumnsInput.css('display', 'none');
            $('label[for='+lColumnsInputId+']').css('display', 'none');
        }

        att.$WidthInput.val(att.defaultWidth);
        att.$HeightInput.val(att.defaultHeight);
        att.$HeadersRowsInput.val(att.defaultHeaderRows);
        this.setCode(this.getCode(this.getData()));
    }

    , getData: function(){

        var att = this.attributes;
        var lTitle       = att.$DataStreamContainer.data('dataservice_title');
        var lEmbedUrl    = att.$DataStreamContainer.data('dataservice_embed_url');
        var lHeight      = att.$HeightInput.val();
        var lWidth       = att.$WidthInput.val();
        var lHeadersRows = att.$HeadersRowsInput.val();
		var lFixedColumn = att.$ColumnsInput.val();

        lEmbedUrl        = lEmbedUrl.replace(/header_row=\d*/, 'header_row=' + lHeadersRows);
		lEmbedUrl        = lEmbedUrl.replace(/fixed_column=\d*/, 'fixed_column=' + lFixedColumn);

        return {
            title: lTitle
            , width: lWidth
            , height: lHeight
            , url: lEmbedUrl
        };
    }

    , getCode: function(pData) {
        return this.attributes.codeTemplate(pData);
    }

    , setCode: function(pCode) {
        this.attributes.$TextArea.val(pCode).focus(function(){ $(this).select(); });
    }

    , change: function(pEvent){

        var att = this.attributes;

        var lHeight = !isNaN(att.$HeightInput.val()) ? $.trim(att.$HeightInput.val()) : att.defaultHeight;
        var lWidth = !isNaN(att.$WidthInput.val()) ? $.trim(att.$WidthInput.val()) : att.defaultWidth;
        var lHeaderRows = !isNaN(att.$HeadersRowsInput.val()) ? $.trim(att.$HeadersRowsInput.val()) : att.defaultHeaderRows;

        att.$HeightInput.val(lHeight);
        att.$WidthInput.val(lWidth);
        att.$HeadersRowsInput.val(lHeaderRows);

        this.setCode(this.getCode(this.getData()));

    }

});

var ExpandCollapse = Backbone.Model.extend({

    /*
     * $('.dataStreamBox') should not be harcoded, when refactoring the execute code
     * initialize this class before the ds execution
     */

    defaults: {
        $ExpandButton: null
        , $CollapseButton: null
        , klass: 'expandedBox'
    }

    , initialize: function(){
        var att = this.attributes;
        att.$ExpandButton.click(_.bind(this.expand, this));
        att.$CollapseButton.click(_.bind(this.collapse, this));
    }

    , expand: function(){
        var att = this.attributes;
        $('.dataStreamBox').addClass(att.klass);
		$('.pGroup select').val('1000').trigger('change')
		$('.bDiv').css('height','');
        att.$ExpandButton.fadeOut('fast', function(){ att.$CollapseButton.fadeIn(); });
    }

    , collapse: function(){
        var att = this.attributes;
        $('.dataStreamBox').removeClass(att.klass);
		$('.pGroup select').val('50').trigger('change')
		$('.bDiv').css('height','212px');
        att.$CollapseButton.fadeOut('fast', function(){ att.$ExpandButton.fadeIn(); });
    }
});

var DataStreamStats = Backbone.Model.extend({
    defaults: {
        $Container : null,
        data : '',
        id : ''
    },
    initialize: function(){
        this.getStatistics();
    },
    getStatistics : function(){
    	var lUrl  = '/datastreams/get_last_30_days_datastream/'+ this.attributes.id;
        
        //TODO add loading gif
        
        $.ajax({ url: lUrl,
                    dataType: 'json',
                    context : this,
                    success: this.parseData,
                    error: function(pResponse){
                    	// do nothing if error, dont show chart
                    }
                });
    },
    parseData : function(pResponse){
    	var _this  = this;
        var att     = _this.attributes;
        var data    = {};
        data.rows   = [];
        data.cols   = [];
        var lData;

        //setting headers for line chart
        for (var i = 0; i <= 1; i++) {
            var lCol = {};
            lCol.id = i + '_' + '';
            lCol.label = '';
            if(i == 1){
                var lHeader = '';
                lCol.id = i + '_' + lHeader;
                lCol.label = lHeader;
            }
            if (i == 0) {
                lCol.type = 'string';
            }
            else {
                lCol.type = 'number';
            }
            data.cols.push(lCol);
        }
        
        for (var i = 1; i < pResponse.chart.length; i++) {
            lData = { c: [] };
            var lHeader;
            //var lDate = pResponse[i].date.split("-");
            lHeader = { v: '' };
            lData.c.push(lHeader);
            var stat = pResponse.chart[i][1];
            var lValue = { v: stat };
            lData.c.push(lValue);
            data.rows.push(lData);
        }
        
    	att.data = new google.visualization.DataTable(data);
    	this.render();
    },
    render : function(){
    	var att = this.attributes;
        var lProps = {
            title: '',
            width: 270, height: 100 ,
            hAxis: {title: ''},
            vAxis: {title: '', format:'#'},
            legend : 'none'
           };
           
        var chart = new google.visualization.LineChart(att.$Container[0]);
        chart.draw(this.attributes.data, lProps);
    }
});