var fDataServiceId;
var lShareBoxes;
var fUserNick;
var fDashboardId;
var fIsBranded;
var fMoveBeforeIndex;
var fDataStreamNeedToMove = false;
var fAddingDataservice = false;
var $fAddDataServiceContainer;
var $fAddDataServiceInfoWrapper;
var $fAddDataServiceErrorWrapper;
var $fAddDataServiceInfoMessage;
var $fAddDataServiceErrorMessage;
var $fNewDashboardContainer;
var $fEditParametersContainer;
var $fDataServicesSearch;
var $fDataServicesSearchForm;
var $fDataServicesPageNumber;
var $fDashboardsSearch;
var $fDashboardsSearchForm;
var $fDashboardsPageNumber;
var $fDashboardsAction;
var $fDataServices;
var $fDataServicesCategory;
var $fEditDashboardDataServicesContainer;
var $fDashboardContainer;
var $fDashboardsContainers;
var $fSwitchDashboardContainer;
var $fPersonalizeDashboardContainer;
var $fDragDashboardDataServiceHelper;
var $fDragFavouriteDashboardHelper;
var $fDashboardDataServicesContainers;
var $fFavouriteDashboardsContainers;
var $fEditFavouriteDashboardsContainer;
var $fFavouriteDashboardsSearchForm;
var $fFavouriteDashboardsAction;
var $fFavouriteDashboardsPageNumber;
var $fFavouriteDashboardsContainer;
var $fSearchFavouriteDashboardsContainer;
var $fEditDashboardContainer;
var $fEditDashboardForm;
var $fEditDashboardInfoWrapper;
var $fEditDashboardErrorWrapper;
var $fEditDashboardErrors;
var $fEditDashboardInfoMessage;
var $fEditDashboardErrorMessage;
var $fNewDashboardContainer;
var $fNewDashboardInfoWrapper;
var $fNewDashboardErrorWrapper;
var $fNewDashboardErrors;
var $fNewDashboardInfoMessage;
var $fNewDashboardErrorMessage;
var $fPersonalizeHideButton;
var $fPersonalizeShowButton;
var $fAddDataServiceBox;
var $fEditDashboardCommentsContainer;
var $fDashboardCommentsSearchForm;
var $fDashboardCommentsPageNumber;
var $fDashboardCommentsAction;
var $fNewDashboardComment;
var fNewDashboardCommentMaxLength;
var fShowIntroductionVideo = true;

var fDefaultSearch = gettext( "DB-FAVDB-DEFAULTSEARCH" );
var fDashboardSearchDefaultText = gettext( "DB-FAVDB-SEARCHTIP" );
var TabManager;
var fIsSharingDisabled;

$(document).ready(function(){

    /* Has Sidebar */
    if( $('.hasSidebar').length > 0 ){
        $('body').addClass('addSidebarBG');
        var hasSidebarActiveTab = $('.hasSidebar .sidebar .active').html();
        $('.hasSidebar .resources .dbSidebarTitle').html(hasSidebarActiveTab);
    }

    window.isDraggingDs = false;

    $fEditDashboardDataServicesContainer= $("#id_edit_dashboard_dataservices_container");
    $fEditDashboardCommentsContainer    = $("#id_edit_dashboard_comments_container");

    $fDashboardContainer                = $("#id_dashboard_container");
    fDashboardId                        = $fDashboardContainer.data('dashboard_id');
    fUserNick                           = $fDashboardContainer.data('user_nick');
    fIsBranded                          = $fDashboardContainer.data('is_branded');

    $fSwitchDashboardContainer          = $("#id_switch_dashboard_container");
    $fEditFavouriteDashboardsContainer  = $("#id_edit_favourite_dashboards_container");
    $fPersonalizeDashboardContainer     = $("#id_personalize_dashboard_container");

    $fDragDashboardDataServiceHelper    = $("#id_dragDashboardDataServiceHelper");
    fIsSharingDisabled                  = $('.sharingDisabled').size() == 1;

    ajaxManager.init();

    window.TabManager = new dashboardDetailTabManager({'disable' : true, 'dashboardId' : fDashboardIdSelected });
    //window.embedCodeOverlay = new EmbedCodeOverlay({'$OverlayContainer' : $('#id_embedCode')});

    $('#id_dashboardMenuButton').click(function(){
        $('#id_dashboardDropDownMenu').fadeIn();
    });

    $('#id_dashboardDropDownMenu').mouseleave(function(){
        $(this).fadeOut ();
    });

    //init Google Spreadsheet overlay
    $("#id_googleSpreadsheetsDatastreamContainer").overlay({
            top: 'center',
            left: 'center',
            mask: {
                color: '#000',
                loadSpeed: 200,
                opacity: 0.5,
                zIndex: 99999
            },
            closeOnClick: true,
            closeOnEsc: true,
            load: false
        });

    if(canShare){
        var sharePrivateOverlay = new SharePrivateOverlay({
            '$Button': $('button[id=id_sharePrivateDashboardButton_]')
            , '$Container': $('#id_sharePrivateContainer')
            , '$Form': $('#id_private_share_form')
        });
    }
});

function showGoogleSpreadsheet(pEvent){
    var lIndex = pEvent.data.index;
    var lGuid = $('#id_dashboard_dataservice_container_' + lIndex).data('dataservice_guid');
    var lDataStreamId = $('#id_dashboard_dataservice_container_' + lIndex).data('dataservice_id');
    var baseUri = $('#id_dashboard_dataservice_container_' + lIndex).data('base_uri');
    var url =  $('#id_dashboard_dataservice_container_' + lIndex).data('datastream_html_link');
    var lCode = '=ImportHtml("'+ url +'" ; "table" ; 1)';

    $('#id_googleSpreadsheetDataStreamInput').val(lCode);
    $('#id_googleSpreadsheetsDatastreamContainer').data('overlay').load();
}

function initDashboardPanel(){

    $fDashboardsContainers = $('[id*=id_dashboard_dataservice_container_]');
    $('body').removeClass('myDashboard');

    var lNotes = new NotesAnonymous({
        '$ViewMoreButton': $('#id_viewMoreNotesButton')
    });

    $fDashboardContainer.find('#id_dashboardTagsViewAllButton').tooltip({events: {def:'click, mouseleave', tooltip:'mouseenter'}
                                                                        , position: "bottom center"
                                                                        , offset: [10, -70]
                                                                        , relative: "true",
                                                                        onShow: function(){
                                                                            var lOffset = $('#id_dashboardTagsViewAllButton').offset()
                                                                            var lTop = lOffset.top + 13;
                                                                            var lLeft = lOffset.left - 143;

                                                                            $('.ao-tag-tooltip').css({
                                                                                'top': lTop,
                                                                                'left': lLeft,
                                                                                'position': 'absolute'
                                                                            })
                                                                        },
                                                                        onBeforeShow: function(){
                                                                            var a = $('.ao-tag-tooltip').detach();
                                                                            $('body').append(a);
                                                                        },
                                                                        onBeforeHide: function(){
                                                                            var a = $('.ao-tag-tooltip').detach();
                                                                            $('.tagsPagination').append(a);
                                                                        }
                                                                        });

    $fPersonalizeHideButton = $('#id_personalizePanelHideButton');
    $fPersonalizeShowButton = $('#id_personalizePanelShowButton');
    $fAddDataServiceBox     = $('#id_addDataServiceBox');

    var lName = $.trim($("#id_maximized_dashboard_name").text());

    if (!fIsSharingDisabled) {

        if( typeof(BitlyClient) != 'undefined' ) {
            var lUrl = $('link[rel=canonical]').attr('href');
            BitlyClient.shorten(lUrl, 'onSuccessDashboardUrlShortened');
        }

        var lInputShareBox = new InputShareBox({
            '$Container': $('.shareBox .share_url_input')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
        });

        var lTwitterShareBox = new TwitterShareBox({
            '$Container': $('.shareBox li.twitter iframe')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
            , 'title': lName
            , 'text': gettext( "DB-INITDB-CHECKOUT" ) + "{title}"
        });

        var lFacebookShareBox = new FacebookShareBox({
            '$Container': $('.shareBox li.facebook iframe')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
        });

        var lGooglePlusShareBox = new GooglePlusShareBox({
            '$Container': $('.shareBox li.google div')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
        });

        var lLinkedinShareBox = new LinkedinShareBox({
            '$Container': $('.shareBox li.linkedin iframe')
            , 'shortUrl': lUrl
            , 'longUrl': lUrl
        });

        lShareBoxes = new ShareBoxes();
        lShareBoxes.add(lInputShareBox);
        lShareBoxes.add(lTwitterShareBox);
        lShareBoxes.add(lFacebookShareBox);
        lShareBoxes.add(lGooglePlusShareBox);
        lShareBoxes.add(lLinkedinShareBox);
    }

    $('#id_exportDashboardCSV').click(exportCSV.exportDashboardCSV);

    window.lGuidDSButton = new DBManagerDSGuidMenuOption({
        '$Container': $('#id_guidDashboardContainer')
        , '$Button': $("[id*=id_guidDataStreamButton_]")
        , '$Menu': $('#id_dashboardDropDownMenu')
    });

    initDashboardDataServices();
    initDashboardCommentsPanel();
    JPad.init();

    var lGuidButton = new DBManagerGuidMenuOption({
        '$Container': $('#id_guidDashboardContainer')
        , '$Button': $('#id_guidButton')
        , '$Menu': $('#id_dashboardDropDownMenu')
    });

}

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function onAddAndEmbedDataServiceButtonClicked(pEvent){
    var lIndex = pEvent.data.index;

    $('#id_add_and_embed').data('overlay').load();
    $('#id_embedDataserviceTextarea').focus(function(){ $(this).select(); });

    var $lDashboardDataServiceContainer = $('#id_dashboard_dataservice_container_'+lIndex);
    var lTitle                          = $.data($lDashboardDataServiceContainer[0], "dataservice_title");
    var lEndPoint                       = $.data($lDashboardDataServiceContainer[0], "dataservice_embed_url");

    var lIframeHtml = '<iframe title="' + lTitle
                + '" width="400" height="175" src="' + lEndPoint
                + '" frameborder="0" style="border:1px solid #E2E0E0;padding:0;margin:0;"></iframe><p style="padding:3px 0 15px 0;margin:0;font:11px arial, helvetica, sans-serif;color:#999;">' + gettext( "APP-POWEREDBY-TEXT" ) + ' <a href="' + Configuration.embedPoweredBy[0] + '" title="' + Configuration.embedPoweredBy[1] +'" style="color:#0862A2;">' + Configuration.embedPoweredBy[1] + '</a></p>';

    $('#id_embedDataserviceTextarea').val(lIframeHtml);
    
    // frozen only for tables
    if ($lDashboardDataServiceContainer.find('.Tabla').size() == 0) {
        var lHeadersRowsInputId = $('#id_embedHeadersRows').attr('id');
        $('#id_embedHeadersRows').css('display', 'none');
        $('label[for='+lHeadersRowsInputId+']').css('display', 'none');

        var lColumnsInputId = $('#id_embedColumns').attr('id');
        $('#id_embedColumns').css('display', 'none');
        $('label[for='+lColumnsInputId+']').css('display', 'none');
    }else{
        var lHeadersRowsInputId = $('#id_embedHeadersRows').attr('id');
        $('#id_embedHeadersRows').css('display', '');
        $('label[for='+lHeadersRowsInputId+']').css('display', '');

        var lColumnsInputId = $('#id_embedColumns').attr('id');
        $('#id_embedColumns').css('display', '');
        $('label[for='+lColumnsInputId+']').css('display', '');
    }
    
    $('#id_embedHeight, #id_embedWidth, #id_embedColumns, #id_embedHeadersRows').change(function(){
        var lDefaultHeight = 175;
        var lDefaultWidth  = 400;

        var lHeight        = lDefaultHeight;
        var lWidth         = lDefaultWidth;

        var $lHeight       = $('#id_embedHeight');
        var $lWidth        = $('#id_embedWidth');

        if (!isNaN($lHeight.val())) {
            lHeight = $.trim($lHeight.val());
        } else {
            $lHeight.val(lDefaultHeight);
        }

        if (!isNaN($lWidth.val())) {
            lWidth = $.trim($lWidth.val());
        } else {
            $lWidth.val(lDefaultWidth);
        }
        
        var lHeaderRow = $('#id_embedHeadersRows').val();
        var lColumn = $('#id_embedColumns').val();
        
        var lEmbedUrl = $('#id_dashboard_dataservice_container_'+lIndex).data("dataservice_embed_url");
        lEmbedUrl = lEmbedUrl.replace(/header_row=\d*/, 'header_row=' + lHeaderRow);
        lEmbedUrl = lEmbedUrl.replace(/fixed_column=\d*/, 'fixed_column=' + lColumn);
        
        lIframeHtml = '<iframe title="' + lTitle
                        + '" width="' + lWidth + '" height="' + lHeight
                        + '" src="' + lEmbedUrl + '" frameborder="0" style="border:1px solid #E2E0E0;padding:0;margin:0;"></iframe><p style="padding:3px 0 15px 0;margin:0;font:11px arial, helvetica, sans-serif;color:#999;">' + gettext( "APP-POWEREDBY-TEXT" ) + ' <a href="' + Configuration.embedPoweredBy[0] + '" title="' + Configuration.embedPoweredBy[1] +'" style="color:#0862A2;">' + Configuration.embedPoweredBy[1] + '</a></p>';

        $('#id_embedDataserviceTextarea').val(lIframeHtml);
    });

    return false;
}

function onAddAndEmbedChartButtonClicked(pEvent){
    var lIndex = pEvent.data.index;

    $('#id_embed_chart_container').css('display', '')
    $('#id_embedCode').data('overlay').load();

    var $lDashboardDataServiceContainer = $('#id_dashboard_dataservice_container_'+lIndex);
    var lSovId       = $lDashboardDataServiceContainer.data('sov_id');
    var lTitle       = $lDashboardDataServiceContainer.data('dataservice_title');
    var lEmbedUrl    = $lDashboardDataServiceContainer.data('dataservice_embed_url');
    var lEndPoint    = $lDashboardDataServiceContainer.data('dataservice_end_point');
    var lWidth       = ($('#id_embedWidth', $('#id_embed_chart_container')).val() != "") ? $('#id_embedWidth', $('#id_embed_chart_container')).val() : att.defaultWidth;
    var lHeight      = ($('#id_embedHeight', $('#id_embed_chart_container')).val() != "") ? $('#id_embedHeight', $('#id_embed_chart_container')).val(): att.defaultHeight;
    var lBaseUri     = $lDashboardDataServiceContainer.data('base_uri');
    var lChartHeight = 0;

    if(lHeight - 60 < 0 ){
        lChartHeight = lHeight;
    }else{
        lChartHeight = lHeight - 60;
    }
    lEmbedUrl        = lEmbedUrl.replace(/width=\d*/, 'width=' + lWidth);
    lEmbedUrl        = lEmbedUrl.replace(/height=\d*/, 'height=' + lChartHeight);
    
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };

    var data = { title: lTitle 
                    , width: lWidth
                    , height: lHeight
                    , url: lEmbedUrl
                };

    var template = '<iframe title="{{title}}" width="{{width}}" height="{{height}}" src="{{url}}" frameborder="0" style="border:1px solid #E2E0E0;padding:0;margin:0;"></iframe>'
            + '<p style="padding:3px 0 15px 0;margin:0;font:11px arial, helvetica, sans-serif;color:#999;">' + gettext( "APP-POWEREDBY-TEXT" ) + ' <a href="' + Configuration.embedPoweredBy[0] + '" title="' + Configuration.embedPoweredBy[1] +'" style="color:#0862A2;">' + Configuration.embedPoweredBy[1] + '</a></p>';

    $('#id_embed_chart_container #id_embedTextarea').val(_.template(template)(data)).focus(function(){ $(this).select(); });

    $('#id_embedHeight, #id_embedWidth', $('#id_embed_chart_container')).change(function(){
        var lDefaultHeight = 175;
        var lDefaultWidth  = 400;

        var lHeight        = lDefaultHeight;
        var lWidth         = lDefaultWidth;

        var $lHeight       = $('#id_embedHeight', $('#id_embed_chart_container'));
        var $lWidth        = $('#id_embedWidth', $('#id_embed_chart_container'));

        if (!isNaN($lHeight.val())) {
            lHeight = $.trim($lHeight.val());
        } else {
            $lHeight.val(lDefaultHeight);
        }

        if (!isNaN($lWidth.val())) {
            lWidth = $.trim($lWidth.val());
        } else {
            $lWidth.val(lDefaultWidth);
        }
        
        
        var $lDashboardDataServiceContainer = $('#id_dashboard_dataservice_container_'+lIndex);
        var lSovId       = $lDashboardDataServiceContainer.data('sov_id');
        var lTitle       = $lDashboardDataServiceContainer.data('dataservice_title');
        var lEmbedUrl    = $lDashboardDataServiceContainer.data('dataservice_embed_url');
        var lEndPoint    = $lDashboardDataServiceContainer.data('dataservice_end_point');
        var lBaseUri     = $lDashboardDataServiceContainer.data('base_uri');
        var lChartHeight = 0;

        if(lHeight - 60 < 0 ){
            lChartHeight = lHeight;
        }else{
            lChartHeight = lHeight - 60;
        }
        lEmbedUrl        = lEmbedUrl.replace(/width=\d*/, 'width=' + lWidth);
        lEmbedUrl        = lEmbedUrl.replace(/height=\d*/, 'height=' + lChartHeight);
        
        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

        var data = { title: lTitle 
                        , width: lWidth
                        , height: lHeight
                        , url: lEmbedUrl
                    };

        var template = '<iframe title="{{title}}" width="{{width}}" height="{{height}}" src="{{url}}" frameborder="0" style="border:1px solid #E2E0E0;padding:0;margin:0;"></iframe>'
                + '<p style="padding:3px 0 15px 0;margin:0;font:11px arial, helvetica, sans-serif;color:#999;">' + gettext( "APP-POWEREDBY-TEXT" ) + ' <a href="' + Configuration.embedPoweredBy[0] + '" title="' + Configuration.embedPoweredBy[1] +'" style="color:#0862A2;">' + Configuration.embedPoweredBy[1] + '</a></p>';

        $('#id_embed_chart_container #id_embedTextarea').val(_.template(template)(data)).focus(function(){ $(this).select(); });
    });

    return false;
}
function initDashboardDataServices(){

    $fDashboardDataServicesContainers = $("div[id*=id_dashboard_dataservice_container_]");

    $('#id_embedCode').overlay({
                                    top: 'center'
                                  , left: 'center'
                                    , mask: {
                                          color: '#000'
                                        , loadSpeed: 200
                                        , opacity: 0.5
                                        , zIndex: 99999
                                    }
                                    , load:false
                              });

    $('#id_add_and_embed').overlay({
                                        top: 'center'
                                      , left: 'center'
                                    , mask: {
                                              color: '#000'
                                            , loadSpeed: 200
                                            , opacity: 0.5
                                            , zIndex: 99999
                                    }
                                    , load:false
                                  });

    $fDashboardDataServicesContainers.each(function(i){
        initDashboardDataService(i);
    });
}

function initDashboardDataService(pIndex){
    var $lDashboardDataServiceContainer = $fDashboardDataServicesContainers.eq(pIndex);
    
    $lDashboardDataServiceContainer.find('div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
    $lDashboardDataServiceContainer.find('div[id*=id_dashboard_dataservice_toolbar_]').css('visibility','hidden');

    $( 'div[id*=id_dashboard_dataservice_toolbar_]' ).css( 'cursor', 'default' );

    $lDashboardDataServiceContainer.find('a[id*=id_menuDashboardDataServiceButton_]').click(function(){$(this).next().fadeIn('fast')});
    $lDashboardDataServiceContainer.find('div[id*=id_tooltipDashboardDataServiceButton_]').mouseleave(closeDashboardDataServiceTooltip);
    $lDashboardDataServiceContainer.find('div[id*=id_tooltipDashboardDataServiceButton_] .J .ic_Menu').click(closeDashboardDataServiceTooltip);

    if(!fIsSharingDisabled){
        $lDashboardDataServiceContainer.find('a[id*=id_menuShareDataServiceButton_]').click(onClickShareMenu);
        $lDashboardDataServiceContainer.find('div[id*=id_tooltipShareDataServiceButton_]').mouseleave(closeDashboardDataServiceShareTooltip);
        $lDashboardDataServiceContainer.find('div[id*=id_tooltipShareDataServiceButton_] .J .ic_Menu').click(closeDashboardDataServiceShareTooltip);
        $lDashboardDataServiceContainer.find('a[id*=id_shareDashboardDataServiceButton_] .share_url_input').focus(function(pEvent){
            pEvent.preventDefault();
        });

    }
    $lDashboardDataServiceContainer.find('a[id*=id_addEmbedDataServiceButton_]').bind('click', {index: pIndex}, onAddAndEmbedDataServiceButtonClicked);
    $lDashboardDataServiceContainer.find('a[id*=id_googlespreadsheetDataStreamButton_]').bind('click', {index: pIndex}, showGoogleSpreadsheet);
    
    $lDashboardDataServiceContainer.find('a[id*=id_resetDashboardDataServiceButton_]').bind('click', {index: pIndex}, onResetDashboardDataServiceButtonClicked);
    $lDashboardDataServiceContainer.find('a[id*=id_maximizeDashboardDataServiceButton_]').bind('click', {index: pIndex}, onMaximizeDashboardDataServiceButtonClicked);

    var $lIframe = $lDashboardDataServiceContainer.find('#id_dashboard_dataservice_' + pIndex);
    if( fAddingDataservice == false){
        if($lDashboardDataServiceContainer.data('isChart')){
            startWaitMessageChart($lIframe, pIndex);    
        }else{
            startWaitMessage($lIframe, pIndex);
        }
    }

    if(fDataStreamNeedToMove){
        $lDashboardDataServiceContainer.hide();
    }

    $lDashboardDataServiceContainer.find("[id*=id_guidDataStreamButton_]").click(_.bind(lGuidDSButton.display, lGuidDSButton));

    var lId         = jQuery.data($lDashboardDataServiceContainer[0], "datastreamrevision_id");
    var lEndPoint   = jQuery.data($lDashboardDataServiceContainer[0], "dataservice_end_point");

    if( !$lDashboardDataServiceContainer.data( 'can_view' ) )
    {
        var lHtml = '<div class="dataStreamBox privateDS clearfix">'+
                        '<h2>' + gettext( "DBMAN-DSPRIVATE-TITLE" ) + '</h2>'+
                        '<div class="privateBox">'+
                            '<p>' + gettext( "DBMAN-DSPRIVATE-SUBTITLE" ) + '.</p>'+
                            '<p>' + gettext( "DBMAN-DSPRIVATE-TIP" ) + '.</p>'+
                        '</div>'+
                    '</div>';
        $fDashboardDataServicesContainers.eq(pIndex).find('.dataStreamActions').removeAttr('style');
        $fDashboardDataServicesContainers.eq(pIndex).find('#id_dashboard_dataservice_' + pIndex).html(lHtml);
        $fDashboardDataServicesContainers.eq(pIndex).find('.dataStreamActions').hide();
    } else {
        invokeDashboardDataService(lId, lEndPoint, pIndex);
    }

}

function closeDashboardDataServiceTooltip(){
    $lDataServiceContainer = $(this).parents('div[id*=id_dashboard_dataservice_container_]');
    $lDataServiceContainer.find('div[id*=id_tooltipDashboardDataServiceButton_]').fadeOut('fast');
}

function closeDashboardDataServiceShareTooltip(){
    $lDataServiceContainer = $(this).parents('div[id*=id_dashboard_dataservice_container_]');
    $lDataServiceContainer.find('div[id*=id_tooltipShareDataServiceButton_]').fadeOut('fast');
}


function onMaximizeDashboardDataServiceButtonClicked( pEvent ){
    var lIndex                                  = pEvent.data.index;
    var $lMaximizedDashboardDataService         = $('#id_maximized_dashboard_dataservice_' + lIndex);
    var $lDashboardDataService                  = $($(this).attr("rel"));
    var $lDashboardDataServiceContainer         = $('#id_dashboard_dataservice_container_' + lIndex);
    var lTitle                                  = $lDashboardDataServiceContainer.data('dataservice_title');
    var lCategory                                 = $lDashboardDataServiceContainer.data('dataservice_category_name');
    var lAuthor                                 = $lDashboardDataServiceContainer.data('user_nick');

    $lMaximizedDashboardDataService.html( $lDashboardDataService.html() );

    var $lMaximizedDashboardDataServiceContainer = $lMaximizedDashboardDataService.data( 'dialog' );

    var contents ='<span class="titleDS"><strong>' + lTitle + '</strong> <a id="id_bigger" href="javascript:;" style="color:black;">+</a> | <a id="id_smaller" href="javascript:;" style="color:black;">-</a><br/>';
    contents = contents + '<span class="infoDS"><span class="categoryDS">'+lCategory+'</span></span>';
    $lMaximizedDashboardDataService.dialog( { title: '' + contents } );
    $lMaximizedDashboardDataService.dialog( 'option', 'position', [10, 10] );

    if($lDashboardDataServiceContainer.data('isChart')){
        $lMaximizedDashboardDataService.dialog( { width: 640, height: 425,resizable: false} );
        $lMaximizedDashboardDataService.bind( 'dialogclose', { index : lIndex }, JPad.onDataServiceDialogClosed );
    }

    try{
        $lMaximizedDashboardDataServiceContainer.open();
    }
    catch(e){}


    if($lDashboardDataServiceContainer.data('isChart')){
        var chart = "chart_" + $lDashboardDataServiceContainer.data("dashboard_dataservice_id");
        window[chart].renderMaximized();
    }

    $($lMaximizedDashboardDataService).parent('div').find('#id_smaller').bind('click', { index:lIndex}, JPad.makeSmaller);
    $($lMaximizedDashboardDataService).parent('div').find('#id_bigger').bind('click', { index:lIndex}, JPad.makeBigger);

    JPad.open( lIndex );

    return false;
}

function startWaitMessage(pHTMLElement, pIndex){
    var lHtml = '<table class="Loading">';

    if(pIndex != undefined){
        var lId = $('#id_dashboard_dataservice_container_'+pIndex).data('dashboard_dataservice_id');
        lHtml = lHtml + '<tr><td><a href="javascript:;" onclick="ajaxManager.kill(\'p'+ lId.toString()+'\');" title="' + gettext( "DS-STOP-TITLE" ) + '"><span>' + gettext( "DS-STOP-TEXT" ) + '</span></a></td></tr>';
    }else{
        lHtml = lHtml + "<tr><td>&nbsp</td></tr></table>";
    }

    pHTMLElement.html(lHtml);
}

function startWaitMessageChart(pHTMLElement, pIndex){
    var lHtml = '<table class="Loading">';

    if(pIndex != undefined){
        var lId = $('#id_dashboard_dataservice_container_'+pIndex).data('dashboard_dataservice_id');
        lHtml = lHtml + '<tr><td><a href="javascript:;" onclick="ajaxManager.kill(\'p'+ lId.toString()+'\');" title=""><span></span></a></td></tr>';
    }else{
        lHtml = lHtml + "<tr><td>&nbsp</td></tr></table>";
    }

    pHTMLElement.html(lHtml);
}

function invokeDashboardDataService(pId, pEndPoint, pIndex){

    var $Container = $("#id_dashboard_dataservice_container_" + pIndex);
    var lDashboardDataserviceId = $Container.data("dashboard_dataservice_id");
    var lUrl = '/dataviews/invoke';
    var lTo = pIndex;
    
    var lData = "datastream_revision_id=" + pId 
    			+ '&pIndex=' + pIndex 
    			+ '&limit=50'
    			+ pEndPoint;

    var lIsChart = $Container.data("isChart");
    if (lIsChart) {
        var _var = "chart_" + lDashboardDataserviceId;
        var implDetails = $Container.data("sov_impl_details");
        window[_var] = new MicrositesDashboardChart({'visualization_id' : $Container.data("sov_revision_id") ,'chartJson' : JSON.parse(implDetails), '$Container': $Container.find('#id_dashboard_dataservice_'+pIndex), 'dataStreamId' : pId, 'endPoint': pEndPoint, 'index':pIndex});
    }
    else {
        var lDashboardDataserviceId = $Container.data("dashboard_dataservice_id");
        var lTo = pIndex;

        if (fDataStreamNeedToMove) {
            lData += '&pDashboardId=' + lDashboardDataserviceId + '&plTo=' + lTo + '&plFrom=' + fMoveBeforeIndex;
        }
        fDataStreamNeedToMove = false;

        var lajaxCall = $.ajax({
            url: lUrl,
            type: 'GET',
            data: lData,
            cache: false,
            dataType: 'json',
            beforeSend: onBeforeDataServiceExecute,
            success: onSuccessDataServiceExecute,
            error: onErrorDataServiceExecute
        });

        ajaxManager.register(lDashboardDataserviceId, lajaxCall);
    }
}

function onSuccessDataServiceExecute(pResponse){

    $.url.setUrl(this.url);

    var lIndex                  = $.url.param("pIndex");

    var $lDashboardDataServiceContainer = $('#id_dashboard_dataservice_container_' + lIndex);
    var lDataserviceId                  = $lDashboardDataServiceContainer.data('dataservice_id');
    var lEndPoint                       = $lDashboardDataServiceContainer.data('dataservice_end_point');
    var lTitle                          = $lDashboardDataServiceContainer.data('dataservice_title');
    var lDescription                    = $lDashboardDataServiceContainer.data('dataservice_description');
    var lParameters                     = $lDashboardDataServiceContainer.data('dataservice_parameters');
    var lURL                            = $lDashboardDataServiceContainer.data('datastream_permalink');

    if(lEndPoint != ''){
        if (lURL.indexOf('?') > 0) {
            lURL = lURL.substring(0, lURL.indexOf('?'));
        }
        lURL = lURL + '?' + lEndPoint.substring(1, lEndPoint.length);
    }

    // hiding the notification button
    $lDashboardDataServiceContainer.find('[id*=id_notificationMessage_]').html('').parent('[id*=id_notification_]').fadeOut();


    var lHtml = '<div class="dataStreamBox clearfix"> <h2>' +
                    '<a id="dashboard_widget_link_'+ lIndex + '" href="' + lURL
                    +'" title="' +lDescription +'" class="clearfix" target="_blank">'
                    +'<span class="txt"><span class="titleDS"><strong>' + lTitle +'</strong>'
    lHtml = lHtml + '</span>';

    // displaying the last update time
    if(Configuration.showLastUpdate){
	    var lNotificationHtml = '';
	    if (pResponse.fTimestamp && pResponse.fTimestamp != 0) {
	        var lLastUpdate = new Date(pResponse.fTimestamp);
	
	        // date to string
	        var lDay = lLastUpdate.getDate() < 10 ? '0' + lLastUpdate.getDate() : lLastUpdate.getDate();
	        var lMonth = lLastUpdate.getMonth() + 1
	        lMonth = lMonth < 10 ? '0' + lMonth : lMonth;
	        var lYear = lLastUpdate.getFullYear();
	        var lHours = lLastUpdate.getHours();
	        var lMinutes = lLastUpdate.getMinutes();
	        var lMeridiem = 'AM';
	        if (lHours > 12) {
	            lHours = lHours - 12;
	            lHours = lHours < 10 ? '0' + lHours : lHours;
	            lMeridiem = 'PM';
	        }
	
	        lLastUpdate = lMonth + '/' + lDay + '/' + lYear + ' ' + lHours + ':' + lMinutes + ' ' + lMeridiem;
	        lNotificationHtml = '<span class="Icon ic_Warning"><span class="DN">' + gettext( "APP-LASTUPDATE-TEXT" ) + ': ' + lLastUpdate + '"</span></span><span class="helpTooltip middleArrow w200" style="display:none;"><span class="arrow"></span><span class="helpTxt">' + gettext( "APP-LASTUPDATE-TEXT" ) + ': ' + lLastUpdate + '</span></span>';
	        $lDashboardDataServiceContainer.find('[id*=id_notificationMessage_]').html(lNotificationHtml).parents('[id*=id_notification_]').fadeIn();
	        $lDashboardDataServiceContainer.find('[id*=id_notificationMessage_] .ic_Warning').mouseover(function(){
	            $(this).next().fadeIn();
	        }).mouseleave(function(){
	            $(this).next().fadeOut();
	        });
	    }
    }

    lHtml += '<span class="infoDS">';

    if (lParameters != '') {
        lHtml = lHtml + '<span class="params">';
        lParameters = lParameters.split(',');
        lHtml = lHtml + ' (';
        var lSeparator = ', ';
        for(var i=0; i<lParameters.length;i++){
            var lValue = $.url.param("pArgument" + i);
            lHtml = lHtml + '<label for="pArgument' + i + '" >'+ $.URLDecode(lValue) + '</label>';
            lHtml = lHtml + '<input type="text" style="display:none" size="10" id="pArgument' + i + '" value="' + $.URLDecode(lValue) + '" />';
            if(i + 1 == lParameters.length){
                lSeparator = '';
            }
            lHtml += lSeparator;
        }
        lHtml = lHtml + ')';
        lHtml += '</span> <span class="sep">|</span> ';
    }


    lHtml += '<span class="categoryDS">' + $lDashboardDataServiceContainer.data('dataservice_category_name')
                                +'</span></span>'
                        + '</span>';
    lHtml += '</a>'+
        '</h2>';

    var isTable = false;

    if( pResponse != null ){
        if(pResponse.fType!='ARRAY'){
            isTable = false;
            var lValue = '';
            if(pResponse.fType == 'TEXT'){
                var str = String(pResponse.fStr);
                str = str.replace(/(<([^>]+)>)/ig," ");
                lValue = '<table class="Texto"><tr><td>' + str + '</td></tr></table>';
            } else if(pResponse.fType == 'NUMBER'){
                var displayFormat = pResponse.fDisplayFormat;
                if (displayFormat != undefined) {
                    var number = $.formatNumber(pResponse.fNum, {format:displayFormat.fPattern, locale:displayFormat.fLocale});
                } else {
                    var number = pResponse.fNum;
                }
                lValue = '<table class="Numero"><tr><td>' + String(number) + '</td></tr></table>';
            } else if(pResponse.fType == 'LINK'){
                lValue = '<table class="Texto"><tr><td><a target="_blank" href="' + pResponse.fUri + '" rel="nofollow" title="' + pResponse.fStr + '">' + pResponse.fStr + '</a></td></tr></table>';
            } else if(pResponse.fType == 'ERROR'){
                var lParameters = $('#id_dashboard_dataservice_container_'+lIndex).data("dataservice_parameters");
                var lText = '';
                if (lParameters != '') {
                    var lSplittedParameters = lParameters.split(', ');
                    if (lSplittedParameters.length > 1) {
                        lText = lSplittedParameters.slice(0, -1).join(', ') + ' ' + gettext( "APP-AND-TEXT" ) + ' ' + lSplittedParameters[lSplittedParameters.length-1];
                    } else {
                        lText = lSplittedParameters[0];
                    }
                    lText = ', ' + gettext( "DS-ENTERANEWVALUEFOR-TEXT" ) + ' ' + lText + ' and';
                }
                lValue = '<table class="Nulo"><tr><td> ' + gettext( "APP-NODATAFOUD-TEXT" ) + '. <span>' + gettext( "APP-PLEASE-TEXT" ) + lText + ' <a id="id_retryDataServiceButton" href="javascript:;" title="' + gettext( "APP-TRYAGAIN-TITLE" ) + '">' + gettext( "APP-TRYAGAIN-TEXT" ) + '</a>.</span></td></tr></table>';
            }
            lHtml  = lHtml + '<div class="dataStreamResult clearfix"><div class="Mensaje">' + lValue +'</div></div>';
        } else {
            isTable = true;
            i = 0;
            lHtml  = lHtml + '<div class="dataStreamResult clearfix"><div class="Mensaje"><table class="Tabla">';
            for(var lRow=1;lRow<=pResponse.fRows;lRow++){
                lHtml  = lHtml + '<tr>';
                for(var lColumns=1;lColumns <= pResponse.fCols;lColumns++){
                    var lCell = pResponse.fArray[i];
                    var lValue = '';
                    if(lCell.fType == 'TEXT'){
                        if(lCell.fStr.length == 1){
                            lValue = lCell.fStr.replace('-','&nbsp;');
                        }else{
                            lValue = String(lCell.fStr);
                            lValue = lValue.replace(/(<([^>]+)>)/ig," ");
                        }
                    } else if(lCell.fType == 'NUMBER'){
                        var displayFormat = lCell.fDisplayFormat;
                        if (displayFormat != undefined) {
                            var number = $.formatNumber(lCell.fNum, {format:displayFormat.fPattern, locale:displayFormat.fLocale});
                            lValue = String(number);
                        } else {
                            lValue = String(lCell.fNum);
                        }
                    } else if(lCell.fType == 'LINK'){
                        lValue = '<a target="_blank" href="' + lCell.fUri + '" rel="nofollow" title="' + lCell.fStr + '">' + lCell.fStr + '</a>';
                    }
                    if (typeof lCell.fHeader !== "undefined" && lCell.fHeader == true) {
						if (Configuration.language != "en") {
							if (typeof lCell.fHeaders !== "undefined") {
								lValue = lCell.fHeaders.fHeader;
							}
						}
						lHtml  = lHtml + '<th><div>' + lValue + '</div></th>';
					}else{
						lHtml  = lHtml + '<td><div>' + lValue + '</div></td>';
					}
                    i++;
                }
                lHtml  = lHtml +'</tr>';
            }
            if(pResponse.fLength > 50){
                lHtml  = lHtml +'</table><a href="'+lURL+'" target="_blank" class="viewMoreLink">' + gettext( "APP-VIEWMORE-TEXT" ) + '</a></div></div>';
            }else{
                lHtml  = lHtml +'</table></div></div>';
            }
        }
    }
    lHtml = lHtml + '</div>';

    $fDashboardDataServicesContainers.eq(lIndex).find('.bottomActions').removeAttr('style');
    $fDashboardDataServicesContainers.eq(lIndex).find('#id_dashboard_dataservice_' + lIndex).html(lHtml);

    // tables long text rendering fix
    var $lTable = $fDashboardDataServicesContainers.eq(lIndex).find('.Tabla');
    if ($lTable.size() == 1) {
        var lMaxWidth = 150;
        for(var lColumn = 1; lColumn <=pResponse.fCols; lColumn++){
            var $lColumns = $lTable.find('tr th:nth-child('+ lColumn +'),td:nth-child('+ lColumn +')');
            var lWidth = 0;
            $lColumns.each(function(){
                var $lTd = $(this);
                var lTdWidth = $lTd.width();
                if (lTdWidth > lWidth) {
                    lWidth = lTdWidth;
                }
                if (lWidth > lMaxWidth) {
                    lWidth = lMaxWidth;
                }
            });

            $lColumns.each(function(){
                $(this).width(lWidth + 29);// plus paddings + 5px width for IE
            });
        }
        $lTable.addClass('tableFix').animate({opacity: 1}, 1000);
    }

    $lDashboardDataServiceContainer.mouseenter( function(){
            $lDashboardDataServiceContainer.find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','visible');
    });
    $lDashboardDataServiceContainer.mouseleave( function(){
            $lDashboardDataServiceContainer.find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
    });

    $lDashboardDataServiceContainer.find('input[id*=pArgument]').bind( 'keydown', { index: lIndex },
        function( event ){
        if( event.keyCode == 13 ){
            onArgumentChange( event.currentTarget,  event.data.index);
        }
    }).bind('blur', { index: lIndex },
        function( event ){
            onArgumentChange( event.currentTarget,  event.data.index);
    });

    $lDashboardDataServiceContainer.find('h2').bind( 'click', { index: lIndex },
        function( event ){
            var $target = $( event.target );
            if( $target.is( "label" ) || $target.is( "input" ) ) {
                onArgumentClicked( event.data.index, $target );
                return false;
            }
    });

    $lMaximizedDataServiceContainer = $( '#id_maximized_dashboard_dataservice_' + lIndex );

    if( $lDashboardDataServiceContainer.find('.Mensaje .Tabla tr').length > 5 ){
        $lMaximizedDataServiceContainer.dialog({
            autoOpen     : false,
            width        : JPad.dataServiceDialogWidth + 200,
            height       : JPad.dataServiceDialogHeight + 200,
            resizeStop: function(event, ui) {
            }
        });
    }else{
        $lMaximizedDataServiceContainer.dialog({
            autoOpen     : false,
            width         : JPad.dataServiceDialogWidth,
            height         : JPad.dataServiceDialogHeight,
            resizeStop: function(event, ui) {
            }
        });
    }

    $lMaximizedDataServiceContainer.bind( 'dialogclose', { index : lIndex }, JPad.onDataServiceDialogClosed );

    var lDashboardId = $.url.param("pDashboardId");
    var lTo          = $.url.param("plTo");
    var lFrom        = $.url.param("plFrom");

    if( lDashboardId != undefined ){
        moveDashboardDataService(lDashboardId, lTo, lFrom);
        $('#id_dashboard_dataservice_container_'+lTo).show();
        jQuery.TwitterMessage( { type: 'success', message : gettext( "DBMAN-ADDDS-SUCCESS" ) } );
    }

    if(!isTable){
        $fDashboardDataServicesContainers.eq(lIndex).find('#id_createChart_'+lIndex).hide();
    }

    $fDashboardDataServicesContainers.eq(lIndex).find('#id_retryDataServiceButton').bind('click', {index: lIndex}, onResetDashboardDataServiceButtonClicked);
}

function onErrorDataServiceExecute(pRequest){
    if(pRequest.status != ''){
        var lMessage   = pRequest.status + ': ' + pRequest.statusText;
    }

    $.url.setUrl(this.url);

    var lIndex              = $.url.param("pIndex");

    var $lDashboardDataServiceContainer = $('#id_dashboard_dataservice_container_' + lIndex);
    var lDataserviceId                  = $lDashboardDataServiceContainer.data('dataservice_id');
    var lEndPoint                       = $lDashboardDataServiceContainer.data('dataservice_end_point');
    var lTitle                          = $lDashboardDataServiceContainer.data('dataservice_title');
    var lDescription                    = $lDashboardDataServiceContainer.data('dataservice_description');
    var lURL                            = $lDashboardDataServiceContainer.data('datastream_permalink');
    var gotosource                      = $lDashboardDataServiceContainer.find('[id*=id_dashboard_dataservice_goToSource_] a').attr('href');
    var lParameters                     = $lDashboardDataServiceContainer.data('dataservice_parameters');

    var lHtml = '<div class="dataStreamBox clearfix"> <h2>' +
                    '<a href="javascript:;" title="' + lDescription +'" class="clearfix" target="_blank">'
                    +'<span class="txt"><span class="titleDS"><strong>' + lTitle + '</strong>';
    lHtml = lHtml + '</span>';

    lHtml += '<span class="infoDS">';
    if (lParameters != '') {
        lHtml = lHtml + '<span class="params">';
        lParameters = lParameters.split(',');
        lHtml = lHtml + ' (';
        var lSeparator = ', ';
        for(var i=0; i<lParameters.length;i++){
            var lValue = $.url.param("pArgument" + i);
            lHtml = lHtml + '<label for="pArgument' + i + '" >'+ $.URLDecode(lValue) + '</label>';
            lHtml = lHtml + '<input type="text" style="display:none" size="10" id="pArgument' + i + '" value="' + $.URLDecode(lValue) + '" />';
            if(i + 1 == lParameters.length){
                lSeparator = '';
            }
            lHtml += lSeparator;
        }
        lHtml = lHtml + ')';
        lHtml += '</span> <span class="sep">|</span> ';
    }

    lHtml += '<span class="categoryDS">'+$lDashboardDataServiceContainer.data('dataservice_category_name')+'</span>' +
                            '</span>' +
                        '</span>' +
                    '</a>' +
                '</h2>';

    lHtml        = lHtml + '<div class="dataStreamResult clearfix"><div class="Mensaje">';
    lHtml        = lHtml + '<table class="Nulo">';
    lHtml        = lHtml + '<tr>';
    lHtml        = lHtml + '<td> ' + gettext( "APP-OOPS-TEXT" ) + ' <span>' + gettext( "DS-CANTLOADDATA-TEXT" ) + '.</span><span>' + gettext( "APP-PLEASE-TEXT" ) + ' <a id="id_retryDataServiceButton" href="javascript:;" title="' + gettext( "APP-TRYAGAIN-TITLE" ) + '">' + gettext( "APP-TRYAGAIN-TEXT" ) + '</a>. ' + gettext( "APP-ORGOTOTHE-TEXT" ) + ' <a href="'+gotosource+'">' + gettext( "APP-SOURCE-TEXT" ) + '</a>.</span></td>';
    lHtml        = lHtml + '</tr>';
    lHtml        = lHtml + '</table>';
    lHtml        = lHtml + '</div></div></div>';

    $fDashboardDataServicesContainers.eq(lIndex).find('.bottomActions').removeAttr('style');
    $fDashboardDataServicesContainers.eq(lIndex).find('#id_dashboard_dataservice_' + lIndex).html(lHtml);

    $fDashboardDataServicesContainers.eq(lIndex).find('.dataStreamBox').addClass('errorFix');

    $fDashboardDataServicesContainers.eq(lIndex).mouseover( function(){
         $fDashboardDataServicesContainers.eq(lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','visible');
        });
    $fDashboardDataServicesContainers.eq(lIndex).mouseleave( function(){
        $fDashboardDataServicesContainers.eq(lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
        });

    $fDashboardDataServicesContainers.eq(lIndex).find('input[id*=pArgument]').bind( 'keydown', { index: lIndex },
        function( event ){
        if( event.keyCode == 13 ){
            onArgumentChange( event.currentTarget, event.data.index);
        }
    }).bind('blur', { index: lIndex },
        function( event ){
            onArgumentChange( event.currentTarget,  event.data.index);
    });

    $fDashboardDataServicesContainers.eq(lIndex).find('h2').bind( 'click', { index: lIndex },
        function( event ){
            var $target = $( event.target );
            if( $target.is( "label" ) || $target.is( "input" ) ) {
                onArgumentClicked( event.data.index, $target );
                return false;
            }
    });

    $fDashboardDataServicesContainers.eq(lIndex).find('#id_retryDataServiceButton').bind('click', {index: lIndex}, onResetDashboardDataServiceButtonClicked);

    $lMaximizedDataServiceContainer = $( '#id_maximized_dashboard_dataservice_' + lIndex );

   if( $lDashboardDataServiceContainer.find('.Mensaje .Tabla tr').length > 5 ){
        $lMaximizedDataServiceContainer.dialog({
            autoOpen     : false,
            width        : JPad.dataServiceDialogWidth + 200,
            height       : JPad.dataServiceDialogHeight + 200,
            resizeStop: function(event, ui) {
            }
        });
    }else{
        $lMaximizedDataServiceContainer.dialog({
            autoOpen     : false,
            width         : JPad.dataServiceDialogWidth,
            height         : JPad.dataServiceDialogHeight,
            resizeStop: function(event, ui) {
            }
        });
    }

    $lMaximizedDataServiceContainer.bind( 'dialogclose', { index : lIndex }, JPad.onDataServiceDialogClosed );

    var lDashboardId         = $.url.param("pDashboardId");
    var lTo                 = $.url.param("plTo");
    var lFrom                 = $.url.param("plFrom");

    if( lDashboardId != undefined ){
        moveDashboardDataService(lDashboardId, lTo, lFrom);
        $('#id_dashboard_dataservice_container_'+lTo).show();
        jQuery.TwitterMessage( { type: 'success', message : gettext( "DBMAN-ADDDS-SUCCESS" ) } );
    }
}

function onBeforeDataServiceExecute(pResponse){
    $.url.setUrl(this.url);
    var lIndex                          = $.url.param("pIndex");
    var $lDashboardDataServiceContainer = $('#id_dashboard_dataservice_container_' + lIndex);
    $lDashboardDataServiceContainer.find('.bottomActions').css('display', 'none');
}

function onArgumentClicked(pIndex, $target){

    var $lLabel                         = $target;// $fDashboardDataServicesContainers.eq(pIndex).find('label');//$(pLabel);
    var $DashboardDataServiceContainer  = $fDashboardDataServicesContainers.eq(pIndex);
    var $lBody                          = $DashboardDataServiceContainer.find('#id_dashboard_dataservice_' + pIndex).html;

    var $lValue = $DashboardDataServiceContainer.find('input[id=' + $lLabel.attr('for') + ']');
    var lText    = $lLabel.text();

    $lValue.val(lText);
    $lLabel.hide();
    $lValue.show().focus();
}

function onArgumentChange(pValue, pIndex){
    var $lValue                         = $(pValue);
    var $lDashboardDataServiceContainer = $fDashboardDataServicesContainers.eq(pIndex);

    var $lLabel                 = $lValue.siblings('label[for=' + pValue.id + ']');
    var lValue                  = $lValue.val();
    var lDataStreamEndPoint     = $lDashboardDataServiceContainer.data("dataservice_end_point");
    var lEndPoint               = new EndPoint({ parameters: lDataStreamEndPoint });
    lEndPoint.setParameter(pValue.id, lValue);

    $lDashboardDataServiceContainer.data("dataservice_end_point", lEndPoint.toString());
    $lDashboardDataServiceContainer.data("short_url", null);
    $lDashboardDataServiceContainer.find('ul.share li input').val('');

    $lLabel.text(lValue);
    $lValue.hide();
    $lLabel.show();

    var lUrl = $lDashboardDataServiceContainer.data("datastream_permalink");
    if (lUrl.indexOf('?') > 0) {
        lUrl = lUrl.substring(0, lUrl.indexOf('?'));
    }
    lUrl = lUrl + lEndPoint.getUrlChunk();
    $lDashboardDataServiceContainer.data("datastream_permalink", lUrl);

    var csvLink = $lDashboardDataServiceContainer.find('.ic_CSV').attr('href');
    if (csvLink.indexOf('?') > 0) {
        csvLink = csvLink.substring(0, csvLink.indexOf('?'));
    }
    csvLink = csvLink + lEndPoint.getUrlChunk();
    $lDashboardDataServiceContainer.find('.ic_CSV').attr('href', csvLink);

    var xlsLink = $lDashboardDataServiceContainer.find('.ic_XLS').attr('href');
    if (xlsLink.indexOf('?') > 0) {
        xlsLink = xlsLink.substring(0, xlsLink.indexOf('?'));
    }
    xlsLink = xlsLink + lEndPoint.getUrlChunk();
    $lDashboardDataServiceContainer.find('.ic_XLS').attr('href', xlsLink);

    var hostname = document.location.protocol + '//' + document.location.hostname;

    var htmlLink = hostname + xlsLink.replace('.xlsx?', '.html?');
    $lDashboardDataServiceContainer.data("datastream_html_link", htmlLink);

    // update embed url
    var embedUrl  = $lDashboardDataServiceContainer.data("dataservice_embed_url");
    if (embedUrl.indexOf('?') > 0) {
        embedUrl = embedUrl.substring(0, embedUrl.indexOf('?'));
    }
    embedUrl = embedUrl + lEndPoint.getUrlChunk() + '&header_row=0&fixed_column=0';
    $lDashboardDataServiceContainer.data("dataservice_embed_url", embedUrl);

    $('#id_resetDashboardDataServiceButton_' + pIndex).trigger('click');
}

function onResetDashboardDataServiceButtonClicked(pEvent){

    var lIndex                          = pEvent.data.index;
    var $lDashboardDataServiceContainer = $fDashboardDataServicesContainers.eq(lIndex);

    var $lIframe = $('#id_dashboard_dataservice_' + lIndex);

    startWaitMessage( $lIframe, lIndex);

    var lId         = jQuery.data($lDashboardDataServiceContainer[0], "datastreamrevision_id");
    var lEndPoint = jQuery.data($lDashboardDataServiceContainer[0], "dataservice_end_point");

    invokeDashboardDataService(lId, lEndPoint, lIndex );

    return false;
}

function onRemoveDashboardDataServiceButtonClicked(pEvent){

    if(confirm( gettext( "DB-REMOVEDS-CONFIRM" ) )){
        $(this).unbind('click');
        var lIndex                          = pEvent.data.index;
        var lDashboardDataServiceContainer  = $fDashboardDataServicesContainers[lIndex];
        var lId                             = jQuery.data(lDashboardDataServiceContainer, "dashboard_dataservice_id");

        removeDashboardDataService(lId, lIndex);
    }


    return false;
}

function removeDashboardDataService(pId, pIndex){

    var lUrl     = Configuration.baseUri + '/portal/DashboardsManager/actionRemoveDashboardDataService';
    var lData     = "id=" + pId + "&dashboard_id=" + fDashboardId + "&index=" + pIndex;

     $.ajax({ url: lUrl
            , type:'GET'
            , data: lData
            , dataType: 'json'
            , success: onSuccessDashboardDataServiceRemoved
            , error: onErrorDashboardDataServiceRemoved
            }
    );

    return false;
}

function onSuccessDashboardDataServiceRemoved(pResponse){

    $.url.setUrl(this.url);

    var lFrom   = parseInt($.url.param("index"));
    var lTo     = $fDashboardsContainers.size()-1;

    $('#id_removeDashboardDataServiceButton_'+lFrom).bind('click', {index: lFrom}, onRemoveDashboardDataServiceButtonClicked);

    for(i=lFrom; i<lTo; i++){
        switchDashboardDataServices(i+1, i);
    }

    var $lDashboardDataServiceContainer = $fDashboardsContainers.eq(lTo);
    var $lDroppableContainer            = $lDashboardDataServiceContainer.prev();

    $lDroppableContainer.remove();
    $lDashboardDataServiceContainer.remove();

    if($fDashboardDataServicesContainers.size() == 1){
        $fPersonalizeShowButton.trigger('click');
    }

    $fDashboardsContainers = $('[id*=id_dashboard_dataservice_container_]');
    $fDashboardDataServicesContainers   = $("div[id*=id_dashboard_dataservice_container_]");
     JPad.init();

     jQuery.TwitterMessage( { type: 'success', message : gettext( "DB-DSREMOVE-SUCCESS" ) } );
}

function onErrorDashboardDataServiceRemoved(pResponse){

    var lMessage = pResponse.status + ': ' + pResponse.statusText;
    jQuery.TwitterMessage( { type: 'error', message : lMessage } );
}

function onEditDashboardDialogClosed(){
    resetEditDashboardDialogMessages();
}

function onUpdateDashboardSuccess(pData){

    var lStatus     = pData.pStatus;
    var lMessage    = pData.pMessage;

    resetEditDashboardDialogMessages();

    if(lStatus == "OK"){
        $fEditDashboardInfoMessage.text(lMessage);
        $fEditDashboardInfoWrapper.show();

        var lName               = $("#id_dashboard-name", $fEditDashboardForm).val();
        var lDescription        = $("#id_dashboard_descriptions-0-description", $fEditDashboardForm).val();
        var $lTags              = $('[id*=id_dashboard-tag_][id$=-name]', $fEditDashboardForm);

        if($lTags.length >= 0){
            var lDashboardTagsContainer     = $("#id_dashboard_tags_container");
            var lDashboardAllTagsContainer  = $("#id_dashboard_alltags_container");
            $(".tagsContainer").show();

            var lHtml = '';
            $lTags.slice(0, 5).each(function(i){
                var $lTag = $(this);
                lHtml = lHtml + '<a href=' + Configuration.baseUri + '/search/?tag=' + $lTag.text() + '" title="' + $lTag.text() + '">' + $lTag.text() + '</a>, '
            });

            lDashboardTagsContainer.html(lHtml);

            lHtml = '';
            $lTags.each(function(i){
                var $lTag = $(this);
                lHtml = lHtml + '<a href=' + Configuration.baseUri + '/search/?tag=' + $lTag.text() + '" title="' + $lTag.text() + '">' + $lTag.text() + '</a>, ';
            });

            lDashboardAllTagsContainer.html(lHtml);

        }
        $('#id_maximized_dashboard_name').text(lName);
        $('#id_maximized_dashboard_description').text(lDescription);

        $fEditDashboardContainer.data("overlay").close();

        return;
    }

    if(lStatus == "FORM_INVALID"){
        var lFields = pData.pErrors;

        for (lField in lFields){
            var lErrors = lFields[lField];

            for (lError in lErrors){
                var lLI = '<li><span style="font-weight:bolder !important;">' + lField + ': </span>' + lErrors[lError] + '</li>';

                $fEditDashboardErrors.append(lLI);
            }
        }
    }

    $fEditDashboardErrorMessage.text(lMessage);
    $fEditDashboardErrorWrapper.show();
}

function onUpdateDashboardError(pRequest, pMsg, pError){

    var lMessage    = pRequest.responseText;

    resetEditDashboardDialogMessages();

    $fEditDashboardErrorMessage.text(lMessage);
    $fEditDashboardErrorWrapper.show();
}

function resetNewDashboardDialogMessages(){

    $fNewDashboardErrors.empty();
    $fNewDashboardErrors.hide();
    $fNewDashboardInfoMessage.text("");
    $fNewDashboardErrorMessage.text("");
    $fNewDashboardErrorWrapper.hide();
    $fNewDashboardInfoWrapper.hide();
}

function onInsertDashboardWithLoginSuccess(pData){

    var lStatus     = pData.pStatus;
    var lMessage    = pData.pMessage;

    resetNewDashboardDialogMessages();

    if(lStatus == "OK"){

        if (_gaq) {
            _gaq.push(['_trackPageview', '/dashboard/create']);
        }

        window.location.replace(Configuration.baseUri + '/dashboards/');

        return;
    }

    if(lStatus == "FORM_INVALID"){
        var lFields = pData.pErrors;

        for (lField in lFields){
            var lErrors = lFields[lField];

            for (lError in lErrors){
                var lLI = '<li><span style="font-weight:bolder !important;">' + lField + ': </span>' + lErrors[lError] + '</li>';

                $fNewDashboardErrors.append(lLI);
            }
        }
    }

    $fNewDashboardErrorMessage.text(lMessage);
    $fNewDashboardErrorWrapper.show();
}

function onInsertDashboardSuccess(pData){

    var lStatus     = pData.pStatus;
    var lMessage    = pData.pMessage;

    if(lStatus == "OK"){

        if (_gaq) {
            _gaq.push(['_trackPageview', '/dashboard/create']);
        }

        var lDashboardId = pData.pDashboardId;

        fDashboardId = lDashboardId;

        $fFavouriteDashboardsAction.val("PREV_PAGE");

        favouriteDashboardTabs.lcurrentSelectedTabId = lDashboardId;

        return;
    }

    if(lStatus == "FORM_INVALID"){
        var lFields = pData.pErrors;

        for (lField in lFields){
            var lErrors = lFields[lField];

            for (lError in lErrors){
                var lLI = '<li><span style="font-weight:bolder !important;">' + lField + ': </span>' + lErrors[lError] + '</li>';

                $fNewDashboardErrors.append(lLI);
            }
        }
    }

    $fNewDashboardErrorMessage.text(lMessage);
    $fNewDashboardErrorWrapper.show();
}

function onInsertDashboardError(pRequest, pMsg, pError){

    var lMessage = pRequest.responseText;

    resetNewDashboardDialogMessages();

    $fNewDashboardErrorMessage.text(lMessage);
    $fNewDashboardErrorWrapper.show();
}

function initDashboardCommentsPanel(){

    $fDashboardCommentsSearchForm   = $("#id_dashboardCommentsSearchForm");
    $fDashboardCommentsPageNumber   = $fDashboardCommentsSearchForm.find('#id_dashboard_comments_page_number');
    $fDashboardCommentsAction       = $fDashboardCommentsSearchForm.find('#id_dashboard_comments_action');

    $fEditDashboardCommentsContainer.find('a[id*=id_dashboardCommentsPageButton_]').click(onDashboardCommentsPageButtonClicked);
    $fEditDashboardCommentsContainer.find('#id_dashboardCommentsPreviousButton').click(onDashboardCommentsPreviousButtonClicked);
    $fEditDashboardCommentsContainer.find('#id_dashboardCommentsNextButton').click(onDashboardCommentsNextButtonClicked);

    if(authManager.getNick() == fUserNick){
        $fEditDashboardCommentsContainer.find('a[id*=id_dashboardCommentRemoveButton]').click(onDashboardCommentsRemoveButtonClicked);
    }
    if(authManager.hasRole("ao-user")){
        $fEditDashboardCommentsContainer.find('#id_dashboardCommentsClearButton').click(onDashboardCommentsClearButtonClicked);
        $fEditDashboardCommentsContainer.find('#id_dashboardCommentsPostButton').click(onDashboardCommentsPostButtonClicked);

        $fNewDashboardComment           = $fEditDashboardCommentsContainer.find('#id_dashboard_comment-comment').keypress(onDashboardCommentKeyPressed);
        fNewDashboardCommentMaxLength   = $fEditDashboardCommentsContainer.find('#id_dashboardCommentCharLeft').text();
    }
}

function onDashboardCommentKeyPressed(pEvent){

    var lText       = $fNewDashboardComment.val();
    var lCharLeft   = fNewDashboardCommentMaxLength - lText.length - 1;

    if(lCharLeft < 0){
        return false;
    }

    $fEditDashboardCommentsContainer.find('#id_dashboardCommentCharLeft').text(lCharLeft);
}

function onDashboardCommentsClearButtonClicked(){

    $fNewDashboardComment.val("");
    $fEditDashboardCommentsContainer.find('#id_dashboardCommentCharLeft').text(fNewDashboardCommentMaxLength);
}

function onDashboardCommentsPostButtonClicked(){

    var lUrl            = Configuration.baseUri + "/portal/DashboardsManager/actionAddDashboardComment";
    var lComment        = $fNewDashboardComment.val();
    var lData             = "dashboard_id=" + fDashboardId
                                + "&dashboard_comment-comment=" + lComment;

    $.ajax({ url: lUrl
            , type:'POST'
            , data: lData
            , dataType: 'html'
            , success: onSuccessDashboardCommentsLoaded
            , error: onErrorDashboardCommentsLoaded
            }
    );

    return false;
}

function onSuccessDashboardCommentsLoaded(pData){

    $fEditDashboardCommentsContainer.html(pData);
    initDashboardCommentsPanel();
}

function onErrorDashboardCommentsLoaded(pResponse){
    jQuery.TwitterMessage( { type: 'error', message : pResponse.statusText} );
}

function onDashboardCommentsPageButtonClicked(){

    var lPageNumber = this.innerHTML;

    $fDashboardCommentsAction.val("GOTO_PAGE");
    $fDashboardCommentsPageNumber.val(lPageNumber);

    loadDashboardComments();

    return false;
}

function onDashboardCommentsNextButtonClicked(){

    $fDashboardCommentsAction.val("NEXT_PAGE");
    loadDashboardComments();

    return false;
}

function onDashboardCommentsViewAllButtonClicked(){

    $fDashboardCommentsAction.val("VIEW_ALL");
    loadDashboardComments();

    return false;
}

function onDashboardCommentsPreviousButtonClicked(){

    $fDashboardCommentsAction.val("PREV_PAGE");
    loadDashboardComments();

    return false;
}

function loadDashboardComments(){

    var lUrl        = $fDashboardCommentsSearchForm.attr("action");
    var lPageNumber = $fDashboardCommentsPageNumber.val();
    var lAction     = $fDashboardCommentsAction.val();
    var lData       = "dashboard_comments_page_number=" + lPageNumber
                        + "&dashboard_comments_action=" + lAction
                        + "&dashboard_id=" + fDashboardId;

    $.ajax({ url: lUrl
            , type:'GET'
            , data: lData
            , dataType: 'html'
            , success: onSuccessDashboardCommentsLoaded
            , error: onSuccessDashboardCommentsLoaded
            }
    );
}

function onDashboardCommentsRemoveButtonClicked(event){

    event.preventDefault();
    var lUrl = this.href + "&dashboard_id=" + fDashboardId;

    if( confirm( gettext( "DB-REMOVECOMMENT-CONFIRM" ) ) ){

        $.ajax({ url: lUrl
            , type:'GET'
            , dataType: 'html'
            , success: onSuccessDashboardCommentsLoaded
            , error: onErrorDashboardCommentsLoaded
            }
        );
    }

    return false;
}

function onSuccessDashboardUrlShortened(pData){
    var lResult;
    for (var r in pData.results){
        lResult = pData.results[r];
        lResult['longUrl'] = r;
        break;
    }
    var lShortUrl               = lResult['shortUrl'];
    var $lShareLinksContainer   = $('#id_dashboard_share_toolbar');
    $lShareLinksContainer.fadeIn('slow');
    var lLongUrl = lResult['longUrl'];
    if (lShortUrl) {
        lShareBoxes.redisplay(lShortUrl, lLongUrl);
    }
}

function onArgumentClicked1(pLabel){
    var $lLabel                 = $(pLabel);

    var $lValue                 = $('input[id=' + $lLabel.attr('for') + ']');
    var lText                   = $lLabel.text();

    $lValue.val(lText)
    $lLabel.hide();
    $lValue.show().focus();
}

function onArgumentChange1(pValue){
    var $lValue                 = $(pValue);

    var $lLabel                 = $lValue.siblings('label[for=' + pValue.id + ']');
    var lValue                  = $lValue.val();
    
    $lLabel.text(lValue);
    $lValue.hide();
    $lLabel.show();
}

function onClickShareMenu() {
    var $lMenuContainer = $(this).next();
    $lMenuContainer.fadeIn('fast');

    var $lDataServiceContainer = $(this).parents('div[id*=id_dashboard_dataservice_container_]');
    var lShortUrl = $lDataServiceContainer.data('short_url');
    var lDataStreamPermalink = $lDataServiceContainer.data('datastream_permalink');

    if( !lShortUrl) {

        if (typeof(BitlyClient) != undefined) {
            BitlyClient.shorten(lDataStreamPermalink, 'onSuccessDataServiceUrlShortened');
        }

        // init twitter button
        var lTwitterIframe = $lMenuContainer.find('li.twitter iframe');
        var lUrl = lTwitterIframe.attr('data-src');
        lTwitterIframe.attr('src', lUrl);

        var lFacebookShareBox = new FacebookShareBox({
            '$Container': $lMenuContainer.find('li.facebook iframe')
            , 'shortUrl': lDataStreamPermalink
            , 'longUrl': lDataStreamPermalink
            , 'layout': 'button_count'
            , 'width': 130
            , 'height': 21
        });

        if (gapi) {
            var lGooglePlusButtonContainer = $lMenuContainer.find('li.google').get(0);
            var result = gapi.plusone.render(lGooglePlusButtonContainer, {"size": "medium", "count": "true", "href": lDataStreamPermalink});
        }

        if (IN) {
            $lMenuContainer.find('li.linkedin').html('<script type="IN/Share" data-url="' + lDataStreamPermalink + '"></script>');
            var lLinkedinButtonContainer = $lMenuContainer.find('li.linkedin').get(0);
            IN.parse(lLinkedinButtonContainer);
        }
    }
}

function onSuccessDataServiceUrlShortened(pData){

    console.log('entro');

    var lResult;
    for (var r in pData.results){
        lResult = pData.results[r];
        lResult['longUrl'] = r;
      break;
    }

    var lDataStreamPermalink = lResult['longUrl'];
    var lShortUrl = lResult['shortUrl'];

    // if we do not have a short url we use the long one instead
    if (lShortUrl) {
        $fDashboardDataServicesContainers.each(function(){
            if ( $(this).data('datastream_permalink') == lDataStreamPermalink ){
                  $lDataServiceContainer = $(this);
                  $lDataServiceContainer.data('short_url', lShortUrl);
                  updateShareLinks(lShortUrl, $lDataServiceContainer);
            }
        });
    }
}

function updateShareLinks(pShortUrl, pShareLinksContainer){

    if (pShortUrl) {
        var lShortUrlEncoded = $.URLEncode(pShortUrl);

        // update twitter iframe url
        var $lTwitterShareButton    = pShareLinksContainer.find('ul li.twitter iframe');
        var lTwitterUrl             = $lTwitterShareButton.attr('src');
        if (typeof lTwitterUrl == 'undefined') {
            lTwitterUrl = $lTwitterShareButton.attr('data-src');
        }

        if (typeof lTwitterUrl != 'undefined') {
            var lTwitterSplitedUrl      = lTwitterUrl.split('&');
            lTwitterSplitedUrl[3]       = 'url=' + lShortUrlEncoded;
            $lTwitterShareButton.attr('src', lTwitterSplitedUrl.join('&'));
        }

        var lFacebookShareBox = new FacebookShareBox({
            '$Container': pShareLinksContainer.find('li.facebook iframe')
            , 'shortUrl': pShortUrl
            , 'longUrl': pShortUrl
            , 'layout': 'button_count'
            , 'width': 130
            , 'height': 21
        });

        if (gapi) {
            var lGooglePlusButtonContainer = pShareLinksContainer.find('li.google').get(0);
            if (lGooglePlusButtonContainer) {
                gapi.plusone.render(lGooglePlusButtonContainer, {"size": "medium", "count": "true", "href": pShortUrl});
            }
        }

        if (IN) {
            var lLinkedinButtonContainer = pShareLinksContainer.find('li.linkedin').get(0);
            if (lLinkedinButtonContainer) {
                pShareLinksContainer.find('li.linkedin').html('<script type="IN/Share" data-url="' + pShortUrl + '"></script>');
                IN.parse(lLinkedinButtonContainer);
            }
        }

        // update input text
        pShareLinksContainer.find('.share_url_input').val(pShortUrl).click(function(){ $(this).select(); });
    }
}
