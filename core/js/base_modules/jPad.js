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
        var lSubTitle     = JPad.allDataServices.eq( pIterator ).data('dataservice_subtitle');

        var content =        '<div class="panelInner">'+
                            '    <div class="In"> ' +
                            '        <h2 id="">' + lTitle + '</h2> ' +
                            '        <p id="">' + lSubTitle + '</p> ' +
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
            var lSubTitle       = l$DashboardDS.data('dataservice_subtitle');
            var lCategory       = l$DashboardDS.data('dataservice_category_name');
            var lAuthor         = l$DashboardDS.data('user_nick');
			
            var contents ='<span class="titleDS"><strong>' + lTitle + '</strong> <br/> ' + lSubTitle + '</span>';
            contents = contents + '<span class="infoDS"><span class="categoryDS">'+lCategory+'</span> <span class="sep">|</span> <span class="authorDS">' + gettext( "APP-BY-TEXT" ) + ' <strong>'+lAuthor+'</strong></span></span>';
            $lMaximizedDashboardDataService.dialog( { title: contents } );
            $lMaximizedDashboardDataService.dialog( 'option', 'position', JPad._positionDataService() );
			if(l$DashboardDS.data('isChart')){
				$lMaximizedDashboardDataService.dialog( { width: 620, height: 366 } );
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
		
        return false;
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