var fUserNick,
    fDataServiceId,
    $fDashboards,
    $fDataService,
    $fDataServiceContainer,
    $fBottomActions,
    $fToolBar;

$(document).ready(function(){

    $fDataServiceContainer              = $("#id_dataStreamContainer");
    $fBottomActions                     = $(".bottomActions");
    $fToolBar                           = $("[id*=id_dataservice_toolbar_]");
    fDataServiceId                      = $fDataServiceContainer.data('dataservice_id');
    fUserNick                           = $fDataServiceContainer.data('user_nick');
    $fDataService                       = $fDataServiceContainer.find('#id_datastreamResult');
    $fEditDataServiceCommentsContainer  = $("#id_edit_dataservice_comments_container");

    ajaxManager.init();
    initDataServicePanel();
    initDataServiceCommentsPanel();

    $('#id_dataserviceTagsViewAllButton').tooltip({events: {def:'click, mouseleave', tooltip:'mouseenter'}
                                                    , position: "bottom center"
                                                    , offset: [10, -70]
                                                    , relative: "true",
                                                    onShow : function(){
                                                        var lOffset = $('#id_dataserviceTagsViewAllButton').offset()
                                                        var lTop = lOffset.top + 13;
                                                        var lLeft = lOffset.left - 143;

                                                        $('.ao-tag-tooltip').css({'top' : lTop, 'left' : lLeft, 'position' : 'absolute'})
                                                    }
                                                    , onBeforeShow : function(){
                                                        var a = $('.ao-tag-tooltip').detach();
                                                        $('body').append(a);
                                                    },
                                                    onBeforeHide : function(){
                                                        var a = $('.ao-tag-tooltip').detach();
                                                        $('.tagsPagination').append(a);
                                                    }
                                                });
    
    window.embedCodeOverlay = new EmbedCodeOverlay({'$OverlayContainer' : $('#id_embedCode')});
    //window.pivotTablesOverlay = new PivotTablesOverlay({'$OverlayContainer' : $('#id_pivotTables')});
    
    //init stat chart
    window.statChart = new DataStreamStats({'$Container' : $('#id_statChart'), 'id' : $("#id_dataStreamContainer").data('dataservice_id')});

        var sharePrivateOverlay = new SharePrivateOverlay({
            '$Button': $('button[id=id_sharePrivateDataStreamButton_]')
            , '$Container': $('#id_sharePrivateContainer')
            , '$Form': $('#id_private_share_form')
        });
});

function initDataServicePanel(){

    var lActionsMenu = new ActionsMenu();

    var lEmbedCode = new EmbedCodeDatastream({'$OverlayContainer' : $('#id_embedCode'), '$DatastreamContainer' : $('#id_embed_datastream_container'), '$data' : $('#id_dataStreamContainer')});
    $('#id_addEmbedDataServiceButton_').bind('click', {containerSelector: '#id_dataStreamContainer'}, _.bind(lEmbedCode.display, lEmbedCode));

    $fToolBar.find('a[id*=id_resetDataServiceButton_]').bind('click', onResetDataServiceButtonClicked);
    $fToolBar.find('a[id*=id_pivotDataServiceButton_]').bind('click', onPivotDataServiceButtonClicked);

    window.lExpandCollapse = new ExpandCollapse({
        '$ExpandButton': $fToolBar.find('a[id*=id_expandDataServiceButton_]')
        , '$CollapseButton': $fToolBar.find('a[id*=id_collapseDataServiceButton_]')
    })


    var lUrl        = $fDataServiceContainer.data("permalink");
    var lName       = $fDataServiceContainer.data('dataservice_title');

    if ($('.sharingDisabled').size() == 0) {
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

        if (typeof(BitlyClient) != 'undefined') {
            BitlyClient.shorten(lUrl, 'onSuccessUrlShortened');
        }

    }

    $fDataServiceContainer.find('input[id*=pArgument]').bind('keyup', onArgumentKeyup);

    var lId         = $fDataServiceContainer.data("dataservice_id");
    startWaitMessage($fDataService);
    var lEndPoint   = $fDataServiceContainer.data("dataservice_end_point");

    invokeDataService(lEndPoint);
    var lNotes = new NotesAnonymous({
        '$ViewMoreButton': $('#id_viewMoreNotesButton')
    });
}

function startWaitMessage(pHTMLElement){
    var lHtml = '<table class="Loading">';

    var lId = 1;
    lHtml = lHtml + '<tr><td><a href="javascript:;" onclick="ajaxManager.kill(\'p'+ lId.toString()+'\');" title="' + gettext( "DS-STOP-TITLE" ) + '"><span>' + gettext( "DS-STOP-TEXT" ) + '</span></a></td></tr>';

    pHTMLElement.html(lHtml);
}

function invokeDataService(pEndPoint){

    var lUrl     = '/rest/datastreams/' + $fDataServiceContainer.data('datastreamrevision_id')  + '/data.json';
    var lData    = '&limit=50'
    			+ pEndPoint;

    var ajax = $.ajax({ url: lUrl
                            , type:'GET'
                            , data: lData
                            , dataType: 'json'
                            , success: onSuccessDataServiceExecute
                            , error: onErrorDataServiceExecute
                            }
                    );

    ajaxManager.register( 1, ajax );
}

function onSuccessDataServiceExecute(pResponse){

    var lHtml = '<div class="dataStreamBox">';
	
	var lHeaderCells = [];
	var lFirstHeader = false;
	var lNoMoreHeaders = false;
	
    if(pResponse.fType != 'ARRAY'){
        var lValue = '';
        if(pResponse.fType == 'TEXT'){
            lValue = '<table class="Texto" style="height: 212px;"><tr><td>' + pResponse.fStr + '</td></tr></table>';
        } else if(pResponse.fType == 'NUMBER'){
            var displayFormat = pResponse.fDisplayFormat;
            if (displayFormat != undefined) {
                var number = $.formatNumber(pResponse.fNum, {format:displayFormat.fPattern, locale:displayFormat.fLocale});
            } else {
                var number = pResponse.fNum;
            }
            lValue = '<table class="Numero" style="height: 212px;"><tr><td>' + String(number) + '</td></tr></table>';
        } else if(pResponse.fType == 'LINK'){
            lValue = '<table class="Texto" style="height: 212px;" ><tr><td><a target="_blank" href="' + pResponse.fUri + '" rel="nofollow" title="' + pResponse.fStr + '">' + pResponse.fStr + '</a></td></tr></table>';
        } else if(pResponse.fType == 'ERROR'){
            var lParameters = $fDataServiceContainer.data("dataservice_parameters");
            var lText = '';
            if (lParameters != '') {
                var lSplittedParameters = lParameters.split(', ');
                if (lSplittedParameters.length > 0) {
                    lText = lSplittedParameters.slice(0, -1).join(', ') + ' ' + gettext( "APP-AND-TEXT" ) + ' ' + lSplittedParameters[lSplittedParameters.length-1];
                    lText = ', ' + gettext( "DS-ENTERANEWVALUEFOR-TEXT" ) + ' ' + lText + ' ' + gettext( "APP-AND-TEXT" );
                }
            }
            lValue = '<table class="Nulo" ><tr><td> ' + gettext( "APP-NODATAFOUD-TEXT" ) + '. <span>' + gettext( "APP-PLEASE-TEXT" ) + lText + ' <a id="id_retryDataServiceButton" href="javascript:;" title="' + gettext( "APP-TRYAGAIN-TITLE" ) + '">' + gettext( "APP-TRYAGAIN-TEXT" ) + '</a>.</span></td></tr></table>';
        }
        lHtml  = lHtml + '<div class="Mensaje clearfix" style="height:212px;">' + lValue +'</div></div>';
    } else {
        i = 0;
        lHtml  = lHtml + '<div class="Mensaje clearfix" style="width:10000px;"><table class="tableDS">';
        var longColumns = [];
        for (var lRow = 1; lRow <= pResponse.fRows; lRow++) {
            lHtml = lHtml + '<tr>';
            for (var lColumns = 1; lColumns <= pResponse.fCols; lColumns++) {
                var lCell = pResponse.fArray[i];
                var lValue = '';
                var lExceedsLength = false;
                if (lCell.fType == 'TEXT') {
                    if (lCell.fStr.length == 1) {
                        lValue = lCell.fStr.replace('-', '&nbsp;');
                    }
                    else {
                        lValue = lCell.fStr;
                    }
                    if (lValue.length >= 80) {
                        lExceedsLength = true;
                    }
                }
                if (lCell.fType == 'NUMBER') {
                    var displayFormat = lCell.fDisplayFormat;
                    if (displayFormat != undefined) {
                        var number = $.formatNumber(lCell.fNum, {format:displayFormat.fPattern, locale:displayFormat.fLocale});
                        lValue = String(number);
                    } else {
                        lValue = String(lCell.fNum);
                    }
                }
                if (lCell.fType == 'LINK') {
                    if (lCell.fStr.length >= 80) {
                        lExceedsLength = true;
                    }
                    lValue = '<a target="_blank" href="' + lCell.fUri + '" rel="nofollow" title="' + lCell.fStr + '">' + lCell.fStr + '</a>';
                }
                if (lExceedsLength & $.inArray(lColumns, longColumns) == -1 ) {
                    longColumns.push(lColumns);
                }
				
				if (typeof lCell.fHeader !== "undefined" && lCell.fHeader == true && lNoMoreHeaders == false) {
					lFirstHeader = true;
					if (Configuration.language != "en") {
						if (typeof lCell.fHeaders !== "undefined") {
							lValue = lCell.fHeaders.fHeader;
						}
					}
					lHeaderCells.push(lValue);
				}else{
					lHtml  = lHtml + '<td>' + lValue + '</td>';
				}
                i++;
            }
			if(lFirstHeader){
				lNoMoreHeaders = true;
			}
            lHtml = lHtml + '</tr>';
        }
        lHtml  = lHtml +'</table></div></div>';
    }
	
	
    $fDataService.html(lHtml);

    /***  WE SHOULD PUT ALL THIS SHIT IN ANOTHER FUNCTION, LIKE complete FUNCTION FOR AJAX CALLS ***/

    if (typeof longColumns != 'undefined' && longColumns.length > 0) {
        $.each(longColumns, function(pIndex, pValue){
            $fDataService.find('.Tabla tr td:nth-child(' + pValue + ')').addClass('longText');
        })
    }

    var lMinWidth = 618;
    $fDataService.find('.Tabla').css('width', 'auto');
    var lWidth = $fDataService.find('.Tabla').width();
    var lHeight = $fDataService.find('.Tabla').height();
    if (lWidth > lMinWidth) {
        $fDataService.find('.Mensaje').width(lWidth);
        //$fDataService.find('.dataStreamBox').css('overflow', 'auto');
    } else {
        $fDataService.find('.Mensaje').css('width','100%');
        $fDataService.find('.Tabla').css('width','100%');
    }
	
    //if(lHeight <= 177){
        //$fDataService.find('.dataStreamBox').css('overflow-y', 'visible');
		$fDataService.find('.dataStreamBox').css('overflow', 'hidden');
   // }
   
    $fDataService.find('#id_retryDataServiceButton').click(onResetDataServiceButtonClicked);

    $fToolBar.show();
    $fBottomActions.show();
    lExpandCollapse.collapse();

    // hiding the notification button
    $('#id_notificationMessage').html('').parent('#id_notification').fadeOut();

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
	        lNotificationHtml = '<span class="Icon ic_Warning"><span class="DN">Last update: ' + lLastUpdate + '"</span></span><span class="helpTooltip middleArrow w200" style="display:none;"><span class="arrow"></span><span class="helpTxt">Last update: ' + lLastUpdate + '</span></span>';
	        $('#id_notificationMessage').html(lNotificationHtml).parents('#id_notification').fadeIn();
	        $('#id_notificationMessage').find('.ic_Warning').mouseover(function(){
	            $(this).next().fadeIn();
	        }).mouseleave(function(){
	            $(this).next().fadeOut();
	        });
	    }
    }
	
    var flexigridTableWidth = $('#id_dataStreamContainer').width(),
        flexigridCellWidth = 100,
        flexiGridCols = pResponse.fCols;

    if( flexigridTableWidth / flexiGridCols > 100 ){
        flexigridCellWidth = flexigridTableWidth / flexiGridCols;
    }

    if( flexigridCellWidth * flexiGridCols <= flexigridTableWidth ){
        $('body').append('<style type="text/css"> .flexigrid div.bDiv{overflow-x:hidden !important;} </style>');
    } 

	if (pResponse.fType == 'ARRAY'){
		var lColumns = [];
		if(lHeaderCells.length > 0){
			for (var j = 0; j < pResponse.fCols; j++) {
				var lCol = {};
				lCol.display = lHeaderCells[j];
				lCol.name = lHeaderCells[j];
				lCol.width = flexigridCellWidth;
				lCol.sortable = false;
				lCol.align = 'center';
				lColumns.push(lCol);
			}
		}else{
			var lACharCode 	= 65;
			for (var j = 0; j < pResponse.fCols; j++) {
				var lCol = {};
				lCol.display = String.fromCharCode(lACharCode + j);
				lCol.name = String.fromCharCode(lACharCode + j);
				lCol.width = flexigridCellWidth;
				lCol.sortable = false;
				lCol.align = 'center';
				lColumns.push(lCol);
			}
		}
		
		$('.dataStreamContainer').addClass('flexibleGridTable');
		
		$('.tableDS').flexigrid({
			url: '/rest/datastreams/' + $('#id_datastreamGrid').serializeArray()['datastream_id'] + '/data.grid',
			dataType : 'json',
			colModel : lColumns,
			autoload : false,
			sortname : "",
			sortorder : "",
			width : 'auto',
			usepager : true,
			useRp : true,
			singleSelect: true,
			resizable: true,
			minheight : 100,
			height : 288,
			total : pResponse.fLength,
			pages : Math.ceil( pResponse.fLength / 50),
			method: 'GET',
			onSubmit: function(){
				var lParams = $('#id_datastreamGrid').serializeArray();
				$(".tableDS").flexOptions({params:lParams});
				return true;
			},
			onSuccess : function(pResponse){
                
			},
			onError : function(pResponse){

			},
			rp : 50
		});  
		
	}
	
	if (pResponse.fType != 'ARRAY') {
		 $('[id*=id_expandDataServiceButton_]').hide();
		 $('[id*=id_pivotDataServiceButton_]').hide();
		 $('.actionsToolbar').find('.Sep').hide();
		 $('.dataStreamActions').hide();
	}
}

function onErrorDataServiceExecute(pRequest){
    if(pRequest.status != ''){
        var lMessage   = pRequest.status + ': ' + pRequest.statusText;
    }

    var lEndPoint = $fDataServiceContainer.data("dataservice_end_point");

    var lHtml  = '<div class="dataStreamBox dsErrorBox clearfix">';
    lHtml        = lHtml + '<table class="Contenedor"><tr><td>';

    lHtml        = lHtml + '<div class="Mensaje">';
    lHtml        = lHtml + '<table class="Nulo">';
    lHtml        = lHtml + '<tr>';
    lHtml        = lHtml + '<td> ' + gettext( "APP-OOPS-TEXT" ) + ' <span>' + gettext( "DS-CANTLOADDATA-TEXT" ) + '.</span><span>' + gettext( "APP-PLEASE-TEXT" ) + ' <a id="id_retryDataServiceButton" href="javascript:;" title="' + gettext( "APP-TRYAGAIN-TITLE" ) + '">' + gettext( "APP-TRYAGAIN-TEXT" ) + '</a>.</span></td>';
    lHtml        = lHtml + '</tr>';
    lHtml        = lHtml + '</table>';
    lHtml        = lHtml + '</div>';

    $fDataService.html(lHtml);

    $fDataServiceContainer.find('#id_retryDataServiceButton').bind('click', onResetDataServiceButtonClicked);

    $fToolBar.show();
    $fBottomActions.show();
    $('[id*=id_expandDataServiceButton_]').fadeOut('fast');
}

function onArgumentClicked(pLabel, pIndex){
    var $lLabel                 = $(pLabel);
    var $lValue                 = $('input[id=' + $lLabel.attr('for') + ']');
    var lText                   = $lLabel.text();

    $lValue.val(lText)
    $lLabel.hide();
    $lValue.show().focus().select();
}

function onArgumentChange(pValue){
    var $lValue = $(pValue);
    var $lLabel = $lValue.siblings('label[for=' + pValue.id + ']');
    var $lLabels = $lValue.siblings('label');
    var lValue = $lValue.val()
    
    if (lValue != '') {       
        var lDataStreamEndPoint     = $fDataServiceContainer.data("dataservice_end_point");
        var lEndPoint               = new EndPoint({ parameters: lDataStreamEndPoint });
        lEndPoint.setParameter(pValue.id, lValue);
        $('#id_datastreamGrid').find('input[name='+pValue.id+']').val(lValue);

        $fDataServiceContainer.data("dataservice_end_point", lEndPoint.toString());
        $fDataServiceContainer.data("short_url", null);
        $fDataServiceContainer.find('.share_url_input').val('');
        $lLabel.text(lValue);

        var lUrl = $fDataServiceContainer.data("permalink");
        if (lUrl.indexOf('?') > 0) {
            lUrl = lUrl.substring(0, lUrl.indexOf('?'));
        }
        lUrl = lUrl + lEndPoint.getUrlChunk();
        $fDataServiceContainer.data("permalink", lUrl);

        var csvLink = $('.ic_CSV').attr('href');
        if (csvLink.indexOf('?') > 0) {
            csvLink = csvLink.substring(0, csvLink.indexOf('?'));
        }
        csvLink = csvLink + lEndPoint.getUrlChunk();
        $('.ic_CSV').attr('href', csvLink);

        var xlsLink = $('.ic_XLS').attr('href');
        if (xlsLink.indexOf('?') > 0) {
            xlsLink = xlsLink.substring(0, xlsLink.indexOf('?'));
        }

        xlsLink = xlsLink + lEndPoint.getUrlChunk();
        $('.ic_XLS').attr('href', xlsLink);

        var hostname = document.location.protocol + '//' + document.location.hostname;

        var htmlLink = hostname + xlsLink.replace('.xlsx?', '.html?');
        var googleSpreadsheetImport = '=ImportHtml("' + htmlLink + '" ; "table" ; 1)"';
        $('#id_googleSpreadsheetDataStreamInput').val(googleSpreadsheetImport);

        if (typeof(BitlyClient) != 'undefined') {
            BitlyClient.shorten(lUrl, 'onSuccessUrlShortened');
        }

        // update embed url
        var embedUrl  = $fDataServiceContainer.data("dataservice_embed_url");
        if (embedUrl.indexOf('?') > 0) {
            embedUrl = embedUrl.substring(0, embedUrl.indexOf('?'));
        }

        embedUrl = embedUrl + lEndPoint.getUrlChunk() + '&header_row=0&fixed_column=0';
        $fDataServiceContainer.data("dataservice_embed_url", embedUrl);

        for(var i = 0; i < $lLabels.length; i++){
            if($($lLabels[i].control).val() == ''){
                $lValue.hide();
                $lLabel.show();
                return;
            }
        }

        startWaitMessage($fDataService);
        $fDataServiceContainer.find('a[id*=id_resetDataServiceButton_]').trigger('click');
    }
    $lValue.hide();
    $lLabel.show();
}

function onResetDataServiceButtonClicked(pEvent){
    $fToolBar.hide();
    $fBottomActions.hide()

    startWaitMessage($fDataService);

    var lEndPoint = $fDataServiceContainer.data("dataservice_end_point");

    invokeDataService(lEndPoint);

    return false;
}

function onPivotDataServiceButtonClicked(pEvent){
//	$('#id_pivotTables').overlay(fOverlayDefaultsOptions).data('overlay').load();

  $btn = $(pEvent.currentTarget);

  $("#id_datastreamResult").toggle();
  if (flexmonster_toggle) {
    flexmonster_toggle();
  }
}
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

function onArgumentKeyup(pSender, pEvent){
    if ((pEvent.which && pEvent.which == 13) || (pEvent.keyCode && pEvent.keyCode == 13))  {
        $(pSender).trigger('blur');
    }
    if ((pEvent.which && pEvent.which == 9) || (pEvent.keyCode && pEvent.keyCode == 9)){
        pEvent.preventDefault();
        $(pSender).trigger('blur');
        $(pSender).next().trigger('click');
    }
}

function initDataServiceCommentsPanel(){

    $fDataServiceCommentsSearchForm   = $fEditDataServiceCommentsContainer.find("#id_dataServiceCommentsSearchForm");
    $fDataServiceCommentsPageNumber   = $fDataServiceCommentsSearchForm.find('#id_dataservice_comments_page_number');
    $fDataServiceCommentsAction       = $fDataServiceCommentsSearchForm.find('#id_dataservice_comments_action');

    $fEditDataServiceCommentsContainer.find('a[id*=id_dataServiceCommentsPageButton_]').click(onDataServiceCommentsPageButtonClicked);
    $fEditDataServiceCommentsContainer.find('#id_dataServiceCommentsPreviousButton').click(onDataServiceCommentsPreviousButtonClicked);
    $fEditDataServiceCommentsContainer.find('#id_dataServiceCommentsNextButton').click(onDataServiceCommentsNextButtonClicked);

    if(User.nick == fUserNick){
        $fEditDataServiceCommentsContainer.find('a[id*=id_dataServiceCommentsRemoveButton_]').click(onDataServiceCommentsRemoveButtonClicked);
    }
    if(hasRole("ao-user")){
        $fEditDataServiceCommentsContainer.find('#id_dataServiceCommentsClearButton').click(onDataServiceCommentsClearButtonClicked);
        $fEditDataServiceCommentsContainer.find('#id_dataServiceCommentsPostButton').click(onDataServiceCommentsPostButtonClicked);

        $fNewDataServiceComment         = $fEditDataServiceCommentsContainer.find('#id_dataservice_comment-comment').keypress(onDataServiceCommentKeyPressed);
        fNewDataServiceCommentMaxLength = $fEditDataServiceCommentsContainer.find('#id_dataServiceCommentCharLeft').text();
    }
}

function onDataServiceCommentKeyPressed(pEvent){

    var lText       = $fNewDataServiceComment.val();
    var lCharLeft   = fNewDataServiceCommentMaxLength - lText.length - 1;

    if(lCharLeft < 0){
        return false;
    }

    $fEditDataServiceCommentsContainer.find('#id_dataServiceCommentCharLeft').text(lCharLeft);
}

function onDataServiceCommentsClearButtonClicked(){


    $fNewDataServiceComment.val("");
    $fEditDataServiceCommentsContainer.find('#id_dataServiceCommentCharLeft').text(fNewDataServiceCommentMaxLength);
    return false;
}

function onDataServiceCommentsPostButtonClicked(){
    var lUrl        = '/portal/DataServicesManager/actionAddDataServiceComment';
    var lComment    = $fNewDataServiceComment.val();
    var lData         = "dataservice_id=" + fDataServiceId
                            + "&dataservice_comment-comment=" + lComment;

    $.ajax({ url: lUrl
            , type:'POST'
            , data: lData
            , dataType: 'html'
            , success: onSuccessDataServiceCommentsLoaded
            , error: onErrorDataServiceCommentsLoaded
            }
    );

    return false;
}

function onSuccessDataServiceCommentsLoaded(pData){
    if (_gaq && this.url.search('actionAddDataServiceComment') != -1) {
        _gaq.push(['_trackEvent', 'DS Actions - Share', 'Post Comment', 'Data Stream ID: ' + fDataServiceId],
                ['_trackPageview', '/comments/datastream?' + fDataServiceId]);
    }

    $fEditDataServiceCommentsContainer.html(pData);
    initDataServiceCommentsPanel();
}

function onErrorDataServiceCommentsLoaded(pResponse){
    jQuery.TwitterMessage( { type: 'error', message : pResponse.statusText } );
}

function onDataServiceCommentsPageButtonClicked(){
    var lPageNumber = this.innerHTML;

    $fDataServiceCommentsAction.val("GOTO_PAGE");
    $fDataServiceCommentsPageNumber.val(lPageNumber);

    loadDataServiceComments();

    return false;
}

function onDataServiceCommentsNextButtonClicked(){
    $fDataServiceCommentsAction.val("NEXT_PAGE");
    loadDataServiceComments();

    return false;
}

function onDataServiceCommentsPreviousButtonClicked(){
    $fDataServiceCommentsAction.val("PREV_PAGE");
    loadDataServiceComments();

    return false;
}

function loadDataServiceComments(){
    var lUrl        = $fDataServiceCommentsSearchForm.attr("action");
    var lPageNumber = $fDataServiceCommentsPageNumber.val();
    var lAction     = $fDataServiceCommentsAction.val();

    var lData       = "dataservice_comments_page_number=" + lPageNumber
                    + "&dataservice_comments_action=" + lAction
                    + "&dataservice_id=" + fDataServic
eId;

    $.ajax({ url: lUrl
            , type:'GET'
            , data: lData
            , dataType: 'html'
            , success: onSuccessDataServiceCommentsLoaded
            , error: onSuccessDataServiceCommentsLoaded
            }
    );
}

function onDataServiceCommentsRemoveButtonClicked(){
    var lUrl = this.href + "&dataservice_id=" + fDataServiceId;

    if( confirm( gettext( "DB-REMOVECOMMENT-CONFIRM" ) ) == true ){

        $.ajax({ url: lUrl
                , type:'GET'
                , dataType: 'html'
                , success: onSuccessDataServiceCommentsLoaded
                , error: onErrorDataServiceCommentsLoaded
                }
        );
    }

    return false;
}
