JPad = {
    allDataServices             : [],
    totalMaximizedDataServices     : 0,
    documentWidth                 : 0,
    JPadScrollPaneIconWidth     : 178,
    lastDataServicePosition     : [20, 20],
    dataServiceDialogHeight     : 220,
    dataServiceDialogWidth         : 300,
    totalDataServicesHorizontal     : 0,
    totalDataServicesVertical         : 0,
    currentDSHorizontal             : 2,
    currentDSVertical                : 1,

    init : function(){
        this.documentHeight 	= $( document ).height();

        var viewPortHeight     	= $( window ).height() - 50;
        var viewPortWidth      	= $( window ).width() - 10;

        this.totalDataServicesHorizontal     = Math.floor( viewPortWidth / this.dataServiceDialogWidth );
        this.totalDataServicesVertical       = Math.floor( viewPortHeight / this.dataServiceDialogHeight );
		
		this.allDataServices = $('[id*=id_dashboard_dataservice_container_]');
		
        $( '#id_maximizeDashboardCloseAll' ).bind( 'click', JPad.closeAll );

        this._initOverlayMask();
        this._initJPadScrollPane();
    },
    _initOverlayMask : function(){
        $( '#id_overlayMask' ).css( {width : '100%',
                                    height : this.documentHeight + 'px'
                                } );
    },
    _initJPadScrollPane : function( pIndex ){
        $( ".scrollableDS" ).scrollable({next : ".next", prev : ".prev"});
        $( '#id_dsIcon_' + pIndex ).addClass( 'dsIconDisabled' );
    },
    _loadJPadScrollPane : function(){
        var ltotalDataServices   = this.allDataServices.length;
        var ltotalDSperSubset    = 5;
        var ltotalSubsets        = Math.ceil( ltotalDataServices / ltotalDSperSubset );
        var container  	= $( '.items' );
        var iterator    = 0;

        for( i = 0; i < ltotalSubsets; i++ ){
            var newSubset = $( '<div class="Slider clearfix"></div>' );
			var dsIcons = '';
            for( j = 0; j < ltotalDSperSubset; j++ ){
                if( iterator < ltotalDataServices ){
                    var dsIcon = this._createDSIcon( iterator );
					dsIcons = dsIcons + dsIcon;
                    iterator++;
                }
            }
			newSubset.append( dsIcons );
            $( '.scrollableDS' ).data( 'scrollable' ).addItem( newSubset );
        }
		
		$('[id*=id_dsIcon_]').click(JPad.onJPadScrollPaneIconClicked);
		
        var scrollableDSWidthFix = ($( document ).width() * 92 ) / 100;
        $( '.scrollableDS .Slider' ).css('width',scrollableDSWidthFix);

        $( '#id_dataService_scroll_container' ).css( 'display', 'block' );

        $( window ).resize(function () {
            JPad._loadJPadScrollPane();
        });
    },
    _createDSIcon : function( pIterator ){
		var lIndex = $(JPad.allDataServices.eq( pIterator )).data('index');
        var $lMaximizedDashboardDataService = $( '#id_maximized_dashboard_dataservice_' + lIndex );
        var $lDashboardDataService             = JPad.allDataServices.eq( pIterator ).find( '#id_dashboard_dataservice_' + lIndex );

        var lTitle        = JPad.allDataServices.eq( pIterator ).data('dataservice_title');

        var content =        '<div class="panelInner">'+
                            '    <div class="In"> ' +
                            '        <h2 id="">' + lTitle + '</h2> ' +
                            '    </div>' +
                            '</div>';

        var dsIcon = '<div id="id_dsIcon_' + lIndex + '" data="'+lIndex+'" rel="#id_dashboard_dataservice_' + lIndex + '" class="dsIcon panel"> ' + content + '</div>';

        return dsIcon;
    },
    open : function( pIndex ){
        this.totalMaximizedDataServices++;

        $( '#id_overlayMask' ).show();

        this._loadJPadScrollPane();
        this._initJPadScrollPane( pIndex );
    },
    _close : function(){
        if( this.totalMaximizedDataServices < 1 ){
            this._destroy();
        }
    },
    closeAll : function(){
        $('.ui-dialog-content').dialog('close');
        JPad._destroy();
    },
    onJPadScrollPaneIconClicked : function( pEvent ){
		var lIndex = $(pEvent.currentTarget).attr('data');
		 
        $( '#id_dsIcon_' + lIndex ).addClass( 'dsIconDisabled' );
		var l$DashboardDS								= $('#id_dashboard_dataservice_container_' + lIndex);
        var $lMaximizedDashboardDataService             = $( '#id_maximized_dashboard_dataservice_' + lIndex );
        var $lDashboardDataService                      = $('#id_dashboard_dataservice_container_' + lIndex).find( '#id_dashboard_dataservice_' + lIndex );

        if( $lMaximizedDashboardDataService.dialog( "isOpen" ) != true ){
            JPad.totalMaximizedDataServices++;
            $lMaximizedDashboardDataService.html( $lDashboardDataService.html() );

            var $lMaximizedDashboardDataServiceContainer = $lMaximizedDashboardDataService.data( 'dialog' );
            var lTitle          = l$DashboardDS.data('dataservice_title');
            var lCategory       = l$DashboardDS.data('dataservice_category_name');
            var lAuthor         = l$DashboardDS.data('user_nick');
			
            var contents ='<span class="titleDS"><strong>' + lTitle + '</strong> <a id="id_bigger" href="javascript:;" style="color:black;">+</a> | <a id="id_smaller" href="javascript:;" style="color:black;">-</a><br/>';
            contents = contents + '<span class="infoDS"><span class="categoryDS">'+lCategory+'</span> <span class="sep">|</span> <span class="authorDS">' + gettext( "APP-BY-TEXT" ) + ' <strong>'+lAuthor+'</strong></span></span>';
            $lMaximizedDashboardDataService.dialog( { title: contents } );
            $lMaximizedDashboardDataService.dialog( 'option', 'position', JPad._positionDataService() );
			if(l$DashboardDS.data('isChart')){
				$lMaximizedDashboardDataService.dialog( { width: 640, height: 425,resizable: false});
				$lMaximizedDashboardDataService.bind( 'dialogclose', { index : lIndex }, JPad.onDataServiceDialogClosed );
			}
			
            try{
                $lMaximizedDashboardDataServiceContainer.open();
                $lMaximizedDashboardDataService.dialog('moveToTop');
            }
            catch(e){}
			if(l$DashboardDS.data('isChart')){
				var chart = "chart_" + l$DashboardDS.data("dashboard_dataservice_id");
		        window[chart].renderMaximized();
			}
        }
		
        $($lMaximizedDashboardDataService).parent('div').find('#id_smaller').bind('click', { index:lIndex}, JPad.makeSmaller);
        $($lMaximizedDashboardDataService).parent('div').find('#id_bigger').bind('click', { index:lIndex}, JPad.makeBigger);
        return false;
    },
    makeBigger : function(event){
        var $parent = $(event.currentTarget).parents('.ui-draggable');
        if($parent.height()<800){
            var width   = $parent.width() + 100;
            var height  = $parent.height() + 100;

            var width1   = $('#id_maximized_dashboard_dataservice_'+event.data.index).width() + 100;
            var height1  = $('#id_maximized_dashboard_dataservice_'+event.data.index).height() + 100;

            $parent.css({'width' : width, 'height' : height});
            $('#id_maximized_dashboard_dataservice_'+event.data.index).css({'width' : width1, 'height' : height1});
        }
    },
    makeSmaller : function(event){
        var $parent = $(event.currentTarget).parents('.ui-draggable');
        if($parent.height()>250){
            var width   = $parent.width() - 100;
            var height  = $parent.height() - 100;

            var width1   = $('#id_maximized_dashboard_dataservice_'+event.data.index).width() - 100;
            var height1  = $('#id_maximized_dashboard_dataservice_'+event.data.index).height() - 100;

            $parent.css({'width' : width, 'height' : height});
            $('#id_maximized_dashboard_dataservice_'+event.data.index).css({'width' : width1, 'height' : height1});
        }
    },
    _positionDataService : function(){
        var x = 0;
        var y = 0;

        y = this.lastDataServicePosition[1]  + 20;
        x = this.lastDataServicePosition[0]  + 20;

        this.lastDataServicePosition = [x, y];

        return this.lastDataServicePosition;
    },
    onDataServiceDialogClosed : function( pEvent ){
        $( '#id_dsIcon_' + pEvent.data.index ).removeClass( 'dsIconDisabled' );
        JPad.totalMaximizedDataServices--;
        JPad._close();
    },
    _destroy : function(){
        $( '#id_overlayMask' ).hide();
        $( '#id_dataService_scroll_container' ).css( 'display', 'none' );
        $('.items .dsIcon').remove();
		$('.Slider').remove();
        $( window ).unbind('resize');
        JPad.totalMaximizedDataServices = 0;
    }
};

ajaxManager = {

    _ajaxRequests : '',

    init : function(){
        this._ajaxRequests = new Array();
    },

    register : function( id, pRequest ){
        this._ajaxRequests[ "p" +id.toString() ] =  pRequest;
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
        for(var i in this._ajaxRequests) {
            _self.kill( i );
        }
        this.clear();
    },

    clear : function(){
        this._ajaxRequests = new Array();
    }
};

/*  copied from ds detail make refactor to use the same base class, sorry, im out of time to do it */
var MenuOption = Backbone.Model.extend({
    defaults: {
        $Button: null
        , $Menu: null
    }

    , initialize: function(){
    }
});

/*  copied from ds detail make refactor to use the same base class, sorry, im out of time to do it */
var GuidMenuOption = MenuOption.extend({
    defaults: {
        $Container : null
    }
    , initialize: function(){
        var att = this.attributes;
        MenuOption.prototype.initialize.call(this);
        _.defaults(att, MenuOption.prototype.defaults);

        att.$Button.click(_.bind(this.display, this));
        att.$Container.overlay(fOverlayDefaultsOptions);
    }
    , display: function(pEvent) {
        this.beforeDisplay(pEvent);
        this.attributes.$Container.data('overlay').load();
    }
    , close: function(pEvent) {
        this.attributes.$Container.data('overlay').close();
    }
    , beforeDisplay: function() {
    }
});

var DBManagerGuidMenuOption = GuidMenuOption.extend({
    initialize: function(){
        var att = this.attributes;
        GuidMenuOption.prototype.initialize.call(this);
        _.defaults(att, GuidMenuOption.prototype.defaults);
    }
    , beforeDisplay: function(pEvent) {
        var att = this.attributes;
        var lGUID = $fDashboardContainer.data('dashboard_guid');
        att.$Container.find('.text').html( gettext( "DBMAN-GETGUID-TITLE" ) );
        att.$Container.find('.key').html(lGUID);
        if (Configuration.isAccountDomain) {
            var message = gettext( "DBMAN-GETGUID-TITLE" ) + '<a href="' + Configuration.baseUri + '/" title="DATAL">DATAL.</a>';
        } else {
            var message = gettext( "DBMAN-GETGUID-TITLE" ) + 'DATAL.'
        }
        att.$Container.find('.tip').html(message);
    }
    , close: function(pEvent) {
        var att = this.attributes;
        att.$Container.find('.key').html('');
        this.attributes.$Container.data('overlay').close();
    }
});

var DBManagerDSGuidMenuOption = GuidMenuOption.extend({

    defaults: {
        $Container : null
    }

    , initialize: function(){
        var att = this.attributes;
        GuidMenuOption.prototype.initialize.call(this);
        _.defaults(att, MenuOption.prototype.defaults);
    }
    , close: function(pEvent) {
        var att = this.attributes;
        att.$Container.find('.key').html('');
        this.attributes.$Container.data('overlay').close();
    }

    , beforeDisplay: function(pEvent) {
        var att = this.attributes;
        var lGUID = $($(pEvent.currentTarget).parents(".ao-draggable-dashboard-dataservice-container")).data("dataservice_guid");
        att.$Container.find('.text').html( gettext( "DSDET-GETGUID-TITLE" ) );
        att.$Container.find('.key').html(lGUID);

        if (Configuration.isAccountDomain) {
            var message = gettext( "DBMAN-GETGUID-TITLE" ) + '<a href="' + Configuration.baseUri + '/" title="DATAL">DATAL.</a>';
        } else {
            var message = gettext( "DBMAN-GETGUID-TITLE" ) + 'DATAL.'
        }
        att.$Container.find('.tip').html(message);
    }
});

exportCSV = {
    exportDashboardCSV : function(){
        var $ldataservices   = $('[id*=id_dashboard_dataservice_container_]');
        var ldashboardName   = $('#id_maximized_dashboard_name').html();

        var json = {};
        json.name = ldashboardName;
        json.datastreams = [];  
        for( var i = 0; i < $ldataservices.size(); i++ ){
            if( $('#id_dashboard_dataservice_' + i).find('table tr').size() > 1 || $('#id_dashboard_dataservice_' + i).parent('div').data('isChart') == true){
                var lDatastream = {};
                lDatastream.id = $ldataservices.eq(i).data('datastreamrevision_id');
                lDatastream.end_point = $ldataservices.eq(i).data('dataservice_end_point');
                json.datastreams.push(lDatastream);
            }
        }
        exportCSV.sendDashboardCSV( json );
    },
    sendDashboardCSV : function( pJson ){
        var $lExportContainer = $('#id_exportToCSVContainer').contents();

        var lHtml = '<html><body>';
        lHtml = lHtml + '<form action="/dashboards/action_csv" method="POST" novalidate>';
        lHtml = lHtml + '<input id="id_json" type="hidden" name="json" value=""/>';
        lHtml = lHtml + '<input id="id_json" type="hidden" name="csrfmiddlewaretoken" value="'+csrfmiddlewaretoken+'"/>';
        lHtml = lHtml + '</form>';
        lHtml = lHtml + '</body></html>';

        var lDoc = $lExportContainer[0];
        lDoc.open();
        lDoc.writeln(lHtml);
        lDoc.close();
        
        $lExportContainer.find('#id_json').val(JSON.stringify(pJson));

        $lExportContainer.find('form')[0].submit();
    },
    exportDataServiceCSV : function( pEvent ){
        var $DataStream = $('#id_dashboard_dataservice_container_' + pEvent.data.index);
        
        var lDataStreamId = $DataStream.data('dataservice_id');
        var lEndPoint = $DataStream.data('dataservice_end_point');
        
        exportCSV.sendDataStreamCSV( lDataStreamId, lEndPoint );
    },
    sendDataStreamCSV : function( pDataStreamId, pEndPoint ){
        var $lExportContainer = $('#id_exportToCSVContainer').contents();

        var lHtml = '<html><body>';
        lHtml = lHtml + '<form action="' + Configuration.baseUri + '/portal/DataServicesManager/actionExportCSV" method="POST" novalidate>';
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