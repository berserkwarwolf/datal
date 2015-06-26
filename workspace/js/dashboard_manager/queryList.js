var page_number = 1;
var lShareBoxes;
var fUserNick;
var fDashboardId;
var fMoveBeforeIndex;
var fDataStreamNeedToMove = false;
var fAddingDataservice = false;
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
var $fDashboardsContainers;
var $fFavouriteDashboardsContainers;
var $fEditFavouriteDashboardsContainer;
var $fFavouriteDashboardsAction;
var $fSearchFavouriteDashboardsContainer;
var $fPersonalizeHideButton;
var $fPersonalizeShowButton;
var $fAddDataServiceBox;
var fDefaultSearch = gettext( "DB-FAVDB-DEFAULTSEARCH" );
var fDashboardSearchDefaultText = gettext( "DB-FAVDB-SEARCHTIP" );

$(document).ready(function(){
	window.isDraggingDs = false;
	
    $fEditDashboardDataServicesContainer= $("#id_edit_dashboard_dataservices_container");

    $fDashboardContainer                = $("#id_dashboard_container");
    fDashboardId                        = jQuery.data($fDashboardContainer[0], "dashboard_id");
    fUserNick                           = jQuery.data($fDashboardContainer[0], "user_nick");

    $fSwitchDashboardContainer          = $("#id_switch_dashboard_container");
    $fEditFavouriteDashboardsContainer  = $("#id_edit_favourite_dashboards_container");
    $fPersonalizeDashboardContainer     = $("#id_personalize_dashboard_container");

    $fDragDashboardDataServiceHelper    = $("#id_dragDashboardDataServiceHelper");

    ajaxManager.init();
    initEditParametersDialog();

	initDashboardPanel();
});

function initDashboardPanel(){

    $fDashboardsContainers = $('[id*=id_dashboard_dataservice_container_]');

    if( $("#id_dashboard_container").data('dashboard_status') != 2 || authManager.hasPrivilege('workspace.can_edit_dashboard_revision')){

        $("#id_edit_dashboard_container").overlay({
            top: 'center',
            left: 'center',
            mask: {
                color: '#000',
                loadSpeed: 200,
                opacity: 0.5,
                zIndex: 99999
            },
            closeOnClick: false,
            closeOnEsc: true,
            load: false
        });
        window.updDashboard = new UpdateDashboard({'$Container': $('#id_edit_dashboard_container')});
        $fDashboardContainer.find('#id_editDashboardButton').click(onEditDashboardButtonClicked).show();
        window.dashboardStatus = new DashboardStatus({'status' : $("#id_dashboard_container").data('dashboard_status'), '$Container' : $('#id_dashboard_toolbar')});
    }

    if($('button[id=id_sharePrivateDashboardButton_]').size() > 0){
        var sharePrivateOverlay = new SharePrivateOverlay({
            '$Button': $('button[id=id_sharePrivateDashboardButton_]')
            , '$Container': $('#id_sharePrivateContainer')
            , '$Form': $('#id_private_share_form')
        });
    }

    $fDashboardContainer.find('#id_dashboardTagsViewAllButton').tooltip({
        events: {
            def: 'click, mouseleave',
            tooltip: 'mouseenter'
        },
        position: "bottom center",
        offset: [10, -70],
        relative: "true",
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
	
	if ($("#id_dashboard_container").data('dashboard_status') != 2 || authManager.hasPrivilege('workspace.can_create_dashboard_notes') || authManager.hasPrivilege('workspace.can_edit_dashboard_notes')) {
		var lNotes = new Notes({
			'$AddButton': $('#id_addNoteButton'),
			'$Form': $('#id_addNotesForm'),
			'formPrefix': 'dashboard_notes',
			'$EditButton': $('#id_editNotesButton'),
			'$ViewMoreButton': $('#id_viewMoreNotesButton'),
			'is_datastream' : false
		});
	}
    initDashboardDataServices();
    JPad.init();

    $('#id_dashboardMenuButton').click(function(){
        $('#id_dashboardDropDownMenu').fadeIn();
    });

    $('#id_dashboardDropDownMenu').mouseleave(function(){
        $(this).fadeOut ();
    });
}

function onEditDashboardButtonClicked(){
    var $lEditDashboardContainer = $("#id_edit_dashboard_container").data("overlay").load();

    return false;
}

function initEditParametersDialog(){

    $fEditParametersContainer = $("#id_edit_parameters_container");

    $fEditParametersContainer.overlay({top: 'center'
                            , left: 'center'
                            , mask: {
                                    color: '#000'
                                    , loadSpeed: 200
                                    , opacity: 0.5
                                    , zIndex: 99999
                            }
                            , closeOnClick: false
                            , closeOnEsc: true
                            , load:false
                        });

    $fEditParametersContainer.find('#id_addParameterAcceptButton').click(onAddParameterAcceptButtonClicked);
}

function initDashboardDataServices(){
    $fDashboardsContainers = $("div[id*=id_dashboard_dataservice_container_]");

    if( $("#id_dashboard_container").data('dashboard_status') != 2 || authManager.hasPrivilege('workspace.can_move_widgets_dashboard')){

        $fDashboardsContainers.addClass('drag-icon');

        $("[id*=id_droppable_dashboard_dataservice_container_]").droppable({
                                                tolerance: 'pointer'
                                                ,activate: function(pEvent, pUI){
                                                    // $('#id_addDataService_container').show();
                                                }
                                                ,drop: onDataServiceDroppedHandler
                                                ,accept: '.ao-draggable-dataservice, .dataStreamDrag'
                                                ,hoverClass: 'drophover'
                                                ,activeClass: 'ui-state-highlight'
                                            });

        $("#id_addDataService_container").droppable({
                                                tolerance: 'fit'
                                                ,activate: function(pEvent, pUI){
                                                    // $('#id_addDataService_container').show();
                                                }
                                                ,drop: onDataServiceDroppedHandler
                                                ,accept: '.ao-draggable-dataservice'
                                                ,hoverClass: 'drophover'
                                                ,activeClass: 'ui-state-highlight'
                                            });

        $fPersonalizeHideButton.click(onPersonalizePanelHideButtonClicked);
        $fPersonalizeShowButton.click(onPersonalizePanelShowButtonClicked);
        $fAddDataServiceBox.find('a').click(onPersonalizePanelShowButtonClicked);

        if($fDashboardsContainers.size() == 0){
            $fPersonalizeShowButton.trigger('click');
        }
    }

    $fDashboardsContainers.each(function(i){
		var t = setTimeout(function(){initDashboardDataService(i)},1);
    });
}

function initPersonalizePanel(){
    $fDataServicesSearchForm    = $("#id_dataServicesSearchForm");
    $fDataServicesCategory      = $("#id_dashboard-category", $fDataServicesSearchForm ).change(onDataServiceCategoryListChange);
    $fDataServicesPageNumber    = $("#id_dataservices_page_number", $fDataServicesSearchForm );
    $fDataServicesSearch        = $("#id_search", $fDataServicesSearchForm ).focus();
    
	$("#id_dashboard-category", $fDataServicesSearchForm ).prepend('<option value="" selected>All Categories</option>');

    $fDataServicesSearch.click(function(){
        this.value = '';
    }).blur(function(){
        if(this.value == ""){
            this.value = fDefaultSearch;
        }
    });

    $("#id_dataServicesPreviousButton").click(onDataServicesPreviousButtonClicked);
    $("#id_dataServicesNextButton").click(onDataServicesNextButtonClicked);

    $fDataServicesSearch.keydown( function( event ){
        if( this.value == fDefaultSearch ){
            this.value = '';
        }
        if( event.keyCode == 13 ){
            onDataServicesSearchButtonClicked();
        }
    });

    $("#id_dataServicesSearchButton").click(onDataServicesSearchButtonClicked);

    $fDataServicesSearch.bind("keydown keypress keyup", function(event){
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

    $( "div[id*=id_dataservice_] #id_addDataFeed" ).bind('click', onAddDashboardDataServiceClicked );

    $fDataServices = $("div[id*=id_dataservice_]").draggable({ snapMode: 'both',
                                                                connectToSortable: ".ao-draggable-dashboard-dataservice-container",
                                                                revert: true,
                                                                start : function(pEvent, pUI){
																	window.isDraggingDS = true;
                                                                    $('#id_addDataService_container').show();
																},
																stop : function(pEvent, pUI){
																	window.isDraggingDS = false;
																}
                                                            });
}

function onDataServiceDroppedHandler(pEvent, pUI){
	
    var lRel         = $(pUI.draggable).attr('data');
    var lOrigin     = $(lRel).data('origin');
    
    switch(lOrigin){
        case "addDataservicePanel":
            onDataServiceDropped(pEvent, pUI);
            break;
        case "dashboardManager":
            onDashboardDataServiceDropped(pEvent, pUI);
            break;
        default:
    }
}

function onDataServiceDropped(pEvent, pUI){
    var lIndex          = 0;
    var lDraggable      = $(pUI.draggable)[0];
    var lDraggableId    = lDraggable.id;
	
    container_id     = $(lDraggable).attr('rel');
    auxIndex     = $(pEvent.target).attr('data')
    
    if(auxIndex == undefined){
        auxIndex = $fDashboardsContainers.size();
    }
    
    fMoveBeforeIndex = auxIndex;
    
    lIndex = $fDashboardsContainers.size();

    fDataStreamNeedToMove = true;

    var ldatastreamid   = jQuery.data( lDraggable, "datastream_id");
	var lrevisionid     = jQuery.data( lDraggable, "revision_id");
    var lParameters     = jQuery.data( lDraggable, "dataservice_parameters");

    if(lParameters != ""){
        var lHtml   = formatParametersForm(lParameters);

        $fEditParametersContainer.find('#id_parametersForm').html(lHtml);

        $fEditParametersContainer.find('input').keypress(function(pEvent){
            if (pEvent.keyCode == 13) {
                $('#id_addParameterAcceptButton').trigger('click');
                pEvent.preventDefault();
            }
        });

        $fEditParametersContainer.data("datastream_id", ldatastreamid);
        $fEditParametersContainer.data("container", container_id);
        $fEditParametersContainer.data("index", lIndex);
        $fEditParametersContainer.data("revision_id", lrevisionid);
        $fEditParametersContainer.data("isChart", $('#id_dataservice_'+container_id).data("isChart"));

        $fEditParametersContainer.data("overlay").load();
    }
    else{
        var lEndPoint = '';
		var visualization_id = '';
		var visualization_impl_details = '';
		var $Container = $('#id_dataservice_'+container_id);
		if ($Container.data('isChart')) {
			visualization_id = $Container.data('sov_id');
			visualization_impl_details = $Container.data('sov_impl_details');
			addDashboardDataService("", lEndPoint, lIndex, visualization_id, visualization_impl_details, container_id, lrevisionid);
		}
    	else{
			addDashboardDataService(ldatastreamid, lEndPoint, lIndex, visualization_id, visualization_impl_details, container_id, lrevisionid);
		}
		jQuery.TwitterMessage({
			type: 'success',
			message: gettext( "DBMAN-ADDDS-SUCCESS" )
		});        
    }
}

function onAddDashboardDataServiceClicked( pEvent ){
	if (!window.isDraggingDs) {
		var container_id = $(this).attr('rel');
		
		attrRel = $(pEvent.target).attr('rel');
		auxIndex = $(attrRel).data('index');
		
		if (auxIndex == undefined) {
			auxIndex = $fDashboardsContainers.size();
		}
		
		fMoveBeforeIndex = auxIndex;
		lIndex = $fDashboardsContainers.size();
		
		var lParameters = $('#id_dataservice_' + container_id).data('dataservice_parameters');
		var lrevisionid = $('#id_dataservice_' + container_id).data('revision_id');
		var ldatastreamid = $('#id_dataservice_' + container_id).data('datastream_id');
		
		if (lParameters != "") {
			var lHtml = formatParametersForm(lParameters);
			
			$fEditParametersContainer.find('#id_parametersForm').html(lHtml);
			
			$fEditParametersContainer.find('input').keypress(function(pEvent){
				if (pEvent.keyCode == 13) {
					$('#id_addParameterAcceptButton').trigger('click');
					pEvent.preventDefault();
				}
			});
			
			jQuery.data($fEditParametersContainer[0], "datastream_id", ldatastreamid);
			jQuery.data($fEditParametersContainer[0], "index", lIndex);
            jQuery.data($fEditParametersContainer[0], "revision_id", lrevisionid);
            jQuery.data($fEditParametersContainer[0], "isChart", $('#id_dataservice_'+container_id).data("isChart"));
            jQuery.data($fEditParametersContainer[0], "container", container_id);
			
			$fEditParametersContainer.data("overlay").load();
		}
		else {
			var lEndPoint = '';
			var visualization_id = '';
			var visualization_impl_details = '';
			var $Container = $('#id_dataservice_'+container_id);
			if ($Container.data('isChart')) {
				visualization_id = $Container.data('sov_id');
				visualization_impl_details = $Container.data('sov_impl_details');
				addDashboardDataService("", lEndPoint, lIndex, visualization_id, visualization_impl_details, container_id, lrevisionid);
			}else{
				addDashboardDataService(ldatastreamid, lEndPoint, lIndex, visualization_id, visualization_impl_details, container_id, lrevisionid);
			}
			jQuery.TwitterMessage({
				type: 'success',
				message: gettext( "DBMAN-ADDDS-SUCCESS" )
			});
		}
	}
}


function onDashboardDataServiceDropped(pEvent, pUI){
    var $lDraggable          = $(pUI.draggable);
    fDataStreamNeedToMove     = false;

    var lDashboardDataServiceContainerId = $(pEvent.target).attr("rel");
    var lDashboardDataServiceContainer   = $(lDashboardDataServiceContainerId)[0];
    var lIndex                           = $(pEvent.target).attr("data");//jQuery.data( lDashboardDataServiceContainer, "index" );

    var lId     = $lDraggable.parent().data('dashboard_dataservice_id');
    var lFrom   = $lDraggable.parent().data('index');

    moveDashboardDataService(lId, lFrom, lIndex);
}

function onDragDashboardDataServiceHelper(){
    $fDragDashboardDataServiceHelper.show();
    return $fDragDashboardDataServiceHelper[0];
}

function onDataServicesSearchButtonClicked(){
    loadDataServices();
    return false;
}

function onDataServiceCategoryListChange(){
    $fDataServicesPageNumber.val("1");
    loadDataServices();
}

function onDataServicesPreviousButtonClicked(){
	var page = $fDataServicesPageNumber.val();
    $fDataServicesPageNumber.val(parseInt( page) - 1);
	loadDataServices();

    return false;
}

function onDataServicesNextButtonClicked(){
    var page = $fDataServicesPageNumber.val();
    $fDataServicesPageNumber.val(parseInt( page) + 1);
	loadDataServices();

    return false;
}

function loadDataServices(){
    var lPageNumber     = "";
    var lSearch         = "";
    var lAction         = "";
    var lCategory       = "";
    var lUrl            = "/dashboards/action_search_datastream";

    if($fDataServicesSearchForm != undefined){
        lPageNumber     = $fDataServicesPageNumber.val();
        lSearch         = $.trim($fDataServicesSearch.val());
        lCategory       = $fDataServicesCategory.val();
    }
    var lData = {'page': lPageNumber, 'search': lSearch, 'category': lCategory}
    $fPersonalizeDashboardContainer.show();
    startWaitMessage($fPersonalizeDashboardContainer);

    $.ajax({ url: lUrl
            , type:'GET'
            , data: lData
            , cache: false
            , dataType: 'html'
            , success: onSuccessDataServicesLoaded
            , error: onErrorDataServicesLoaded
            }
    );

    return false;
}

function onSuccessDataServicesLoaded(pData){
	try{
    	$fPersonalizeDashboardContainer.html(pData);
		}
	catch(err){}
	
    initPersonalizePanel();
}

function onErrorDataServicesLoaded(pResponse){
    try {
        var lMessage   = pResponse.status + ': ' + pResponse.statusText;
        jQuery.TwitterMessage( { type: 'error', message : lMessage } );
    } catch (err) {}
}

function onPersonalizePanelHideButtonClicked(){
    var $lButton        = $(this);
    var $lHiddenButton  = $($lButton.attr('rel'));

    $lButton.hide();
    $lHiddenButton.show();
    $('#id_addDataService_container').hide();
    $fPersonalizeDashboardContainer.slideUp('fast');
    $('.QuickDrop').animate({height:'0'},500);
    $('.AddDrop').fadeOut('slow');

    $fAddDataServiceBox.show();
}

function onPersonalizePanelShowButtonClicked(){
    var $lButton        = $('#id_personalizePanelShowButton');
    var $lHiddenButton   = $($lButton.attr('rel'));

    $lButton.hide();
    $lHiddenButton.show();

    $fPersonalizeDashboardContainer.slideDown('fast');

    $fAddDataServiceBox.hide();
    $('#id_addDataService_container').show();
    $fPersonalizeDashboardContainer.show();
    startWaitMessage($fPersonalizeDashboardContainer);

    lSearchTerm = '"'+$('#id_maximized_dashboard_name').text()+'"';
    $lDashboardTags = $('#id_dashboard_tags_container a');
    $lDashboardTags.each(function(){
        lSearchTerm += ' ' + $(this).text();
    });

    var lData = "page=" + "1"
                    + "&dataservices_action=" + ""
                    + "&search=" + lSearchTerm
                    + "&category=" + "";

    $fPersonalizeDashboardContainer.show();
    startWaitMessage($fPersonalizeDashboardContainer);
    $fDataServicesSearchForm    = $("#id_dataServicesSearchForm");
    $fDataServicesCategory      = $("#id_dataservices_category", $fDataServicesSearchForm ).change(onDataServiceCategoryListChange);
    $fDataServicesPageNumber    = $("#id_dataservices_page_number", $fDataServicesSearchForm );
    $fDataServicesSearch        = $("#id_dataservices_search", $fDataServicesSearchForm ).focus();

    var lUrl = "/dashboards/action_search_datastream?first_search=True";

    $.ajax({ url: lUrl
            , type:'GET'
            , data: lData
            , cache: false
            , dataType: 'html'
            , success: onSuccessDataServicesLoaded
            , error: onErrorDataServicesLoaded
    });

    return;
}

function moveDashboardDataService(pId, pFrom, pTo){
    var lUrl     = '/dashboards/action_move_dashboard_dataStream';
    var lData     = "dashboard_widget_id=" + pId
                    + "&dashboard_id=" + fDashboardId
                    + "&from=" + pFrom
                    + "&to=" + pTo
					+ '&csrfmiddlewaretoken=' + csrfmiddlewaretoken;

    $.ajax({ url: lUrl
            , type:'GET'
            , data: lData
            , dataType: 'json'
            , success: onSuccessDashboardDataServiceMoved
            , error: onErrorDashboardDataServiceMoved
            }
    );
}

function onSuccessDashboardDataServiceMoved(pResponse){
    $.url.setUrl(this.url);
    var lFrom      = parseInt($.url.param("from"));
    var lTo     = parseInt($.url.param("to"));

    if(lFrom < lTo){
        for(i=lFrom; i<lTo; i++){
            switchDashboardDataServices(i+1, i);
        }
    }
    else{
        for(i=lFrom; i>lTo; i--){
            switchDashboardDataServices(i-1, i);
        }
    }
}

function onErrorDashboardDataServiceMoved(pResponse){
    var lMessage = pResponse.status + ': ' + pResponse.statusText;
    jQuery.TwitterMessage( { type: 'error', message : lMessage } );
}

function formatParametersForm(pParameters){

    var lHtml = '<form>';

    lHtml = lHtml + '<table class="ao-dialogue">';

    var lParameters = pParameters.split(",");

    for(var i=0;i<lParameters.length;i++){
        var name = 'pArgument' + i;
        lHtml = lHtml + '<tr><td>';
        lHtml = lHtml + '<label for="' + name + '">' + lParameters[i] + ':</label>';
        lHtml = lHtml + '</td>';
        lHtml = lHtml + '<td>';
        lHtml = lHtml + '<input type="text" id="' + name + '" name="' + name + '"/>';
        lHtml = lHtml + '</td></tr>';
    };

    lHtml = lHtml + '</table></form>';

    return lHtml;
}

function onAddParameterAcceptButtonClicked(){
    var ldatastreamid   = jQuery.data( $fEditParametersContainer[0], "datastream_id");
    var lrevisionid     = jQuery.data( $fEditParametersContainer[0], "revision_id");
    var lIndex          = jQuery.data( $fEditParametersContainer[0], "index");
    var container_id    = jQuery.data( $fEditParametersContainer[0], "container");
    
    var lEndPoint = '';
    $('input[id*=pArgument]', $fEditParametersContainer).each(function(i){
        lEndPoint = lEndPoint + '&pArgument' + i + '=' + this.value;
    });

    $fEditParametersContainer.data("overlay").close();

    var visualization_id = '';
    var visualization_impl_details = '';
    
    if (jQuery.data( $fEditParametersContainer[0], "isChart")) {
        visualization_id = jQuery.data( $fEditParametersContainer[0], "sov_id");
        visualization_impl_details = jQuery.data( $fEditParametersContainer[0], "sov_impl_details");
        addDashboardDataService("", lEndPoint, lIndex, visualization_id, visualization_impl_details, container_id, lrevisionid);
    }else{
        addDashboardDataService(ldatastreamid, lEndPoint, lIndex, visualization_id, visualization_impl_details, container_id, lrevisionid);
    }

    jQuery.TwitterMessage( { type: 'success', message : gettext( "DBMAN-ADDDS-SUCCESS" ) } );

    return false;
}

function addDashboardDataService(pdatastreamid, pEndPoint, pIndex, visualization_id, visualization_impl_details, container, previsionid ){
    
    var lUrl     = '/dashboards/action_add_datastream';
    var lData     = {datastream_id: pdatastreamid,
                     visualization_id: visualization_id,
                     revision_id: previsionid,
                     dashboard_id: fDashboardId,
                     to: pIndex,
                     end_point: pEndPoint,
					 impl_details: visualization_impl_details,
					 container: container};

    $.ajax({ url: lUrl
            , type:'GET'
            , data: lData
            , dataType: 'json'
            , success: onSuccessDashboardDataServiceAdded
            , error: onErrorDashboardDataServiceAdded
            }
    );
}

function onSuccessDashboardDataServiceAdded(pResponse){

    if (pResponse.pStatus == 'ERROR') {
        $.TwitterMessage({'type': 'error', 'message': pResponse.pMessage});
        return;
    }
    
	fDashboardId = pResponse.dashboard_revision_id;
    $.url.setUrl(this.url);
    
    var lDataServiceId      = $.url.param("datastream_id");
	var lRevisionId      	= $.url.param("revision_id");
	var lVisualization_id   = $.url.param("visualization_id");
	var container   		= $.url.param("container");
	var visualization_impl_details   = $.url.param("impl_details");
    var lEndPoint  			= unescape($.url.param("end_point")).replace(/\+/g, ' ');
    var lTo                 = parseInt($.url.param("to"));
    var lDataService        = $("#id_dataservice_" + container)[0];
    var lTitle              = jQuery.data(lDataService, "dataservice_title");
   
    var lDescription        = jQuery.data(lDataService, "dataservice_description");
    var lParameters         = jQuery.data(lDataService, "dataservice_parameters");
    var lDataSourceEndPoint = jQuery.data(lDataService, "datasource_end_point");
    var lUserNick           = jQuery.data(lDataService, "user_nick");
    var lUserEmail          = jQuery.data(lDataService, "user_email");
    var lCategory           = jQuery.data(lDataService, "dataservice_category_name");
    var lCreatedAt          = jQuery.data(lDataService, "created_at");
    var lOrigin             = jQuery.data(lDataService, "origin");
	var lpermalink          = jQuery.data(lDataService, "datastream_permalink");
    var dataSetType         = jQuery.data(lDataService, "dataset_type");
    var lIsSelfPublishing   = jQuery.data(lDataService, "is_self_publishing");
    
	var isChart   			= jQuery.data(lDataService, "isChart");
	var sovId   			= jQuery.data(lDataService, "sov_id");
    var sovrevisionId   	= jQuery.data(lDataService, "sov_revision_id");
	var sov_impl_details   	= jQuery.data(lDataService, "sov_impl_details");
    var sources             = [];//jQuery.data(lDataService, "sources");

	if(isChart){
		var lHtml               = '<div id="id_droppable_dashboard_dataservice_container_' + lTo + '" rel="#id_dashboard_dataservice_container_' + lTo + '" class="Drop"' + ' data="' + lTo + '"><div><span>' + gettext( "APP-DROPHERE-TEXT" ) + '</span></div></div>';
	    lHtml                   = lHtml + '<div id="id_dashboard_dataservice_container_' + lTo + '" class="ao-draggable-dashboard-dataservice-container">';
	    lHtml                   = lHtml + '<div id="id_maximized_dashboard_dataservice_'+ lTo+'" style="display:none;"></div>';
	    lHtml                   = lHtml + '<div id="id_dashboard_dataservice_toolbar_' + lTo + '" class="dataStreamDrag toolbar clearfix" data="#id_dashboard_dataservice_container_' + lTo + '">';
	    lHtml                   = lHtml + '<div class="FR">';
	    lHtml                   = lHtml + '<a href="javascript:;" id="id_removeDashboardChartButton_' + lTo + '" title="' + gettext( "APP-REMOVE-TEXT" ) + '" class="Icon FR ic_Remove"><span class="DN">' + gettext( "APP-REMOVE-TEXT" ) + '</span></a>';
	    lHtml                   = lHtml + '<span class="Sep FR"><span class="DN">|</span></span>';
	    lHtml                   = lHtml + '<a href="javascript:;" id="id_maximizeDashboardDataServiceButton_' + lTo + '" rel="#id_dashboard_dataservice_' + lTo + '" title="' + gettext( "APP-MAXIMIZE-TEXT" ) + '" class="Icon FR ic_Maximize"><span class="DN">' + gettext( "APP-MAXIMIZE-TEXT" ) + '</span></a>';
	    lHtml                   = lHtml + '<span class="Sep FR"><span class="DN">|</span></span>';
	    lHtml                   = lHtml + '<a href="javascript:;" id="id_refreshChartButton_' + lTo + '" title="' + gettext( "APP-RELOAD-TEXT" ) + '" class="Icon FR ic_Refresh"><span class="DN">' + gettext( "APP-RELOAD-TEXT" ) + '</span></a>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                     = lHtml + '<div class="dataStreamContainer">';
	    lHtml                     = lHtml + '<div id="id_dashboard_dataservice_' + lTo + '" >' +'</div>';
	    lHtml                     = lHtml + '<div class="dataStreamActions bottomActions">';
	    lHtml                     = lHtml + '<div class="actionsInner toolbar clearfix">';
	
	    if (canChange) {
		    if (dataSetType == 'URL'){
		    lHtml                   = lHtml + '<div class="collectedFrom toolbar FL clearfix">';
		    lHtml                   = lHtml + '<a id="id_gotosource" href="'+lDataSourceEndPoint+'" target="_blank" rel="nofollow" title="' + gettext("APP-WHERETHISCOMEFROM-TEXT") + ': '+lDataSourceEndPoint+'" class="Icon ic_CollectedFrom FL"><span class="DN">' + gettext("APP-WHERETHISCOMEFROM-TEXT") + '</span></a>';
		    lHtml                   = lHtml + '</div>';
		    } else if(dataSetType == 'SELF PUBLISH') {
		    lHtml                   = lHtml + '<div class="collectedFrom noHover toolbar FL clearfix">';
		    lHtml                   = lHtml + '<span title="' + gettext('APP-USERUPLOAD-TEXT') + '" class="Icon ic_File FL"><span class="DN">' + gettext('APP-USERUPLOAD-TEXT') + '</span></span>';
		    lHtml                   = lHtml + '</div>';
		    } else if (dataSetType == 'WEBSERVICE') {
	    	lHtml                   = lHtml + '<div class="collectedFrom noHover toolbar FL clearfix">';
	        lHtml                   = lHtml + '<span title="' + gettext('APP-SOAP-TEXT') + ': ' + lDataSourceEndPoint + '" class="Icon ic_SOAP FL"><span class="DN">' + gettext('APP-SOAP-TEXT') + '</span></span>';
	        lHtml                   = lHtml + '</div>'
		    }
	    }
	
	    lHtml                     = lHtml + '<div class="sep FL"><span class="DN">|</span></div>';
	    lHtml                     = lHtml + '<div class="actionsMenu relative FR">';
	    lHtml                     = lHtml + '<a href="javascript:;" id="id_menuDashboardDataServiceButton_' + lTo + '" class="Icon FR ic_Menu" title="' + gettext( "APP-ACTIONS-TEXT" ) + '"><span>' + gettext( "APP-ACTIONS-TEXT" ) + '</span></a>';
	    lHtml                     = lHtml + '<div class="dashboard-dataservice-tooltip" id="id_tooltipDashboardDataServiceButton_' + lTo + '">';
	    lHtml                     = lHtml + '<div class="menuInner">';
	    lHtml                     = lHtml + '<ul class="In">';
	    lHtml                     = lHtml + '<li class="J"><a href="javascript:;" title="' + gettext( "APP-ACTIONS-TEXT" ) + '" class="Icon FR ic_Menu open"><span>' + gettext( "APP-ACTIONS-TEXT" ) + '</span></a></li>';
	    if (canChange) {
	    lHtml                   = lHtml + ( !lIsSelfPublishing ? '<li class="Item"><a href="javascript:;" id="id_sourceDashboardDataServiceButton_' + lTo  + '" title="' + gettext( "DB-ACTIONSMENU-REUSESOURCE" ) + '" class="Icon ic_Src">' + gettext( "APP-REUSESOURCE-TEXT" ) + '</a></li>' : '');
	    }
	    lHtml                   = lHtml + '</ul>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '<div class="sep FR"><span class="DN">|</span></div>';
	    lHtml                     = lHtml + '</div>';
	    lHtml                     = lHtml + '</div>';
	    if (sources.length > 0) {
	    lHtml                   = lHtml + '<div id="id_dashboard_dataservice_goToSource_'+lTo+'" class="gotosource">';
	    lHtml                   = lHtml + '<div class="gotosourceInner">';
	    lHtml                   = lHtml + '<span>' + gettext( "APP-SOURCES-TEXT" ) + ': </span>';
	    for (var i=0; i < sources.length;i++) {
	        if (i!=0) {
	        lHtml                   = lHtml + '<em class="comma">, </em>';
	        }
	    lHtml                   = lHtml + '<a href="' + sources[i].url + '" title="' + sources[i].name + '">' + sources[i].name + '</a>';
	    }
	    lHtml                   = lHtml + '</div><span class="transparency">&nbsp;</span></div>';
	    }
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '</div>';
	}else{
	    var lHtml               = '<div id="id_droppable_dashboard_dataservice_container_' + lTo + '" rel="#id_dashboard_dataservice_container_' + lTo + '" class="Drop" data="' + lTo + '"><div><span>' + gettext( "APP-DROPHERE-TEXT" ) + '</span></div></div>';
	    lHtml                   = lHtml + '<div id="id_dashboard_dataservice_container_' + lTo + '" class="ao-draggable-dashboard-dataservice-container">';
	    lHtml                   = lHtml + '<div id="id_maximized_dashboard_dataservice_'+ lTo+'" style="display:none;"></div>';
	    lHtml                   = lHtml + '<div id="id_dashboard_dataservice_toolbar_' + lTo + '" class="dataStreamDrag toolbar clearfix" data="#id_dashboard_dataservice_container_' + lTo + '">';
	    lHtml                   = lHtml + '<div class="FR">';
	    lHtml                   = lHtml + '<a href="javascript:;" id="id_removeDashboardDataServiceButton_' + lTo + '" title="' + gettext( "APP-REMOVE-TEXT" ) + '" class="Icon FR ic_Remove"><span class="DN">' + gettext( "APP-REMOVE-TEXT" ) + '</span></a>';
	    lHtml                   = lHtml + '<span class="Sep FR"><span class="DN">|</span></span>';
	    lHtml                   = lHtml + '<a href="javascript:;" id="id_maximizeDashboardDataServiceButton_' + lTo + '" rel="#id_dashboard_dataservice_' + lTo + '" title="' + gettext( "APP-MAXIMIZE-TEXT" ) + '" class="Icon FR ic_Maximize"><span class="DN">' + gettext( "APP-MAXIMIZE-TEXT" ) + '</span></a>';
	    lHtml                   = lHtml + '<span class="Sep FR"><span class="DN">|</span></span>';
	    lHtml                   = lHtml + '<a href="javascript:;" id="id_resetDashboardDataServiceButton_' + lTo + '" title="' + gettext( "APP-RELOAD-TEXT" ) + '" class="Icon FR ic_Refresh"><span class="DN">' + gettext( "APP-RELOAD-TEXT" ) + '</span></a>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                     = lHtml + '<div class="dataStreamContainer">';
	    lHtml                     = lHtml + '<div id="id_dashboard_dataservice_' + lTo + '" >' +'</div>';
	    lHtml                     = lHtml + '<div class="dataStreamActions bottomActions">';
	    lHtml                     = lHtml + '<div class="actionsInner toolbar clearfix">';
	
	    if (canChange) {
	    if (dataSetType == 'URL'){
	    lHtml                   = lHtml + '<div class="collectedFrom toolbar FL clearfix">';
	    lHtml                   = lHtml + '<a id="id_gotosource" href="'+lDataSourceEndPoint+'" target="_blank" rel="nofollow" title="' + gettext("APP-WHERETHISCOMEFROM-TEXT") + ': '+lDataSourceEndPoint+'" class="Icon ic_CollectedFrom FL"><span class="DN">' + gettext("APP-WHERETHISCOMEFROM-TEXT") + '</span></a>';
	    lHtml                   = lHtml + '</div>';
	    } else if(dataSetType == 'SELF PUBLISH') {
	    lHtml                   = lHtml + '<div class="collectedFrom noHover toolbar FL clearfix">';
	    lHtml                   = lHtml + '<span title="' + gettext('APP-USERUPLOAD-TEXT') + '" class="Icon ic_File FL"><span class="DN">' + gettext('APP-USERUPLOAD-TEXT') + '</span></span>';
	    lHtml                   = lHtml + '</div>';
	    } else if (dataSetType == 'WEBSERVICE') {
    	lHtml                   = lHtml + '<div class="collectedFrom noHover toolbar FL clearfix">';
        lHtml                   = lHtml + '<span title="' + gettext('APP-SOAP-TEXT') + ': ' + lDataSourceEndPoint + '" class="Icon ic_SOAP FL"><span class="DN">' + gettext('APP-SOAP-TEXT') + '</span></span>';
        lHtml                   = lHtml + '</div>'
	    }
	    }
	
	    lHtml                     = lHtml + '<div class="sep FL"><span class="DN">|</span></div>';
	    lHtml                     = lHtml + '<div class="actionsMenu relative FR">';
	    lHtml                     = lHtml + '<a href="javascript:;" id="id_menuDashboardDataServiceButton_' + lTo + '" class="Icon FR ic_Menu" title="' + gettext( "APP-ACTIONS-TEXT" ) + '"><span>' + gettext( "APP-ACTIONS-TEXT" ) + '</span></a>';
	    lHtml                     = lHtml + '<div class="dashboard-dataservice-tooltip" id="id_tooltipDashboardDataServiceButton_' + lTo + '">';
	    lHtml                     = lHtml + '<div class="menuInner">';
	    lHtml                     = lHtml + '<ul class="In">';
	    lHtml                     = lHtml + '<li class="J"><a href="javascript:;" title="' + gettext( "APP-ACTIONS-TEXT" ) + '" class="Icon FR ic_Menu open"><span>' + gettext( "APP-ACTIONS-TEXT" ) + '</span></a></li>';
	    if (canChange) {
	    lHtml                   = lHtml + ( !lIsSelfPublishing ? '<li class="Item"><a href="javascript:;" id="id_sourceDashboardDataServiceButton_' + lTo  + '" title="' + gettext( "DB-ACTIONSMENU-REUSESOURCE" ) + '" class="Icon ic_Src">' + gettext( "APP-REUSESOURCE-TEXT" ) + '</a></li>' : '');
	    }
	    lHtml                   = lHtml + '</ul>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '<div class="sep FR"><span class="DN">|</span></div>';
	    lHtml                     = lHtml + '</div>';
	    lHtml                     = lHtml + '</div>';
	    if (sources.length > 0) {
	    lHtml                   = lHtml + '<div id="id_dashboard_dataservice_goToSource_'+lTo+'" class="gotosource">';
	    lHtml                   = lHtml + '<div class="gotosourceInner">';
	    lHtml                   = lHtml + '<span>' + gettext( "APP-SOURCES-TEXT" ) + ': </span>';
	    for (var i=0; i < sources.length;i++) {
	        if (i!=0) {
	        lHtml                   = lHtml + '<em class="comma">, </em>';
	        }
	    lHtml                   = lHtml + '<a href="' + sources[i].url + '" title="' + sources[i].name + '">' + sources[i].name + '</a>';
	    }
	    lHtml                   = lHtml + '</div><span class="transparency">&nbsp;</span></div>';
	    }
	    lHtml                   = lHtml + '</div>';
	    lHtml                   = lHtml + '</div>';
	}

	$("#id_dashboard_dataservices_container").append(lHtml);
    $fDashboardsContainers = $('[id*=id_dashboard_dataservice_container_]');
    var lDashboardDataServiceContainer  = $("#id_dashboard_dataservice_container_" + lTo)[0];
    
	var lDashboardDataServiceId = pResponse.pIds;
	
    jQuery.data(lDashboardDataServiceContainer, "index", lTo);
    jQuery.data(lDashboardDataServiceContainer, "dashboard_dataservice_id", lDashboardDataServiceId);
    jQuery.data(lDashboardDataServiceContainer, "dataservice_id", lRevisionId);
    jQuery.data(lDashboardDataServiceContainer, "dataservice_title", lTitle);
    jQuery.data(lDashboardDataServiceContainer, "dataservice_description", lDescription);
	jQuery.data(lDashboardDataServiceContainer, "isChart", isChart);
	if (isChart) {
		jQuery.data(lDashboardDataServiceContainer, "sov_id", sovId);
        jQuery.data(lDashboardDataServiceContainer, "sov_revision_id", sovrevisionId);
		jQuery.data(lDashboardDataServiceContainer, "sov_impl_details", sov_impl_details);
	}else{
		jQuery.data(lDashboardDataServiceContainer, "sov_id", '');
        jQuery.data(lDashboardDataServiceContainer, "sov_revision_id", '');
		jQuery.data(lDashboardDataServiceContainer, "sov_impl_details", '');
	}
	
    jQuery.data(lDashboardDataServiceContainer, "dataservice_end_point", lEndPoint);
    jQuery.data(lDashboardDataServiceContainer, "dataservice_parameters", lParameters);
    jQuery.data(lDashboardDataServiceContainer, "datasource_end_point", lDataSourceEndPoint);
    jQuery.data(lDashboardDataServiceContainer, "user_nick", lUserNick);
    jQuery.data(lDashboardDataServiceContainer, "short_url", false);
    jQuery.data(lDashboardDataServiceContainer, "user_email", lUserEmail);
    jQuery.data(lDashboardDataServiceContainer, "created_at", lCreatedAt);
    jQuery.data(lDashboardDataServiceContainer, "dataservice_category_name", lCategory);
    jQuery.data(lDashboardDataServiceContainer, "origin", "dashboardManager");
	jQuery.data(lDashboardDataServiceContainer, "datastream_permalink", lpermalink);

    $fDashboardsContainers = $("div[id*=id_dashboard_dataservice_container_]");

    $('#id_dataservice_' + lDataServiceId).addClass('dataServiceAdded');
    
    $fDashboardsContainers.addClass('drag-icon');
	
    if (isChart) {
        var _var = "chart_" + lDashboardDataServiceId;
        window[_var] = new DashboardChart({'visualization_id': sovrevisionId, 'chartJson' : JSON.parse(sov_impl_details), '$Container': $fDashboardsContainers.eq(lTo), 'dataStreamId' : jQuery.data(lDataService, "revision_id"), 'endPoint': '', 'index':lTo});
		$("#id_dashboard_dataservice_container_" + lTo).find('a[id*=id_maximizeDashboardDataServiceButton_]').bind('click', {index: lTo}, onMaximizeDashboardDataServiceButtonClicked);
    }else{
		initDashboardDataService(lTo);	
	}
    
    if(dashboardStatus.get("status") != '0' && dashboardStatus.get("status") != '1'){
        dashboardStatus.set({'status' : '0'});
        dashboardStatus.renderButtons();
    }

    JPad.init();
}

function onErrorDashboardDataServiceAdded(pResponse){
    var lMessage = pResponse.status + ': ' + pResponse.statusText;
    jQuery.TwitterMessage( { type: 'error', message : lMessage } );
}

function initDashboardDataService(pIndex){
    var $lDashboardDataServiceContainer = $fDashboardsContainers.eq(pIndex);
    
    $lDashboardDataServiceContainer.find('div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
    $lDashboardDataServiceContainer.find('div[id*=id_dashboard_dataservice_toolbar_]').css('visibility','hidden');

    //if((authManager.hasPrivilege('dashboard.can_remove_datastreams') && fUserNick == authManager.getNick())
        //|| authManager.hasPrivilege('any_dashboard.can_remove_datastreams')){

        var $lRemoveDashboardDataServiceButton = $lDashboardDataServiceContainer.find('a[id*=id_removeDashboardDataServiceButton_]');
        $lRemoveDashboardDataServiceButton.bind('click', {index: pIndex}, onRemoveDashboardDataServiceButtonClicked);
    //}

    //if((authManager.hasPrivilege('dashboard.can_change') && fUserNick == authManager.getNick())
        //|| authManager.hasPrivilege('any_dashboard.can_change')){

        $lDashboardDataServiceContainer.find('.dataStreamDrag').draggable({ snapMode: 'both'
                                                                      , revert: true
                                                                      , cursor: 'move'
                                                                      , start : function(){
                                                                      }
                                                                      , helper: onDragDashboardDataServiceHelper});

        $lDroppableDashboardDataServiceContainer = $("#id_droppable_dashboard_dataservice_container_" + pIndex);

        $lDroppableDashboardDataServiceContainer.droppable({
                                                            tolerance: 'pointer'
                                                            ,drop: onDataServiceDroppedHandler
                                                            ,accept: '.ao-draggable-dataservice, .dataStreamDrag'
                                                            ,hoverClass: 'drophover'
                                                            ,activeClass: 'ui-state-highlight'
                                                            });



    //} else if(authManager.hasRole("ao-user")) {
    //    $( 'div[id*=id_dashboard_dataservice_toolbar_]' ).css( 'cursor', 'default' );
    //}

    $lDashboardDataServiceContainer.find('a[id*=id_menuDashboardDataServiceButton_]').click(function(){$(this).next().fadeIn('fast')});
    $lDashboardDataServiceContainer.find('div[id*=id_tooltipDashboardDataServiceButton_]').mouseleave(closeDashboardDataServiceTooltip);
    $lDashboardDataServiceContainer.find('div[id*=id_tooltipDashboardDataServiceButton_] .J .ic_Menu').click(closeDashboardDataServiceTooltip);


    $lDashboardDataServiceContainer.find('a[id*=id_resetDashboardDataServiceButton_]').bind('click', {index: pIndex}, onResetDashboardDataServiceButtonClicked);
    $lDashboardDataServiceContainer.find('a[id*=id_maximizeDashboardDataServiceButton_]').bind('click', {index: pIndex}, onMaximizeDashboardDataServiceButtonClicked);

    $lDashboardDataServiceContainer.find('a[id*=id_sourceDashboardDataServiceButton_]').bind('click', {index: pIndex}, onSourceDashboardDataServiceButtonClicked);

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

    var lId       = jQuery.data($lDashboardDataServiceContainer[0], "dataservice_id");
    var lEndPoint = jQuery.data($lDashboardDataServiceContainer[0], "dataservice_end_point");

    /*if( !$lDashboardDataServiceContainer.data( 'can_view' ) )
    {
        var lHtml = '<div class="dataStreamBox privateDS clearfix">'+
                        '<h2>' + gettext( "DBMAN-DSPRIVATE-TITLE" ) + '</h2>'+
                        '<div class="privateBox">'+
                            '<p>' + gettext( "DBMAN-DSPRIVATE-SUBTITLE" ) + '</p>'+
                            '<p>' + gettext( "DBMAN-DSPRIVATE-TIP" ) + '</p>'+
                        '</div>'+
                    '</div>';
        $fDashboardsContainers.eq(pIndex).find('.dataStreamActions').removeAttr('style');
        $fDashboardsContainers.eq(pIndex).find('#id_dashboard_dataservice_' + pIndex).html(lHtml);
        $fDashboardsContainers.eq(pIndex).find('.dataStreamActions').hide();
    } else {*/
        invokeDashboardDataService(lId, lEndPoint, pIndex);
    //}
}

function closeDashboardDataServiceTooltip(){
    $lDataServiceContainer = $(this).parents('div[id*=id_dashboard_dataservice_container_]');
    $lDataServiceContainer.find('div[id*=id_tooltipDashboardDataServiceButton_]').fadeOut('fast');
}

function switchDashboardDataServices(pIndex1, pIndex2){
    var $lDashboardDataServiceContainer1    = $fDashboardsContainers.eq(pIndex1).detach();
    var $lDashboardDataServiceContainer2    = $fDashboardsContainers.eq(pIndex2).detach();
    
    var $lDroppableContainter1 =  $('#id_droppable_dashboard_dataservice_container_' + pIndex1);
    var $lDroppableContainter2 =  $('#id_droppable_dashboard_dataservice_container_' + pIndex2);
    
    $lDroppableContainter2.after($lDashboardDataServiceContainer1);
    $lDroppableContainter1.after($lDashboardDataServiceContainer2);
    
    $lDroppableContainter1.attr("rel", $lDashboardDataServiceContainer2.attr("id"));
    $lDroppableContainter2.attr("rel", $lDashboardDataServiceContainer1.attr("id"));

    $lDashboardDataServiceContainer1.data("index", pIndex2);
    $lDashboardDataServiceContainer2.data("index", pIndex1);

    $fDashboardsContainers = $('div[id*=id_dashboard_dataservice_container_]');
    if($fDashboardsContainers.eq(pIndex1).data("isChart")){
        var chart = "chart_" + $fDashboardsContainers.eq(pIndex1).data("dashboard_dataservice_id");
        window[chart].attributes.$Container = $fDashboardsContainers.eq(pIndex1).find('[id*=id_chartContainer_]').eq(0);
        window[chart].attributes.index = pIndex1;
        window[chart].reRenderChart();
    }else{
        $fDashboardsContainers.eq(pIndex1).find('[id*=id_removeDashboardDataServiceButton_]').unbind();
        $fDashboardsContainers.eq(pIndex1).find('[id*=id_removeDashboardDataServiceButton_]').bind('click', {index: pIndex1}, onRemoveDashboardDataServiceButtonClicked);
    }

    if($fDashboardsContainers.eq(pIndex2).data("isChart")){
        var chart = "chart_" + $fDashboardsContainers.eq(pIndex2).data("dashboard_dataservice_id");
        window[chart].attributes.$Container = $fDashboardsContainers.eq(pIndex2).find('[id*=id_chartContainer_]').eq(0);
        window[chart].attributes.index = pIndex2;
        window[chart].reRenderChart();
    }else{
        $fDashboardsContainers.eq(pIndex2).find('[id*=id_removeDashboardDataServiceButton_]').unbind();
        $fDashboardsContainers.eq(pIndex2).find('[id*=id_removeDashboardDataServiceButton_]').bind('click', {index: pIndex2}, onRemoveDashboardDataServiceButtonClicked);
    }
}

function onSourceDashboardDataServiceButtonClicked(pEvent){
    var lIndex                         = pEvent.data.index;
    var lDashboardDataServiceContainer = $fDashboardsContainers[lIndex];
    var lEndPoint                      = jQuery.data(lDashboardDataServiceContainer, "datasource_end_point");
    var lServiceId                       = jQuery.data(lDashboardDataServiceContainer, "dataservice_id");
    window.location.replace(Configuration.baseUri + '/datastreams/create?end_point=' + $.URLEncode(lEndPoint) + '&data_stream_id='+lServiceId);
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
    contents = contents + '<span class="infoDS"><span class="categoryDS">'+lCategory+'</span> <span class="sep">|</span> <span class="authorDS">by <strong>'+lAuthor+'</strong></span></span>';
    $lMaximizedDashboardDataService.dialog( { title: '' + contents , resizable: false} );
    $lMaximizedDashboardDataService.dialog( 'option', 'position', [10, 10] );
	
	if($lDashboardDataServiceContainer.data('isChart')){
		$lMaximizedDashboardDataService.dialog( { width: 835, height: 580, resizable: false});
		$lMaximizedDashboardDataService.bind( 'dialogclose', { index : lIndex }, JPad.onDataServiceDialogClosed );
	}
    
    if($lDashboardDataServiceContainer.data('isChart')){
        var chart = "chart_" + $lDashboardDataServiceContainer.data("dashboard_dataservice_id");
        window[chart].renderMaximized();
    }

	try{
        $lMaximizedDashboardDataServiceContainer.open();
    }
    catch(e){
	}
	
    $($lMaximizedDashboardDataService).parent('div').find('#id_smaller').bind('click', { index:lIndex}, JPad.makeSmaller);
    $($lMaximizedDashboardDataService).parent('div').find('#id_bigger').bind('click', { index:lIndex}, JPad.makeBigger);

    JPad.open( lIndex );
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
    var lTo = pIndex;

	var lData = "datastream_revision_id=" + pId 
			+ '&pIndex=' + pIndex 
			+ '&limit=50'
			+ pEndPoint;

    var lIsChart = $Container.data("isChart");
    if (lIsChart) {
        var _var = "chart_" + lDashboardDataserviceId;
		window.lTo = lTo;
		window.visalization_id = lDashboardDataserviceId;
        var visualization_id = $Container.data('sov_revision_id');
        var implDetails = $Container.data("sov_impl_details");
        window[_var] = new DashboardChart({'visualization_id' : visualization_id, 'chartJson' : JSON.parse(implDetails), '$Container': $Container.find('#id_dashboard_dataservice_'+pIndex), 'dataStreamId' : pId, 'endPoint': pEndPoint, 'index':pIndex});
    }
    else {
        var lDashboardDataserviceId = $Container.data("dashboard_dataservice_id");
        var lUrl = '/dataviews/invoke';
        var lTo = pIndex;
		var lData = 'datastream_revision_id=' + pId 
				+ '&pIndex=' + pIndex 
				+ '&limit=50'
				+ pEndPoint;

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
	var isChart                         = $lDashboardDataServiceContainer.data('isChart');
    var lEndPoint                       = $lDashboardDataServiceContainer.data('dataservice_end_point');
    var lTitle                          = $lDashboardDataServiceContainer.data('dataservice_title');
    var lDescription                    = $lDashboardDataServiceContainer.data('dataservice_description');
    var lParameters                     = $lDashboardDataServiceContainer.data('dataservice_parameters');
    var lURL                            = '/dataviews/action_view?datastream_revision_id=' + lDataserviceId + lEndPoint;

    // hiding the notification button
    $lDashboardDataServiceContainer.find('[id*=id_notificationMessage_]').html('').parent('[id*=id_notification_]').fadeOut();

    var lHtml = '<div class="dataStreamBox clearfix"> <h2>' +
                    '<a href="' + lURL
                    +'" title="' +lDescription +'" class="clearfix" target="_blank">'
                    +'<span class="txt"><span class="titleDS"><strong>' + lTitle +'</strong>';
    lHtml = lHtml + '</span>';

    // displaying the last update time
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
        lNotificationHtml = '<span class="Icon ic_Warning"><span class="DN"' + gettext( "APP-LASTUPDATE-TEXT" ) + ': ' + lLastUpdate + '"</span></span><span class="helpTooltip middleArrow w200" style="display:none;"><span class="arrow"></span><span class="helpTxt">' + gettext( "APP-LASTUPDATE-TEXT" ) + ': ' + lLastUpdate + '</span></span>';
        $lDashboardDataServiceContainer.find('[id*=id_notificationMessage_]').html(lNotificationHtml).parents('[id*=id_notification_]').fadeIn();
        $lDashboardDataServiceContainer.find('[id*=id_notificationMessage_] .ic_Warning').mouseover(function(){
            $(this).next().fadeIn();
        }).mouseleave(function(){
            $(this).next().fadeOut();
        });
    }

    lHtml += '<span class="infoDS">';
    
    if (typeof lParameters !== "undefined") {
        if (lParameters != '') {
            lHtml = lHtml + '<span class="params">';
            if (lParameters != '') {
                lParameters = lParameters.split(',');
                lHtml = lHtml + ' (';
                var lSeparator = ', ';
                for (var i = 0; i < lParameters.length; i++) {
                    var lValue = $.url.param("pArgument" + i);
                    lHtml = lHtml + '<label for="pArgument' + i + '" >' + $.URLDecode(lValue) + '</label>';
                    lHtml = lHtml + '<input type="text" style="display:none" size="10" id="pArgument' + i + '" value="' + $.URLDecode(lValue) + '" />';
                    if (i + 1 == lParameters.length) {
                        lSeparator = '';
                    }
                    lHtml += lSeparator;
                }
            }
            lHtml = lHtml + ')';
            lHtml += '</span> <span class="sep">|</span> ';
        }
    }

    lHtml += '<span class="categoryDS">' + $lDashboardDataServiceContainer.data('dataservice_category_name')
            +'</span> <span class="sep">|</span> <span class="authorDS">' + gettext( "APP-BY-TEXT" ) + ' <strong>' + $lDashboardDataServiceContainer.data('user_nick')
            +'</strong></span>'
            + '</span>'
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
                    lText = ', ' + gettext( "DS-ENTERANEWVALUEFOR-TEXT" ) + ' ' + lText + ' ' + gettext( "APP-AND-TEXT" );
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
						lHtml  = lHtml + '<th><div>' + lValue + '</div></th>';
					}else{
						lHtml  = lHtml + '<td><div>' + lValue + '</div></td>';
					}
                    i++;
                }
                lHtml  = lHtml +'</tr>';
            }
            if(pResponse.fLength > 100){
            	lHtml  = lHtml +'</table><a href="'+lURL+'" target="_blank" class="viewMoreLink">' + gettext( "APP-VIEWMORE-TEXT" ) + '</a></div></div>';
            }else{
            	lHtml  = lHtml +'</table></div></div>';
            }
        }
    }
    lHtml = lHtml + '</div>';

    $fDashboardsContainers.eq(lIndex).find('.bottomActions').removeAttr('style');
    $fDashboardsContainers.eq(lIndex).find('#id_dashboard_dataservice_' + lIndex).html(lHtml);

    // tables long text rendering fix
    var $lTable = $fDashboardsContainers.eq(lIndex).find('.Tabla');
    if ($lTable.size() == 1) {
        var lMaxWidth = 150;
        for(var lColumn = 1; lColumn <= pResponse.fCols; lColumn++){
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
        $fDashboardsContainers.eq(lIndex).find('#id_createChart_'+lIndex).hide();
    }

    $fDashboardsContainers.eq(lIndex).find('#id_retryDataServiceButton').bind('click', {index: lIndex}, onResetDashboardDataServiceButtonClicked);
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
    var lSubTitle                       = $lDashboardDataServiceContainer.data('dataservice_subtitle');
    var lDescription                    = $lDashboardDataServiceContainer.data('dataservice_description');
    var lURL                            = $lDashboardDataServiceContainer.data('datastream_permalink');
    var gotosource                      = $lDashboardDataServiceContainer.find('[id*=id_dashboard_dataservice_goToSource_] a').attr('href');
    var lRepairUrl                      = Configuration.baseUri + '/portal/DataStreamRepairer/actionRepair?dataservice_id=' + lDataserviceId + '&end_point=' + $.URLEncode(lEndPoint);
    var lParameters                     = $lDashboardDataServiceContainer.data('dataservice_parameters');

    var lHtml = '<div class="dataStreamBox clearfix"> <h2>' +
                    '<a href="javascript:;" title="' + lDescription +'" class="clearfix">'
                    +'<span class="txt"><span class="titleDS"><strong>' + lTitle + '</strong>  <br/> ';
    lHtml = lHtml + '</span>';

    lHtml += '<span class="infoDS">';
    if (lParameters != '') {
        lHtml += '<span class="params">';
        lParameters = lParameters.split(',');
        lHtml = lHtml + ' (';
        var lSeparator = ', ';
        for(var i=0; i<lParameters.length;i++){
            var lValue = $.url.param("pArgument" + i);
            lHtml = lHtml + '<label for="pArgument' + i + '" >' + $.URLDecode(lValue) + '</label>';
            lHtml = lHtml + '<input type="text" style="display:none" size="10" id="pArgument' + i + '" value="' + $.URLDecode(lValue) + '" />';
            if(i + 1 == lParameters.length){
                lSeparator = '';
            }
            lHtml += lSeparator;
        }
        lHtml = lHtml + ')';
        lHtml += '</span> <span class="sep">|</span> ';
    }

            lHtml += '<span class="categoryDS">'+$lDashboardDataServiceContainer.data('dataservice_category_name')+'</span> <span class="sep">|</span> <span class="authorDS">' + gettext( "APP-BY-TEXT" ) + ' <strong>'+$lDashboardDataServiceContainer.data('user_nick')+'</strong></span>' +
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

    $fDashboardsContainers.eq(lIndex).find('.bottomActions').removeAttr('style');
    $fDashboardsContainers.eq(lIndex).find('#id_dashboard_dataservice_' + lIndex).html(lHtml);

    $fDashboardsContainers.eq(lIndex).find('.dataStreamBox').addClass('errorFix');

    $fDashboardsContainers.eq(lIndex).find('#id_repairDashboardDataServiceButton_' + lIndex).attr('href', lRepairUrl);

    $fDashboardsContainers.eq(lIndex).mouseover( function(){
         $fDashboardsContainers.eq(lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','visible');
        });
    $fDashboardsContainers.eq(lIndex).mouseleave( function(){
        $fDashboardsContainers.eq(lIndex).find('div[id*=id_dashboard_dataservice_toolbar_], div[id*=id_dashboard_dataservice_goToSource_]').css('visibility','hidden');
        });

    $fDashboardsContainers.eq(lIndex).find('input[id*=pArgument]').bind( 'keydown', { index: lIndex },
        function( event ){
        if( event.keyCode == 13 ){
            onArgumentChange( event.currentTarget, event.data.index);
        }
    }).bind('blur', { index: lIndex },
        function( event ){
            onArgumentChange( event.currentTarget,  event.data.index);
    });

    $fDashboardsContainers.eq(lIndex).find('h2').bind( 'click', { index: lIndex },
        function( event ){
            var $target = $( event.target );
            if( $target.is( "label" ) || $target.is( "input" ) ) {
                onArgumentClicked( event.data.index, $target );
                return false;
            }
    });

    $fDashboardsContainers.eq(lIndex).find('#id_retryDataServiceButton').bind('click', {index: lIndex}, onResetDashboardDataServiceButtonClicked);

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

    var lDashboardId     = $.url.param("pDashboardId");
    var lTo             = $.url.param("plTo");
    var lFrom             = $.url.param("plFrom");

    if( lDashboardId != undefined ){
        moveDashboardDataService(lDashboardId, lTo, lFrom);
        $('#id_dashboard_dataservice_container_'+lTo).show();
        jQuery.TwitterMessage( { type: 'success', message : gettext( "DBMAN-ADDDS-SUCCESS" ) } );
    }
}

function onBeforeDataServiceExecute(xhr, settings){

    // Prevent override of global beforeSend
    $.ajaxSettings.beforeSend(xhr, settings);)

    $.url.setUrl(this.url);
    var lIndex                          = $.url.param("pIndex");
    var $lDashboardDataServiceContainer = $('#id_dashboard_dataservice_container_' + lIndex);
    $lDashboardDataServiceContainer.find('.bottomActions').css('display', 'none');
    
}

function onArgumentClicked(pIndex, $target){
    var $lLabel                         = $target;// $fDashboardsContainers.eq(pIndex).find('label');//$(pLabel);
    var $DashboardDataServiceContainer  = $fDashboardsContainers.eq(pIndex);
    var $lBody                          = $DashboardDataServiceContainer.find('#id_dashboard_dataservice_' + pIndex).html;

    var $lValue = $DashboardDataServiceContainer.find('input[id=' + $lLabel.attr('for') + ']');
    var lText    = $lLabel.text();

    $lValue.val(lText);
    $lLabel.hide();
    $lValue.show().focus();
}

function onArgumentChange(pValue, pIndex){
    var $lValue                         = $(pValue);
    var lDashboardDataServiceContainer  = $fDashboardsContainers[pIndex];

    var $lLabel                 = $lValue.siblings('label[for=' + pValue.id + ']');
    var lValue                  = $lValue.val();
    
    var lDataStreamEndPoint     = jQuery.data(lDashboardDataServiceContainer, "dataservice_end_point");
    var lEndPoint               = new EndPoint({ parameters: lDataStreamEndPoint });
    lEndPoint.setParameter(pValue.id, lValue);

    jQuery.data(lDashboardDataServiceContainer, "dataservice_end_point", lEndPoint.toString());
    jQuery.data(lDashboardDataServiceContainer, "short_url", null);
    $(lDashboardDataServiceContainer).find('ul.share li input').val('');

    $lLabel.text(lValue);
    $lValue.hide();
    $lLabel.show();
    
    var lUrl = jQuery.data(lDashboardDataServiceContainer, "datastream_permalink");
    if (lUrl.indexOf('?') > 0) {
        lUrl = lUrl.substring(0, lUrl.indexOf('?'));
    }
    lUrl = lUrl + lEndPoint.getUrlChunk();
    jQuery.data(lDashboardDataServiceContainer, "datastream_permalink", lUrl);

    var lId         = jQuery.data(lDashboardDataServiceContainer, "dataservice_id");
    var lData       = '?dataservice_id=' + lId + '&end_point=' + encodeURIComponent(lEndPoint.toString());

    $('#id_resetDashboardDataServiceButton_' + pIndex).trigger('click');
}

function onResetDashboardDataServiceButtonClicked(pEvent){
    var lIndex                          = pEvent.data.index;
    var $lDashboardDataServiceContainer = $fDashboardsContainers.eq(lIndex);

    var $lIframe = $('#id_dashboard_dataservice_' + lIndex);

    startWaitMessage( $lIframe, lIndex);

    var lId         = jQuery.data($lDashboardDataServiceContainer[0], "dataservice_id");
    var lEndPoint = jQuery.data($lDashboardDataServiceContainer[0], "dataservice_end_point");

    invokeDashboardDataService(lId, lEndPoint, lIndex );
}

function onRemoveDashboardDataServiceButtonClicked(pEvent){
    if(confirm( gettext( "DB-REMOVEDS-CONFIRM" ) )){
        $(this).unbind('click');
        var lIndex                          = pEvent.data.index;
        var lDashboardDataServiceContainer  = $fDashboardsContainers[lIndex];
        var lId                             = jQuery.data(lDashboardDataServiceContainer, "dashboard_dataservice_id");

        removeDashboardDataService(lId, lIndex);
    }
}

function removeDashboardDataService(pId, pIndex){
    var lUrl     =  '/dashboards/action_remove_dashboard_widget';
    var lData     = "widget_id=" + pId + "&dashboard_id=" + fDashboardId + "&index=" + pIndex;

     $.ajax({ url: lUrl
            , type:'GET'
            , data: lData
            , dataType: 'json'
            , success: onSuccessDashboardDataServiceRemoved
            , error: onErrorDashboardDataServiceRemoved
            }
    );
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

    $lDashboardDataServiceContainer.remove();
	$lDroppableContainer.remove();
    
	if($fDashboardsContainers.size() == 1){
        $fPersonalizeShowButton.trigger('click');
    }

    $fDashboardsContainers   = $("div[id*=id_dashboard_dataservice_container_]");
    
     JPad.init();

     jQuery.TwitterMessage( { type: 'success', message : gettext( "DB-DSREMOVE-SUCCESS" ) } );
}

function onErrorDashboardDataServiceRemoved(pResponse){
    var lMessage = pResponse.status + ': ' + pResponse.statusText;
    jQuery.TwitterMessage( { type: 'error', message : lMessage } );
}
